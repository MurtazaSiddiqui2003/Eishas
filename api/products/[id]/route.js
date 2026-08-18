import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    await Product.findByIdAndDelete(params.id);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/products/[id] failed:", err);
    return Response.json({ error: err.message || "Could not delete product" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();
    const product = await Product.findByIdAndUpdate(params.id, body, { new: true });
    return Response.json(product);
  } catch (err) {
    console.error("PATCH /api/products/[id] failed:", err);
    return Response.json({ error: err.message || "Could not update product" }, { status: 500 });
  }
}
