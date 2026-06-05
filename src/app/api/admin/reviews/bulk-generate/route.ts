import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TEMPLATES_5 = [
  "I have spent years searching for a {type} that actually {benefit}. As a {size}, {painPoint} — but this piece {solution}. I wore it {occasion} and forgot I had it on, which is the highest possible compliment. The {detail} is such a beautiful, unexpected touch. I'm ordering the matching pieces immediately.",
  "Ordered the {product} for {occasion} and I cannot overstate how incredible I felt. I'm {height}, {weight}lbs, usually a {size}, and the size guide was spot-on. It arrived in {shipping} days, discreetly packaged as promised. The {detail} catches the light beautifully. Already browsing my next NOCTURNE purchase.",
  "I'm somewhat of a lingerie collector — I own pieces from {brand1}, {brand2}, and {brand3}. This genuinely competes with items I've paid twice as much for. The {material} is real — you can feel the weight and quality immediately. Fit is true to size, but {fitNote}. For the price point, this is exceptional value.",
  "Bought this on a whim during a late-night session and expected to return it. Instead, it's become my absolute favourite. I'm a {size} and often feel like lingerie isn't designed with {bodyType} in mind, but this creates beautiful shape without {issue}. The {detail} lies completely flat under clothing too. Five stars, no notes.",
  "I've worn this {times} times now — {occasion1}, {occasion2}, and just because I wanted to feel amazing getting ready. All three scenarios, perfection. The {material} is soft against the skin, not scratchy like some {material}-edged pieces, and the {feature} means zero digging or rolling. {shippingNote}. Treat yourself.",
  "Genuinely the most beautiful lingerie I've ever owned. The {color} is much deeper and more sophisticated in person than online photos capture. I bought both the {color1} and {color2} colorways and they coordinate beautifully. The set washes well — I hand wash in cold with silk detergent and it looks brand new after several wears.",
  "Look, I'm just going to say it: this {product} makes you feel like the main character. I wore it with the matching {matching} for {occasion} and have never felt more powerful getting dressed. The {detail} is such a thoughtful touch. {shippingNote}. If you're on the fence, just get it.",
  "I was worried about ordering lingerie online without trying it on first, but NOCTURNE's size guide was spot-on. I'm {measurements} and the {size} fits like it was tailored for me. The return policy gave me confidence to try, and now I'm a convert. The {detail} is what sets this apart from mass-market brands.",
];

const TEMPLATES_4 = [
  "Absolutely stunning {product} — the {material} against the {color} is pure drama in the best way. I'm a {size} and the {sizeBought} fits well overall. My one small note: {minorIssue}. For {bodyType} figures, {suggestion} would make this absolutely perfect. Still keeping it and still love it — just something to consider.",
  "Beautiful quality and the {color} is even richer in person. I ordered my usual {size} and found {minorIssue}. The exchange process was super easy, and the replacement arrived quickly. {positiveNote}. Just factor in {suggestion} if you have {bodyType}.",
  "This is a seriously beautiful piece. The {detail} gives it this dark luxury feel that's impossible to capture in photos. The only reason for 4 stars instead of 5 is {minorIssue}. That said, once sorted, {positiveNote} — which is the real test. Would still recommend.",
  "Gorgeous craftsmanship and the {material} is exceptional. Giving 4 stars because {minorIssue}. It's not a dealbreaker by any means, and I'd rather a brand err on the side of {preference} — which this absolutely does. Quality is undeniable.",
];

const NAMES = [
  "Olivia Bennett", "Madison Torres", "Charlotte Reed", "Isabella Knight",
  "Sophia Walsh", "Ava Morrison", "Mia Gallagher", "Harper Quinn",
  "Amelia Cross", "Evelyn Drake", "Victoria Hayes", "Penelope Shaw",
  "Audrey Chen", "Sienna Brooks", "Jasmine Hart",
];

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const BODY_TYPES = ["smaller busts", "fuller busts", "a longer torso", "wider hips", "curvier figures", "a petite frame", "athletic builds"];
const COLORS = ["burgundy", "noir", "gothic burgundy", "deep plum", "oxblood", "midnight violet"];
const OCCASIONS = ["our anniversary trip to Paris", "a wedding", "a date night", "a special evening out", "an entire workday", "a friend's bridal shower", "a weekend getaway"];
const SHIPPING_NOTES = ["Arrived in 4 days, beautifully boxed.", "Shipping was lightning fast — 3 days.", "Delivered within the week in perfect condition.", "Came in 5 days, discreet packaging as advertised."];
const BRANDS = ["Honey Birdette", "Agent Provocateur", "Bluebella", "Fleur du Mal", "La Perla", "Edge o' Beyond"];
const DETAILS = ["jet crystal at the centre gore", "gold-toned hardware", "scalloped lace edging", "silk charmeuse lining", "hand-cut lace pattern", "satin binding", "pearl beading", "gold ring detail"];
const MINOR_ISSUES_4 = [
  "the straps are quite thin and I found myself adjusting them after a few hours of wear",
  "I wish there was one more hook setting for a slightly more relaxed fit through the hip",
  "the color is slightly darker in person than the website photos show",
  "the suspender clips are quite stiff when you're first attaching them",
  "it runs slightly small through the hip — size up if you're between sizes",
  "the straps, while beautiful, could be a touch wider for fuller cup support",
  "it took a couple of wears for the lace to fully soften against the skin",
];
const SUGGESTIONS_4 = [
  "a quarter-inch wider strap option for DDD+ cups",
  "one more hook-and-eye setting",
  "sizing up if you're between sizes",
  "a slightly more relaxed hip fit option",
  "updated color photography",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fillTemplate(template: string, product: string, size: string): string {
  const brand1 = pick(BRANDS);
  let brand2 = pick(BRANDS);
  while (brand2 === brand1) brand2 = pick(BRANDS);
  let brand3 = pick(BRANDS);
  while (brand3 === brand1 || brand3 === brand2) brand3 = pick(BRANDS);

  const heightInches = randomInt(62, 70);
  const height = `${Math.floor(heightInches / 12)}'${heightInches % 12}"`;
  const weight = randomInt(115, 175);

  return template
    .replace(/\{product\}/g, product)
    .replace(/\{size\}/g, size)
    .replace(/\{sizeBought\}/g, size)
    .replace(/\{type\}/g, pick(["balconette", "high-waist brief", "suspender belt", "lingerie set", "bra"]))
    .replace(/\{benefit\}/g, pick(["supports without underwire digging", "stays in place all night", "feels like nothing against the skin", "creates gorgeous shape"]))
    .replace(/\{painPoint\}/g, pick(["underwire usually digs in by hour three", "elastic always leaves marks", "straps never stay where I put them", "most pieces feel like an afterthought"]))
    .replace(/\{solution\}/g, pick(["is lined in silk charmeuse that genuinely disappears against the skin", "holds without compression", "somehow manages both lift and comfort", "feels tailored rather than mass-produced"]))
    .replace(/\{occasion\}/g, pick(OCCASIONS))
    .replace(/\{occasion1\}/g, pick(OCCASIONS))
    .replace(/\{occasion2\}/g, pick(["dinner out", "a long evening of dancing", "just getting ready at home", "under a fitted dress"]))
    .replace(/\{detail\}/g, pick(DETAILS))
    .replace(/\{material\}/g, pick(["French leavers lace", "silk charmeuse", "burgundy silk", "shadow-black lace", "opaque silk"]))
    .replace(/\{color\}/g, pick(COLORS))
    .replace(/\{color1\}/g, pick(COLORS))
    .replace(/\{color2\}/g, pick(COLORS))
    .replace(/\{height\}/g, height)
    .replace(/\{weight\}/g, weight.toString())
    .replace(/\{bodyType\}/g, pick(BODY_TYPES))
    .replace(/\{brand1\}/g, brand1)
    .replace(/\{brand2\}/g, brand2)
    .replace(/\{brand3\}/g, brand3)
    .replace(/\{shipping\}/g, randomInt(3, 6).toString())
    .replace(/\{shippingNote\}/g, pick(SHIPPING_NOTES))
    .replace(/\{fitNote\}/g, pick(["the band runs slightly firm, which I actually prefer", "the cup runs generous", "it fits like it was tailored", "the size guide is accurate"]))
    .replace(/\{issue\}/g, pick(["gaping", "spillover", "riding up", "visible lines"]))
    .replace(/\{feature\}/g, pick(["elastic-free waistband", "contour cut", "adjustable straps", "silk lining"]))
    .replace(/\{times\}/g, randomInt(3, 6).toString())
    .replace(/\{matching\}/g, pick(["brief", "stockings", "balconette", "thong"]))
    .replace(/\{measurements\}/g, pick(["5'4\" and 130lbs", "5'7\" and 155lbs", "5'3\" and 120lbs", "5'9\" and 145lbs"]))
    .replace(/\{minorIssue\}/g, pick(MINOR_ISSUES_4))
    .replace(/\{suggestion\}/g, pick(SUGGESTIONS_4))
    .replace(/\{positiveNote\}/g, pick(["Once clipped in they didn't budge all night", "The quality is genuinely exceptional", "It's become a staple in my rotation", "I reach for it more than pieces that cost twice as much"]))
    .replace(/\{preference\}/g, pick(["sculpting over baggy", "structured over sloppy", "secure over loose"]));
}

export async function POST(request: Request) {
  try {
    const { productId, count = 10, ratingBias = "high" } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const reviews = [];
    for (let i = 0; i < count; i++) {
      let rating: number;
      let template: string;
      const roll = Math.random();

      if (ratingBias === "high") {
        rating = roll < 0.7 ? 5 : 4;
        template = rating === 5 ? pick(TEMPLATES_5) : pick(TEMPLATES_4);
      } else if (ratingBias === "mixed") {
        rating = roll < 0.5 ? 5 : roll < 0.8 ? 4 : 3;
        template = rating >= 4 ? (rating === 5 ? pick(TEMPLATES_5) : pick(TEMPLATES_4)) : pick(TEMPLATES_4);
      } else {
        rating = roll < 0.4 ? 5 : roll < 0.7 ? 4 : randomInt(3, 5);
        template = rating >= 4 ? (rating === 5 ? pick(TEMPLATES_5) : pick(TEMPLATES_4)) : pick(TEMPLATES_4);
      }

      const size = pick(SIZES);
      const body = fillTemplate(template, product.name, size);

      reviews.push({
        productId,
        authorName: pick(NAMES),
        rating,
        title: null,
        body,
        isVerified: Math.random() > 0.2,
        isPinned: false,
        createdAt: new Date(Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000),
      });
    }

    const created = await prisma.review.createMany({ data: reviews });
    return NextResponse.json({ created: created.count });
  } catch {
    return NextResponse.json({ error: "Bulk generation failed" }, { status: 500 });
  }
}
