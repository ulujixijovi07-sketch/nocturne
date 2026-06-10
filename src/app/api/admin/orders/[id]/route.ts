import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendShippingNotification } from "@/lib/email";

export const runtime = "nodejs";

// ─── GET — single order with items & events ────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = parseInt(id);

  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      events: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

// ─── PATCH — update status / shipping / notes ──────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = parseInt(id);

  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const body = await request.json();
  const {
    status,
    shippingAddress,
    trackingNumber,
    trackingCompany,
    internalNotes,
    operatorName,
  } = body;

  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Build update data
  const updateData: Record<string, unknown> = {};
  if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress;
  if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
  if (trackingCompany !== undefined) updateData.trackingCompany = trackingCompany;
  if (internalNotes !== undefined) updateData.internalNotes = internalNotes;

  const oldStatus = existing.status;
  const newStatus = status !== undefined ? status : oldStatus;
  if (status !== undefined) {
    updateData.status = status;
  }

  // Update the order
  const order = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      items: true,
      events: { orderBy: { createdAt: "desc" } },
    },
  });

  // Auto-create OrderEvent if status changed
  if (status !== undefined && oldStatus !== newStatus) {
    const operator = operatorName || "Admin";
    await prisma.orderEvent.create({
      data: {
        orderId,
        eventType: "STATUS_CHANGE",
        operatorName: operator,
        note: `Status changed from ${oldStatus} to ${newStatus}`,
      },
    });

    // Send shipping notification when status changes to SHIPPED
    if (newStatus === "SHIPPED" && trackingNumber && existing.customerEmail) {
      sendShippingNotification(existing.customerEmail, {
        orderNumber: existing.orderNumber,
        customerName: existing.customerName,
        trackingNumber,
        trackingCompany: trackingCompany || undefined,
      });
    }

    // Re-fetch with the new event
    const updated = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        events: { orderBy: { createdAt: "desc" } },
      },
    });

    return NextResponse.json(updated);
  }

  // If only notes/shipping changed without status change, no auto-event
  return NextResponse.json(order);
}
