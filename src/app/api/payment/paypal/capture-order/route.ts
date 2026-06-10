import { NextRequest, NextResponse } from "next/server";

function env(name: string) { return (process.env as any)[name] || ""; }

const PAYPAL_CLIENT = env("PAYPAL_CLIENT_ID");
const PAYPAL_KEY = env("PAYPAL_API_KEY");
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

// POST /api/payment/paypal/capture-order
export async function POST(request: NextRequest) {
  try {
    const { orderID } = await request.json();
    if (!orderID) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const token = await getAccessToken();
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data?.message || "Capture failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: data.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "PayPal error" }, { status: 500 });
  }
}
