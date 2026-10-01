import { cookies } from "next/headers";
import { adminCookie, createAdminToken } from "@/lib/adminAuth";

export async function POST(req) {
  try {
    const { password } = await req.json();

    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: "Incorrect password" }, { status: 401 });
    }

    cookies().set(adminCookie.name, createAdminToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: adminCookie.maxAge,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("POST /api/admin/login failed:", err);
    return Response.json({ error: err.message || "Login failed" }, { status: 500 });
  }
}
