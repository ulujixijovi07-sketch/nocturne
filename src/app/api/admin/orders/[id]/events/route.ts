import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// ─── POST — create an OrderEvent (notes / status changes) ──────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = parseInt(id);

  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  // Verify order exists
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const body = await request.json();
  const { eventType, operatorName, note } = body;

  if (!eventType || !operatorName) {
    return NextResponse.json(
      { error: "eventType and operatorName are required" },
      { status: 400 }
    );
  }

  const event = await prisma.orderEvent.create({
    data: {
      orderId,
      eventType: eventType || "NOTE_ADDED",
      operatorName: operatorName || "Admin",
      note: note || null,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
