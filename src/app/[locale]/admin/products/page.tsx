"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { X, UploadSimple, Plus } from "@phosphor-icons/react";

type ProductImage = {
  id?: number;
  url: string;
  isPrimary: boolean;
  sortOrder?: number;
};

type ProductCategory = {
  category: { id: number; name: string; slug: string };
};

type ProductVariant = {
  id?: number;
  color: string;
  colorHex: string;
  size: string;
  cup?: string | null;
  stock: number;
  sku: string;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  discountPercent: number | null;
  collectionId: number | null;
  isActive: boolean;
  status?: string;
  collection: { name: string } | null;
  images?: ProductImage[];
  categories?: ProductCategory[];
  translations?: { locale: string; name: string; description: string | null; seoTitle: string | null; seoDesc: string | null }[];
  variants?: ProductVariant[];
};

type Collection = { id: number; name: string };
type Category = { id: number; name: string; slug: string };

const LOCALES = ["EN", "FR", "DE", "ES", "IT"];
const LOCALE_KEYS = ["en", "fr", "de", "es", "it"];
const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const CUP_SIZES = ["A", "B", "C", "D", "DD", "E", "F", "G", "H"];
const DEFAULT_COLORS = [
  { color: "Black", colorHex: "#000000" },
  { color: "Red", colorHex: "#C41E3A" },
  { color: "White", colorHex: "#FFFFFF" },
];

const TABS = [
  { key: "basic", label: "Basic Info" },
  { key: "sku", label: "SKU Matrix" },
  { key: "images", label: "Images" },
  { key: "seo", label: "SEO" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [activeLocale, setActiveLocale] = useState("EN");
  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const [translations, setTranslations] = useState<
    Record<string, { name: string; description: string; seoTitle?: string; seoDesc?: string }>
  >({});
  const [images, setImages] = useState<ProductImage[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", price: 0,
    compareAtPrice: 0, discountPercent: 0, collectionId: 0, isActive: true,
  });

  // ─── SKU Matrix state ──────────────────────────────────────────────
  const [variantColors, setVariantColors] = useState<{ color: string; colorHex: string }[]>([]);
  const [variantStocks, setVariantStocks] = useState<Record<string, number>>({});
  const [hasBrasCategory, setHasBrasCategory] = useState(false);
  const [savingVariants, setSavingVariants] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

  const variantSizes = useMemo(() => {
    if (hasBrasCategory) return [...DEFAULT_SIZES, ...CUP_SIZES];
    return [...DEFAULT_SIZES];
  }, [hasBrasCategory]);

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  }, []);

  const fetchCollections = useCallback(async () => {
    const res = await fetch("/api/collections");
    const data = await res.json();
    setCollections(Array.isArray(data) ? data : []);
  }, []);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => { fetchProducts(); fetchCollections(); fetchCategories(); }, [fetchProducts, fetchCollections, fetchCategories]);

  // ─── Stock helper ──────────────────────────────────────────────────
  const stockKey = (colorHex: string, size: string) => `${colorHex}::${size}`;

  const getStock = (colorHex: string, size: string): number => {
    return variantStocks[stockKey(colorHex, size)] ?? 0;
  };

  const setStock = (colorHex: string, size: string, value: number) => {
    setVariantStocks((prev) => ({
      ...prev,
      [stockKey(colorHex, size)]: Math.max(0, Math.floor(value) || 0),
    }));
  };

  // ─── Modal open/close ──────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null);
    setActiveLocale("EN");
    setActiveTab("basic");
    setTranslations({});
    setImages([]);
    setImageUrl("");
    setVariantColors(DEFAULT_COLORS.map((c) => ({ ...c })));
    setVariantStocks({});
    setHasBrasCategory(false);
    setNewColorName("");
    setNewColorHex("#000000");
    setForm({
      name: "", slug: "", description: "", price: 0, compareAtPrice: 0, discountPercent: 0,
      collectionId: collections[0]?.id || 0, isActive: true,
    });
    setSelectedCategoryIds([]);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setActiveLocale("EN");
    setActiveTab("basic");

    // Load translations from existing data
    const transMap: Record<string, { name: string; description: string; seoTitle?: string; seoDesc?: string }> = {};
    if (p.translations) {
      for (const t of p.translations) {
        transMap[t.locale.toUpperCase()] = {
          name: t.name,
          description: t.description || "",
          seoTitle: t.seoTitle || "",
          seoDesc: t.seoDesc || "",
        };
      }
    }
    if (!transMap["EN"]) {
      transMap["EN"] = { name: p.name, description: p.description || "" };
    }
    setTranslations(transMap);

    // Images
    setImages(
      (p.images || []).map((img) => ({
        url: img.url,
        isPrimary: img.isPrimary,
        id: img.id,
        sortOrder: img.sortOrder,
      }))
    );
    setImageUrl("");

    // Form
    setForm({
      name: p.name, slug: p.slug, description: p.description || "",
      price: p.price, compareAtPrice: p.compareAtPrice || 0,
      discountPercent: p.discountPercent || 0,
      collectionId: p.collectionId || 0, isActive: p.isActive,
    });

    // SKU Matrix: derive from existing variants
    if (p.variants && p.variants.length > 0) {
      const colorMap = new Map<string, { color: string; colorHex: string }>();
      const stocks: Record<string, number> = {};
      for (const v of p.variants) {
        colorMap.set(v.colorHex, { color: v.color, colorHex: v.colorHex });
        stocks[stockKey(v.colorHex, v.size)] = v.stock;
      }
      setVariantColors(Array.from(colorMap.values()));
      setVariantStocks(stocks);
    } else {
      setVariantColors(DEFAULT_COLORS.map((c) => ({ ...c })));
      setVariantStocks({});
    }

    // Check for Bras category
    const cats = p.categories || [];
    setHasBrasCategory(cats.some((c) => c.category.name.toLowerCase().includes("bras")));
    setSelectedCategoryIds(cats.map((c) => c.category.id));

    setNewColorName("");
    setNewColorHex("#000000");
    setModalOpen(true);
  };

  // ─── Locale switching ──────────────────────────────────────────────
  const switchLocale = (loc: string) => {
    // Save current form values to translations
    setTranslations((prev) => ({
      ...prev,
      [activeLocale]: {
        ...prev[activeLocale],
        name: form.name,
        description: form.description,
      },
    }));
    const t = translations[loc] || { name: "", description: "" };
    setForm((prev) => ({ ...prev, name: t.name, description: t.description }));
    setActiveLocale(loc);
  };

  // ─── Image helpers ─────────────────────────────────────────────────
  const addImageUrl = () => {
    const trimmed = imageUrl.trim();
    if (!trimmed) return;
    setImages((prev) => [...prev, { url: trimmed, isPrimary: prev.length === 0 }]);
    setImageUrl("");
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (prev[index]?.isPrimary && next.length > 0) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  };

  const setPrimary = (index: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setImages((prev) => [...prev, { url: data.url, isPrimary: prev.length === 0 }]);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // ─── Color management ──────────────────────────────────────────────
  const addColor = () => {
    const name = newColorName.trim();
    if (!name) {
      alert("Please enter a color name.");
      return;
    }
    if (variantColors.some((c) => c.colorHex === newColorHex)) {
      alert(`Color hex ${newColorHex} already exists. Pick a different color.`);
      return;
    }
    if (variantColors.some((c) => c.color.toLowerCase() === name.toLowerCase())) {
      alert(`Color "${name}" already exists.`);
      return;
    }
    setVariantColors((prev) => [...prev, { color: name, colorHex: newColorHex }]);
    setNewColorName("");
  };

  const removeColor = (colorHex: string) => {
    setVariantColors((prev) => prev.filter((c) => c.colorHex !== colorHex));
    // Remove stocks for this color
    setVariantStocks((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key.startsWith(`${colorHex}::`)) delete next[key];
      }
      return next;
    });
  };

  // Batch fill helpers
  const fillRow = (colorHex: string, value: number) => {
    setVariantStocks((prev) => {
      const next = { ...prev };
      for (const size of variantSizes) {
        next[stockKey(colorHex, size)] = value;
      }
      return next;
    });
  };

  const fillColumn = (size: string, value: number) => {
    setVariantStocks((prev) => {
      const next = { ...prev };
      for (const c of variantColors) {
        next[stockKey(c.colorHex, size)] = value;
      }
      return next;
    });
  };

  // Generate variants array from matrix state
  const buildVariants = (): ProductVariant[] => {
    const result: ProductVariant[] = [];
    for (const c of variantColors) {
      for (const size of variantSizes) {
        const stock = getStock(c.colorHex, size);
        const colorSlug = c.color.toLowerCase().replace(/\s+/g, "-");
        const sizeSlug = size.toLowerCase();
        const sku = `${form.slug || editing?.slug || "product"}-${colorSlug}-${sizeSlug}`;
        const isCup = CUP_SIZES.includes(size);
        result.push({
          color: c.color,
          colorHex: c.colorHex,
          size,
          cup: isCup ? size : null,
          stock,
          sku,
        });
      }
    }
    return result;
  };

  // ─── Save variants (tab-level save) ────────────────────────────────
  const saveVariants = async () => {
    if (!editing) return;
    setSavingVariants(true);
    try {
      const variants = buildVariants();
      await fetch(`/api/admin/products/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variants }),
      });
    } finally {
      setSavingVariants(false);
      fetchProducts();
    }
  };

  // ─── Main product save ─────────────────────────────────────────────
  const save = async () => {
    // Finalize translations with current form values
    const finalTranslations = {
      ...translations,
      [activeLocale]: {
        ...translations[activeLocale],
        name: form.name,
        description: form.description,
      },
    };

    const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";
    const method = editing ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        translations: finalTranslations,
        categories: selectedCategoryIds.map((id) => ({ categoryId: id })),
        images: images.map((img, i) => ({
          url: img.url,
          isPrimary: img.isPrimary,
          sortOrder: i,
        })),
      }),
    });
    setModalOpen(false);
    fetchProducts();
  };

  const toggleActive = async (p: Product) => {
    await fetch(`/api/admin/products/${p.id}/toggle`, { method: "PATCH" });
    fetchProducts();
  };

  const deleteProduct = async (p: Product) => {
    if (!confirm(`Delete ${p.name}?`)) return;
    await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    fetchProducts();
  };

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [collectionFilter, setCollectionFilter] = useState("0");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === "ACTIVE" && p.status !== "ACTIVE") return false;
    if (statusFilter === "DRAFT" && p.status !== "DRAFT") return false;
    if (statusFilter === "ARCHIVED" && p.status !== "ARCHIVED") return false;
    if (collectionFilter !== "0" && p.collectionId !== parseInt(collectionFilter)) return false;
    return true;
  });

  const toggleSelect = (id: number) => {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const selectAll = () => {
    if (selected.size === filtered.length) { setSelected(new Set()); }
    else { setSelected(new Set(filtered.map(p => p.id))); }
  };
  const bulkAction = async (action: string) => {
    setBulkLoading(true);
    await fetch("/api/admin/products/batch", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected), action }),
    });
    setSelected(new Set());
    setBulkLoading(false);
    fetchProducts();
  };

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl text-text-primary">
          Products ({products.length})
        </h1>
        <button
          onClick={openAdd}
          className="rounded bg-brand-dark px-6 py-2 font-medium text-xs uppercase tracking-widest text-text-light"
        >
          + Add Product
        </button>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full max-w-xs rounded border border-border bg-brand-primary px-4 py-2 font-body text-sm outline-none focus:border-brand-gold"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded border border-border bg-brand-primary px-3 py-2 font-body text-sm">
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select value={collectionFilter} onChange={(e) => setCollectionFilter(e.target.value)} className="rounded border border-border bg-brand-primary px-3 py-2 font-body text-sm">
          <option value="0">All Collections</option>
          {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded border border-brand-gold/30 bg-brand-gold/5 px-4 py-3">
          <span className="font-body text-sm text-text-primary">{selected.size} selected</span>
          <button onClick={() => bulkAction("activate")} disabled={bulkLoading} className="rounded bg-emerald-600 px-3 py-1.5 font-medium text-[10px] uppercase text-white hover:bg-emerald-700">Active</button>
          <button onClick={() => bulkAction("draft")} disabled={bulkLoading} className="rounded bg-yellow-600 px-3 py-1.5 font-medium text-[10px] uppercase text-white hover:bg-yellow-700">Draft</button>
          <button onClick={() => bulkAction("archive")} disabled={bulkLoading} className="rounded bg-gray-600 px-3 py-1.5 font-medium text-[10px] uppercase text-white hover:bg-gray-700">Archive</button>
          <button onClick={() => { if (confirm(`Delete ${selected.size} products?`)) bulkAction("delete"); }} disabled={bulkLoading} className="rounded bg-red-600 px-3 py-1.5 font-medium text-[10px] uppercase text-white hover:bg-red-700">
            {bulkLoading ? "..." : "Delete"}
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto font-body text-xs text-text-secondary underline">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full text-left font-body text-sm">
          <thead>
            <tr className="border-b border-border bg-brand-primary text-text-secondary">
              <th className="py-3 pl-4 w-10"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={selectAll} /></th>
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 px-4">Collection</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 pl-4 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-brand-secondary/50">
                <td className="py-3 pl-4"><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                <td className="py-3 pr-4 font-medium text-text-primary">{p.name}</td>
                <td className="py-3 px-4 text-text-secondary">{p.collection?.name || "—"}</td>
                <td className="py-3 px-4">${p.price}</td>
                <td className="py-3 px-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    p.status === "ACTIVE" ? "bg-green-100 text-green-800" : p.status === "DRAFT" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                  }`}>
                    {p.status || (p.isActive ? "ACTIVE" : "INACTIVE")}
                  </span>
                </td>
                <td className="py-3 pl-4 pr-4">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(p)} className="text-brand-gold hover:underline">Edit</button>
                    <button onClick={() => deleteProduct(p)} className="text-red-500 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-text-secondary">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Modal ──────────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded bg-brand-primary p-8 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-6 font-display text-xl">
              {editing ? "Edit Product" : "Add Product"}
            </h2>

            {/* ── Tab bar ──────────────────────────────────────────── */}
            <div className="mb-6 flex border-b border-border">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-2.5 font-medium text-[11px] uppercase tracking-wider transition-colors border-b-2 -mb-[1px] ${
                    activeTab === tab.key
                      ? "border-brand-dark text-text-primary"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Tab: Basic Info ───────────────────────────────────── */}
            {activeTab === "basic" && (
              <div className="flex flex-col gap-4">
                {/* Language tabs */}
                <div>
                  <p className="mb-2 font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                    Language
                  </p>
                  <div className="flex gap-1 rounded border border-border p-1">
                    {LOCALES.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => switchLocale(loc)}
                        className={`flex-1 rounded py-1.5 font-medium text-[10px] font-medium transition-colors ${
                          activeLocale === loc
                            ? "bg-brand-dark text-text-light"
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  placeholder={`Name (${activeLocale})`}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded border border-border bg-brand-primary px-4 py-2 font-body text-sm"
                />
                <textarea
                  placeholder={`Description (${activeLocale})`}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="h-24 rounded border border-border bg-brand-primary px-4 py-2 font-body text-sm"
                />

                <input
                  placeholder="Slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="rounded border border-border bg-brand-primary px-4 py-2 font-body text-sm"
                />

                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Price"
                    value={form.price || ""}
                    onChange={(e) => setForm({ ...form, price: +e.target.value })}
                    className="flex-1 rounded border border-border bg-brand-primary px-4 py-2 font-body text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Compare At"
                    value={form.compareAtPrice || ""}
                    onChange={(e) => setForm({ ...form, compareAtPrice: +e.target.value })}
                    className="flex-1 rounded border border-border bg-brand-primary px-4 py-2 font-body text-sm"
                  />
                </div>

                {/* Discount */}
                <div>
                  <label className="mb-1.5 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                    Discount (%)
                  </label>
                  <select
                    value={form.discountPercent || 0}
                    onChange={(e) => setForm({ ...form, discountPercent: +e.target.value })}
                    className="w-full rounded border border-border bg-brand-primary px-4 py-2 font-body text-sm"
                  >
                    <option value={0}>No Discount</option>
                    <option value={5}>5% Off</option>
                    <option value={10}>10% Off</option>
                    <option value={15}>15% Off</option>
                    <option value={20}>20% Off</option>
                    <option value={25}>25% Off</option>
                    <option value={30}>30% Off</option>
                    <option value={40}>40% Off</option>
                    <option value={50}>50% Off</option>
                  </select>
                </div>

                <select
                  value={form.collectionId}
                  onChange={(e) => setForm({ ...form, collectionId: +e.target.value })}
                  className="rounded border border-border bg-brand-primary px-4 py-2 font-body text-sm"
                >
                  <option value={0}>No Collection</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Categories multi-select */}
                <div>
                  <p className="mb-2 font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                    Categories
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 font-body text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategoryIds.includes(cat.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategoryIds((prev) => [...prev, cat.id]);
                            } else {
                              setSelectedCategoryIds((prev) => prev.filter((id) => id !== cat.id));
                            }
                          }}
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 font-body text-sm">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />{" "}
                  Active
                </label>

                {/* Save / Cancel */}
                <div className="mt-2 flex gap-3">
                  <button
                    onClick={save}
                    className="flex-1 rounded bg-brand-dark py-3 font-medium text-xs uppercase tracking-widest text-text-light"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 rounded border border-border py-3 font-medium text-xs uppercase tracking-widest text-text-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ── Tab: SKU Matrix ───────────────────────────────────── */}
            {activeTab === "sku" && (
              <div>
                {!editing && (
                  <p className="text-sm text-text-secondary mb-4">
                    Save the product first, then edit to manage SKU variants.
                  </p>
                )}

                {editing && (
                  <div className="flex flex-col gap-6">
                    {/* Color management */}
                    <div>
                      <p className="mb-3 font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                        Colors
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {variantColors.map((c) => (
                          <div
                            key={c.colorHex}
                            className="flex items-center gap-2 rounded border border-border bg-brand-secondary px-3 py-1.5"
                          >
                            <span
                              className="h-4 w-4 rounded-full border border-border/50"
                              style={{ backgroundColor: c.colorHex }}
                            />
                            <span className="font-body text-xs text-text-primary">{c.color}</span>
                            <button
                              onClick={() => removeColor(c.colorHex)}
                              className="text-text-secondary hover:text-red-500 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      {/* Add new color */}
                      <div className="flex gap-2 items-end">
                        <input
                          type="color"
                          value={newColorHex}
                          onChange={(e) => setNewColorHex(e.target.value)}
                          className="h-8 w-10 rounded border border-border cursor-pointer"
                        />
                        <input
                          placeholder="Color name..."
                          value={newColorName}
                          onChange={(e) => setNewColorName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addColor()}
                          className="w-32 rounded border border-border bg-brand-secondary px-3 py-1.5 font-body text-xs"
                        />
                        <button
                          onClick={addColor}
                          className="flex items-center gap-1 rounded bg-brand-dark px-4 py-1.5 font-medium text-[10px] uppercase tracking-wider text-text-light"
                        >
                          <Plus size={12} /> Add
                        </button>
                      </div>
                    </div>

                    {/* SKU Matrix table */}
                    <div>
                      <p className="mb-3 font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                        Stock Matrix
                      </p>
                      <div className="overflow-x-auto rounded border border-border">
                        <table className="w-full text-left font-body text-xs">
                          <thead>
                            <tr className="border-b border-border bg-brand-secondary">
                              <th className="py-2 px-3 text-text-secondary font-medium sticky left-0 bg-brand-secondary">
                                Color ↓ / Size →
                              </th>
                              {variantSizes.map((size) => (
                                <th key={size} className="py-2 px-0 text-center text-text-secondary font-medium min-w-[3.5rem]">
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span>{size}</span>
                                    <button
                                      onClick={() => fillColumn(size, 0)}
                                      className="font-medium text-[8px] text-text-secondary/40 hover:text-brand-gold"
                                      title={`Set all ${size} to value`}
                                    >
                                      <input
                                        type="number"
                                        className="w-8 text-center text-[9px] bg-transparent border border-border/30 rounded px-0.5 py-0"
                                        placeholder="0"
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                          const v = parseInt(e.target.value);
                                          if (!isNaN(v)) fillColumn(size, v);
                                        }}
                                      />
                                    </button>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {variantColors.map((c) => (
                              <tr key={c.colorHex} className="border-b border-border/50 hover:bg-brand-secondary/30">
                                <td className="py-1.5 px-3 sticky left-0 bg-brand-primary">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="h-3 w-3 rounded-full border border-border/40 shrink-0"
                                      style={{ backgroundColor: c.colorHex }}
                                    />
                                    <span className="text-text-primary font-medium whitespace-nowrap">
                                      {c.color}
                                    </span>
                                    <input
                                      type="number"
                                      className="w-10 text-center text-[9px] bg-transparent border border-border/30 rounded px-0.5 py-0 ml-1"
                                      placeholder="0"
                                      onChange={(e) => {
                                        const v = parseInt(e.target.value);
                                        if (!isNaN(v)) fillRow(c.colorHex, v);
                                      }}
                                      title="Set entire row"
                                    />
                                  </div>
                                </td>
                                {variantSizes.map((size) => (
                                  <td key={size} className="py-1.5 px-0 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      value={getStock(c.colorHex, size) || ""}
                                      onChange={(e) =>
                                        setStock(c.colorHex, size, parseInt(e.target.value) || 0)
                                      }
                                      className="w-12 text-center rounded border border-border/40 bg-brand-primary px-1 py-1 font-body text-xs outline-none focus:border-brand-gold"
                                      placeholder="0"
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                            {variantColors.length === 0 && (
                              <tr>
                                <td
                                  colSpan={variantSizes.length + 1}
                                  className="py-8 text-center text-text-secondary"
                                >
                                  Add at least one color to build the SKU matrix.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Save Variants button */}
                    <button
                      onClick={saveVariants}
                      disabled={savingVariants}
                      className="self-start rounded bg-brand-dark px-8 py-3 font-medium text-xs uppercase tracking-widest text-text-light disabled:opacity-50"
                    >
                      {savingVariants ? "Saving..." : "Save Variants"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Images ────────────────────────────────────────── */}
            {activeTab === "images" && (
              <div className="flex flex-col gap-4">
                <p className="font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                  Images
                </p>

                {/* Thumbnails row */}
                <div className="flex flex-wrap gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={img.url}
                        alt=""
                        className={`h-16 w-16 rounded border object-cover ${
                          img.isPrimary
                            ? "border-brand-gold ring-1 ring-brand-gold/30"
                            : "border-border"
                        }`}
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-burgundy text-white hover:bg-brand-burgundy/80 transition-opacity opacity-0 group-hover:opacity-100"
                      >
                        <X size={10} />
                      </button>
                      <button
                        onClick={() => setPrimary(i)}
                        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 rounded px-1.5 py-0.5 font-medium text-[8px] uppercase transition-opacity ${
                          img.isPrimary
                            ? "bg-brand-gold text-brand-dark"
                            : "bg-text-secondary/60 text-white opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {img.isPrimary ? "Primary" : "Set"}
                      </button>
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 5 - images.length) }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="flex h-16 w-16 items-center justify-center rounded border border-dashed border-border/50 bg-brand-secondary/50"
                    >
                      <Plus size={14} className="text-text-secondary/30" />
                    </div>
                  ))}
                </div>

                {/* Add URL / UploadSimple */}
                <div className="flex gap-2">
                  <input
                    placeholder="Paste image URL..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addImageUrl()}
                    className="flex-1 rounded border border-border bg-brand-secondary px-3 py-1.5 font-body text-xs text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-brand-gold"
                  />
                  <button
                    onClick={addImageUrl}
                    className="rounded bg-brand-dark px-3 py-1.5 font-medium text-[10px] uppercase tracking-wider text-text-light"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1 rounded border border-border bg-brand-secondary px-3 py-1.5 font-medium text-[10px] uppercase tracking-wider text-text-secondary hover:text-text-primary disabled:opacity-50"
                  >
                    <UploadSimple size={12} /> {uploading ? "..." : "UploadSimple"}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                  />
                </div>

                {/* Save / Cancel */}
                <div className="mt-2 flex gap-3">
                  <button
                    onClick={save}
                    className="flex-1 rounded bg-brand-dark py-3 font-medium text-xs uppercase tracking-widest text-text-light"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 rounded border border-border py-3 font-medium text-xs uppercase tracking-widest text-text-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ── Tab: SEO ───────────────────────────────────────────── */}
            {activeTab === "seo" && (
              <div className="flex flex-col gap-4">
                {/* Language tabs */}
                <div>
                  <p className="mb-2 font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                    Language
                  </p>
                  <div className="flex gap-1 rounded border border-border p-1">
                    {LOCALES.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          // Save current SEO fields to translations
                          setTranslations((prev) => ({
                            ...prev,
                            [activeLocale]: {
                              ...prev[activeLocale],
                              seoTitle: prev[activeLocale]?.seoTitle || "",
                              seoDesc: prev[activeLocale]?.seoDesc || "",
                            },
                          }));
                          setActiveLocale(loc);
                        }}
                        className={`flex-1 rounded py-1.5 font-medium text-[10px] font-medium transition-colors ${
                          activeLocale === loc
                            ? "bg-brand-dark text-text-light"
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SEO fields for current locale */}
                <div>
                  <label className="block mb-1 font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                    SEO Title ({activeLocale})
                  </label>
                  <input
                    placeholder={`SEO Title (${activeLocale})`}
                    value={translations[activeLocale]?.seoTitle || ""}
                    onChange={(e) =>
                      setTranslations((prev) => ({
                        ...prev,
                        [activeLocale]: { ...prev[activeLocale], seoTitle: e.target.value },
                      }))
                    }
                    className="w-full rounded border border-border bg-brand-primary px-4 py-2 font-body text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                    SEO Description ({activeLocale})
                  </label>
                  <textarea
                    placeholder={`SEO Description (${activeLocale})`}
                    value={translations[activeLocale]?.seoDesc || ""}
                    onChange={(e) =>
                      setTranslations((prev) => ({
                        ...prev,
                        [activeLocale]: { ...prev[activeLocale], seoDesc: e.target.value },
                      }))
                    }
                    className="h-24 w-full rounded border border-border bg-brand-primary px-4 py-2 font-body text-sm"
                  />
                </div>

                {/* Save / Cancel */}
                <div className="mt-2 flex gap-3">
                  <button
                    onClick={save}
                    className="flex-1 rounded bg-brand-dark py-3 font-medium text-xs uppercase tracking-widest text-text-light"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 rounded border border-border py-3 font-medium text-xs uppercase tracking-widest text-text-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
