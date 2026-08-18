import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/Settings";

// GET -> { apparel: {...}, beauty: {...}, jewelry: {...} }
export async function GET() {
  try {
    await connectDB();
    const all = await Settings.find({});
    const map = {};
    for (const s of all) map[s.store] = s;
    return Response.json(map);
  } catch (err) {
    console.error("GET /api/settings failed:", err);
    return Response.json({ error: err.message || "Failed to load settings" }, { status: 500 });
  }
}

// POST { store, logo?, doorImage?, heroImage? } -> upserts that store's settings
export async function POST(req) {
  try {
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
  } catch (err) {
    console.error("POST /api/settings failed:", err);
    return Response.json({ error: err.message || "Could not save settings" }, { status: 500 });
  }
}
