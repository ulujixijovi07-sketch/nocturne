import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = "NOCTURNE <newsletter@lovenocturne.com>";

// POST /api/admin/newsletter/send — send bulk newsletter
export async function POST(request: NextRequest) {
  try {
    const { subject, html, testMode } = await request.json();
    if (!subject || !html) {
      return NextResponse.json({ error: "Subject and HTML body required" }, { status: 400 });
    }

    if (!resend) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    const users = await prisma.user.findMany({
      where: { role: { not: "ADMIN" } },
      select: { email: true },
    });

    const emails = users.map((u) => u.email);

    if (testMode) {
      // Send only to first email as test
      const testEmail = emails[0];
      if (!testEmail) return NextResponse.json({ error: "No subscribers" }, { status: 400 });

      await resend.emails.send({
        from: FROM,
        to: testEmail,
        subject: `[TEST] ${subject}`,
        html,
      });

      return NextResponse.json({ sent: 1, total: emails.length, mode: "test", testEmail });
    }

    // Send to all (Resend batch limit is 100 per call)
    const batchSize = 50;
    let sent = 0;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      await resend.emails.send({
        from: FROM,
        to: batch,
        subject,
        html,
      });
      sent += batch.length;
    }

    return NextResponse.json({ sent, total: emails.length, mode: "live" });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Send failed" }, { status: 500 });
  }
}
