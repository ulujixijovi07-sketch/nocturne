import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { ids, action } = body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids array required" }, { status: 400 });
  }

  try {
    switch (action) {
      case "activate":
        await prisma.product.updateMany({ where: { id: { in: ids } }, data: { status: "ACTIVE", isActive: true } });
        break;
      case "draft":
        await prisma.product.updateMany({ where: { id: { in: ids } }, data: { status: "DRAFT" } });
        break;
      case "archive":
        await prisma.product.updateMany({ where: { id: { in: ids } }, data: { status: "ARCHIVED", isActive: false } });
        break;
      case "delete":
        await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive: false, status: "ARCHIVED" } });
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    return NextResponse.json({ success: true, updated: ids.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
