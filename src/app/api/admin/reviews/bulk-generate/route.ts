import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── Templates ─────────────────────────────────────────────────────────

const TEMPLATES = [
  "OMG this {product} is absolutely {adj}! The {material} feels divine against the skin.",
  "This {product} exceeded all my expectations. The {material} is {adj2} and the fit is {adj}. My partner could not stop staring.",
  "I was hesitant to order lingerie online but {product} is worth every penny. {adj_cap} craftsmanship.",
  "As a {size} I struggle to find {adj} lingerie that actually fits. {product} delivers!",
  "Bought {product} for my anniversary and felt incredible. The photos do not do it justice.",
  "Finally — {adj} lingerie for {size} that actually looks designed for real curves.",
  "I own several NOCTURNE pieces and {product} might be my favorite. The {material} is so {adj2}.",
];

// ─── Variable pools ────────────────────────────────────────────────────

const ADJECTIVES = [
  "stunning", "gorgeous", "divine", "luxurious", "exquisite",
  "elegant", "flawless", "breathtaking",
];

const MATERIALS = ["lace", "silk", "satin", "velvet", "mesh", "tulle"];

const SIZES = [
  "32DD", "34DD", "36DDD", "38G", "34C", "36D", "38DD",
  "curvy", "plus-size", "busty",
];

const NAMES = [
  "Sophia", "Emma", "Olivia", "Ava", "Isabella",
  "Mia", "Charlotte", "Amelia", "Harper", "Evelyn",
  "Abigail", "Emily", "Elizabeth", "Sofia", "Avery",
  "Ella", "Madison", "Scarlett", "Victoria", "Grace",
];

const FOUR_STAR_CRITIQUES = [
  "Runs slightly small", "Beautiful, just wish the clasp was sturdier",
  "Stunning but runs slightly small — size up if between sizes",
  "Wish it came in more colors", "Straps are a bit thin",
  "Lovely material but the stitching could be tighter",
  "Beautiful design but the straps dig in a little",
];

// ─── Helpers ───────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clampRating(): number {
  // 4 or 5 stars
  return Math.random() < 0.15 ? 4 : 5;
}

function fillTemplate(template: string, productName: string): string {
  const adj = pick(ADJECTIVES);
  const adj2 = pick(ADJECTIVES);
  const material = pick(MATERIALS);
  const size = pick(SIZES);

  return template
    .replace(/\{product\}/g, productName)
    .replace(/\{adj_cap\}/g, adj.charAt(0).toUpperCase() + adj.slice(1))
    .replace(/\{adj2\}/g, adj2)
    .replace(/\{adj\}/g, adj)
    .replace(/\{material\}/g, material)
    .replace(/\{size\}/g, size);
}

function spreadDates(
  count: number,
  dateFrom: string,
  dateTo: string
): Date[] {
  const start = new Date(dateFrom).getTime();
  const end = new Date(dateTo).getTime();
  const step = count > 1 ? (end - start) / (count - 1) : 0;

  return Array.from({ length: count }, (_, i) => {
    const ts = start + step * i + (Math.random() - 0.5) * step * 0.5;
    return new Date(Math.max(start, Math.min(end, ts)));
  });
}

// ─── Route ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { productId, count = 10, fiveStarPercent = 80, dateFrom, dateTo } = body;

  if (!productId || !count || count < 1 || count > 100) {
    return NextResponse.json(
      { error: "productId (number) and count (1-100) are required" },
      { status: 400 }
    );
  }

  // Find product for name
  const product = await prisma.product.findUnique({
    where: { id: parseInt(String(productId)) },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const productName = product.name;
  const fiveStarCount = Math.round((fiveStarPercent / 100) * count);
  const fourStarCount = count - fiveStarCount;

  // Generate review objects
  const dates = spreadDates(
    count,
    dateFrom || new Date(Date.now() - 90 * 86400000).toISOString(),
    dateTo || new Date().toISOString()
  );

  const generated: {
    productId: number;
    authorName: string;
    rating: number;
    title: string | null;
    body: string;
    isVerified: boolean;
    isPinned: boolean;
    isDeleted: boolean;
    createdAt: Date;
  }[] = [];

  // Use a shuffled array of ratings to respect fiveStarPercent
  const ratings = [
    ...Array(fiveStarCount).fill(5),
    ...Array(fourStarCount).fill(4),
  ];

  // Fisher-Yates shuffle
  for (let i = ratings.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ratings[i], ratings[j]] = [ratings[j], ratings[i]];
  }

  for (let i = 0; i < count; i++) {
    const rating = ratings[i];
    const template = pick(TEMPLATES);
    let body = fillTemplate(template, productName);

    if (rating === 4) {
      body += " " + pick(FOUR_STAR_CRITIQUES) + ".";
    }

    // ~40% chance of a title for 5-star reviews, always for 4-star
    const title =
      rating === 4
        ? pick(["Almost perfect", "Beautiful but...", "Lovely piece", "Nearly flawless"])
        : Math.random() < 0.4
          ? pick([
              "Absolutely stunning",
              "In love!",
              "Best purchase ever",
              "So beautiful",
              "Worth every penny",
              "Pure luxury",
              "Obsessed",
            ])
          : null;

    generated.push({
      productId: parseInt(String(productId)),
      authorName: pick(NAMES),
      rating,
      title,
      body,
      isVerified: Math.random() < 0.7,
      isPinned: false,
      isDeleted: false,
      createdAt: dates[i],
    });
  }

  // Insert all
  await prisma.review.createMany({ data: generated });

  // Fetch the created reviews to return them
  const inserted = await prisma.review.findMany({
    where: { productId: parseInt(String(productId)) },
    orderBy: { createdAt: "desc" },
    take: count,
    include: {
      product: { select: { name: true } },
    },
  });

  return NextResponse.json({
    created: inserted.length,
    reviews: inserted,
  });
}
