"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/currency";

export default function ProductDetail({ product }) {
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(product.sizes?.[0] || null);
  const [color, setColor] = useState(product.colors?.[0] || null);
  const [added, setAdded] = useState(false);

  const onSale = product.compareAtPrice > product.price;
  const discountPercent = onSale
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  function handleAdd() {
    addItem(product, 1, { size, color });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <div className="relative w-full aspect-[3/4] mb-3 bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] overflow-hidden">
          {product.images?.[activeImage] ? (
            // key={activeImage} remounts the image on every thumbnail click,
            // which replays the fadeIn animation — a smooth cross-fade
            // instead of the picture just instantly swapping out.
            <Image
              key={activeImage}
              src={product.images[activeImage]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover animate-fadeIn"
            />
          ) : (
            <div className="w-full h-full bg-placeholder-pattern" />
          )}

          {onSale && (
            <span className="absolute top-4 left-4 w-14 h-14 rounded-full bg-theme-accent text-theme-bg flex items-center justify-center text-sm font-medium font-body shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>

        {product.images?.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {product.images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                className={`relative w-16 h-20 shrink-0 border overflow-hidden transition-colors ${
                  i === activeImage ? "border-theme-accent" : "border-transparent"
                }`}
              >
                <Image src={img} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="font-body text-xs uppercase tracking-wider opacity-55 mb-2">
          {(product.categories || []).join(", ")}
        </p>
        <h1 className="font-display text-2xl mb-3 text-theme-ink">{product.name}</h1>
        <div className="flex items-baseline gap-3 mb-2">
          <p className="font-body text-lg text-theme-accent">{formatPrice(product.price)}</p>
          {onSale && (
            <p className="font-body text-sm text-theme-ink opacity-40 line-through">
              {formatPrice(product.compareAtPrice)}
            </p>
          )}
        </div>
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-sm text-[#b3261e] font-body mb-4">Only {product.stock} left in stock</p>
        )}
        <p className="font-body text-sm leading-relaxed opacity-80 mb-6 whitespace-pre-line">
          {product.description}
        </p>

        {product.colors?.length > 0 && (
          <div className="mb-6">
            <p className="font-body text-xs uppercase tracking-wide mb-2 opacity-70">Color</p>
            <div className="flex gap-2 flex-wrap">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`px-3.5 py-2 border font-body text-sm ${
                    color === c
                      ? "bg-theme-accent text-theme-bg border-theme-accent"
                      : "border-[color-mix(in_srgb,var(--ink)_25%,transparent)] text-theme-ink"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.sizes?.length > 0 && (
          <div className="mb-6">
            <p className="font-body text-xs uppercase tracking-wide mb-2 opacity-70">Size</p>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-3.5 py-2 border font-body text-sm ${
                    size === s
                      ? "bg-theme-accent text-theme-bg border-theme-accent"
                      : "border-[color-mix(in_srgb,var(--ink)_25%,transparent)] text-theme-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="font-body text-sm opacity-70 space-y-1 mb-6">
          {product.fabric && <p>Fabric: {product.fabric}</p>}
          {product.material && <p>Material: {product.material}</p>}
          {product.skinType && <p>Skin type: {product.skinType}</p>}
          {product.volume && <p>Volume: {product.volume}</p>}
        </div>

        <button
          onClick={handleAdd}
          disabled={product.stock <= 0}
          className="w-full py-3.5 border border-theme-accent text-theme-accent font-body text-sm uppercase tracking-wide hover:bg-theme-accent hover:text-theme-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {product.stock <= 0 ? "Out of stock" : added ? "Added ✓" : "Add to bag"}
        </button>
      </div>
    </div>
  );
}
