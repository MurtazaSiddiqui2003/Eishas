import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { formatPrice } from "@/lib/currency";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

const paymentLabel = {
  pending_verification: "Payment pending verification",
  paid: "Paid",
  failed: "Payment failed",
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/account");
  }

  await connectDB();
  const orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 }).lean();

  return (
    <main className="min-h-screen bg-[var(--ivory)] text-[var(--ink)] font-['Inter'] flex flex-col">
      <div className="w-full max-w-[680px] mx-auto px-6 py-14 flex-1">
        <a href="/" className="block text-center font-['Cormorant_Garamond'] text-2xl mb-8">
          Eisha&rsquo;s
        </a>
        <h1 className="font-['Cormorant_Garamond'] text-2xl mb-1">My Orders</h1>
        <p className="text-sm opacity-60 mb-8">Signed in as {session.user.email}</p>

        {orders.length === 0 ? (
          <p className="text-sm opacity-70 leading-relaxed">
            No orders yet. Browse{" "}
            <a href="/apparel" className="text-[var(--gold-deep)] underline">Collection</a>,{" "}
            <a href="/beauty" className="text-[var(--gold-deep)] underline">Beauty</a>, or{" "}
            <a href="/jewelry" className="text-[var(--gold-deep)] underline">Jewelry</a>.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <div key={order._id} className="bg-white border border-black/10 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <p className="font-medium text-sm">{order.orderNumber}</p>
                  <p className="text-xs opacity-60">
                    {new Date(order.createdAt).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex flex-col gap-1 text-sm opacity-80 mb-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between gap-3">
                      <span className="flex-1">
                        {item.name}
                        {[item.color, item.size].filter(Boolean).length > 0
                          ? ` (${[item.color, item.size].filter(Boolean).join(", ")})`
                          : ""}{" "}
                        &times; {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-black/10">
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-0.5 border border-black/15 capitalize">
                      {order.status}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 border ${
                        order.paymentStatus === "paid"
                          ? "border-[#1f7a3d] text-[#1f7a3d]"
                          : order.paymentStatus === "failed"
                          ? "border-[#b3261e] text-[#b3261e]"
                          : "border-[#c9a24a] text-[#8a6c1f]"
                      }`}
                    >
                      {paymentLabel[order.paymentStatus]}
                    </span>
                  </div>
                  <p className="font-medium text-sm">{formatPrice(order.total)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer variant="shell" />
    </main>
  );
}
