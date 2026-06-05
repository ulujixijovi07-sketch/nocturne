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

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // silently fail (private browsing, quota, etc.)
  }
}

// ─── Provider ───────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  // Persist on change (skip before hydration to avoid clearing LS)
  useEffect(() => {
    if (hydrated) {
      saveCart(items);
    }
  }, [items, hydrated]);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + 1 }
            : i
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
        prev.map((i) =>
          i.variantId === variantId ? { ...i, quantity } : i
        )
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
    if (!promoCode) return 0;
    if (promoCode.type === "percentage") {
      return Math.round((promoCode.value / 100) * subtotal * 100) / 100;
    }
    return promoCode.value;
  }, [promoCode, subtotal]);

  const total = useMemo(
    () => Math.max(0, subtotal - discount),
    [subtotal, discount]
  );

  const value = useMemo<CartContextType>(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
      promoCode,
      promoError,
      promoLoading,
      applyPromoCode,
      removePromoCode,
      discount,
      total,
    }),
    [
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
      promoCode,
      promoError,
      promoLoading,
      applyPromoCode,
      removePromoCode,
      discount,
      total,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────────────

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a <CartProvider>");
  }
  return ctx;
}
