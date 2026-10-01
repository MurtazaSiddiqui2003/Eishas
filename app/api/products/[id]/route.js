import { requireAdmin } from "@/lib/requireAdmin";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { validateProductInput } from "@/lib/validateProduct";

export async function DELETE(req, { params }) {
  if (!requireAdmin()) return Response.json({ error: "Not authorized" }, { status: 401 });
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
  if (!requireAdmin()) return Response.json({ error: "Not authorized" }, { status: 401 });
  try {
    await connectDB();
    const body = await req.json();
    const validation = validateProductInput(body, { partial: true });
    if (validation.error) return Response.json({ error: validation.error }, { status: 400 });

    const product = await Product.findByIdAndUpdate(params.id, validation.data, { new: true, runValidators: true });
    return Response.json(product);
  } catch (err) {
    console.error("PATCH /api/products/[id] failed:", err);
    return Response.json({ error: err.message || "Could not update product" }, { status: 500 });
  }
}
