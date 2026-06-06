import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    const {
      email,
      firstName,
      lastName,
      address: street,
      city,
      zip,
      country,
      phone,
      delivery,
      shippingCost,
      promoCode,
      discount,
      items,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    const customerName = `${firstName || ""} ${lastName || ""}`.trim();
    const customerEmail = session?.user?.email || email || "";

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const total = subtotal + (shippingCost || 0) - (discount || 0);

    // Generate order number
    const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ23456789";
    const rand = () => Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const orderNumber = `NC-${rand()}-${rand().slice(0, 3)}`;

    // Build shipping address JSON
    const shippingAddress = JSON.stringify({ street, city, zip, country, phone, name: customerName });

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customerName || "Guest",
        customerEmail,
        status: "PENDING",
        subtotal,
        shipping: shippingCost || 0,
        discount: discount || 0,
        total: Math.max(0, total),
        shippingAddress,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.name,
            variantSku: item.sku || null,
            unitPrice: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          })),
        },
        events: {
          create: {
            eventType: "CREATED",
            operatorName: customerName || "Customer",
          },
        },
      },
      include: { items: true },
    });

    // Consume promo code
    if (promoCode) {
      await prisma.promoCode.update({
        where: { code: promoCode },
        data: { usedCount: { increment: 1 } },
      });

      // Check if max uses reached
      const promo = await prisma.promoCode.findUnique({ where: { code: promoCode } });
      if (promo && promo.maxUses && promo.usedCount >= promo.maxUses) {
        await prisma.promoCode.update({
          where: { code: promoCode },
          data: { isActive: false },
        });
      }

      // For gift cards, always deactivate after one use
      if (promo?.isGiftCard) {
        await prisma.promoCode.update({
          where: { code: promoCode },
          data: { isActive: false },
        });
      }
    }

    return NextResponse.json({ success: true, orderNumber, orderId: order.id }, { status: 201 });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
