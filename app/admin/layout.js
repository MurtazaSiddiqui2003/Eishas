import { cookies } from "next/headers";
import AdminLogin from "@/components/AdminLogin";
import { adminCookie, isValidAdminToken } from "@/lib/adminAuth";

export const metadata = {
  title: "Eisha's — Admin",
};

export default function AdminLayout({ children }) {
  const isAuthed = isValidAdminToken(cookies().get(adminCookie.name)?.value);

  return (
    <div className="min-h-screen bg-[#f4f4f2] text-[#1a1a1a] font-['Inter']">
      {isAuthed ? children : <AdminLogin />}
    </div>
  );
}
