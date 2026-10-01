import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { adminCookie, isValidAdminToken } from "@/lib/adminAuth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import PaymentSettings from "@/models/PaymentSettings";
import { getNextOrderNumber } from "@/lib/orderNumber";
import { getDeliveryFee } from "@/lib/delivery";
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from "@/lib/email";

const VALID_METHODS = ["easypaisa", "jazzcash", "sadapay", "bank_transfer", "cod"];

function isAdmin() {
  return isValidAdminToken(cookies().get(adminCookie.name)?.value);
}

// GET -> list every order (used by the admin Orders tab). Admin-only.
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

// POST -> create an order from the checkout page. Guest checkout is
// allowed — if the person happens to be signed in, we attach their
// user id, but it's not required.
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { items, shippingAddress, customerName, customerEmail, paymentMethod } = body;

    if (!items || items.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!customerName || !shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.phone) {
      return Response.json({ error: "Missing required shipping details" }, { status: 400 });
    }
    if (!VALID_METHODS.includes(paymentMethod)) {
      return Response.json({ error: "Please choose a payment method" }, { status: 400 });
    }

    // Confirm the chosen method is actually configured/enabled — guards
    // against someone submitting a method that isn't set up (or was
    // turned off) since the checkout page loaded.
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

    // Rebuild the order from trusted product data. Never trust price, name,
    // store, image, or totals sent by the browser — the cart lives in
    // localStorage and can be modified by the customer.
    const serverItems = [];
    const quantitiesByProduct = new Map();

    for (const item of items) {
      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return Response.json({ error: "Invalid item quantity" }, { status: 400 });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return Response.json({ error: "One of the products is no longer available" }, { status: 400 });
      }

      const requestedQuantity = (quantitiesByProduct.get(product._id.toString()) || 0) + quantity;
      quantitiesByProduct.set(product._id.toString(), requestedQuantity);

      if (product.stock < requestedQuantity) {
        return Response.json(
          { error: `Only ${product.stock} left of ${product.name} — please adjust your cart` },
          { status: 400 }
        );
      }

      if (item.size && (!product.sizes || !product.sizes.includes(item.size))) {
        return Response.json({ error: `Selected size is unavailable for ${product.name}` }, { status: 400 });
      }

      if (item.color && (!product.colors || !product.colors.includes(item.color))) {
        return Response.json({ error: `Selected color is unavailable for ${product.name}` }, { status: 400 });
      }

      serverItems.push({
        product: product._id,
        store: product.store,
        name: product.name,
        price: product.price,
        quantity,
        size: item.size || undefined,
        color: item.color || undefined,
        image: product.images?.[0] || undefined,
      });
    }

    // Reserve stock atomically before creating the order. The stock check
    // above is useful for a friendly error, but it is not enough by itself:
    // two checkouts can pass it at the same time. This conditional update
    // makes the database enforce the stock limit.
    const reservedItems = [];
    try {
      for (const item of serverItems) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );

        if (!updatedProduct) {
          throw new Error(`Only ${item.quantity > 1 ? "enough stock is not available" : "1 item"} of ${item.name} is available`);
        }

        reservedItems.push(item);
      }

      const session = await getServerSession(authOptions);
      const orderNumber = await getNextOrderNumber();

      const subtotal = serverItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const deliveryFee = getDeliveryFee(subtotal);
      const total = subtotal + deliveryFee;

      const order = await Order.create({
        orderNumber,
        user: session?.user?.id || undefined,
        customerName,
        customerEmail,
        paymentMethod,
        items: serverItems,
        shippingAddress,
        subtotal,
        deliveryFee,
        total,
      });

      // Fire-and-forget — email failures should never fail the order itself.
      sendOrderConfirmationEmail(order);
      sendAdminNotificationEmail(order, settings?.notificationEmail);

      return Response.json(order, { status: 201 });
    } catch (err) {
      // If order creation fails after stock was reserved, put the stock back.
      for (const item of reservedItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
      throw err;
    }

    // Fire-and-forget — email failures should never fail the order itself.
    sendOrderConfirmationEmail(order);
    sendAdminNotificationEmail(order, settings?.notificationEmail);

    return Response.json(order, { status: 201 });
  } catch (err) {
    // This is the fix for "Unexpected end of JSON input" on the checkout
    // page — without this catch, any error here (bad DB connection, an
    // invalid product id, anything) crashed with no response body at all,
    // and the browser tried to parse nothing as JSON. Now the real reason
    // always comes back as readable text.
    console.error("POST /api/orders failed:", err);
    return Response.json({ error: err.message || "Could not place order" }, { status: 500 });
  }
}
