import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getNextOrderNumber } from "@/lib/orderNumber";

// GET -> list orders, newest first (used by the admin Orders tab)
export async function GET() {
  try {
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
    const { items, shippingAddress, customerName, customerEmail } = body;

    if (!items || items.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!customerName || !shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.phone) {
      return Response.json({ error: "Missing required shipping details" }, { status: 400 });
    }

    // Check stock for every item before committing to anything.
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return Response.json({ error: `${item.name} is no longer available` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return Response.json(
          { error: `Only ${product.stock} left of ${item.name} — please adjust your cart` },
          { status: 400 }
        );
      }
    }

    const session = await getServerSession(authOptions);
    const orderNumber = await getNextOrderNumber();

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      orderNumber,
      user: session?.user?.id || undefined,
      customerName,
      customerEmail,
      items: items.map((i) => ({
        product: i.productId,
        store: i.store,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        size: i.size || undefined,
        image: i.image,
      })),
      shippingAddress,
      total,
    });

    // Decrement stock now that the order is confirmed to exist.
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

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
