import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordReset } from "@/lib/email";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "fallback-secret-change-me");

// POST /api/auth/forgot-password — send reset email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true, message: "If that email exists, we've sent a reset link." });
    }

    // Create JWT token valid for 1 hour
    const token = await new SignJWT({ userId: user.id, purpose: "password-reset" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret);

    const resetUrl = `https://lovenocturne.com/auth/reset-password?token=${token}`;
    
    let emailError: string | null = null;
    try {
      await sendPasswordReset(email, resetUrl);
    } catch (e: any) {
      emailError = e?.message || String(e);
      console.error("[EMAIL] sendPasswordReset error:", e);
    }

    return NextResponse.json({ 
      success: true, 
      message: "If that email exists, we've sent a reset link.", 
      _debug: { 
        hasResendKey: !!process.env.RESEND_API_KEY, 
        keyLength: (process.env.RESEND_API_KEY || "").length,
        emailError 
      } 
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed", _debug: { error: e?.message } }, { status: 500 });
  }
}
