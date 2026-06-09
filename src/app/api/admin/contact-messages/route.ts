import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(messages);
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "0");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "0");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { reply } = await request.json();
  if (!reply) return NextResponse.json({ error: "Missing reply" }, { status: 400 });

  await prisma.contactMessage.update({
    where: { id },
    data: { reply, repliedAt: new Date(), isRead: true },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "0");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.contactMessage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
