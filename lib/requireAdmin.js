import { cookies } from "next/headers";
import { adminCookie, isValidAdminToken } from "@/lib/adminAuth";

export function requireAdmin() {
  return isValidAdminToken(cookies().get(adminCookie.name)?.value);
}
