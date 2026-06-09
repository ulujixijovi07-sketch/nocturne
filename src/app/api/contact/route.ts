import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Log to console (in production, send via email service)
    console.log(`[CONTACT] ${name} <${email}> [${subject}]: ${message}`);

    // TODO: Send email notification to admin
    // For production: integrate Resend, SendGrid, or Nodemailer

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
