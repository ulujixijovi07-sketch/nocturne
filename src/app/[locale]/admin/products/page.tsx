"use client";

import { useState, useEffect, useCallback } from "react";

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  collectionId: number | null;
  isActive: boolean;
  collection: { name: string } | null;
};

type Collection = { id: number; name: string };

const LOCALES = ["EN", "FR", "DE", "ES", "IT"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [activeLocale, setActiveLocale] = useState("EN");
  const [translations, setTranslations] = useState<Record<string, { name: string; description: string }>>({});
  const [form, setForm] = useState({
    name: "", slug: "", description: "", price: 0,
    compareAtPrice: 0, collectionId: 0, isActive: true,
  });

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

  useEffect(() => { fetchProducts(); fetchCollections(); }, [fetchProducts, fetchCollections]);

  const openAdd = () => {
    setEditing(null);
    setActiveLocale("EN");
    setTranslations({});
    setForm({ name: "", slug: "", description: "", price: 0, compareAtPrice: 0, collectionId: collections[0]?.id || 0, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setActiveLocale("EN");
    setTranslations({ EN: { name: p.name, description: p.description || "" } });
    setForm({ name: p.name, slug: p.slug, description: p.description || "", price: p.price, compareAtPrice: p.compareAtPrice || 0, collectionId: p.collectionId || 0, isActive: p.isActive });
    setModalOpen(true);
  };

  const switchLocale = (loc: string) => {
    // Save current locale's data before switching
    setTranslations(prev => ({
      ...prev,
      [activeLocale]: { name: form.name, description: form.description },
    }));
    // Load new locale's data
    const t = translations[loc] || { name: "", description: "" };
    setForm(prev => ({ ...prev, name: t.name, description: t.description }));
    setActiveLocale(loc);
  };

  const save = async () => {
    // Save current locale before submitting
    const finalTranslations = {
      ...translations,
      [activeLocale]: { name: form.name, description: form.description },
    };

    const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";
    const method = editing ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, translations: finalTranslations }),
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

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl text-text-primary">Products ({products.length})</h1>
        <button onClick={openAdd} className="rounded bg-brand-dark px-6 py-2 font-accent text-xs uppercase tracking-widest text-text-light">+ Add Product</button>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="mb-6 w-full max-w-md rounded border border-border bg-brand-primary px-4 py-2 font-body text-sm outline-none focus:border-brand-gold" />

      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full text-left font-body text-sm">
          <thead>
            <tr className="border-b border-border bg-brand-primary text-text-secondary">
              <th className="py-3 pl-4 pr-4">Name</th>
              <th className="py-3 px-4">Collection</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 pl-4 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-brand-secondary/50">
                <td className="py-3 pl-4 pr-4 font-medium text-text-primary">{p.name}</td>
                <td className="py-3 px-4 text-text-secondary">{p.collection?.name || "—"}</td>
                <td className="py-3 px-4">${p.price}</td>
                <td className="py-3 px-4">
                  <button onClick={() => toggleActive(p)} className={`rounded-full px-3 py-0.5 text-xs font-medium ${p.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </button>
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
              <tr><td colSpan={5} className="py-12 text-center text-text-secondary">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-lg rounded bg-brand-primary p-8 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-6 font-display text-xl">{editing ? "Edit Product" : "Add Product"}</h2>
            <div className="flex flex-col gap-4">
              {/* Language Tabs */}
              <div>
                <p className="mb-2 font-accent text-[10px] uppercase tracking-widest text-text-secondary">Language</p>
                <div className="flex gap-1 rounded border border-border p-1">
                  {LOCALES.map(loc => (
                    <button key={loc} onClick={() => switchLocale(loc)}
                      className={`flex-1 rounded py-1.5 font-accent text-[10px] font-medium transition-colors ${
                        activeLocale === loc ? "bg-brand-dark text-text-light" : "text-text-secondary hover:text-text-primary"
                      }`}
                    >{loc}</button>
                  ))}
                </div>
              </div>
              <input placeholder={`Name (${activeLocale})`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded border border-border bg-brand-primary px-4 py-2 font-body text-sm" />
              <textarea placeholder={`Description (${activeLocale})`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-24 rounded border border-border bg-brand-primary px-4 py-2 font-body text-sm" />
              <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="rounded border border-border bg-brand-primary px-4 py-2 font-body text-sm" />
              <div className="flex gap-4">
                <input type="number" placeholder="Price" value={form.price || ""} onChange={(e) => setForm({ ...form, price: +e.target.value })} className="flex-1 rounded border border-border bg-brand-primary px-4 py-2 font-body text-sm" />
                <input type="number" placeholder="Compare At" value={form.compareAtPrice || ""} onChange={(e) => setForm({ ...form, compareAtPrice: +e.target.value })} className="flex-1 rounded border border-border bg-brand-primary px-4 py-2 font-body text-sm" />
              </div>
              <select value={form.collectionId} onChange={(e) => setForm({ ...form, collectionId: +e.target.value })} className="rounded border border-border bg-brand-primary px-4 py-2 font-body text-sm">
                <option value={0}>No Collection</option>
                {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <label className="flex items-center gap-2 font-body text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={save} className="flex-1 rounded bg-brand-dark py-3 font-accent text-xs uppercase tracking-widest text-text-light">Save</button>
              <button onClick={() => setModalOpen(false)} className="flex-1 rounded border border-border py-3 font-accent text-xs uppercase tracking-widest text-text-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
