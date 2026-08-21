"use client";

import { useEffect, useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import OrdersPanel from "@/components/admin/OrdersPanel";
import PaymentPanel from "@/components/admin/PaymentPanel";
import { formatPrice } from "@/lib/currency";

// Curated per-store category tags — checkable, not exclusive, since a
// product can be tagged with several (e.g. an apparel piece can be both
// "Lehngas" and "Unstitched"). Plus a free-text box for anything not
// on the list.
const CATEGORY_PRESETS = {
  apparel: ["Sarees", "Lehngas", "Suits", "Kurtis", "Sharara", "Unstitched", "Stitched", "Fabric"],
  beauty: ["Skincare", "Makeup", "Haircare", "Fragrance"],
  jewelry: ["Earrings", "Necklaces", "Bangles", "Rings", "Sets"],
};

const emptyForm = {
  store: "apparel",
  name: "",
  slug: "",
  description: "",
  price: "",
  compareAtPrice: "",
  images: [],
  categories: [],
  sizes: "",
  colors: "",
  fabric: "",
  skinType: "",
  volume: "",
  material: "",
  stock: "10",
  featured: false,
};

export default function AdminPage() {
  const [activeStore, setActiveStore] = useState("apparel");
  const [section, setSection] = useState("products"); // "products" | "design"

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [customCategory, setCustomCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({});
  const [settingsForm, setSettingsForm] = useState({
    logo: "",
    doorImage: "",
    doorImageMobile: "",
    heroImage: "",
    heroImageMobile: "",
    instagramUrl: "",
  });
  const [settingsStatus, setSettingsStatus] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  async function loadProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  }

  async function loadSettings() {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setSettings(data);
  }

  useEffect(() => {
    loadProducts();
    loadSettings();
  }, []);

  // Whenever we switch stores, load that store's saved design settings
  // into the design form (or blank fields if it hasn't been set up yet).
  useEffect(() => {
    const s = settings[activeStore];
    setSettingsForm({
      logo: s?.logo || "",
      doorImage: s?.doorImage || "",
      doorImageMobile: s?.doorImageMobile || "",
      heroImage: s?.heroImage || "",
      heroImageMobile: s?.heroImageMobile || "",
      instagramUrl: s?.instagramUrl || "",
    });
  }, [activeStore, settings]);

  function update(field) {
    return (e) => {
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
    };
  }

  // Slug auto-fills from the name unless the person has edited it themselves.
  function updateName(e) {
    const name = e.target.value;
    setForm((f) => ({
      ...f,
      name,
      slug: f.slug === slugify(f.name) ? slugify(name) : f.slug,
    }));
  }

  function slugify(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function toggleCategory(cat) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }));
  }

  function addCustomCategory() {
    const trimmed = customCategory.trim();
    if (trimmed && !form.categories.includes(trimmed)) {
      setForm((f) => ({ ...f, categories: [...f.categories, trimmed] }));
    }
    setCustomCategory("");
  }

  function resetForm(store) {
    setForm({ ...emptyForm, store });
    setCustomCategory("");
    setEditingId(null);
  }

  function handleEdit(p) {
    setEditingId(p._id);
    setStatus(null);
    setForm({
      store: p.store,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: String(p.price),
      compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : "",
      images: p.images || [],
      categories: p.categories || [],
      sizes: (p.sizes || []).join(", "),
      colors: (p.colors || []).join(", "),
      fabric: p.fabric || "",
      skinType: p.skinType || "",
      volume: p.volume || "",
      material: p.material || "",
      stock: String(p.stock),
      featured: !!p.featured,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      if (form.images.length === 0) {
        throw new Error("Add at least one product image");
      }
      if (form.categories.length === 0) {
        throw new Error("Pick at least one category");
      }

      const payload = {
        store: form.store,
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
        images: form.images,
        categories: form.categories,
        stock: parseInt(form.stock, 10) || 0,
        featured: form.featured,
        ...(form.store === "apparel" && {
          sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
          colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
          fabric: form.fabric,
        }),
        ...(form.store === "beauty" && {
          skinType: form.skinType,
          volume: form.volume,
        }),
        ...(form.store === "jewelry" && {
          material: form.material,
          colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
        }),
      };

      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Could not save product");
      }

      setStatus({ type: "success", message: editingId ? "Product updated." : "Product added." });
      resetForm(form.store);
      loadProducts();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (editingId === id) resetForm(activeStore);
    loadProducts();
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsStatus(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ store: activeStore, ...settingsForm }),
      });

      if (!res.ok) throw new Error("Could not save design settings");

      setSettingsStatus({ type: "success", message: "Saved." });
      loadSettings();
    } catch (err) {
      setSettingsStatus({ type: "error", message: err.message });
    } finally {
      setSavingSettings(false);
    }
  }

  const filtered = products.filter((p) => p.store === activeStore);

  const inputClass = "px-3 py-2.5 border border-[#d5d5d0] text-sm font-inherit";
  const labelClass = "text-xs text-[#666] -mb-1.5";

  return (
    <>
      <header className="print:hidden flex flex-wrap justify-between items-center gap-4 px-8 py-6 border-b border-[#ddd]">
        <h1 className="text-xl">Eisha&rsquo;s — Admin</h1>

        <div className="flex flex-wrap items-center gap-6">
          {(section === "products" || section === "design") && (
            <div className="flex gap-4 text-sm">
              {["apparel", "beauty", "jewelry"].map((store) => (
                <button
                  key={store}
                  className={`px-3.5 py-1.5 border ${
                    activeStore === store
                      ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                      : "bg-white border-[#ddd]"
                  }`}
                  onClick={() => {
                    setActiveStore(store);
                    resetForm(store);
                  }}
                >
                  {store[0].toUpperCase() + store.slice(1)}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 text-xs">
            <button
              className={`px-3 py-1.5 border ${
                section === "products" ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "border-[#ddd]"
              }`}
              onClick={() => setSection("products")}
            >
              Products
            </button>
            <button
              className={`px-3 py-1.5 border ${
                section === "design" ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "border-[#ddd]"
              }`}
              onClick={() => setSection("design")}
            >
              Store design
            </button>
            <button
              className={`px-3 py-1.5 border ${
                section === "orders" ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "border-[#ddd]"
              }`}
              onClick={() => setSection("orders")}
            >
              Orders
            </button>
            <button
              className={`px-3 py-1.5 border ${
                section === "payment" ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "border-[#ddd]"
              }`}
              onClick={() => setSection("payment")}
            >
              Payment
            </button>
          </div>
        </div>
      </header>

      {section === "orders" ? (
        <OrdersPanel />
      ) : section === "payment" ? (
        <PaymentPanel />
      ) : section === "design" ? (
        <div className="p-8 max-w-[560px] mx-auto">
          <form onSubmit={handleSaveSettings} className="flex flex-col gap-6 bg-white p-6 border border-[#e2e2de]">
            <div>
              <h2 className="text-sm mb-1">Design — {activeStore}</h2>
              <p className="text-xs text-[#888]">
                These images control the nav logo, the landing page split-screen
                panel, and the hero banner at the top of this store.
              </p>
            </div>

            <ImageUploader
              label="Logo (shown in the nav bar, square works best)"
              value={settingsForm.logo}
              onChange={(url) => setSettingsForm((f) => ({ ...f, logo: url }))}
            />

            <div>
              <label className="text-xs text-[#666] block mb-1.5">
                Instagram URL (shown in this store&rsquo;s footer and the Contact page)
              </label>
              <input
                className="w-full px-3 py-2.5 border border-[#d5d5d0] text-sm"
                placeholder="https://instagram.com/yourhandle"
                value={settingsForm.instagramUrl}
                onChange={(e) => setSettingsForm((f) => ({ ...f, instagramUrl: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-3 pb-5 border-b border-[#eee]">
              <ImageUploader
                label="Landing page split-screen image — desktop"
                value={settingsForm.doorImage}
                onChange={(url) => setSettingsForm((f) => ({ ...f, doorImage: url }))}
              />
              <ImageUploader
                label="Same, but for mobile (optional — falls back to the desktop image above if left empty). Use this when the desktop photo is a wide shot that would crop awkwardly on a tall phone screen."
                value={settingsForm.doorImageMobile}
                onChange={(url) => setSettingsForm((f) => ({ ...f, doorImageMobile: url }))}
              />
            </div>

            <div className="flex flex-col gap-3">
              <ImageUploader
                label="Store hero banner image — desktop"
                value={settingsForm.heroImage}
                onChange={(url) => setSettingsForm((f) => ({ ...f, heroImage: url }))}
              />
              <ImageUploader
                label="Same, but for mobile (optional — falls back to the desktop image above if left empty)"
                value={settingsForm.heroImageMobile}
                onChange={(url) => setSettingsForm((f) => ({ ...f, heroImageMobile: url }))}
              />
            </div>

            {settingsStatus && (
              <p className={`text-sm ${settingsStatus.type === "success" ? "text-[#1f7a3d]" : "text-[#b3261e]"}`}>
                {settingsStatus.message}
              </p>
            )}

            <button
              type="submit"
              disabled={savingSettings}
              className="py-3 bg-[#1a1a1a] text-white text-sm disabled:opacity-50"
            >
              {savingSettings ? "Saving…" : "Save design"}
            </button>
          </form>
        </div>
      ) : (
        <div className="p-8 max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 bg-white p-6 border border-[#e2e2de]">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm">
                {editingId ? "Edit product" : "Add product"} — {activeStore}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={() => resetForm(activeStore)}
                  className="text-xs text-[#888] hover:text-[#1a1a1a]"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <input className={inputClass} placeholder="Name" value={form.name} onChange={updateName} required />
            <input className={inputClass} placeholder="Slug (url)" value={form.slug} onChange={update("slug")} required />
            <textarea
              className={`${inputClass} min-h-[80px] resize-y`}
              placeholder="Description"
              value={form.description}
              onChange={update("description")}
              required
            />

            <div>
              <label className={labelClass}>Categories (pick as many as apply)</label>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 mb-2">
                {CATEGORY_PRESETS[form.store].map((c) => (
                  <label key={c} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-auto"
                      checked={form.categories.includes(c)}
                      onChange={() => toggleCategory(c)}
                    />
                    {c}
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  className={`${inputClass} flex-1`}
                  placeholder="Add a custom category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomCategory();
                    }
                  }}
                />
                <button type="button" onClick={addCustomCategory} className="px-4 border border-[#d5d5d0] text-sm">
                  Add
                </button>
              </div>

              {form.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.categories.map((c) => (
                    <span key={c} className="flex items-center gap-1 px-2.5 py-1 bg-[#f0f0ee] text-xs">
                      {c}
                      <button type="button" onClick={() => toggleCategory(c)} className="opacity-60 hover:opacity-100">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <ImageUploader
              label="Product images (first one is the main image)"
              multiple
              value={form.images}
              onChange={(urls) => setForm((f) => ({ ...f, images: urls }))}
            />

            <label className={labelClass}>Price / Compare-at price / Stock</label>
            <div className="flex gap-2">
              <input className={inputClass} type="number" step="0.01" placeholder="Price" value={form.price} onChange={update("price")} required />
              <input className={inputClass} type="number" step="0.01" placeholder="Was (optional)" value={form.compareAtPrice} onChange={update("compareAtPrice")} />
              <input className={inputClass} type="number" placeholder="Stock" value={form.stock} onChange={update("stock")} />
            </div>

            {form.store === "apparel" && (
              <>
                <input className={inputClass} placeholder="Sizes (S, M, L, XL)" value={form.sizes} onChange={update("sizes")} />
                <input className={inputClass} placeholder="Colors (comma-separated, e.g. Maroon, Navy)" value={form.colors} onChange={update("colors")} />
                <input className={inputClass} placeholder="Fabric (e.g. Chiffon, Silk, Cotton)" value={form.fabric} onChange={update("fabric")} />
              </>
            )}

            {form.store === "beauty" && (
              <>
                <input className={inputClass} placeholder="Skin type (e.g. All, Dry, Oily)" value={form.skinType} onChange={update("skinType")} />
                <input className={inputClass} placeholder="Volume (e.g. 50ml)" value={form.volume} onChange={update("volume")} />
              </>
            )}

            {form.store === "jewelry" && (
              <>
                <input className={inputClass} placeholder="Material (e.g. 22k Gold Plated)" value={form.material} onChange={update("material")} />
                <input className={inputClass} placeholder="Colors (comma-separated, e.g. Rose Gold, Antique Silver)" value={form.colors} onChange={update("colors")} />
              </>
            )}

            <label className="flex items-center gap-1.5 flex-row text-sm">
              <input type="checkbox" checked={form.featured} onChange={update("featured")} className="w-auto" />
              Feature this product
            </label>

            {status && (
              <p className={`text-sm ${status.type === "success" ? "text-[#1f7a3d]" : "text-[#b3261e]"}`}>
                {status.message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="py-3 mt-2 bg-[#1a1a1a] text-white text-sm disabled:opacity-50"
            >
              {saving ? "Saving…" : editingId ? "Save changes" : "Add product"}
            </button>
          </form>

          <div>
            <h2 className="text-sm mb-3">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""} in {activeStore}
            </h2>
            {filtered.length === 0 ? (
              <p className="text-sm text-[#888] py-4">No products yet in this store.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filtered.map((p) => (
                  <div
                    key={p._id}
                    className={`flex gap-3 items-center bg-white border px-4 py-2.5 text-sm ${
                      editingId === p._id ? "border-[#1a1a1a]" : "border-[#e2e2de]"
                    }`}
                  >
                    {p.images?.[0] && (
                      <img src={p.images[0]} alt={p.name} className="w-10 h-[50px] object-cover bg-[#eee] shrink-0" />
                    )}
                    <div className="flex-1">
                      {p.name}
                      <div className="text-xs uppercase tracking-wide text-[#888]">
                        {(p.categories || []).join(", ")} · {formatPrice(p.price)} {p.images?.length > 1 ? `· ${p.images.length} images` : ""}
                      </div>
                    </div>
                    <button onClick={() => handleEdit(p)} className="text-xs text-[#666] hover:text-[#1a1a1a]">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="text-xs text-[#666] hover:text-[#b3261e]">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
