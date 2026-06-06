"use client";

import { useState, useEffect } from "react";
import { Gift, Plus, X } from "lucide-react";

type GiftCard = {
  code: string;
  type: string;
  value: number;
  isGiftCard: boolean;
  used: boolean;
};

export default function GiftCardsPage() {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nocturne-giftcards");
      if (saved) setCards(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("nocturne-giftcards", JSON.stringify(cards));
  }, [cards, loaded]);

  const addCard = async () => {
    const code = input.trim().toUpperCase();
    if (!code) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: 9999 }),
      });
      const data = await res.json();

      if (data.valid) {
        if (cards.find((c) => c.code === code)) {
          setError("This gift card is already added.");
        } else {
          setCards([...cards, { code, type: data.type, value: data.value, isGiftCard: data.isGiftCard || false, used: false }]);
          setInput("");
        }
      } else {
        setError(data.reason || "Invalid gift card code.");
      }
    } catch {
      setError("Failed to validate code.");
    } finally {
      setLoading(false);
    }
  };

  const removeCard = (code: string) => {
    setCards(cards.filter((c) => c.code !== code));
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-2xl font-light tracking-[0.1em] text-text-primary">Gift Cards</h1>
      <p className="mt-2 font-body text-sm text-text-secondary">Add gift card codes to your account for easy checkout.</p>

      {/* Add card input */}
      <div className="mt-8 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCard()}
          placeholder="Enter gift card code (e.g. NC-GIFT-XXXX)"
          className="flex-1 rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-brand-gold"
        />
        <button
          onClick={addCard}
          disabled={loading || !input.trim()}
          className="flex items-center gap-2 rounded-sm bg-brand-dark px-6 py-3 font-accent text-xs uppercase tracking-widest text-text-light hover:bg-brand-dark/90 disabled:opacity-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {loading ? "Checking…" : "Add Card"}
        </button>
      </div>
      {error && <p className="mt-2 font-body text-sm text-brand-burgundy">{error}</p>}

      {/* Gift card list */}
      {cards.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center py-12 rounded border border-dashed border-border">
          <Gift className="h-10 w-10 text-text-secondary/30" />
          <p className="mt-4 font-body text-sm text-text-secondary">No gift cards added yet.</p>
          <p className="mt-1 font-body text-xs text-text-secondary/60">Enter a code above to add a gift card.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.code}
              className="relative rounded-lg border border-brand-gold/30 bg-gradient-to-br from-[#1a1817] to-[#2a2520] p-6 overflow-hidden group"
            >
              {/* Decorative corner */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-brand-gold/10 rounded-full" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-tl-full" />

              {/* Remove button */}
              <button
                onClick={() => removeCard(card.code)}
                className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-dark/60 text-text-secondary/60 hover:bg-brand-burgundy hover:text-white opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              {/* Card content */}
              <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-brand-gold/50">NOCTURNE GIFT CARD</p>
              <p className="mt-3 font-mono text-lg font-medium tracking-wider text-brand-gold">{card.code}</p>
              <p className="mt-1 font-display text-2xl font-light text-text-primary">
                {card.type === "percentage" ? `${card.value}% OFF` : `$${card.value} OFF`}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className={card.used ? "bg-text-secondary/20" : "bg-brand-gold/20"}>
                  <span className={card.used ? "text-text-secondary/60" : "text-brand-gold"}>
                    •
                  </span>
                </div>
                <span className="font-body text-[11px] text-text-secondary/60">
                  {card.used ? "Used" : "Available"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
