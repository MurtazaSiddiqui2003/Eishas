import { randomBytes } from "crypto";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { adminCookie, isValidAdminToken } from "@/lib/adminAuth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import PaymentSettings from "@/models/PaymentSettings";
import PaymentTransaction from "@/models/PaymentTransaction";
import { getNextOrderNumber } from "@/lib/orderNumber";
import { getDeliveryFee } from "@/lib/delivery";
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from "@/lib/email";

const VALID_METHODS = ["easypaisa", "jazzcash", "sadapay", "bank_transfer", "cod"];

function isAdmin() {
  return isValidAdminToken(cookies().get(adminCookie.name)?.value);
}

export async function GET() {
  try {
    if (!isAdmin()) {
      return Response.json({ error: "Not authorized" }, { status: 401 });
    }

    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return Response.json(orders);
  } catch (err) {
    console.error("GET /api/orders failed:", err);
    return Response.json({ error: err.message || "Failed to load orders" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { items, shippingAddress, customerName, customerEmail, paymentMethod } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    const name = typeof customerName === "string" ? customerName.trim() : "";
    const email = typeof customerEmail === "string" ? customerEmail.trim().toLowerCase() : "";
    const line1 = typeof shippingAddress?.line1 === "string" ? shippingAddress.line1.trim() : "";
    const city = typeof shippingAddress?.city === "string" ? shippingAddress.city.trim() : "";
    const province = typeof shippingAddress?.province === "string" ? shippingAddress.province.trim() : "";
    const postalCode = typeof shippingAddress?.postalCode === "string" ? shippingAddress.postalCode.trim() : "";
    const phone = typeof shippingAddress?.phone === "string" ? shippingAddress.phone.trim() : "";

    if (!name || !line1 || !city || !phone) {
      return Response.json({ error: "Missing required shipping details" }, { status: 400 });
    }

    if (name.length > 100 || line1.length > 250 || city.length > 100 || province.length > 100 || postalCode.length > 30 || phone.length > 30) {
      return Response.json({ error: "One or more shipping details are too long" }, { status: 400 });
    }

    if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return Response.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    if (!VALID_METHODS.includes(paymentMethod)) {
      return Response.json({ error: "Please choose a payment method" }, { status: 400 });
    }

    const settings = await PaymentSettings.findOne({ key: "default" });
    const isAvailable =
      (paymentMethod === "bank_transfer" && settings?.bankName && settings?.accountNumber) ||
      (paymentMethod === "easypaisa" && settings?.easypaisaNumber) ||
      (paymentMethod === "jazzcash" && settings?.jazzcashNumber) ||
      (paymentMethod === "sadapay" && settings?.sadapayNumber) ||
      (paymentMethod === "cod" && settings?.codEnabled !== false);

    if (!isAvailable) {
      return Response.json({ error: "That payment method isn't available right now" }, { status: 400 });
    }

    const serverItems = [];
    const quantitiesByProduct = new Map();

    for (const item of items) {
      const quantity = Number(item?.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return Response.json({ error: "Invalid item quantity" }, { status: 400 });
      }

      let product;
      try {
        product = await Product.findById(item?.productId);
      } catch {
        return Response.json({ error: "One of the products is no longer available" }, { status: 400 });
      }

      if (!product) {
        return Response.json({ error: "One of the products is no longer available" }, { status: 400 });
      }

      const productId = product._id.toString();
      const requestedQuantity = (quantitiesByProduct.get(productId) || 0) + quantity;
      quantitiesByProduct.set(productId, requestedQuantity);

      if (product.stock < requestedQuantity) {
        return Response.json(
          { error: `Only ${product.stock} left of ${product.name} — please adjust your cart` },
          { status: 400 }
        );
      }

      if (item?.size && (!product.sizes || !product.sizes.includes(item.size))) {
        return Response.json({ error: `Selected size is unavailable for ${product.name}` }, { status: 400 });
      }

      if (item?.color && (!product.colors || !product.colors.includes(item.color))) {
        return Response.json({ error: `Selected color is unavailable for ${product.name}` }, { status: 400 });
      }

      serverItems.push({
        product: product._id,
        store: product.store,
        name: product.name,
        price: product.price,
        quantity,
        size: item?.size || undefined,
        color: item?.color || undefined,
        image: product.images?.[0] || undefined,
      });
    }

    const reservedItems = [];

    try {
      for (const item of serverItems) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );

        if (!updatedProduct) {
          throw new Error(
            `Only ${item.quantity > 1 ? "enough stock is not available" : "1 item"} of ${item.name} is available`
          );
        }

        reservedItems.push(item);
      }

      const session = await getServerSession(authOptions);
      const orderNumber = await getNextOrderNumber();
      const confirmationToken = randomBytes(32).toString("hex");

      const subtotal = serverItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const deliveryFee = getDeliveryFee(subtotal);
      const total = subtotal + deliveryFee;

      const order = await Order.create({
        orderNumber,
        confirmationToken,
        user: session?.user?.id || undefined,
        customerName: name,
        customerEmail: email || undefined,
        paymentMethod,
        items: serverItems,
        shippingAddress: {
          line1,
          city,
          province: province || undefined,
          postalCode: postalCode || undefined,
          country: "Pakistan",
          phone,
        },
        subtotal,
        deliveryFee,
        total,
      });

      if (paymentMethod !== "cod") {
        await PaymentTransaction.create({
          order: order._id,
          provider: paymentMethod,
          merchantReference: orderNumber,
          amount: total,
          currency: "PKR",
          status: "created",
          idempotencyKey: randomBytes(32).toString("hex"),
        });
      }

      sendOrderConfirmationEmail(order).catch((err) =>
        console.error("Order confirmation email failed:", err)
      );
      sendAdminNotificationEmail(order, settings?.notificationEmail).catch((err) =>
        console.error("Admin notification email failed:", err)
      );

      return Response.json({ orderNumber: order.orderNumber, confirmationToken }, { status: 201 });
    } catch (err) {
      if (typeof order !== "undefined" && order?._id) {
        await Order.findByIdAndDelete(order._id);
      }

      for (const item of reservedItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
      throw err;
    }
  } catch (err) {
    console.error("POST /api/orders failed:", err);
    return Response.json({ error: err.message || "Could not place order" }, { status: 500 });
  }
}
