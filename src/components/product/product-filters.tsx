"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { CaretDown, Sliders, X } from "@phosphor-icons/react";
import { ProductGrid } from "./product-grid";
import type { ProductCardProduct } from "./product-card";

// ─── Types ────────────────────────────────────────────────────────────────

type SortOption = "best-selling" | "price-asc" | "price-desc" | "newest";

// ─── Extract filter options from products ─────────────────────────────────

function extractFilterOptions(products: ProductCardProduct[]) {
  const sizes = new Set<string>();
  const colors: { name: string; hex: string }[] = [];
  const colorSet = new Set<string>();
  const collections: string[] = [];
  const collectionSet = new Set<string>();
  const categories: string[] = [];
  const categorySet = new Set<string>();

  products.forEach((p) => {
    p.variants.forEach((v) => {
      sizes.add(v.size);
      if (!colorSet.has(v.colorHex)) {
        colorSet.add(v.colorHex);
        colors.push({ name: v.color, hex: v.colorHex });
      }
    });
    if (p.collection && !collectionSet.has(p.collection.name)) {
      collectionSet.add(p.collection.name);
      collections.push(p.collection.name);
    }
    if (p.categories) {
      p.categories.forEach((c: any) => {
        const catName = c.name || c.category?.name;
        if (catName && !categorySet.has(catName)) {
          categorySet.add(catName);
          categories.push(catName);
        }
      });
    }
  });

  return {
    sizes: Array.from(sizes).sort(),
    colors,
    collections,
    categories: categories.sort(),
    priceRanges: [
      { label: "Under $50", min: 0, max: 50 },
      { label: "$50 – $100", min: 50, max: 100 },
      { label: "$100 – $200", min: 100, max: 200 },
      { label: "$200+", min: 200, max: Infinity },
    ],
  };
}

// ─── Collapsible filter section ──────────────────────────────────────────

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between font-medium text-xs uppercase tracking-widest text-text-primary"
      >
        {title}
        <CaretDown
          className={cn(
            "h-4 w-4 text-text-secondary transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200",
          isOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-2">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Checkbox row ────────────────────────────────────────────────────────

function FilterCheckbox({
  checked,
  onChange,
  label,
  dot,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  dot?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-border text-brand-burgundy focus:ring-1 focus:ring-brand-gold"
      />
      {dot && (
        <span
          className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-border"
          style={{ backgroundColor: dot }}
        />
      )}
      <span className="font-body text-sm text-text-secondary">{label}</span>
    </label>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

type ProductFiltersProps = {
  products: ProductCardProduct[];
};

export function ProductFilters({ products }: ProductFiltersProps) {
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<Set<number>>(
    new Set()
  );
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(
    new Set()
  );
  const [sortOption, setSortOption] = useState<SortOption>("best-selling");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  const filterOptions = useMemo(
    () => extractFilterOptions(products),
    [products]
  );

  // ── Filtered + sorted products ────────────────────────────────────────

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedSizes.size > 0) {
      result = result.filter((p) =>
        p.variants.some(
          (v: ProductCardProduct["variants"][number]) =>
            selectedSizes.has(v.size)
        )
      );
    }

    if (selectedColors.size > 0) {
      result = result.filter((p) =>
        p.variants.some(
          (v: ProductCardProduct["variants"][number]) =>
            selectedColors.has(v.colorHex)
        )
      );
    }

    if (selectedPriceRanges.size > 0) {
      result = result.filter((p) =>
        Array.from(selectedPriceRanges).some((idx) => {
          const range = filterOptions.priceRanges[idx];
          return p.price >= range.min && p.price < range.max;
        })
      );
    }

    if (selectedCollections.size > 0) {
      result = result.filter(
        (p) => p.collection && selectedCollections.has(p.collection.name)
      );
    }

    if (selectedCategories.size > 0) {
      result = result.filter((p) =>
        p.categories?.some((c) => selectedCategories.has(c.name))
      );
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
          return b.id - a.id;
        default:
          return 0;
      }
    });

    return result;
  }, [
    products,
    selectedSizes,
    selectedColors,
    selectedPriceRanges,
    selectedCollections,
    sortOption,
    filterOptions,
  ]);

  // ── Toggle helpers ────────────────────────────────────────────────────

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<Set<any>>>,
    value: any
  ) => {
    setter((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  const clearAll = () => {
    setSelectedSizes(new Set());
    setSelectedColors(new Set());
    setSelectedPriceRanges(new Set());
    setSelectedCollections(new Set());
    setSelectedCategories(new Set());
  };

  const activeFilterCount =
    selectedSizes.size +
    selectedColors.size +
    selectedPriceRanges.size +
    selectedCollections.size +
    selectedCategories.size;

  const hasActiveFilters = activeFilterCount > 0;

  // ── Sidebar content (reused in desktop + mobile) ──────────────────────

  const sidebarContent = (
    <div className="space-y-1">
      <div className="flex items-center justify-between pb-2">
        <span className="font-medium text-xs uppercase tracking-widest text-text-primary">
          Filters
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="font-body text-xs text-text-secondary transition-colors hover:text-text-primary"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Size */}
      {filterOptions.sizes.length > 0 && (
        <FilterSection title="Size" defaultOpen={false}>
          {filterOptions.sizes.map((size) => (
            <FilterCheckbox
              key={size}
              label={size}
              checked={selectedSizes.has(size)}
              onChange={() => toggle(setSelectedSizes, size)}
            />
          ))}
        </FilterSection>
      )}

      {/* Color */}
      {filterOptions.colors.length > 0 && (
        <FilterSection title="Color" defaultOpen={false}>
          {filterOptions.colors.map((c) => (
            <FilterCheckbox
              key={c.hex}
              label={c.name}
              dot={c.hex}
              checked={selectedColors.has(c.hex)}
              onChange={() => toggle(setSelectedColors, c.hex)}
            />
          ))}
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price Range" defaultOpen={false}>
        {filterOptions.priceRanges.map((range, i) => (
          <FilterCheckbox
            key={range.label}
            label={range.label}
            checked={selectedPriceRanges.has(i)}
            onChange={() => toggle(setSelectedPriceRanges, i)}
          />
        ))}
      </FilterSection>

      {/* Collection */}
      {filterOptions.collections.length > 0 && (
        <FilterSection title="Collection" defaultOpen={false}>
          {filterOptions.collections.map((col) => (
            <FilterCheckbox
              key={col}
              label={col}
              checked={selectedCollections.has(col)}
              onChange={() => toggle(setSelectedCollections, col)}
            />
          ))}
        </FilterSection>
      )}

      {/* Categories */}
      {filterOptions.categories.length > 0 && (
        <FilterSection title="Categories">
          {filterOptions.categories.map((cat) => (
            <FilterCheckbox
              key={cat}
              label={cat}
              checked={selectedCategories.has(cat)}
              onChange={() => toggle(setSelectedCategories, cat)}
            />
          ))}
        </FilterSection>
      )}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ── Mobile filter bar ──────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="inline-flex items-center gap-2 font-medium text-xs uppercase tracking-widest text-text-primary"
        >
          <Sliders className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-burgundy px-1 text-[10px] font-bold text-text-light">
              {activeFilterCount}
            </span>
          )}
        </button>

        <SortSelect value={sortOption} onChange={setSortOption} />
      </div>

      {/* ── Mobile filter drawer ────────────────────────────────────── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-brand-dark/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-80 max-w-[85vw] flex-col overflow-y-auto bg-brand-primary shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-brand-primary px-6 py-4">
              <span className="font-display text-lg text-text-primary">
                Filters
              </span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-2">{sidebarContent}</div>
          </div>
        </div>
      )}

      {/* ── Desktop layout ──────────────────────────────────────────── */}
      <div className="lg:flex lg:gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:block lg:w-1/4">{sidebarContent}</aside>

        {/* Product area */}
        <div className="lg:w-3/4">
          {/* Result bar */}
          <div className="mb-6 flex items-center justify-between">
            <p className="font-body text-sm text-text-secondary">
              Showing {filteredProducts.length} result
              {filteredProducts.length !== 1 ? "s" : ""}
            </p>
            <div className="hidden lg:block">
              <SortSelect value={sortOption} onChange={setSortOption} />
            </div>
          </div>

          <ProductGrid products={filteredProducts} />
        </div>
      </div>
    </div>
  );
}

// ─── Sort dropdown (shared) ───────────────────────────────────────────────

function SortSelect({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (v: SortOption) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className="cursor-pointer rounded-sm border border-border bg-transparent px-3 py-1.5 font-body text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-gold"
    >
      <option value="newest">Newest</option>
      <option value="price-asc">Price: Low – High</option>
      <option value="price-desc">Price: High – Low</option>
    </select>
  );
}
