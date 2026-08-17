"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/currency";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    phone: "",
    line1: "",
    city: "",
    province: "",
    postalCode: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          customerEmail: form.customerEmail || undefined,
          shippingAddress: {
            line1: form.line1,
            city: form.city,
            province: form.province || undefined,
            postalCode: form.postalCode || undefined,
            phone: form.phone,
          },
          items,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Could not place order");

      clearCart();
      window.location.href = `/order-confirmation/${data.orderNumber}`;
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--ivory)] text-[var(--ink)] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="font-['Cormorant_Garamond'] text-xl mb-3">Your bag is empty.</p>
          <a href="/" className="text-[var(--gold-deep)] underline font-['Inter'] text-sm">
            Back to Eisha&rsquo;s
          </a>
        </div>
      </main>
    );
  }

  const inputClass =
    "w-full px-4 py-3 border border-black/15 text-[var(--ink)] placeholder:text-[color-mix(in_srgb,var(--ink)_40%,transparent)] font-['Inter'] text-sm bg-white";

  return (
    <main className="min-h-screen bg-[var(--ivory)] text-[var(--ink)] font-['Inter']">
      <div className="max-w-[900px] mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-10">
        <div>
          <a href="/" className="block font-['Cormorant_Garamond'] text-2xl mb-8">
            Eisha&rsquo;s
          </a>
          <h1 className="font-['Cormorant_Garamond'] text-2xl mb-6">Checkout</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input className={inputClass} placeholder="Full name" value={form.customerName} onChange={update("customerName")} required />
            <input className={inputClass} type="email" placeholder="Email (optional)" value={form.customerEmail} onChange={update("customerEmail")} />
            <input className={inputClass} placeholder="Phone number" value={form.phone} onChange={update("phone")} required />
            <input className={inputClass} placeholder="Address" value={form.line1} onChange={update("line1")} required />
            <div className="flex gap-3">
              <input className={inputClass} placeholder="City" value={form.city} onChange={update("city")} required />
              <input className={inputClass} placeholder="Province (optional)" value={form.province} onChange={update("province")} />
            </div>
            <input className={inputClass} placeholder="Postal code (optional)" value={form.postalCode} onChange={update("postalCode")} />

            <p className="text-xs opacity-60 mt-1 leading-relaxed">
              After placing your order, you&rsquo;ll get an order number and instructions
              for sending payment via bank transfer or EasyPaisa.
            </p>

            {error && <p className="text-sm text-[#b3261e]">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 py-3.5 bg-[var(--ink)] text-[var(--ivory)] font-medium text-sm tracking-wide disabled:opacity-50"
            >
              {submitting ? "Placing order…" : "Place order"}
            </button>
          </form>
        </div>

        <div className="bg-white/60 border border-black/10 p-6 h-fit">
          <h2 className="font-['Cormorant_Garamond'] text-lg mb-4">Order summary</h2>
          <div className="flex flex-col gap-3 mb-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm gap-3">
                <span className="flex-1">
                  {item.name}
                  {item.size ? ` (${item.size})` : ""} &times; {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-medium text-base pt-3 border-t border-black/10">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
