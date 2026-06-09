"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ─── Types ──────────────────────────────────────────────────────────────

export type CartItem = {
  variantId: number;
  productId: number;
  name: string;
  slug: string;
  image: string;
  color: string;
  colorHex: string;
  size: string;
  price: number;
  quantity: number;
};

export type AppliedPromo = {
  code: string;
  type: string;
  value: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  promoCode: AppliedPromo | null;
  promoError: string | null;
  promoLoading: boolean;
  applyPromoCode: (code: string) => Promise<void>;
  removePromoCode: () => void;
  discount: number;
  total: number;
};

// ─── Context ────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = "nocturne-cart";

function loadLocal(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch { return []; }
}

function saveLocal(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
}

// ─── Provider ───────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const userIdRef = useRef<string | null>(null);

  // Hydrate + sync with server
  useEffect(() => {
    const init = async () => {
      // Check session
      try {
        const sess = await fetch("/api/auth/session", { credentials: "include" }).then(r => r.json());
        if (sess?.user?.id) {
          setIsLoggedIn(true);
          userIdRef.current = sess.user.id;
          // Load from server
          const res = await fetch("/api/cart", { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            if (data.items?.length > 0) {
              setItems(data.items);
              // Merge local into server (one-time migration)
              const local = loadLocal();
              if (local.length > 0) {
                for (const item of local) {
                  await fetch("/api/cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(item),
                    credentials: "include",
                  }).catch(() => {});
                }
                // Re-fetch merged cart
                const merged = await fetch("/api/cart", { credentials: "include" });
                if (merged.ok) {
                  const mergedData = await merged.json();
                  if (mergedData.items?.length > 0) setItems(mergedData.items);
                }
                saveLocal([]);
              }
              setHydrated(true);
              return;
            }
          }
        }
      } catch {}
      
      // Fallback: localStorage
      setItems(loadLocal());
      setHydrated(true);
    };
    init();
  }, []);

  // Persist to localStorage always, sync to server if logged in
  const syncInProgress = useRef(false);
  useEffect(() => {
    if (!hydrated) return;
    saveLocal(items);
    
    if (isLoggedIn && !syncInProgress.current) {
      // Full sync: clear server cart and re-add all local items
      // (simpler than per-item diff)
      const doSync = async () => {
        syncInProgress.current = true;
        try {
          // Get current server cart
          const res = await fetch("/api/cart", { credentials: "include" });
          const serverData = res.ok ? await res.json() : { items: [] };
          const serverItems: CartItem[] = serverData.items || [];
          
          // Delete server items not in local
          for (const si of serverItems) {
            if (!items.find(li => li.variantId === si.variantId)) {
              await fetch(`/api/cart?variantId=${si.variantId}`, {
                method: "DELETE",
                credentials: "include",
              }).catch(() => {});
            }
          }
          
          // Upsert local items to server
          for (const li of items) {
            await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(li),
              credentials: "include",
            }).catch(() => {});
          }
        } catch {} finally {
          syncInProgress.current = false;
        }
      };
      doSync();
    }
  }, [items, hydrated, isLoggedIn]);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    // GA4 add_to_cart event
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "add_to_cart", {
        currency: "USD",
        value: item.price,
        items: [{
          item_id: item.productId,
          item_name: item.name,
          item_variant: `${item.color} / ${item.size}`,
          price: item.price,
        }],
      });
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((variantId: number) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const updateQuantity = useCallback(
    (variantId: number, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(variantId);
        return;
      }
      setItems((prev) =>
        prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  // ── Promo code ──────────────────────────────────────────────────────

  const [promoCode, setPromoCode] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const applyPromoCode = useCallback(async (code: string) => {
    setPromoLoading(true);
    setPromoError(null);
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoCode({ code: data.code, type: data.type, value: data.value });
      } else {
        setPromoError(data.reason ?? "Invalid promo code.");
        setPromoCode(null);
      }
    } catch {
      setPromoError("Failed to validate promo code.");
      setPromoCode(null);
    } finally {
      setPromoLoading(false);
    }
  }, [subtotal]);

  const removePromoCode = useCallback(() => {
    setPromoCode(null);
    setPromoError(null);
  }, []);

  const discount = useMemo(() => {
    // Bulk discount: 3+ items → 20% off
    const bulkDiscount = totalItems >= 3 ? Math.round(subtotal * 0.2 * 100) / 100 : 0;
    // Promo discount
    let promoDiscount = 0;
    if (promoCode) {
      if (promoCode.type === "percentage") {
        promoDiscount = Math.round((promoCode.value / 100) * subtotal * 100) / 100;
      } else {
        promoDiscount = promoCode.value;
      }
    }
    // Stack: apply promo discount on top of bulk-discounted subtotal
    const afterBulk = subtotal - bulkDiscount;
    if (promoDiscount > 0 && promoCode?.type === "percentage") {
      return bulkDiscount + Math.round(promoCode.value / 100 * afterBulk * 100) / 100;
    }
    return bulkDiscount + promoDiscount;
  }, [promoCode, subtotal, totalItems]);

  const total = useMemo(
    () => Math.max(0, subtotal - discount),
    [subtotal, discount]
  );

  const value = useMemo<CartContextType>(
    () => ({
      items, addToCart, removeFromCart, updateQuantity, clearCart,
      totalItems, subtotal, promoCode, promoError, promoLoading,
      applyPromoCode, removePromoCode, discount, total,
    }),
    [items, addToCart, removeFromCart, updateQuantity, clearCart,
      totalItems, subtotal, promoCode, promoError, promoLoading,
      applyPromoCode, removePromoCode, discount, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────────────

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
