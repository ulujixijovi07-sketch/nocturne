import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAbandonedCartReminder, sendTierUpgradeEmail, sendBirthdayGift } from "@/lib/email";

const CRON_SECRET = process.env.CRON_SECRET || "nocturne-cron-secret";

// GET /api/cron/jobs?secret=xxx&job=abandoned-cart|birthday
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const job = searchParams.get("job") || "all";
  const results: Record<string, any> = {};

  try {
    if (job === "all" || job === "abandoned-cart") {
      results.abandonedCart = await runAbandonedCart();
    }
    if (job === "all" || job === "birthday") {
      results.birthday = await runBirthdayGifts();
    }
    return NextResponse.json({ success: true, results });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Cron failed" }, { status: 500 });
  }
}

// ─── Abandoned Cart Recovery ──────────────────────────────────────────

async function runAbandonedCart() {
  const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000);
  const TWENTY_FOUR_HOURS_AGO = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Find users with cart items updated 1h–24h ago, not notified yet
  const users = await prisma.user.findMany({
    where: {
      cartItems: { some: {} },
      OR: [
        { abandonedCartNotifiedAt: null },
        { abandonedCartNotifiedAt: { lt: TWENTY_FOUR_HOURS_AGO } },
      ],
    },
    include: {
      cartItems: {
        where: { updatedAt: { lt: ONE_HOUR_AGO } },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  let sent = 0;
  for (const user of users) {
    if (user.cartItems.length === 0) continue;

    const items = user.cartItems.map((ci) => ({
      name: ci.name,
      image: ci.image,
      price: ci.price,
      qty: ci.quantity,
    }));

    await sendAbandonedCartReminder(
      user.email,
      user.name || "Valued Customer",
      items,
      `https://lovenocturne.com/cart`,
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { abandonedCartNotifiedAt: new Date() },
    });

    sent++;
  }

  return { checked: users.length, sent };
}

// ─── Birthday Gifts ───────────────────────────────────────────────────

async function runBirthdayGifts() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  // Find users whose birthday is today
  const users = await prisma.user.findMany({
    where: {
      birthday: { not: null },
    },
  });

  const birthdayUsers = users.filter((u) => {
    if (!u.birthday) return false;
    const bd = new Date(u.birthday);
    return bd.getMonth() + 1 === month && bd.getDate() === day;
  });

  let sent = 0;
  for (const user of birthdayUsers) {
    // Determine discount based on tier
    const tierDiscounts: Record<string, number> = {
      BRONZE: 10,
      SILVER: 15,
      GOLD: 20,
      PLATINUM: 25,
    };
    const discountPercent = tierDiscounts[user.memberTier] || 10;
    const code = `BDAY${today.getFullYear()}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}-${user.id.slice(-6).toUpperCase()}`;

    // Create promo code
    const expiresAt = new Date(today);
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.promoCode.upsert({
      where: { code },
      update: {},
      create: {
        code,
        type: "percentage",
        value: discountPercent,
        isActive: true,
        maxUses: 1,
        expiresAt,
        recipientEmail: user.email,
      },
    });

    await sendBirthdayGift(user.email, user.name || "Valued Customer", code, discountPercent);
    sent++;
  }

  return { checked: birthdayUsers.length, sent };
}
