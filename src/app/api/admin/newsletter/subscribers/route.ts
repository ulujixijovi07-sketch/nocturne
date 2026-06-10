import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/newsletter/subscribers — list all subscribers
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: { not: "ADMIN" } },
      select: { id: true, email: true, name: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ subscribers: users });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
