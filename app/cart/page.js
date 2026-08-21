"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/currency";
import { getDeliveryFee } from "@/lib/delivery";
import Footer from "@/components/Footer";

const storeLabels = {
  apparel: "Eisha's Collection",
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
      <div className="w-full max-w-[680px] mx-auto px-6 pt-10 pb-20 flex-1">
      <a href="/" className="block text-center font-['Cormorant_Garamond'] text-2xl mb-8">
        Eisha&rsquo;s
      </a>
      <h1 className="font-['Cormorant_Garamond'] text-[1.8rem] mb-8">Your bag</h1>

      {items.length === 0 ? (
        <p className="opacity-75 leading-relaxed">
          Your bag is empty. Browse{" "}
          <a href="/apparel" className="text-[var(--gold-deep)] underline">Collection</a>,{" "}
          <a href="/beauty" className="text-[var(--gold-deep)] underline">Beauty</a>, or{" "}
          <a href="/jewelry" className="text-[var(--gold-deep)] underline">Jewelry</a>.
        </p>
      ) : (
        <>
          {Object.entries(grouped).map(([store, storeItems]) => (
            <section key={store} className="mb-10">
              <h2 className="font-['Cormorant_Garamond'] text-lg text-[var(--gold-deep)] mb-4 pb-2 border-b border-black/10">
                {storeLabels[store]}
              </h2>
              {storeItems.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-4 py-4 border-b border-black/[0.07]"
                >
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-[70px] h-[90px] object-cover shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-[0.95rem] mb-1">{item.name}</p>
                    {(item.color || item.size) && (
                      <p className="text-xs opacity-60 mb-2">
                        {[item.color, item.size].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <button
                        className="w-[1.6rem] h-[1.6rem] border border-black/20"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.color, Math.max(1, item.quantity - 1))
                        }
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="w-[1.6rem] h-[1.6rem] border border-black/20"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right text-sm flex flex-col justify-between">
                    <p>{formatPrice(item.price * item.quantity)}</p>
                    <button
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

          <div className="pt-6 border-t border-black/15">
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

          <a
            href="/checkout"
            className="block text-center w-full py-4 bg-[var(--gold)] text-[var(--ink)] font-medium tracking-wide"
          >
            Checkout
          </a>
        </>
      )}
      </div>
      <Footer variant="shell" whatsappNumber={paymentSettings?.whatsappNumber} contactPhone={paymentSettings?.contactPhone} />
    </main>
  );
}
