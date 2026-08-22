import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

function isAdmin() {
  return cookies().get("eishas_admin")?.value === process.env.ADMIN_PASSWORD;
}

// PATCH -> update payment/fulfillment status. Admin-only.
export async function PATCH(req, { params }) {
  try {
    if (!isAdmin()) {
      return Response.json({ error: "Not authorized" }, { status: 401 });
    }
    await connectDB();
    const body = await req.json();
    const order = await Order.findByIdAndUpdate(params.id, body, { new: true });
    return Response.json(order);
  } catch (err) {
    console.error("PATCH /api/orders/[id] failed:", err);
    return Response.json({ error: err.message || "Could not update order" }, { status: 500 });
  }
}
