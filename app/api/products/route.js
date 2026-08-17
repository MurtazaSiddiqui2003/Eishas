import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

// GET /api/products?store=apparel  -> list products, optionally filtered by store
export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const store = searchParams.get("store");

  const query = store ? { store } : {};
  const products = await Product.find(query).sort({ createdAt: -1 });

  return Response.json(products);
}

// POST /api/products -> create a product (admin panel uses this)
export async function POST(req) {
  await connectDB();

  const body = await req.json();
  const product = await Product.create(body);

  return Response.json(product, { status: 201 });
}
