import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// POST /api/admin/promos/send — create gift card and return data
// (Email sending will be added later as stated in requirements)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      value,
      minOrderAmount,
      maxUses,
      expiresAt,
      recipientEmail,
      senderName,
      message,
    } = body;

    if (!value) {
      return NextResponse.json(
        { error: "Value is required" },
        { status: 400 }
      );
    }

    // Generate unique gift card code
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `NC-GIFT-${random}`;

    const promo = await prisma.promoCode.create({
      data: {
        code,
        type: "fixed",
        value: Number(value),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        recipientEmail: recipientEmail || null,
        senderName: senderName || null,
        message: message || null,
        isGiftCard: true,
      },
    });

    return NextResponse.json(
      {
        promo,
        message: "Gift card created successfully. Email integration pending.",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create gift card" },
      { status: 500 }
    );
  }
}
