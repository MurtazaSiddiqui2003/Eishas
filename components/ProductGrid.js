"use client";

import Image from "next/image";
import Link from "next/link";
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 lg:gap-x-8 lg:gap-y-10 px-4 sm:px-6 lg:px-8 pt-4 pb-16 max-w-[1400px] mx-auto">
      {products.map((product) => {
        const onSale = product.compareAtPrice > product.price;
        const discountPercent = onSale
          ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
          : 0;
        const secondImage = product.images?.[1];
        const hasVariants = Boolean(product.sizes?.length || product.colors?.length);
        const productHref = `${storeHref}/${product.slug}`;

        return (
          <article key={product._id} className="flex flex-col gap-1.5 group min-w-0">
            <Link href={productHref} className="block" aria-label={`View ${product.name}`}>
              <div className="relative w-full aspect-[3/4] mb-2 sm:mb-3 overflow-hidden bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]">
                {product.images?.[0] ? (
                  <>
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    {secondImage && (
                      <Image
                        src={secondImage}
                        alt=""
                        fill
                        sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
                        className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-placeholder-pattern" aria-hidden="true" />
                )}

                {onSale && (
                  <span className="absolute top-2 left-2 sm:top-3 sm:left-3 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-theme-accent text-theme-bg flex items-center justify-center text-[10px] sm:text-xs font-medium font-body shadow-sm">
                    -{discountPercent}%
                  </span>
                )}
              </div>
              <h3 className="font-display font-[var(--heading-weight,500)] text-sm sm:text-base text-theme-ink leading-snug">
                {product.name}
              </h3>
              <p className="font-body text-[10px] sm:text-xs tracking-wider uppercase opacity-55">
                {(product.categories || []).join(", ")}
              </p>
            </Link>

            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-0.5">
              <span className="font-body font-medium text-theme-accent text-sm sm:text-base">
                {formatPrice(product.price)}
              </span>
              {onSale ? (
                <span className="font-body text-xs sm:text-sm text-theme-ink opacity-40 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              ) : null}
            </div>

            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-[10px] sm:text-xs text-[#b3261e] font-body -mt-1" aria-live="polite">
                Only {product.stock} left
              </p>
            )}

            {product.stock <= 0 ? (
              <button
                type="button"
                disabled
                className="mt-2 self-start max-w-full px-2.5 sm:px-4 py-2 sm:py-2.5 border border-theme-accent text-theme-accent font-body text-[10px] sm:text-xs tracking-wide uppercase opacity-40 cursor-not-allowed"
              >
                Out of stock
              </button>
            ) : hasVariants ? (
              <Link
                href={productHref}
                className="mt-2 self-start max-w-full px-2.5 sm:px-4 py-2 sm:py-2.5 border border-theme-accent text-theme-accent font-body text-[10px] sm:text-xs tracking-wide uppercase transition-colors hover:bg-theme-accent hover:text-theme-bg"
              >
                Choose options
              </Link>
            ) : (
              <button
                type="button"
                className="mt-2 self-start max-w-full px-2.5 sm:px-4 py-2 sm:py-2.5 border border-theme-accent text-theme-accent font-body text-[10px] sm:text-xs tracking-wide uppercase transition-colors hover:bg-theme-accent hover:text-theme-bg"
                onClick={() => addItem(product, 1)}
              >
                Add to bag
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}
