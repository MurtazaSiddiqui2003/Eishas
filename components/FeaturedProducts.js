import ProductGrid from "./ProductGrid";

export default function FeaturedProducts({ products, storeHref }) {
  const featured = products.filter((p) => p.featured);

  if (featured.length === 0) return null;

  return (
    <section className="pt-8">
      <h2 className="font-display text-xl px-8 mb-1 text-theme-ink">Featured</h2>
      <ProductGrid products={featured} storeHref={storeHref} />
      <div className="h-px mx-8 mb-2 bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]" />
    </section>
  );
}
