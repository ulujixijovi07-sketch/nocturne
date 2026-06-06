import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── Templates ─────────────────────────────────────────────────────────

const TEMPLATES = [
  "OMG this {product} is absolutely {adj}! The {material} feels {adj2} against the skin. I wore this for my {occasion} and felt like a goddess.",
  "{product} exceeded all my expectations! The {material} is {adj} and the fit is {adj2}. My {partner} couldn't stop {verb}.",
  "I was hesitant to order lingerie online but {product} is worth every penny. {adj_cap} craftsmanship, {adj2} details — this is luxury you can feel.",
  "This is my {number}th purchase from NOCTURNE and {product} might be my favorite yet. The {color} color is even more {adj} in person.",
  "As a {size} I struggle to find {adj} lingerie that actually fits. {product} delivers! Supportive where it needs to be, {adj2} everywhere else.",
  "Bought {product} for my honeymoon and let me just say... my husband's jaw DROPPED. The photos don't do it justice.",
  "{product} makes me feel like the main character. The {material} drapes {adv} and the {detail} detail is {adj}. I want every color!",
  "FINALLY — {adj} lingerie for {size} that doesn't look like it was designed by someone who's never seen curves. {product} is a game changer.",
  "Ordered {product} on a whim during the sale and it's now my #1 confidence booster. The way the {material} catches the light is pure magic.",
  "My girlfriend literally gasped when she saw me in {product}. The {material} + {detail} combination is lethal. Buy it. Just do it.",
  "I own over {number} sets from NOCTURNE and {product} stands out for its {adj} {material} and {adj2} fit. True to size, incredibly comfortable.",
  "Wearing {product} right now and had to write a review immediately. The {material} is so {adj}, I forget I'm wearing anything at all.",
  "Perfect anniversary gift from me to me ;) {product} arrived in the most discreet packaging, and the unboxing felt like opening a luxury jewelry box.",
  "As someone who works in fashion, I'm picky about {material} quality. {product} uses genuinely {adj} {material} — not the cheap stuff you see elsewhere.",
  "If you're scrolling reviews trying to decide — this is your sign. {product} is {adj}, {adj2}, and worth twice the price.",
];

// Templates that reference {size} (0-indexed)
const SIZE_TEMPLATE_INDICES = new Set([4, 7]); // templates 5 and 8

// ─── Variable pools ────────────────────────────────────────────────────

const ADJECTIVES = [
  "stunning", "gorgeous", "divine", "luxurious", "exquisite",
  "elegant", "flawless", "breathtaking", "incredible",
  "sophisticated", "enchanting", "heavenly", "seductive", "beautiful",
];

const MATERIALS = ["lace", "silk", "satin", "velvet", "mesh", "tulle", "organza"];

const DETAILS = ["embroidery", "beading", "strap", "applique", "trim", "harness", "cutout"];

const VERBS = ["staring", "smiling", "complimenting me", "taking his eyes off me"];

const OCCASIONS = ["anniversary", "date night", "honeymoon", "wedding night", "Valentine's Day"];

const ADVERBS = ["beautifully", "elegantly", "perfectly", "sensually", "flawlessly"];

const COLORS = ["Black", "Red", "White", "Burgundy", "Navy", "Emerald", "Blush", "Ivory"];

const NUMBERS = ["2", "3", "4", "5", "6", "7", "8"];

const PARTNERS = ["husband", "boyfriend", "partner", "fiancé"];

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

const FIVE_STAR_TITLES = [
  "Absolutely stunning", "In love!", "Best purchase ever",
  "So beautiful", "Worth every penny", "Pure luxury", "Obsessed",
  "Perfection", "My new favorite", "Beyond expectations",
];

const FOUR_STAR_TITLES = [
  "Almost perfect", "Beautiful but...", "Lovely piece",
  "Nearly flawless", "Love it with one note", "Great but not perfect",
];

// ─── Helpers ───────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Get the right template pool based on mentionSize preference */
function selectTemplate(mentionSize: boolean): string {
  if (mentionSize) {
    // Random chance to pick a size template: ~25% weight
    if (Math.random() < 0.25) {
      return TEMPLATES[4]; // template 5
    }
    if (Math.random() < 0.25) {
      return TEMPLATES[7]; // template 8
    }
  }
  // Pick from non-size templates (all except indices 4 and 7)
  const nonSize = TEMPLATES.filter((_, i) => !SIZE_TEMPLATE_INDICES.has(i));
  return pick(nonSize);
}

function fillTemplate(template: string, productName: string): string {
  const adj = pick(ADJECTIVES);
  const adj2 = pick(ADJECTIVES);
  const material = pick(MATERIALS);
  const size = pick(SIZES);
  const verb = pick(VERBS);
  const occasion = pick(OCCASIONS);
  const adv = pick(ADVERBS);
  const detail = pick(DETAILS);
  const partner = pick(PARTNERS);
  const number = pick(NUMBERS);
  const color = pick(COLORS);

  return template
    .replace(/\{product\}/g, productName)
    .replace(/\{adj_cap\}/g, adj.charAt(0).toUpperCase() + adj.slice(1))
    .replace(/\{adj2\}/g, adj2)
    .replace(/\{adj\}/g, adj)
    .replace(/\{material\}/g, material)
    .replace(/\{size\}/g, size)
    .replace(/\{verb\}/g, verb)
    .replace(/\{occasion\}/g, occasion)
    .replace(/\{adv\}/g, adv)
    .replace(/\{detail\}/g, detail)
    .replace(/\{partner\}/g, partner)
    .replace(/\{number\}/g, number)
    .replace(/\{color\}/g, color);
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

  const {
    productId,
    count = 10,
    fiveStarPercent = 75,
    dateFrom,
    dateTo,
    verifiedPercent = 100,
    randomNames = true,
    mentionSize = true,
    helpfulMin = 1,
    helpfulMax = 8,
  } = body;

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

  // ── Rating distribution ──────────────────────────────────────────
  const fiveStarCount = Math.round((fiveStarPercent / 100) * count);
  const nonFiveStarCount = count - fiveStarCount;
  // Among non-5-star reviews, ~30% get 4.5, rest get 4.0
  const fourPointFiveCount = Math.round(nonFiveStarCount * 0.3);
  const fourStarExact = nonFiveStarCount - fourPointFiveCount;

  const ratings: number[] = [
    ...Array(fiveStarCount).fill(5.0),
    ...Array(fourPointFiveCount).fill(4.5),
    ...Array(fourStarExact).fill(4.0),
  ];

  // Fisher-Yates shuffle
  for (let i = ratings.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ratings[i], ratings[j]] = [ratings[j], ratings[i]];
  }

  // ── Dates ────────────────────────────────────────────────────────
  const defaultFrom = new Date(Date.now() - 90 * 86400000).toISOString();
  const defaultTo = new Date().toISOString();

  const dates = spreadDates(
    count,
    dateFrom || defaultFrom,
    dateTo || defaultTo
  );

  // ── Generate reviews ─────────────────────────────────────────────
  const generated: {
    productId: number;
    authorName: string;
    rating: number;
    title: string | null;
    body: string;
    isVerified: boolean;
    isPinned: boolean;
    isDeleted: boolean;
    helpfulCount: number;
    createdAt: Date;
  }[] = [];

  const fixedName = "Verified Buyer";

  for (let i = 0; i < count; i++) {
    const rating = ratings[i];
    const template = selectTemplate(mentionSize);
    let body = fillTemplate(template, productName);

    // Append critique for non-5-star reviews
    if (rating === 4.0) {
      body += " " + pick(FOUR_STAR_CRITIQUES) + ".";
    } else if (rating === 4.5 && Math.random() < 0.5) {
      body += " " + pick(FOUR_STAR_CRITIQUES) + ".";
    }

    // Title logic: always for ≤4.0, ~40% chance for 5.0, ~60% for 4.5
    const title =
      rating === 4.0
        ? pick(FOUR_STAR_TITLES)
        : rating === 4.5
          ? Math.random() < 0.6
            ? pick(FOUR_STAR_TITLES)
            : null
          : Math.random() < 0.4
            ? pick(FIVE_STAR_TITLES)
            : null;

    // Verified based on verifiedPercent
    const isVerified = Math.random() < verifiedPercent / 100;

    // Helpful count
    const helpfulCount =
      helpfulMin + Math.floor(Math.random() * (helpfulMax - helpfulMin + 1));

    generated.push({
      productId: parseInt(String(productId)),
      authorName: randomNames ? pick(NAMES) : fixedName,
      rating,
      title,
      body,
      isVerified,
      isPinned: false,
      isDeleted: false,
      helpfulCount,
      createdAt: dates[i],
    });
  }

  // ── Insert ───────────────────────────────────────────────────────
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
