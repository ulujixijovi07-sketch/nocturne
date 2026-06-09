import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  await prisma.contactMessage.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });
  return NextResponse.json({ success: true });
}
