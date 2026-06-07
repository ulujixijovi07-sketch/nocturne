import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

function generateGiftCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "WELCOME-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // ─── Validate ──────────────────────────────────────────────────────

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    // ─── Check uniqueness ──────────────────────────────────────────────

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // ─── Hash password & create user ───────────────────────────────────

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name?.trim() || null,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "USER",
      },
    });

    // ─── Create welcome gift card (10% off) ────────────────────────────

    let giftCode = "";
    try {
      // Generate unique code
      for (let i = 0; i < 5; i++) {
        const candidate = generateGiftCode();
        const exists = await prisma.promoCode.findUnique({ where: { code: candidate } });
        if (!exists) { giftCode = candidate; break; }
      }
      if (!giftCode) giftCode = `WELCOME-${Date.now().toString(36).toUpperCase()}`;

      await prisma.promoCode.create({
        data: {
          code: giftCode,
          type: "percentage",
          value: 10,
          isGiftCard: true,
          isActive: true,
          recipientEmail: user.email,
          maxUses: 1,
        },
      });
    } catch {
      // Gift card creation failed, but user is registered — don't block
      giftCode = "";
    }

    return NextResponse.json(
      {
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
        giftCard: giftCode ? { code: giftCode, type: "percentage", value: 10 } : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
