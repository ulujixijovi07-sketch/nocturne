import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/account/addresses — list user's addresses
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ addresses });
}

// POST /api/account/addresses — create address
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const body = await request.json();
  const { label, name, phone, street, city, state, zip, country, isDefault } = body;

  if (!name || !street || !city || !state || !zip) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  }

  // If this address is default, unset all others
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  // If this is the first address, make it default
  const count = await prisma.address.count({
    where: { userId: session.user.id },
  });

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      label: label || "Home",
      name,
      phone: phone || "",
      street,
      city,
      state,
      zip,
      country: country || "US",
      isDefault: isDefault || count === 0,
    },
  });

  return NextResponse.json({ address }, { status: 201 });
}

// PUT /api/account/addresses — update address by id in body
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const body = await request.json();
  const { id, label, name, phone, street, city, state, zip, country, isDefault } = body;

  if (!id) {
    return NextResponse.json({ error: "Address id required" }, { status: 400 });
  }

  // Verify ownership
  const existing = await prisma.address.findFirst({
    where: { id: Number(id), userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  // If setting as default, unset others
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id: Number(id) },
    data: {
      label,
      name,
      phone,
      street,
      city,
      state,
      zip,
      country,
      isDefault,
    },
  });

  return NextResponse.json({ address });
}

// DELETE /api/account/addresses?id= — remove address
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Address id required" }, { status: 400 });
  }

  // Verify ownership
  const existing = await prisma.address.findFirst({
    where: { id: Number(id), userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  await prisma.address.delete({ where: { id: Number(id) } });

  return NextResponse.json({ success: true });
}

// PATCH /api/account/addresses — set default
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Address id required" }, { status: 400 });
  }

  // Verify ownership
  const existing = await prisma.address.findFirst({
    where: { id: Number(id), userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  // Unset all defaults, then set the target
  await prisma.address.updateMany({
    where: { userId: session.user.id, isDefault: true },
    data: { isDefault: false },
  });

  await prisma.address.update({
    where: { id: Number(id) },
    data: { isDefault: true },
  });

  return NextResponse.json({ success: true });
}
