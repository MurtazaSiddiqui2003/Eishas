"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/currency";

export default function ProductDetail({ product }) {
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(product.sizes?.length ? null : null);
  const [color, setColor] = useState(product.colors?.length ? null : null);
  const [added, setAdded] = useState(false);
  const [variantError, setVariantError] = useState("");
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const onSale = product.compareAtPrice > product.price;
  const discountPercent = onSale
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  function changeImage(direction) {
    const imageCount = product.images?.length || 0;
    if (imageCount < 2) return;
    setActiveImage((current) => (current + direction + imageCount) % imageCount);
  }

  function handleAdd() {
    if (product.sizes?.length > 0 && !size) {
      setVariantError("Please select a size.");
      return;
    }

    if (product.colors?.length > 0 && !color) {
      setVariantError("Please select a color.");
      return;
    }

    setVariantError("");
    addItem(product, quantity, { size, color });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <div className="relative w-full aspect-[3/4] mb-3 bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] overflow-hidden">
          {product.images?.[activeImage] ? (
            <Image
              key={activeImage}
              src={product.images[activeImage]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover animate-fadeIn"
            />
          ) : (
            <div className="w-full h-full bg-placeholder-pattern" aria-hidden="true" />
          )}

          {onSale && (
            <span className="absolute top-4 left-4 w-14 h-14 rounded-full bg-theme-accent text-theme-bg flex items-center justify-center text-sm font-medium font-body shadow-sm">
              -{discountPercent}%
            </span>
          )}

          {product.images?.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => changeImage(-1)}
                aria-label="View previous product image"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-[#332e2b] shadow-md flex items-center justify-center hover:bg-white transition-colors"
              >
                <span aria-hidden="true" className="text-2xl leading-none">‹</span>
              </button>
              <button
                type="button"
                onClick={() => changeImage(1)}
                aria-label="View next product image"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-[#332e2b] shadow-md flex items-center justify-center hover:bg-white transition-colors"
              >
                <span aria-hidden="true" className="text-2xl leading-none">›</span>
              </button>
              <span className="absolute bottom-3 right-3 rounded-full bg-black/55 text-white px-3 py-1 text-xs font-body tabular-nums" aria-live="polite">
                {activeImage + 1} / {product.images.length}
              </span>
            </>
          )}
        </div>

        {product.images?.length > 1 && (
          <div className="flex gap-2 overflow-x-auto flex-nowrap pb-1">
            {product.images.map((img, i) => (
              <button
                type="button"
                key={img}
                onClick={() => setActiveImage(i)}
                aria-label={`View image ${i + 1} of ${product.images.length}`}
                aria-pressed={i === activeImage}
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
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
          <p className="font-body text-2xl text-theme-accent tabular-nums">{formatPrice(product.price)}</p>
          {onSale && (
            <>
              <p className="font-body text-sm text-theme-ink opacity-40 line-through">
                {formatPrice(product.compareAtPrice)}
              </p>
              <span className="font-body text-xs text-theme-accent">{discountPercent}% off</span>
            </>
          )}
        </div>
        <p
          className={`font-body text-xs mb-5 ${product.stock <= 0 ? "text-[#b3261e]" : product.stock <= 5 ? "text-[#9a641f]" : "text-[#55765b]"}`}
          aria-live="polite"
        >
          {product.stock <= 0 ? "Currently out of stock" : product.stock <= 5 ? `Only ${product.stock} left — order soon` : "In stock"}
        </p>
        {product.description && (
          <div className="mb-5">
            <p className={`font-body text-sm leading-relaxed opacity-80 whitespace-pre-line ${descriptionExpanded ? "" : "line-clamp-3"}`}>
              {product.description}
            </p>
            {product.description.length > 150 && (
              <button
                type="button"
                onClick={() => setDescriptionExpanded((expanded) => !expanded)}
                className="font-body text-xs text-theme-accent underline underline-offset-4 mt-2"
                aria-expanded={descriptionExpanded}
              >
                {descriptionExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {product.colors?.length > 0 && (
          <div className="mb-6">
            <p className="font-body text-xs uppercase tracking-wide mb-2 opacity-70">Color</p>
            <div className="flex gap-2 flex-wrap">
              {product.colors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => { setColor(c); setVariantError(""); }}
                  aria-pressed={color === c}
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
                  type="button"
                  key={s}
                  onClick={() => { setSize(s); setVariantError(""); }}
                  aria-pressed={size === s}
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

        {(product.fabric || product.material || product.skinType || product.volume) && (
          <div className="border-t border-[color-mix(in_srgb,var(--ink)_12%,transparent)] pt-4 mt-1 mb-6">
            <p className="font-body text-[10px] uppercase tracking-[0.16em] opacity-50 mb-2">Product details</p>
            <div className="font-body text-sm opacity-75 space-y-1">
              {product.fabric && <p>Fabric: {product.fabric}</p>}
              {product.material && <p>Material: {product.material}</p>}
              {product.skinType && <p>Skin type: {product.skinType}</p>}
              {product.volume && <p>Volume: {product.volume}</p>}
            </div>
          </div>
        )}

        <div className="border border-[color-mix(in_srgb,var(--ink)_15%,transparent)] p-4 sm:p-5 mt-2">
          <div className="flex items-center justify-between gap-4 mb-4">
            <p className="font-body text-xs uppercase tracking-wide opacity-70">Quantity</p>
            <div className="inline-flex items-center border border-[color-mix(in_srgb,var(--ink)_25%,transparent)]">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                disabled={quantity <= 1 || product.stock <= 0}
                aria-label="Decrease quantity"
                className="w-10 h-10 text-lg disabled:opacity-35"
              >
                −
              </button>
              <span className="w-9 text-center font-body text-sm tabular-nums" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
                disabled={quantity >= product.stock || product.stock <= 0}
                aria-label="Increase quantity"
                className="w-10 h-10 text-lg disabled:opacity-35"
              >
                +
              </button>
            </div>
          </div>

          {variantError && (
            <p className="text-sm text-[#b3261e] font-body mb-3" role="alert">{variantError}</p>
          )}

          <button
            type="button"
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="w-full py-3.5 border border-theme-accent text-theme-accent font-body text-sm uppercase tracking-wide hover:bg-theme-accent hover:text-theme-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {product.stock <= 0 ? "Out of stock" : added ? "Added ✓" : "Add to bag"}
          </button>
          <p className="font-body text-[10px] text-center opacity-50 mt-3">Secure checkout · Easy ordering</p>
        </div>
      </div>
    </div>
  );
}
