import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/admin/promos — list all promos
export async function GET() {
  try {
    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ promos });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch promos" },
      { status: 500 }
    );
  }
}

// POST /api/admin/promos — create promo or gift card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      value,
      minOrderAmount,
      maxUses,
      expiresAt,
      recipientEmail,
      senderName,
      message,
      isGiftCard,
    } = body;

    if (!type || value === undefined || value === null) {
      return NextResponse.json(
        { error: "Type and value are required" },
        { status: 400 }
      );
    }

    // Generate code
    let code: string;
    if (isGiftCard) {
      const random = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();
      code = `NC-GIFT-${random}`;
    } else {
      code = body.code;
      if (!code) {
        return NextResponse.json(
          { error: "Code is required for non-gift-card promos" },
          { status: 400 }
        );
      }
    }

    // Check for duplicate code
    const existing = await prisma.promoCode.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: "A promo with this code already exists" },
        { status: 409 }
      );
    }

    const promo = await prisma.promoCode.create({
      data: {
        code,
        type,
        value: Number(value),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        recipientEmail: recipientEmail || null,
        senderName: senderName || null,
        message: message || null,
        isGiftCard: isGiftCard || false,
      },
    });

    return NextResponse.json({ promo }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create promo" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/promos — toggle active/inactive
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Promo id required" }, { status: 400 });
    }

    const promo = await prisma.promoCode.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ promo });
  } catch {
    return NextResponse.json(
      { error: "Failed to update promo" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/promos?id= — delete promo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Promo id required" }, { status: 400 });
    }

    await prisma.promoCode.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete promo" },
      { status: 500 }
    );
  }
}
