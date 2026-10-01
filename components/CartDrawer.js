"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/currency";
import { FREE_DELIVERY_THRESHOLD, getDeliveryFee } from "@/lib/delivery";

const storeHrefs = {
  apparel: "/apparel",
  beauty: "/beauty",
  jewelry: "/jewelry",
};

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, total, isOpen, closeCart } = useCart();
  const [suggestions, setSuggestions] = useState([]);

  const remaining = Math.max(FREE_DELIVERY_THRESHOLD - total, 0);
  const progressPct = Math.min((total / FREE_DELIVERY_THRESHOLD) * 100, 100);
  const deliveryFee = getDeliveryFee(total);
  const qualifiesFreeDelivery = items.length > 0 && deliveryFee === 0;

  useEffect(() => {
    if (!isOpen || items.length === 0) {
      setSuggestions([]);
      return;
    }

    const store = items[items.length - 1].store;
    fetch(`/api/products?store=${store}`)
      .then((res) => res.json())
      .then((data) => {
        const cartIds = new Set(items.map((i) => i.productId));
        setSuggestions(
          (Array.isArray(data) ? data : [])
            .filter((p) => !cartIds.has(p._id) && p.stock > 0)
            .slice(0, 4)
        );
      })
      .catch(() => setSuggestions([]));
  }, [isOpen, items]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-[var(--ivory)] text-[var(--ink)] z-50 shadow-xl flex flex-col font-['Inter'] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping bag"
        aria-hidden={!isOpen}
      >
        <div className="px-5 pt-5 pb-4 border-b border-black/10">
          <p className="text-xs text-center mb-2">
            {qualifiesFreeDelivery
              ? "You've unlocked Free Delivery 🎉"
              : items.length === 0
              ? `Shop for ${formatPrice(FREE_DELIVERY_THRESHOLD)} for Free Delivery`
              : `Shop for ${formatPrice(remaining)} more for Free Delivery`}
          </p>
          <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--gold)] transition-all duration-500 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
          <h2 className="font-['Cormorant_Garamond'] text-xl">Your bag</h2>
          <button
            type="button"
            onClick={closeCart}
            className="text-sm opacity-60 hover:opacity-100"
            aria-label="Close shopping bag"
          >
            Close ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-sm opacity-60 text-center py-10">Your bag is empty.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-16 h-20 object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.name}</p>
                    {(item.color || item.size) && (
                      <p className="text-xs opacity-55 mb-1">
                        {[item.color, item.size].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="w-5 h-5 border border-black/20 text-xs leading-none"
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
                        className="w-5 h-5 border border-black/20 text-xs leading-none"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right text-sm flex flex-col justify-between items-end">
                    <span>{formatPrice(item.price * item.quantity)}</span>
                    <button
                      type="button"
                      className="text-xs opacity-50 hover:opacity-100 hover:text-[#e08585]"
                      onClick={() => removeItem(item.productId, item.size, item.color)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="mt-8 pt-6 border-t border-black/10">
              <p className="text-xs uppercase tracking-wide opacity-60 mb-3">You may also like</p>
              <div className="grid grid-cols-2 gap-3">
                {suggestions.map((p) => {
                  const href = `${storeHrefs[p.store]}/${p.slug}`;
                  const hasVariants = Boolean(p.sizes?.length || p.colors?.length);

                  return (
                    <div key={p._id} className="text-sm">
                      <Link href={href} onClick={closeCart} className="block">
                        {p.images?.[0] && (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-full aspect-[3/4] object-cover mb-1.5"
                          />
                        )}
                        <p className="text-xs truncate">{p.name}</p>
                        <p className="text-xs opacity-70">{formatPrice(p.price)}</p>
                      </Link>
                      <Link
                        href={href}
                        onClick={closeCart}
                        className="mt-1 block w-full text-center text-[10px] uppercase tracking-wide py-1.5 border border-black/20"
                      >
                        {hasVariants ? "Choose options" : "View product"}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-black/10">
            <div className="flex justify-between text-sm mb-1">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-xs opacity-70 mb-3">
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block text-center py-3 bg-[var(--ink)] text-[var(--ivory)] font-medium text-sm mb-2"
            >
              Checkout
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="block text-center py-2 text-sm underline opacity-75"
            >
              View full cart
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
