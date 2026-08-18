import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ error: "All fields are required" }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return Response.json({ error: "An account with that email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    return Response.json({ id: user._id, name: user.name, email: user.email }, { status: 201 });
  } catch (err) {
    console.error("POST /api/signup failed:", err);
    return Response.json({ error: err.message || "Could not create account" }, { status: 500 });
  }
}
