"use client";

import { useState, useEffect } from "react";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";

// ⚠️ Replace with your Stripe publishable key or use NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
);

function CheckoutForm({
  clientSecret,
  onSuccess,
  onError,
  total,
}: {
  clientSecret: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
  total: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/en/order/confirmation`,
      },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message || "Payment failed");
    } else {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
          defaultValues: { billingDetails: { name: "" } },
        }}
      />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full rounded bg-brand-gold py-3.5 font-medium text-sm uppercase tracking-widest text-brand-dark transition-colors hover:bg-brand-gold/80 disabled:opacity-50"
      >
        {loading ? "Processing…" : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}

interface StripePaymentProps {
  total: number;
  orderNumber: string;
  customerEmail: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export function StripePayment({ total, orderNumber, customerEmail, onSuccess, onError }: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/payment/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total, orderNumber, customerEmail }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.clientSecret) setClientSecret(d.clientSecret);
        else setError(d.error || "Failed to initialize payment");
      })
      .catch(() => setError("Payment service unavailable"));
  }, [total, orderNumber, customerEmail]);

  if (error) {
    return <p className="text-center font-body text-sm text-brand-burgundy py-4">{error}</p>;
  }

  if (!clientSecret) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 w-full rounded bg-brand-dark/30" />
        <div className="h-12 w-full rounded bg-brand-dark/30" />
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#C9A96E",
        colorBackground: "#1A1817",
        colorText: "#A69D94",
        colorDanger: "#8B2635",
        fontFamily: "Georgia, serif",
        borderRadius: "2px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        clientSecret={clientSecret}
        onSuccess={onSuccess}
        onError={onError}
        total={total}
      />
    </Elements>
  );
}
