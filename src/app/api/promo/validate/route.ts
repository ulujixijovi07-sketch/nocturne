import { NextResponse } from "next/server";

const PROMOS: Record<string, { type: string; value: number; minOrder?: number }> = {
  WELCOME10: { type: "percentage", value: 10 },
  SAVE20: { type: "percentage", value: 20, minOrder: 100 },
  FREESHIP: { type: "fixed", value: 0 },
};

export async function POST(request: Request) {
  try {
    const { code, subtotal } = (await request.json()) as { code: string; subtotal: number };
    if (!code) return NextResponse.json({ valid: false, reason: "No code provided." }, { status: 400 });

    const promo = PROMOS[code.toUpperCase().trim()];
    if (!promo) return NextResponse.json({ valid: false, reason: "Code not found." });
    if (promo.minOrder && subtotal < promo.minOrder) return NextResponse.json({ valid: false, reason: `Minimum order of $${promo.minOrder} required.` });

    const discount = promo.type === "percentage" ? Math.round((promo.value / 100) * subtotal * 100) / 100 : promo.value;
    return NextResponse.json({ valid: true, discount, type: promo.type, value: promo.value, code: code.toUpperCase() });
  } catch {
    return NextResponse.json({ valid: false, reason: "Failed to validate promo code." }, { status: 500 });
  }
}
