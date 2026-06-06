"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

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

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const STORAGE_KEY = "nocturne-wishlist";

function loadLocal(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocal(items: WishlistItem[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check session on mount
  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.id) {
          setIsLoggedIn(true);
          // Load wishlist from server
          return fetch("/api/wishlist", { credentials: "include" });
        }
        // Not logged in, load from localStorage
        setItems(loadLocal());
        setHydrated(true);
        return null;
      })
      .then((res) => {
        if (res) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.items) {
          setItems(data.items);
        }
        setHydrated(true);
      })
      .catch(() => {
        setItems(loadLocal());
        setHydrated(true);
      });
  }, []);

  // Sync to localStorage for anonymous users
  useEffect(() => {
    if (hydrated && !isLoggedIn) saveLocal(items);
  }, [items, hydrated, isLoggedIn]);

  const addItem = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.find((i) => i.productId === item.productId)) return prev;
      return [...prev, item];
    });
    // Sync to server if logged in
    if (isLoggedIn) {
      fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.productId }),
        credentials: "include",
      }).catch(() => {});
    }
  }, [isLoggedIn]);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    if (isLoggedIn) {
      fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
        credentials: "include",
      }).catch(() => {});
    }
  }, [isLoggedIn]);

  const isInWishlist = useCallback(
    (productId: number) => items.some((i) => i.productId === productId),
    [items]
  );

  const value = useMemo<WishlistContextType>(
    () => ({ items, addItem, removeItem, isInWishlist, totalItems: items.length }),
    [items, addItem, removeItem, isInWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within <WishlistProvider>");
  return ctx;
}
