import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { password } = await req.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: "Incorrect password" }, { status: 401 });
    }

    cookies().set("eishas_admin", process.env.ADMIN_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("POST /api/admin/login failed:", err);
    return Response.json({ error: err.message || "Login failed" }, { status: 500 });
  }
}
