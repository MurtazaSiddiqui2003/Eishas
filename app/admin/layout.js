import { cookies } from "next/headers";
import AdminLogin from "@/components/AdminLogin";

export const metadata = {
  title: "Eisha's — Admin",
};

export default function AdminLayout({ children }) {
  const isAuthed = cookies().get("eishas_admin")?.value === process.env.ADMIN_PASSWORD;

  return (
    <div className="min-h-screen bg-[#f4f4f2] text-[#1a1a1a] font-['Inter']">
      {isAuthed ? children : <AdminLogin />}
    </div>
  );
}
