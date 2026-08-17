import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function DELETE(req, { params }) {
  await connectDB();
  await Product.findByIdAndDelete(params.id);
  return Response.json({ ok: true });
}

export async function PATCH(req, { params }) {
  await connectDB();
  const body = await req.json();
  const product = await Product.findByIdAndUpdate(params.id, body, { new: true });
  return Response.json(product);
}
