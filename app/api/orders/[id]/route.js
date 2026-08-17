import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

// PATCH -> update payment/fulfillment status (used by the admin Orders tab)
export async function PATCH(req, { params }) {
  await connectDB();
  const body = await req.json();
  const order = await Order.findByIdAndUpdate(params.id, body, { new: true });
  return Response.json(order);
}
