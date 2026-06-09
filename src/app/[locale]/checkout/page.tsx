"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, ShoppingBag, CaretLeft, CaretRight, CaretDown, Check, MapPin } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";

// ─── Constants ─────────────────────────────────────────────────────────

const FREE_SHIPPING_THRESHOLD = 99;
const COUNTRIES = ["US", "UK", "CA", "AU", "FR", "DE", "ES", "IT"];
const STEPS = ["Shipping", "Delivery", "Payment", "Review"] as const;
type Step = (typeof STEPS)[number];

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

function generateOrderNumber() {
  return `NOCT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

// ─── Default address type ─────────────────────────────────────────────

type DefaultAddress = {
  id: number;
  label: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

// ─── Step indicator bar ────────────────────────────────────────────────

function StepBar({ step }: { step: string }) {
  const currentIdx = STEPS.indexOf(step as Step);
  return (
    <div className="mb-10 overflow-x-auto">
      <div className="flex min-w-[320px] items-center justify-center gap-0">
        {STEPS.map((s, i) => {
          const isDone = i < currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={s} className="flex items-center">
              {/* Circle */}
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                    isDone
                      ? "bg-brand-gold text-brand-dark"
                      : isCurrent
                        ? "bg-brand-dark text-text-light"
                        : "bg-brand-secondary text-text-secondary"
                  )}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "mt-1.5 whitespace-nowrap font-medium text-[10px] uppercase tracking-widest",
                    isDone
                      ? "text-brand-gold"
                      : isCurrent
                        ? "text-text-primary"
                        : "text-text-secondary/40"
                  )}
                >
                  {s}
                </span>
              </div>
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-px w-6 sm:w-10",
                    i < currentIdx ? "bg-brand-gold" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    total,
    discount,
    clearCart,
    promoCode,
    promoError,
    promoLoading,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [step, setStep] = useState<Step>("Shipping");
  const [submitting, setSubmitting] = useState(false);
  const [orderExpanded, setOrderExpanded] = useState(false);
  const [promoInput, setPromoInput] = useState("");

  // ── Step 1: Shipping ──────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("US");
  const [phone, setPhone] = useState("");

  // ── Step 2: Delivery ──────────────────────────────────────────────
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : delivery === "express" ? 14.99 : 4.99;
  const shippingFree = shippingCost === 0;

  // ── Step 3: Payment ───────────────────────────────────────────────
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [billingSame, setBillingSame] = useState(true);
  const [paypalSelected, setPaypalSelected] = useState(false);

  const orderTotal = total + shippingCost;

  // ── Session check for redirect ────────────────────────────────────
  const [userEmail, setUserEmail] = useState("");
  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d?.user?.email) setUserEmail(d.user.email); })
      .catch(() => {});
  }, []);

  // ── Saved gift cards from My Account ──────────────────────────────────
  const [savedCards, setSavedCards] = useState<{code:string;type:string;value:number}[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("nocturne-giftcards");
      if (raw) setSavedCards(JSON.parse(raw));
    } catch {}
  }, []);

  // ── Pre-fill shipping from default address ──────────────────────────
  const [addressFetched, setAddressFetched] = useState(false);

  useEffect(() => {
    if (addressFetched) return;
    fetch("/api/account/addresses")
      .then((r) => r.json())
      .then((data) => {
        const def = data.addresses?.find((a: DefaultAddress) => a.isDefault);
        if (def) {
          const nameParts = def.name.split(" ");
          setFirstName(nameParts[0] || "");
          setLastName(nameParts.slice(1).join(" ") || "");
          setAddress(def.street);
          setCity(def.city);
          setZip(def.zip);
          setCountry(def.country);
          setPhone(def.phone || "");
          setEmail("");  // keep email separate, not stored in address
        }
      })
      .catch(() => {})
      .finally(() => setAddressFetched(true));
  }, [addressFetched]);

  // ── Pre-fill shipping from default address ──────────────────────────
  const step1Valid = email.trim() && firstName.trim() && lastName.trim() && address.trim() && city.trim() && zip.trim();
  const step3Valid = paypalSelected || (cardNumber.trim().length >= 4 && cardExpiry.trim() && cardCvc.trim().length >= 3);

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, firstName, lastName,
          address, city, zip, country, phone,
          delivery, shippingCost,
          promoCode: promoCode?.code || null,
          discount,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            sku: `${item.color} / ${item.size}`,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        clearCart();
        // Remove used gift card from localStorage
        if (promoCode) {
          try {
            const raw = localStorage.getItem("nocturne-giftcards");
            if (raw) {
              const cards = JSON.parse(raw).filter((c: any) => c.code !== promoCode.code);
              localStorage.setItem("nocturne-giftcards", JSON.stringify(cards));
            }
          } catch {}
        }
        router.push(`/en/order/confirmation?email=${encodeURIComponent(email)}&order=${data.orderNumber}`);
      } else {
        alert(data.error || "Failed to place order");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Order summary (reusable) ──────────────────────────────────────
  const orderSummaryContent = (
    <>
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-3 py-3">
            <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-sm bg-brand-secondary">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center"><ShoppingBag className="h-4 w-4 text-text-secondary/30" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-body text-sm font-medium text-text-primary">{item.name}</p>
              <p className="font-body text-xs text-text-secondary">{item.color} / {item.size} × {item.quantity}</p>
              <p className="mt-0.5 font-body text-xs text-text-primary">{formatPrice(item.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2 border-t border-border pt-4">
        <div className="flex justify-between font-body text-sm"><span className="text-text-secondary">Subtotal</span><span className="text-text-primary">{formatPrice(subtotal)}</span></div>
        <div className="flex justify-between font-body text-sm">
          <span className="text-text-secondary">Shipping</span>
          <span className={shippingFree ? "text-brand-gold" : "text-text-secondary"}>{shippingFree ? "Free" : formatPrice(shippingCost)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between font-body text-sm"><span className="text-brand-gold">Discount</span><span className="text-brand-gold">−{formatPrice(discount)}</span></div>
        )}
        {promoCode && (
          <div className="rounded border border-brand-gold/30 bg-gradient-to-br from-brand-dark/80 to-brand-dark/40 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/10 rounded-bl-full" />
            <p className="font-medium text-[10px] uppercase tracking-widest text-brand-gold/60">Gift Card Applied</p>
            <p className="mt-1 font-display text-lg text-brand-gold tracking-wider">{promoCode.code}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-body text-xs text-text-secondary">
                {promoCode.type === "percentage" ? `${promoCode.value}% off` : `$${promoCode.value} off`}
              </span>
              <button onClick={removePromoCode} className="font-body text-xs text-text-secondary underline hover:text-brand-burgundy transition-colors">Remove</button>
            </div>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-2 font-body text-sm"><span className="font-medium text-text-primary">Total</span><span className="font-semibold text-text-primary">{formatPrice(orderTotal)}</span></div>
      </div>
      {/* Gift card / promo input */}
      {!promoCode && (
        <div className="mt-3 space-y-2">
          {/* Saved cards dropdown */}
          {savedCards.length > 0 && (
            <div className="flex gap-2">
              <select
                onChange={(e) => { if (e.target.value) { applyPromoCode(e.target.value); } }}
                className="flex-1 rounded-sm border border-border bg-transparent px-3 py-2 font-body text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold"
                defaultValue=""
              >
                <option value="" disabled>Select a saved gift card…</option>
                {savedCards.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.type === "percentage" ? `${c.value}%` : `$${c.value}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Manual input */}
          <form onSubmit={(e) => { e.preventDefault(); if (promoInput.trim()) { applyPromoCode(promoInput.trim()); setPromoInput(""); } }} className="flex gap-2">
            <input type="text" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="Or enter code manually" className="flex-1 rounded-sm border border-border bg-transparent px-3 py-2 font-body text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold" />
            <button type="submit" disabled={promoLoading || !promoInput.trim()} className="rounded-sm border border-border px-4 py-2 font-medium text-[10px] uppercase tracking-widest text-text-secondary disabled:cursor-not-allowed disabled:opacity-50">{promoLoading ? "…" : "Apply"}</button>
          </form>
        </div>
      )}
      {promoError && <p className="mt-1.5 font-body text-xs text-brand-burgundy">{promoError}</p>}
    </>
  );

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2">
          <Lock className="h-4 w-4 text-text-secondary" />
          <h1 className="font-display text-xl tracking-[0.2em] text-text-primary">SECURE CHECKOUT</h1>
        </div>
      </div>

      {/* Step indicator */}
      <StepBar step={step} />

      <div className="lg:flex lg:gap-10">
        {/* ── Main form ──────────────────────────────────────────────── */}
        <div className="flex-1">
          {/* ── STEP 1: SHIPPING ──────────────────────────────────────── */}
          {step === "Shipping" && (
            <form onSubmit={(e) => { e.preventDefault(); if (step1Valid) setStep("Delivery"); }} className="space-y-5">
              <h2 className="font-display text-xl font-medium text-text-primary">Shipping Information</h2>
              
              {/* Login prompt for guest users */}
              {!userEmail && (
                <div className="rounded-sm border border-brand-gold/20 bg-brand-gold/5 p-4">
                  <p className="font-body text-sm text-text-primary">
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="text-brand-gold underline underline-offset-2 hover:text-brand-burgundy transition-colors">
                      Sign in
                    </Link>
                    {" "}for faster checkout and order tracking.
                  </p>
                </div>
              )}
              
              <div>
                <label className="mb-1.5 block font-medium text-xs uppercase tracking-widest text-text-secondary">Email</label>
                <input type="email" required name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold" placeholder="you@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block font-accent text-xs uppercase tracking-widest text-text-secondary">First Name</label>
                  <input type="text" required name="firstName" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold" />
                </div>
                <div>
                  <label className="mb-1.5 block font-accent text-xs uppercase tracking-widest text-text-secondary">Last Name</label>
                  <input type="text" required name="lastName" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block font-accent text-xs uppercase tracking-widest text-text-secondary">Address</label>
                <input type="text" required name="address" autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block font-accent text-xs uppercase tracking-widest text-text-secondary">City</label>
                  <input type="text" required name="city" autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold" />
                </div>
                <div>
                  <label className="mb-1.5 block font-accent text-xs uppercase tracking-widest text-text-secondary">ZIP / Postal</label>
                  <input type="text" required name="zip" autoComplete="postal-code" value={zip} onChange={(e) => setZip(e.target.value)} className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block font-accent text-xs uppercase tracking-widest text-text-secondary">Country</label>
                  <select name="country" autoComplete="country-name" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold">
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block font-accent text-xs uppercase tracking-widest text-text-secondary">Phone</label>
                  <input type="tel" name="phone" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold" />
                </div>
              </div>
              <button type="submit" disabled={!step1Valid} className={cn("w-full rounded py-4 font-medium text-xs font-medium uppercase tracking-widest transition-colors", step1Valid ? "bg-brand-dark text-text-light hover:bg-brand-dark/90" : "cursor-not-allowed bg-brand-secondary text-text-secondary")}>Continue to Delivery</button>
            </form>
          )}

          {/* ── STEP 2: DELIVERY ──────────────────────────────────────── */}
          {step === "Delivery" && (
            <div className="space-y-6">
              <button onClick={() => setStep("Shipping")} className="inline-flex items-center gap-1 font-body text-sm text-text-secondary hover:text-text-primary"><CaretLeft className="h-4 w-4" />Back</button>
              <h2 className="font-display text-xl font-medium text-text-primary">Delivery</h2>

              {/* Standard */}
              <label
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-sm border p-5 transition-colors",
                  delivery === "standard" ? "border-brand-gold bg-brand-gold/5" : "border-border bg-brand-primary"
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="delivery"
                    checked={delivery === "standard"}
                    onChange={() => setDelivery("standard")}
                    className="h-4 w-4 text-brand-gold"
                  />
                  <div>
                    <p className="font-body text-sm font-medium text-text-primary">Standard Shipping</p>
                    <p className="font-body text-xs text-text-secondary">5–15 business days</p>
                  </div>
                </div>
                <span className="font-body text-sm text-text-primary">{shippingFree ? "Free" : "$4.99"}</span>
              </label>

              {/* Express */}
              <label
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-sm border p-5 transition-colors",
                  delivery === "express" ? "border-brand-gold bg-brand-gold/5" : "border-border bg-brand-primary"
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="delivery"
                    checked={delivery === "express"}
                    onChange={() => setDelivery("express")}
                    className="h-4 w-4 text-brand-gold"
                  />
                  <div>
                    <p className="font-body text-sm font-medium text-text-primary">Express Shipping</p>
                    <p className="font-body text-xs text-text-secondary">2–3 business days</p>
                  </div>
                </div>
                <span className="font-body text-sm text-text-primary">$14.99</span>
              </label>
              <button onClick={() => setStep("Payment")} className="w-full rounded py-4 font-medium text-xs font-medium uppercase tracking-widest bg-brand-dark text-text-light hover:bg-brand-dark/90 transition-colors">Continue to Payment</button>
            </div>
          )}

          {/* ── STEP 3: PAYMENT ────────────────────────────────────────── */}
          {step === "Payment" && (
            <div className="space-y-6">
              <button onClick={() => setStep("Delivery")} className="inline-flex items-center gap-1 font-body text-sm text-text-secondary hover:text-text-primary"><CaretLeft className="h-4 w-4" />Back</button>
              <h2 className="font-display text-xl font-medium text-text-primary">Payment</h2>

              {/* Credit Card */}
              <div className={cn("space-y-4 rounded-sm border p-5", paypalSelected ? "border-border" : "border-brand-gold bg-brand-gold/5")}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="payment" checked={!paypalSelected} onChange={() => setPaypalSelected(false)} className="h-4 w-4 text-brand-gold" />
                  <span className="font-body text-sm font-medium text-text-primary">Credit Card</span>
                </label>
                {!paypalSelected && (
                  <div className="space-y-4 pl-7">
                    <div>
                      <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">Card Number</label>
                      <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))} placeholder="1234 5678 9012 3456" className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">Expiry MM/YY</label>
                        <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold" />
                      </div>
                      <div>
                        <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">CVC</label>
                        <input type="text" value={cardCvc} onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold" />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} className="h-4 w-4 rounded border-border text-brand-gold" />
                      <span className="font-body text-xs text-text-secondary">Billing address same as shipping</span>
                    </label>
                  </div>
                )}
              </div>

              {/* PayPal */}
              <div className={cn("rounded-sm border p-5", paypalSelected ? "border-brand-gold bg-brand-gold/5" : "border-border")}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="payment" checked={paypalSelected} onChange={() => setPaypalSelected(true)} className="h-4 w-4 text-brand-gold" />
                  <span className="font-body text-sm font-medium text-text-primary">PayPal</span>
                </label>
                {paypalSelected && <p className="mt-3 pl-7 font-body text-xs text-text-secondary">You will be redirected to PayPal to complete your payment securely.</p>}
              </div>

              <button onClick={() => { if (step3Valid) setStep("Review"); }} disabled={!step3Valid} className={cn("w-full rounded py-4 font-medium text-xs font-medium uppercase tracking-widest transition-colors", step3Valid ? "bg-brand-dark text-text-light hover:bg-brand-dark/90" : "cursor-not-allowed bg-brand-secondary text-text-secondary")}>Continue to Review</button>
            </div>
          )}

          {/* ── STEP 4: REVIEW ──────────────────────────────────────────── */}
          {step === "Review" && (
            <div className="space-y-6">
              <button onClick={() => setStep("Payment")} className="inline-flex items-center gap-1 font-body text-sm text-text-secondary hover:text-text-primary"><CaretLeft className="h-4 w-4" />Back</button>
              <h2 className="font-display text-xl font-medium text-text-primary">Review Your Order</h2>

              {/* Shipping summary */}
              <div className="rounded-sm border border-border bg-brand-primary p-5">
                <h3 className="font-medium text-xs uppercase tracking-widest text-text-secondary">Shipping</h3>
                <p className="mt-1 font-body text-sm text-text-primary">{firstName} {lastName}</p>
                <p className="font-body text-sm text-text-secondary">{address}, {city}, {zip}</p>
                <p className="font-body text-sm text-text-secondary">{country} — {phone || "No phone"}</p>
                <p className="font-body text-sm text-text-secondary">{email}</p>
              </div>

              {/* Delivery summary */}
              <div className="rounded-sm border border-border bg-brand-primary p-5">
                <h3 className="font-medium text-xs uppercase tracking-widest text-text-secondary">Delivery</h3>
                <p className="mt-1 font-body text-sm text-text-primary capitalize">{delivery} — {shippingFree ? "Free" : formatPrice(shippingCost)}</p>
              </div>

              {/* Payment summary */}
              <div className="rounded-sm border border-border bg-brand-primary p-5">
                <h3 className="font-medium text-xs uppercase tracking-widest text-text-secondary">Payment</h3>
                <p className="mt-1 font-body text-sm text-text-primary">{paypalSelected ? "PayPal" : `Card ending in ${cardNumber.slice(-4) || "····"}`}</p>
              </div>

              {/* Total */}
              <div className="rounded-sm border border-border bg-brand-primary p-5">
                <div className="flex justify-between font-body"><span className="font-medium text-text-primary">Order Total</span><span className="font-semibold text-text-primary">{formatPrice(orderTotal)}</span></div>
              </div>

              <button onClick={handlePlaceOrder} disabled={submitting} className={cn("w-full rounded py-4 font-medium text-xs font-medium uppercase tracking-widest transition-colors", submitting ? "cursor-not-allowed bg-brand-secondary text-text-secondary" : "bg-brand-dark text-text-light hover:bg-brand-dark/90")}>{submitting ? "Placing order..." : "Place Order"}</button>
              <p className="text-center font-body text-xs text-text-secondary">By placing your order you agree to our <Link href="/terms" className="underline hover:text-text-primary">Terms</Link> &amp; <Link href="/privacy" className="underline hover:text-text-primary">Privacy Policy</Link>.</p>
            </div>
          )}
        </div>

        {/* ── Collapsible Order Summary sidebar ────────────────────────── */}
        <aside className="mt-8 lg:mt-0 lg:w-80 lg:shrink-0">
          {/* Mobile toggle */}
          <button
            onClick={() => setOrderExpanded(!orderExpanded)}
            className="flex w-full items-center justify-between rounded-sm border border-border bg-brand-primary p-4 lg:hidden"
          >
            <span className="font-medium text-xs uppercase tracking-widest text-text-primary">
              Order Summary
            </span>
            <span className="flex items-center gap-2">
              <span className="font-body text-sm font-semibold text-text-primary">{formatPrice(orderTotal)}</span>
              <CaretDown className={cn("h-4 w-4 text-text-secondary transition-transform", orderExpanded && "rotate-180")} />
            </span>
          </button>

          {/* Desktop + expanded mobile */}
          <div className={cn("rounded-sm border border-border bg-brand-primary p-6", orderExpanded ? "mt-2 lg:mt-0 block" : "hidden lg:block")}>
            <h2 className="hidden font-display text-xl font-medium text-text-primary lg:block">Order Summary</h2>
            <div className={cn("hidden lg:block", "mt-4")} />
            {orderSummaryContent}
          </div>
        </aside>
      </div>
    </div>
  );
}
