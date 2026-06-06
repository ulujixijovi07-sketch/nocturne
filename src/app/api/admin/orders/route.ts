import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// ─── GET — paginated orders list ───────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "createdAt_desc";

  const where: Record<string, unknown> = {};

  // Search across customer name, email, or order number
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
      { orderNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  // Status filter
  if (status) {
    where.status = status;
  }

  // Sort
  const [sortField, sortDir] = sort.split("_");
  const orderBy = { [sortField || "createdAt"]: sortDir === "asc" ? "asc" : "desc" };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const formatted = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    status: o.status,
    subtotal: o.subtotal,
    shipping: o.shipping,
    discount: o.discount,
    total: o.total,
    itemsCount: o._count.items,
    createdAt: o.createdAt,
  }));

  return NextResponse.json({
    orders: formatted,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// ─── POST — create a test order for development ────────────────────────

const FIRST_NAMES = [
  "Isabelle", "Camille", "Margaux", "Sofia", "Elena",
  "Valentina", "Amandine", "Chiara", "Lucia", "Anouk",
];

const LAST_NAMES = [
  "Laurent", "Moreau", "Dubois", "Martin", "Bernard",
  "Petit", "Roux", "Leroy", "Fontaine", "Girard",
];

const PRODUCTS = [
  { name: "VIOLETTA Lace Set", price: 245 },
  { name: "ELARA Silk Robe", price: 380 },
  { name: "CELESTE Bodysuit", price: 195 },
  { name: "AURÉLIE Chemise", price: 220 },
  { name: "SOPHIE Balconette", price: 175 },
  { name: "MARGOT High-Waist Brief", price: 95 },
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `NC-${ts}-${rand}`;
}

export async function POST() {
  const firstName = randomFrom(FIRST_NAMES);
  const lastName = randomFrom(LAST_NAMES);
  const itemCount = randomInt(1, 3);
  const picked = new Set<number>();
  const items = [];

  while (items.length < itemCount) {
    const idx = randomInt(0, PRODUCTS.length - 1);
    if (picked.has(idx)) continue;
    picked.add(idx);
    const p = PRODUCTS[idx];
    const qty = randomInt(1, 2);
    items.push({
      productName: p.name,
      unitPrice: p.price,
      quantity: qty,
      subtotal: p.price * qty,
      productId: 1, // placeholder — real products may not exist in dev
      variantSku: null,
    });
  }

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const shipping = subtotal > 200 ? 0 : 14.95;
  const discount = Math.random() > 0.7 ? randomInt(10, 30) : 0;
  const total = Math.round((subtotal + shipping - discount) * 100) / 100;

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerName: `${firstName} ${lastName}`,
      customerEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      status: "PENDING",
      subtotal,
      shipping,
      discount,
      total,
      shippingAddress: `${randomInt(10, 200)} Rue de Rivoli, ${randomInt(1, 20)}e, 75001 Paris, France`,
      items: {
        create: items,
      },
    },
    include: {
      items: true,
      events: true,
    },
  });

  return NextResponse.json(order, { status: 201 });
}
