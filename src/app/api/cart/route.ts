import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/cart — get user's cart
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ items });
}

// POST /api/cart — add or update item
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const body = await request.json();
  const { variantId, productId, name, slug, image, color, colorHex, size, price, quantity = 1 } = body;

  if (!variantId || !productId) {
    return NextResponse.json({ error: "variantId and productId required" }, { status: 400 });
  }

  const item = await prisma.cartItem.upsert({
    where: { userId_variantId: { userId: session.user.id, variantId } },
    create: { userId: session.user.id, variantId, productId, name, slug, image, color, colorHex, size, price, quantity },
    update: { quantity },
  });

  return NextResponse.json({ item });
}

// PUT /api/cart — update item quantity
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const body = await request.json();
  const { variantId, quantity } = body;

  if (!variantId) {
    return NextResponse.json({ error: "variantId required" }, { status: 400 });
  }

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id, variantId },
    });
    return NextResponse.json({ deleted: true });
  }

  const item = await prisma.cartItem.update({
    where: { userId_variantId: { userId: session.user.id, variantId } },
    data: { quantity },
  });

  return NextResponse.json({ item });
}

// DELETE /api/cart?variantId= — remove item
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const variantId = searchParams.get("variantId");
  if (!variantId) return NextResponse.json({ error: "variantId required" }, { status: 400 });

  await prisma.cartItem.deleteMany({
    where: { userId: session.user.id, variantId: parseInt(variantId) },
  });

  return NextResponse.json({ success: true });
}
