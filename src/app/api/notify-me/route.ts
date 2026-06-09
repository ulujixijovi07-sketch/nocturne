import { NextRequest, NextResponse } from "next/server";

// POST /api/notify-me — register for back-in-stock alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, productName, variantSku } = body;

    if (!email || !productName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // For now, log to console. Future: save to DB or send to admin email.
    console.log(`[NOTIFY-ME] ${email} wants to be notified when ${productName} (SKU: ${variantSku || "N/A"}) is back in stock`);

    // TODO: Save to a RestockAlert table and/or send to admin email
    // For production, integrate with an email service like Resend, SendGrid, etc.

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
