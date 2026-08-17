import { connectDB } from "@/lib/mongodb";
import PaymentSettings from "@/models/PaymentSettings";

export async function GET() {
  await connectDB();
  const settings = await PaymentSettings.findOne({ key: "default" });
  return Response.json(settings || {});
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();

  const updated = await PaymentSettings.findOneAndUpdate(
    { key: "default" },
    { ...body, key: "default" },
    { upsert: true, new: true }
  );

  return Response.json(updated);
}
