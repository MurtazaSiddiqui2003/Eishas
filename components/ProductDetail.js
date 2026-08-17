"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function ProductDetail({ product }) {
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(product.sizes?.[0] || null);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, 1, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <div className="relative w-full aspect-[3/4] mb-3 bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] overflow-hidden">
          {product.images?.[activeImage] ? (
            <Image
              src={product.images[activeImage]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-placeholder-pattern" />
          )}
        </div>

        {product.images?.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {product.images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                className={`relative w-16 h-20 shrink-0 border overflow-hidden ${
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
          {product.category}
        </p>
        <h1 className="font-display text-2xl mb-3 text-theme-ink">{product.name}</h1>
        <p className="font-body text-lg text-theme-accent mb-5">${product.price.toFixed(2)}</p>
        <p className="font-body text-sm leading-relaxed opacity-80 mb-6 whitespace-pre-line">
          {product.description}
        </p>

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
          {product.color && <p>Color: {product.color}</p>}
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
