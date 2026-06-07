"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { MagnifyingGlass, X, Spinner } from "@phosphor-icons/react";
import type { ProductCardProduct } from "@/components/product/product-card";

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductCardProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Debounced search via API
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data : []);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="MagnifyingGlass"
        className="text-text-secondary hover:text-text-primary transition-colors"
      >
        <MagnifyingGlass className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          <div
            className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-sm bg-brand-primary shadow-2xl">
            <div className="flex items-center border-b border-border px-4">
              <MagnifyingGlass className="h-4 w-4 text-text-secondary" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="MagnifyingGlass products..."
                className="flex-1 bg-transparent px-3 py-4 font-body text-sm text-text-primary placeholder:text-text-secondary/50 outline-none"
              />
              <button
                onClick={() => setOpen(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-5 w-5 animate-spin text-brand-gold" />
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="max-h-80 overflow-y-auto p-2">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-sm px-3 py-2 hover:bg-brand-secondary transition-colors"
                  >
                    <div className="h-10 w-8 shrink-0 overflow-hidden rounded-sm bg-brand-secondary">
                      {p.images?.[0] && (
                        <img
                          src={p.images[0].url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-body text-sm text-text-primary">
                        {p.name}
                      </p>
                      <p className="font-body text-xs text-text-secondary">
                        ${p.price}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!loading && query.length >= 2 && results.length === 0 && (
              <p className="p-6 text-center font-body text-sm text-text-secondary">
                No products found for &quot;{query}&quot;
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
