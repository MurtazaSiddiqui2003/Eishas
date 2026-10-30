"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/currency";
import { getDeliveryFee } from "@/lib/delivery";
import Footer from "@/components/Footer";

const METHOD_LABELS = {
  easypaisa: "EasyPaisa",
  jazzcash: "JazzCash",
  sadapay: "SadaPay",
  bank_transfer: "Bank Transfer",
  cod: "Cash on Delivery",
};

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const deliveryFee = getDeliveryFee(total);
  const orderTotal = total + deliveryFee;
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    phone: "",
    line1: "",
    city: "",
    province: "",
    postalCode: "",
  });
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/payment-settings")
      .then((res) => res.json())
      .then(setPaymentSettings)
      .catch(() => setPaymentSettings({}));
  }, []);

  const availableMethods = useMemo(() => {
    if (!paymentSettings) return [];
    const methods = [];
    if (paymentSettings.bankName && paymentSettings.accountNumber) methods.push("bank_transfer");
    if (paymentSettings.easypaisaNumber) methods.push("easypaisa");
    if (paymentSettings.jazzcashNumber) methods.push("jazzcash");
    if (paymentSettings.sadapayNumber) methods.push("sadapay");
    if (paymentSettings.codEnabled !== false) methods.push("cod");
    return methods;
  }, [paymentSettings]);

  useEffect(() => {
    if (!paymentMethod && availableMethods.length > 0) {
      setPaymentMethod(availableMethods[0]);
    }
  }, [availableMethods, paymentMethod]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function submitJazzCashForm(paymentUrl, fields) {
    const formElement = document.createElement("form");
    formElement.method = "POST";
    formElement.action = paymentUrl;
    formElement.style.display = "none";

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = String(value ?? "");
      formElement.appendChild(input);
    });

    document.body.appendChild(formElement);
    formElement.submit();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!paymentMethod) {
      setError("Please choose a payment method.");
      return;
    }

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
          paymentMethod,
          items,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(
          "Something went wrong on our end — please try again in a moment."
        );
      }

      if (!res.ok) throw new Error(data.error || "Could not place order");

      if (paymentMethod === "jazzcash") {
        const paymentRes = await fetch("/api/payments/jazzcash/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber: data.orderNumber,
            confirmationToken: data.confirmationToken,
          }),
        });

        let paymentData;
        try {
          paymentData = await paymentRes.json();
        } catch {
          throw new Error("Could not start JazzCash payment.");
        }

        if (!paymentRes.ok) {
          throw new Error(
            paymentData.error || "Could not start JazzCash payment."
          );
        }

        clearCart();
        submitJazzCashForm(paymentData.paymentUrl, paymentData.fields);
        return;
      }

      clearCart();
      window.location.href = `/order-confirmation/${data.orderNumber}?token=${encodeURIComponent(
        data.confirmationToken
      )}`;
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
          <p className="font-['Cormorant_Garamond'] text-xl mb-3">
            Your bag is empty.
          </p>
          <Link
            href="/"
            className="text-[var(--gold-deep)] underline font-['Inter'] text-sm"
          >
            Back to Eisha&rsquo;s Collection
          </Link>
        </div>
      </main>
    );
  }

  const inputClass =
    "w-full px-4 py-3.5 border border-black/15 text-[var(--ink)] placeholder:text-[color-mix(in_srgb,var(--ink)_40%,transparent)] font-['Inter'] text-sm bg-white focus:outline-none focus:border-[var(--ink)] transition-colors";

  return (
    <main className="min-h-screen bg-[var(--ivory)] text-[var(--ink)] font-['Inter'] flex flex-col">
      <div className="w-full max-w-[1040px] mx-auto px-5 sm:px-8 py-8 sm:py-12 grid grid-cols-1 md:grid-cols-[1.25fr_0.85fr] gap-8 lg:gap-14 flex-1">
        <div>
          <Link
            href="/"
            className="block font-['Cormorant_Garamond'] text-2xl mb-8"
          >
            Eisha&rsquo;s Collection
          </Link>

          <p className="text-[0.65rem] tracking-[0.22em] uppercase opacity-50 mb-2">Almost yours</p>
          <h1 className="font-['Cormorant_Garamond'] text-[2rem] leading-none mb-3">
            Checkout
          </h1>
          <p className="text-sm opacity-60 mb-7">Add your delivery details and choose how you’d like to pay.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="sr-only" htmlFor="customerName">
              Full name
            </label>
            <input
              id="customerName"
              name="name"
              autoComplete="name"
              className={inputClass}
              placeholder="Full name"
              value={form.customerName}
              onChange={update("customerName")}
              required
            />

            <label className="sr-only" htmlFor="customerEmail">
              Email
            </label>
            <input
              id="customerEmail"
              name="email"
              autoComplete="email"
              className={inputClass}
              type="email"
              placeholder="Email (optional)"
              value={form.customerEmail}
              onChange={update("customerEmail")}
            />

            <label className="sr-only" htmlFor="phone">
              Phone number
            </label>
            <input
              id="phone"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              className={inputClass}
              placeholder="Phone number"
              value={form.phone}
              onChange={update("phone")}
              required
            />

            <label className="sr-only" htmlFor="line1">
              Address
            </label>
            <input
              id="line1"
              name="address"
              autoComplete="street-address"
              className={inputClass}
              placeholder="Address"
              value={form.line1}
              onChange={update("line1")}
              required
            />

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="sr-only" htmlFor="city">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  autoComplete="address-level2"
                  className={inputClass}
                  placeholder="City"
                  value={form.city}
                  onChange={update("city")}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="sr-only" htmlFor="province">
                  Province
                </label>
                <input
                  id="province"
                  name="province"
                  autoComplete="address-level1"
                  className={inputClass}
                  placeholder="Province (optional)"
                  value={form.province}
                  onChange={update("province")}
                />
              </div>
            </div>

            <label className="sr-only" htmlFor="postalCode">
              Postal code
            </label>
            <input
              id="postalCode"
              name="postalCode"
              autoComplete="postal-code"
              inputMode="numeric"
              className={inputClass}
              placeholder="Postal code (optional)"
              value={form.postalCode}
              onChange={update("postalCode")}
            />

            <p
              className="text-xs uppercase tracking-[0.16em] opacity-65 mt-5 mb-1"
              id="payment-method-heading"
            >
              Payment method
            </p>

            {paymentSettings === null ? (
              <p className="text-sm opacity-50">Loading payment options…</p>
            ) : availableMethods.length === 0 ? (
              <p className="text-sm text-[#b3261e]" role="alert">
                No payment methods are set up yet — please contact us directly
                to place this order.
              </p>
            ) : (
              <div
                className="flex flex-col gap-2"
                role="radiogroup"
                aria-labelledby="payment-method-heading"
              >
                {availableMethods.map((method) => (
                  <label
                    key={method}
                    className={`flex items-center gap-3 px-4 py-3.5 border cursor-pointer text-sm transition-colors ${
                      paymentMethod === method
                        ? "border-[var(--ink)] bg-white"
                        : "border-black/15"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                    />
                    {METHOD_LABELS[method]}
                  </label>
                ))}
              </div>
            )}

            <p className="text-xs opacity-60 mt-1 leading-relaxed">
              JazzCash payments will open the secure JazzCash checkout. Other
              payment methods will show your order confirmation and payment
              instructions.
            </p>

            {error && (
              <p className="text-sm text-[#b3261e]" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || availableMethods.length === 0}
              className="mt-3 py-4 bg-[var(--ink)] text-[var(--ivory)] font-medium text-xs uppercase tracking-[0.16em] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Processing…" : "Place order"}
            </button>
          </form>
        </div>

        <div className="bg-white/60 border border-black/10 p-5 sm:p-7 h-fit md:sticky md:top-8">
          <h2 className="font-['Cormorant_Garamond'] text-xl mb-5 pb-3 border-b border-black/10">
            Order summary
          </h2>
          <div className="flex flex-col gap-4 mb-5">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="flex justify-between text-sm gap-3 leading-relaxed"
              >
                <span className="flex-1">
                  {item.name}
                  {[item.color, item.size].filter(Boolean).length > 0
                    ? ` (${[item.color, item.size].filter(Boolean).join(", ")})`
                    : ""}{" "}
                  &times; {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm opacity-70 pt-3 border-t border-black/10">
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-sm opacity-70 mb-3">
            <span>Delivery</span>
            <span>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-medium text-lg pt-4 mt-1 border-t border-black/10">
            <span>Total</span>
            <span>{formatPrice(orderTotal)}</span>
          </div>
        </div>
      </div>

      <Footer
        variant="shell"
        whatsappNumber={paymentSettings?.whatsappNumber}
        contactPhone={paymentSettings?.contactPhone}
      />
    </main>
  );
}
