"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/currency";

export default function ProductGrid({ products, emptyMessage, storeHref }) {
  const { addItem } = useCart();

  if (!products || products.length === 0) {
    return emptyMessage ? (
      <div className="text-center py-20 px-6 font-body opacity-60 max-w-[420px] mx-auto">
        <p>{emptyMessage}</p>
      </div>
    ) : null;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-8 px-8 pt-4 pb-16 max-w-[1400px] mx-auto">
      {products.map((product) => (
        <article key={product._id} className="flex flex-col gap-1.5 group">
          <a href={`${storeHref}/${product.slug}`} className="block">
            <div className="relative w-full aspect-[3/4] mb-3 overflow-hidden bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 700px) 100vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="w-full h-full bg-placeholder-pattern" />
              )}
            </div>
            <h3 className="font-display font-[var(--heading-weight,500)] text-base text-theme-ink">
              {product.name}
            </h3>
            <p className="font-body text-xs tracking-wider uppercase opacity-55">
              {product.category}
            </p>
          </a>
          <div className="flex items-baseline gap-2.5 mt-0.5">
            <span className="font-body font-medium text-theme-accent">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice ? (
              <span className="font-body text-sm text-theme-ink opacity-40 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
          </div>
          <button
            className="mt-2 self-start px-4 py-2.5 border border-theme-accent text-theme-accent font-body text-xs tracking-wide uppercase transition-colors hover:bg-theme-accent hover:text-theme-bg disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => addItem(product)}
            disabled={product.stock <= 0}
          >
            {product.stock <= 0 ? "Out of stock" : "Add to bag"}
          </button>
        </article>
      ))}
    </div>
  );
}
