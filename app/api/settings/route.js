import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/Settings";

// GET -> { apparel: {...}, beauty: {...}, jewelry: {...} }
export async function GET() {
  await connectDB();
  const all = await Settings.find({});
  const map = {};
  for (const s of all) map[s.store] = s;
  return Response.json(map);
}

// POST { store, logo?, doorImage?, heroImage? } -> upserts that store's settings
export async function POST(req) {
  await connectDB();
  const body = await req.json();

  if (!body.store) {
    return Response.json({ error: "store is required" }, { status: 400 });
  }

  const updated = await Settings.findOneAndUpdate({ store: body.store }, body, {
    upsert: true,
    new: true,
  });

  return Response.json(updated);
}
