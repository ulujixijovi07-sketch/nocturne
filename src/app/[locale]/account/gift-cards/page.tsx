"use client";

import { useState, useEffect } from "react";
import { Gift, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────

type SavedCard = {
  code: string;
  type: string;
  value: number;
};

const STORAGE_KEY = "nocturne-gift-cards";

function loadCards(): SavedCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedCard[]) : [];
  } catch {
    return [];
  }
}

function saveCards(cards: SavedCard[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // silently fail
  }
}

// ─── Page ──────────────────────────────────────────────────────────────

export default function GiftCardsPage() {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCards(loadCards());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCards(cards);
  }, [cards, hydrated]);

  const totalBalance = cards.reduce((sum, c) => {
    if (c.type === "percentage") return sum;
    return sum + c.value;
  }, 0);

  const addCard = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), subtotal: 0 }),
      });
      const data = await res.json();
      if (data.valid) {
        const alreadySaved = cards.find(
          (c) => c.code.toUpperCase() === data.code.toUpperCase()
        );
        if (alreadySaved) {
          setError("This gift card is already saved.");
        } else {
          setCards((prev) => [
            ...prev,
            { code: data.code, type: data.type, value: data.value },
          ]);
          setCode("");
        }
      } else {
        setError(data.reason ?? "Invalid gift card code.");
      }
    } catch {
      setError("Failed to validate gift card.");
    } finally {
      setLoading(false);
    }
  };

  const removeCard = (code: string) => {
    setCards((prev) => prev.filter((c) => c.code !== code));
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
      <div className="text-center">
        <Gift className="mx-auto h-10 w-10 text-brand-gold" />
        <h1 className="mt-4 font-display text-3xl font-light tracking-[0.15em] text-text-primary">
          Gift Cards
        </h1>
        <p className="mt-2 font-body text-sm text-text-secondary">
          Check your balance or add a new gift card code.
        </p>
      </div>

      {/* Balance */}
      {hydrated && cards.length > 0 && (
        <div className="mt-8 rounded-sm border border-border bg-brand-primary p-6 text-center">
          <p className="font-accent text-xs uppercase tracking-widest text-text-secondary">
            Total Balance
          </p>
          <p className="mt-1 font-display text-4xl font-light text-text-primary">
            ${totalBalance.toFixed(2)}
          </p>
        </div>
      )}

      {/* Add card */}
      <div className="mt-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addCard();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter gift card code"
            className="flex-1 rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className={cn(
              "rounded-sm px-6 py-3 font-accent text-xs uppercase tracking-widest transition-colors",
              code.trim()
                ? "bg-brand-dark text-text-light hover:bg-brand-dark/90"
                : "cursor-not-allowed bg-brand-secondary text-text-secondary"
            )}
          >
            {loading ? "…" : "Add Card"}
          </button>
        </form>
        {error && (
          <p className="mt-2 font-body text-xs text-brand-burgundy">
            {error}
          </p>
        )}
      </div>

      {/* Saved cards */}
      {hydrated && cards.length > 0 && (
        <div className="mt-8 space-y-3">
          {cards.map((card) => (
            <div
              key={card.code}
              className="flex items-center justify-between rounded-sm border border-border bg-brand-primary p-4"
            >
              <div>
                <p className="font-body text-sm font-medium text-text-primary">
                  {card.code}
                </p>
                <p className="font-body text-xs text-text-secondary">
                  {card.type === "percentage"
                    ? `${card.value}% off`
                    : `$${card.value.toFixed(2)}`}
                </p>
              </div>
              <button
                onClick={() => removeCard(card.code)}
                className="text-text-secondary/50 transition-colors hover:text-brand-burgundy"
                aria-label={`Remove ${card.code}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {hydrated && !cards.length && (
        <div className="mt-10 text-center">
          <p className="font-body text-sm text-text-secondary">
            No gift cards saved yet. Enter a code above to get started.
          </p>
        </div>
      )}
    </div>
  );
}
