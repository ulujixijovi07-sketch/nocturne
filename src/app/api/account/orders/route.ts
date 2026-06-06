import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ orders: [] });
  }

  const orders = await prisma.order.findMany({
    where: { customerEmail: session.user.email },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      events: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return NextResponse.json({ orders });
}
