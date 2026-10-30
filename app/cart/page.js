"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/currency";
import { getDeliveryFee } from "@/lib/delivery";
import Footer from "@/components/Footer";

const storeLabels = {
  apparel: "Eisha's Fashion",
  beauty: "Eisha's Beauty",
  jewelry: "Eisha's Jewelry",
};

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const [paymentSettings, setPaymentSettings] = useState(null);
  const deliveryFee = getDeliveryFee(total);

  useEffect(() => {
    fetch("/api/payment-settings")
      .then((res) => res.json())
      .then(setPaymentSettings)
      .catch(() => setPaymentSettings({}));
  }, []);

  const grouped = items.reduce((acc, item) => {
    acc[item.store] = acc[item.store] || [];
    acc[item.store].push(item);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-[var(--ivory)] text-[var(--ink)] flex flex-col font-['Inter']">
      <div className="w-full max-w-[760px] mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-20 flex-1">
        <Link href="/" className="block text-center font-['Cormorant_Garamond'] text-2xl mb-8">
          Eisha&rsquo;s Collection
        </Link>

        <div className="flex items-end justify-between gap-4 mb-8 pb-4 border-b border-black/10">
          <div>
            <p className="text-[0.65rem] tracking-[0.22em] uppercase opacity-50 mb-1">Your selection</p>
            <h1 className="font-['Cormorant_Garamond'] text-[2rem] leading-none">Your bag</h1>
          </div>
          {items.length > 0 && (
            <p className="text-xs tracking-wide opacity-60 pb-1">
              {items.reduce((count, item) => count + item.quantity, 0)} {items.reduce((count, item) => count + item.quantity, 0) === 1 ? "item" : "items"}
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <div>
            <p className="opacity-75 leading-relaxed">
              Your bag is empty. Browse{" "}
              <Link href="/apparel" className="text-[var(--gold-deep)] underline">Fashion</Link>,{" "}
              <Link href="/beauty" className="text-[var(--gold-deep)] underline">Beauty</Link>, or{" "}
              <Link href="/jewelry" className="text-[var(--gold-deep)] underline">Jewelry</Link>.
            </p>
          </div>
        ) : (
          <>
            {Object.entries(grouped).map(([store, storeItems]) => (
              <section key={store} className="mb-8 border border-black/[0.08] bg-white/30 px-4 sm:px-6 py-4 sm:py-5" aria-labelledby={`cart-section-${store}`}>
                <h2
                  id={`cart-section-${store}`}
                  className="font-['Cormorant_Garamond'] text-xl text-[var(--gold-deep)] mb-2 pb-3 border-b border-black/10"
                >
                  {storeLabels[store] || store}
                </h2>

                {storeItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex gap-3 sm:gap-5 py-5 border-b last:border-b-0 border-black/[0.07]"
                  >
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-[76px] h-[100px] sm:w-[88px] sm:h-[112px] object-cover shrink-0 bg-black/[0.03]" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-[0.95rem] font-medium mb-1 leading-snug">{item.name}</p>

                      {(item.color || item.size) && (
                        <p className="text-xs opacity-60 mb-2">
                          {[item.color, item.size].filter(Boolean).join(" · ")}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-sm mt-3">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="w-8 h-8 border border-black/20 hover:bg-black/[0.04] transition-colors"
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.color, Math.max(1, item.quantity - 1))
                          }
                        >
                          −
                        </button>
                        <span aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          className="w-8 h-8 border border-black/20 hover:bg-black/[0.04] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                          }
                          disabled={Number.isFinite(item.stock) && item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-right text-sm flex flex-col justify-between items-end shrink-0 min-w-[76px]">
                      <p>{formatPrice(item.price * item.quantity)}</p>
                      <button
                        type="button"
                        className="text-xs opacity-50 hover:opacity-100 hover:text-[#e08585] mt-2"
                        onClick={() => removeItem(item.productId, item.size, item.color)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </section>
            ))}

            <div className="pt-6 border-t border-black/15 max-w-[440px] ml-auto">
              <div className="flex justify-between text-sm opacity-70 mb-1">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm opacity-70 mb-4">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-['Cormorant_Garamond'] text-xl mb-6">
                <span>Total</span>
                <span>{formatPrice(total + deliveryFee)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block text-center w-full py-4 bg-[var(--gold)] text-[var(--ink)] font-medium tracking-[0.12em] uppercase text-xs hover:opacity-90 transition-opacity"
            >
              Checkout
            </Link>
          </>
        )}
      </div>

      <Footer
        variant="shell"
        whatsappNumber={paymentSettings?.whatsappNumber}
        contactPhone={paymentSettings?.contactPhone}
      />
    </main>
  );
}
