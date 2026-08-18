import { connectDB } from "@/lib/mongodb";
import PaymentSettings from "@/models/PaymentSettings";

export async function GET() {
  try {
    await connectDB();
    const settings = await PaymentSettings.findOne({ key: "default" });
    return Response.json(settings || {});
  } catch (err) {
    console.error("GET /api/payment-settings failed:", err);
    return Response.json({ error: err.message || "Failed to load payment settings" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const updated = await PaymentSettings.findOneAndUpdate(
      { key: "default" },
      { ...body, key: "default" },
      { upsert: true, new: true }
    );

    return Response.json(updated);
  } catch (err) {
    console.error("POST /api/payment-settings failed:", err);
    return Response.json({ error: err.message || "Could not save payment settings" }, { status: 500 });
  }
}
