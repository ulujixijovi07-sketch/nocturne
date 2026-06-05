import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code, subtotal } = (await request.json()) as {
      code: string;
      subtotal: number;
    };

    if (!code) {
      return NextResponse.json(
        { valid: false, reason: "No code provided." },
        { status: 400 }
      );
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!promo) {
      return NextResponse.json({
        valid: false,
        reason: "Promo code not found.",
      });
    }

    if (!promo.isActive) {
      return NextResponse.json({
        valid: false,
        reason: "This promo code is no longer active.",
      });
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({
        valid: false,
        reason: "This promo code has expired.",
      });
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({
        valid: false,
        reason: "This promo code has reached its usage limit.",
      });
    }

    if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
      return NextResponse.json({
        valid: false,
        reason: `Minimum order of $${promo.minOrderAmount.toFixed(0)} required.`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (promo.type === "percentage") {
      discount = (promo.value / 100) * subtotal;
    } else {
      discount = promo.value;
    }

    return NextResponse.json({
      valid: true,
      discount: Math.round(discount * 100) / 100,
      type: promo.type,
      value: promo.value,
      code: promo.code,
    });
  } catch {
    return NextResponse.json(
      { valid: false, reason: "Failed to validate promo code." },
      { status: 500 }
    );
  }
}
