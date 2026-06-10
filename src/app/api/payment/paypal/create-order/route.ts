import { NextRequest, NextResponse } from "next/server";

function env(name: string) { return (process.env as any)[name] || ""; }

const PAYPAL_CLIENT = env("PAYPAL_CLIENT_ID");
const PAYPAL_KEY = env("PAYPAL_API_KEY"); // PayPal client secret
const PAYPAL_BASE = env("PAYPAL_MODE") === "production"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_KEY}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

// POST /api/payment/paypal/create-order
export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const token = await getAccessToken();
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount.toFixed(2),
            },
          },
        ],
      }),
    });

    const data = (await res.json()) as { id: string; status: string };
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
    }

    return NextResponse.json({ orderID: data.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "PayPal error" }, { status: 500 });
  }
}
