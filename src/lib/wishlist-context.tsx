"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// ─── Types ──────────────────────────────────────────────────────────────

export type WishlistItem = {
  productId: number;
  name: string;
  slug: string;
  image: string;
  price: number;
};

type WishlistContextType = {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  totalItems: number;
};

// ─── Context ────────────────────────────────────────────────────────────

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "nocturne-wishlist";

function loadWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

function saveWishlist(items: WishlistItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // silently fail
  }
}

// ─── Provider ───────────────────────────────────────────────────────────

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadWishlist());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveWishlist(items);
  }, [items, hydrated]);

  const addItem = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.find((i) => i.productId === item.productId)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const isInWishlist = useCallback(
    (productId: number) => items.some((i) => i.productId === productId),
    [items]
  );

  const totalItems = items.length;

  const value = useMemo<WishlistContextType>(
    () => ({ items, addItem, removeItem, isInWishlist, totalItems }),
    [items, addItem, removeItem, isInWishlist, totalItems]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a <WishlistProvider>");
  }
  return ctx;
}
