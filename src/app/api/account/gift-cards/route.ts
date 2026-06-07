import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ giftCards: [] });
    }

    const giftCards = await prisma.promoCode.findMany({
      where: {
        recipientEmail: session.user.email,
        isGiftCard: true,
      },
      orderBy: { createdAt: "desc" },
      select: {
        code: true,
        type: true,
        value: true,
        isActive: true,
        usedCount: true,
        maxUses: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      giftCards: giftCards.map(gc => ({
        code: gc.code,
        type: gc.type,
        value: gc.value,
        isGiftCard: true,
        used: gc.maxUses ? gc.usedCount >= gc.maxUses : false,
      })),
    });
  } catch {
    return NextResponse.json({ giftCards: [] });
  }
}
