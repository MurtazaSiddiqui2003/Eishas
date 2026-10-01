import { requireAdmin } from "@/lib/requireAdmin";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { validateProductInput } from "@/lib/validateProduct";

// GET /api/products?store=apparel  -> list products, optionally filtered by store
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const store = searchParams.get("store");

    const query = store ? { store } : {};
    const products = await Product.find(query).sort({ createdAt: -1 });

    return Response.json(products);
  } catch (err) {
    console.error("GET /api/products failed:", err);
    return Response.json({ error: err.message || "Failed to load products" }, { status: 500 });
  }
}

// POST /api/products -> create a product (admin panel uses this)
export async function POST(req) {
  if (!requireAdmin()) return Response.json({ error: "Not authorized" }, { status: 401 });
  try {
    await connectDB();

    const body = await req.json();
    const validation = validateProductInput(body);
    if (validation.error) return Response.json({ error: validation.error }, { status: 400 });

    const product = await Product.create(validation.data);

    return Response.json(product, { status: 201 });
  } catch (err) {
    console.error("POST /api/products failed:", err);
    return Response.json({ error: err.message || "Could not save product" }, { status: 500 });
  }
}
