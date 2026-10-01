"use client";

import { useState, useMemo } from "react";
import ProductGrid from "./ProductGrid";

export default function StoreCatalog({ products, storeHref }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");

  const categories = useMemo(() => {
    const set = new Set(products.flatMap((p) => p.categories || []).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;

    if (category !== "all") {
      list = list.filter((p) => (p.categories || []).includes(category));
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.categories || []).some((c) => c.toLowerCase().includes(q))
      );
    }

    list = [...list];
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return list;
  }, [products, category, query, sort]);

  const hasFilters = Boolean(query.trim()) || category !== "all" || sort !== "newest";

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setSort("newest");
  };

  const fieldClass =
    "px-3.5 py-2.5 border border-[color-mix(in_srgb,var(--ink)_20%,transparent)] text-sm font-body bg-transparent text-theme-ink";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 px-8 pt-6 pb-3 max-w-[1400px] mx-auto">
        <input
          type="text"
          placeholder="Search products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${fieldClass} flex-1 min-w-[160px] placeholder:opacity-50`}
          aria-label="Search products"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={fieldClass}
          aria-label="Filter by category"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All categories" : c}
            </option>
          ))}
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)} className={fieldClass} aria-label="Sort products">
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="px-3.5 py-2.5 text-sm font-body text-theme-accent hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="px-8 pb-4 max-w-[1400px] mx-auto text-xs font-body opacity-60">
        {filtered.length} {filtered.length === 1 ? "product" : "products"}
      </div>

      <ProductGrid
        products={filtered}
        emptyMessage={hasFilters ? "No products match your filters." : "No products are available yet."}
        storeHref={storeHref}
      />
    </div>
  );
}
