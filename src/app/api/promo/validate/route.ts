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

    const cleanCode = code.toUpperCase().trim();

    // Check database first
    const promo = await prisma.promoCode.findUnique({
      where: { code: cleanCode },
    });

    if (promo) {
      if (!promo.isActive) {
        return NextResponse.json({
          valid: false,
          reason: "This code is no longer active.",
        });
      }

      if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
        return NextResponse.json({
          valid: false,
          reason: "This code has expired.",
        });
      }

      if (promo.maxUses && promo.usedCount >= promo.maxUses) {
        return NextResponse.json({
          valid: false,
          reason: "This code has reached its usage limit.",
        });
      }

      if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
        return NextResponse.json({
          valid: false,
          reason: `Minimum order of $${promo.minOrderAmount.toFixed(2)} required.`,
        });
      }

      let discount: number;
      if (promo.type === "percentage") {
        discount =
          Math.round((promo.value / 100) * subtotal * 100) / 100;
      } else {
        discount = Math.min(promo.value, subtotal);
      }

      return NextResponse.json({
        valid: true,
        discount,
        type: promo.type,
        value: promo.value,
        code: promo.code,
        isGiftCard: promo.isGiftCard,
      });
    }

    // Fallback: legacy hardcoded promos
    const LEGACY_PROMOS: Record<
      string,
      { type: string; value: number; minOrder?: number }
    > = {
      WELCOME10: { type: "percentage", value: 10 },
      SAVE20: { type: "percentage", value: 20, minOrder: 100 },
      FREESHIP: { type: "fixed", value: 0 },
    };

    const legacy = LEGACY_PROMOS[cleanCode];
    if (legacy) {
      if (legacy.minOrder && subtotal < legacy.minOrder) {
        return NextResponse.json({
          valid: false,
          reason: `Minimum order of $${legacy.minOrder} required.`,
        });
      }

      const discount =
        legacy.type === "percentage"
          ? Math.round((legacy.value / 100) * subtotal * 100) / 100
          : legacy.value;

      return NextResponse.json({
        valid: true,
        discount,
        type: legacy.type,
        value: legacy.value,
        code: cleanCode,
      });
    }

    return NextResponse.json({ valid: false, reason: "Code not found." });
  } catch {
    return NextResponse.json(
      { valid: false, reason: "Failed to validate promo code." },
      { status: 500 }
    );
  }
}
