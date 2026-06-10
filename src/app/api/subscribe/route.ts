import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

// POST /api/subscribe — newsletter email signup
// Stores to User table if email doesn't exist, or just logs for now.
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });

    if (!existing) {
      // Create a minimal user record for newsletter subscribers
      await prisma.user.create({
        data: {
          email,
          name: email.split("@")[0],
          role: "USER",
        },
      });
    }

    // Log to console for now
    console.log(`[NEWSLETTER] New subscriber: ${email}`);

    // Send welcome email (fire-and-forget)
    sendWelcomeEmail(email);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
