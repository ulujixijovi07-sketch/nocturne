import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const orderNumber = searchParams.get("orderNumber");

  if (!email || !orderNumber) {
    return NextResponse.json({ error: "Email and order number required" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: {
      customerEmail: email.toLowerCase().trim(),
      orderNumber: orderNumber.toUpperCase().trim(),
    },
    include: {
      items: true,
      events: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}
