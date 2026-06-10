import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTrackingStatus } from "@/lib/shippo";

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

  // Get real-time tracking if tracking number exists
  let trackingData = null;
  if (order.trackingNumber && order.trackingCompany) {
    try {
      trackingData = await getTrackingStatus(order.trackingCompany, order.trackingNumber);
    } catch {}
  }

  return NextResponse.json({
    order: {
      ...order,
      trackingUrl: trackingData?.carrierUrl || `https://track.goshippo.com/${order.trackingNumber}`,
      trackingHistory: trackingData?.history || [],
      trackingStatus: trackingData?.status || order.status,
    },
  });
}
