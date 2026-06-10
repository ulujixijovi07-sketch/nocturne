import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-05-27.dahlia" as any })
  : null;

// POST /api/payment/create-intent — create Stripe PaymentIntent
export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const { amount, currency, orderNumber, customerEmail } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: (currency || "usd").toLowerCase(),
      metadata: { orderNumber: orderNumber || "", customerEmail: customerEmail || "" },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e: any) {
    console.error("[STRIPE] Payment intent error:", e);
    return NextResponse.json({ error: e?.message || "Payment failed" }, { status: 500 });
  }
}
