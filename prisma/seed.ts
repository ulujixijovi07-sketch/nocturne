import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function generateSku(
  productPrefix: string,
  colorCode: string,
  size: string,
  cup?: string | null
): string {
  const parts = [`NCT`, productPrefix, colorCode, size];
  if (cup) parts.push(cup);
  return parts.join("-").toUpperCase();
}

interface ColorVariant {
  name: string;
  hex: string;
  code: string;
}

function generateVariants(
  productId: number,
  productPrefix: string,
  colors: ColorVariant[],
  sizes: string[],
  cups?: string[]
) {
  const variants: Array<{
    productId: number;
    color: string;
    colorHex: string;
    size: string;
    cup: string | null;
    stock: number;
    sku: string;
  }> = [];

  for (const color of colors) {
    for (const size of sizes) {
      if (cups && cups.length > 0) {
        for (const cup of cups) {
          variants.push({
            productId,
            color: color.name,
            colorHex: color.hex,
            size,
            cup,
            stock: randomStock(),
            sku: generateSku(productPrefix, color.code, size, cup),
          });
        }
      } else {
        variants.push({
          productId,
          color: color.name,
          colorHex: color.hex,
          size,
          cup: null,
          stock: randomStock(),
          sku: generateSku(productPrefix, color.code, size),
        });
      }
    }
  }

  return variants;
}

function randomStock(): number {
  return Math.floor(Math.random() * 80) + 10; // 10–90 units
}

function generateImages(
  productId: number,
  productSlug: string,
  count: number
) {
  return Array.from({ length: count }, (_, i) => ({
    productId,
    url: `https://picsum.photos/seed/${productSlug}-${i + 1}/800/1067`,
    alt: `${productSlug} — image ${i + 1}`,
    sortOrder: i,
    isPrimary: i === 0,
  }));
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const collections = [
  {
    name: "VIOLETTA",
    slug: "violetta",
    description:
      "Deep burgundy lace and gothic romance intertwine in VIOLETTA. Each piece is forged from French leavers lace, jet crystals, and 24k gold-dipped hardware, evoking moonlit encounters and dark sensuality.",
    heroImage: "https://picsum.photos/seed/collection-violetta/1200/600",
    isActive: true,
    sortOrder: 0,
  },
  {
    name: "ELARA",
    slug: "elara",
    description:
      "Champagne silk charmeuse meets bridal elegance in ELARA. Ivory-touched lace, pearl beading, and whisper-weight trains compose a collection for the woman who walks down the aisle with quiet confidence.",
    heroImage: "https://picsum.photos/seed/collection-elara/1200/600",
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "SERAPHINA",
    slug: "seraphina",
    description:
      "Black leather, gold hardware, and dominatrix luxe define SERAPHINA. Straps, buckles, and harness silhouettes cut a commanding figure — for the woman who wields power as her most potent accessory.",
    heroImage: "https://picsum.photos/seed/collection-seraphina/1200/600",
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "CELESTE",
    slug: "celeste",
    description:
      "Sheer baby blue tulle and ethereal softness float through CELESTE. Hand-embroidered wildflowers, satin ribbons, and barely-there mesh create a collection as light as morning mist on bare skin.",
    heroImage: "https://picsum.photos/seed/collection-celeste/1200/600",
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "MORGANA",
    slug: "morgana",
    description:
      "Emerald velvet and occult seduction converge in MORGANA. Rich velvet devoré, gold embroidery, and dagger-sharp cuts pay homage to the arcane — lingerie as ritual, the body as altar.",
    heroImage: "https://picsum.photos/seed/collection-morgana/1200/600",
    isActive: true,
    sortOrder: 4,
  },
  {
    name: "VALENTINA",
    slug: "valentina",
    description:
      "Red satin and classic femme fatale allure define VALENTINA. Slinking bias cuts, liquid drape, and fire-engine finish craft the silhouette of a woman who enters a room and owns every gaze.",
    heroImage: "https://picsum.photos/seed/collection-valentina/1200/600",
    isActive: true,
    sortOrder: 5,
  },
  {
    name: "LUNA",
    slug: "luna",
    description:
      "Black mesh and celestial crystals compose LUNA. Constellation embroidery, crescent hardware, and sheer panelling evoke the midnight sky — a love letter to the body written in starlight.",
    heroImage: "https://picsum.photos/seed/collection-luna/1200/600",
    isActive: true,
    sortOrder: 6,
  },
  {
    name: "AURORA",
    slug: "aurora",
    description:
      "Blush pink organza and romantic innocence bloom in AURORA. Layered ruffles, silk ribbons, and soft floral appliqués whisper of first light, fresh bloom, and the ache of new desire.",
    heroImage: "https://picsum.photos/seed/collection-aurora/1200/600",
    isActive: true,
    sortOrder: 7,
  },
];

const categories = [
  {
    name: "Lingerie Sets",
    slug: "lingerie-sets",
    description:
      "Complete ensembles that pair bras, briefs, suspenders, and accessories in perfect orchestration. Each set is curated to tell one seamless story from décolletage to ankle.",
    image: "https://picsum.photos/seed/category-lingerie-sets/400/400",
  },
  {
    name: "Bodysuits & Teddies",
    slug: "bodysuits-teddies",
    description:
      "One-piece wonders that sculpt the torso into a singular statement. Clean lines, daring cutouts, and luxurious fabric blends that feel as exquisite as they look.",
    image: "https://picsum.photos/seed/category-bodysuits/400/400",
  },
  {
    name: "Bras",
    slug: "bras",
    description:
      "From demi-cup to balconette, plunge to full-coverage — each bra is engineered with precision underwire and lined in silk charmeuse for a fit that lifts as it caresses.",
    image: "https://picsum.photos/seed/category-bras/400/400",
  },
  {
    name: "Briefs & Thongs",
    slug: "briefs-thongs",
    description:
      "High-cut briefs, Brazilian backs, and gossamer thongs cut from lace, mesh, and silk. Designed to sit low on the hip and high on sensuality.",
    image: "https://picsum.photos/seed/category-briefs/400/400",
  },
  {
    name: "Suspender Belts",
    slug: "suspender-belts",
    description:
      "The bridge between stocking and skin. Each suspender belt is framed with adjustable satin straps and finished with gold-toned clips that hold tension with quiet authority.",
    image: "https://picsum.photos/seed/category-suspenders/400/400",
  },
  {
    name: "Hosiery",
    slug: "hosiery",
    description:
      "Sheer, patterned, and lace-top stockings that elongate the leg and frame the thigh. Knit in Italy with reinforced toes and silicone grip bands for the perfect hold.",
    image: "https://picsum.photos/seed/category-hosiery/400/400",
  },
  {
    name: "Chemises & Slips",
    slug: "chemises-slips",
    description:
      "Liquid silk and lace-trimmed slips that skim the body like a whispered secret. Cut on the bias for a drape that flatters every curve, from bed to boudoir.",
    image: "https://picsum.photos/seed/category-chemises/400/400",
  },
  {
    name: "Corsets & Bustiers",
    slug: "corsets-bustiers",
    description:
      "Waist-cinching corsets with spiral steel boning and silk lacing. Each bustier is hand-constructed to sculpt the hourglass silhouette with equal parts structure and seduction.",
    image: "https://picsum.photos/seed/category-corsets/400/400",
  },
  {
    name: "Robes & Kimonos",
    slug: "robes-kimonos",
    description:
      "Floor-sweeping robes in silk charmeuse, feather-trimmed chiffon, and floral burnout velvet. Designed to drape effortlessly over bare skin from morning languor to evening ritual.",
    image: "https://picsum.photos/seed/category-robes/400/400",
  },
  {
    name: "Harnesses & Body Chains",
    slug: "harnesses-body-chains",
    description:
      "Leather straps, gold chains, and architectural hardware that trace the contours of the body. Worn alone or layered over lingerie — each piece maps desire across the skin.",
    image: "https://picsum.photos/seed/category-harnesses/400/400",
  },
  {
    name: "Bridal Lingerie",
    slug: "bridal-lingerie",
    description:
      "Ivory, champagne, and blush pieces designed for the wedding day and the honeymoon that follows. Pearl-beaded lace, silk charmeuse, and cathedral-length veils complete the trousseau.",
    image: "https://picsum.photos/seed/category-bridal/400/400",
  },
  {
    name: "Self-Love",
    slug: "self-love",
    description:
      "Pieces designed for solitary ritual — silk blindfolds, wrist ties, massage candles, and weighted eye masks. Because the most important relationship is the one you nurture with yourself.",
    image: "https://picsum.photos/seed/category-self-love/400/400",
  },
  {
    name: "Accessories",
    slug: "accessories",
    description:
      "The final note in the composition — lace chokers, silk blindfolds, garter belts, pasties, and gold body chains that complete the ensemble with precision and intent.",
    image: "https://picsum.photos/seed/category-accessories/400/400",
  },
];

const commonSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const cupSizes = ["A", "B", "C", "D", "DD"];

// VIOLETTA color palette — deep burgundy lace gothic romance
const violettaColors: ColorVariant[] = [
  { name: "Noir", hex: "#1A1817", code: "NOI" },
  { name: "Gothic Burgundy", hex: "#8B2252", code: "GBU" },
  { name: "Deep Plum", hex: "#3D1C34", code: "DPL" },
  { name: "Oxblood", hex: "#4A0D1B", code: "OXB" },
  { name: "Midnight Violet", hex: "#2D1B4E", code: "MVI" },
];

// ELARA color palette — champagne silk bridal elegance
const elaraColors: ColorVariant[] = [
  { name: "Champagne", hex: "#F5E6CC", code: "CHA" },
  { name: "Ivory", hex: "#FFFFF0", code: "IVO" },
  { name: "Blush", hex: "#DEB8B0", code: "BLU" },
  { name: "White", hex: "#FAFAFA", code: "WHT" },
];

// SERAPHINA color palette — black leather gold hardware dominatrix luxe
const seraphinaColors: ColorVariant[] = [
  { name: "Black", hex: "#1A1817", code: "BLK" },
  { name: "Oxblood", hex: "#4A0E17", code: "OXB" },
  { name: "Gunmetal", hex: "#5C5C5C", code: "GUN" },
  { name: "Midnight", hex: "#191970", code: "MID" },
  { name: "Gold", hex: "#C9A84C", code: "GLD" },
];

// CELESTE color palette — sheer baby blue ethereal softness
const celesteColors: ColorVariant[] = [
  { name: "Baby Blue", hex: "#B5D8EB", code: "BBL" },
  { name: "Powder Pink", hex: "#F4C2C2", code: "PPI" },
  { name: "Lilac Mist", hex: "#C8C8E8", code: "LMI" },
  { name: "Mint", hex: "#C1E6D8", code: "MIN" },
  { name: "Cloud", hex: "#E8EFF5", code: "CLD" },
];

// MORGANA color palette — emerald velvet occult seduction
const morganaColors: ColorVariant[] = [
  { name: "Emerald", hex: "#0B3B24", code: "EME" },
  { name: "Forest", hex: "#1A3320", code: "FOR" },
  { name: "Jade", hex: "#2E5A3E", code: "JAD" },
  { name: "Noir", hex: "#1A1817", code: "NOI" },
  { name: "Ruby", hex: "#6B1021", code: "RUB" },
];

// VALENTINA color palette — red satin classic femme fatale
const valentinaColors: ColorVariant[] = [
  { name: "Crimson", hex: "#8B0000", code: "CRI" },
  { name: "Ruby", hex: "#9B111E", code: "RUB" },
  { name: "Noir", hex: "#1A1817", code: "NOI" },
  { name: "Wine", hex: "#722F37", code: "WIN" },
  { name: "Blush", hex: "#DEB8B0", code: "BLU" },
];

// LUNA color palette — black mesh crystals celestial body
const lunaColors: ColorVariant[] = [
  { name: "Onyx", hex: "#1A1817", code: "ONX" },
  { name: "Silver", hex: "#C0C0C0", code: "SIL" },
  { name: "Midnight", hex: "#191970", code: "MID" },
  { name: "Gunmetal", hex: "#5C5C5C", code: "GUN" },
  { name: "Starlight", hex: "#E8E8F0", code: "STL" },
];

// AURORA color palette — blush pink organza romantic innocence
const auroraColors: ColorVariant[] = [
  { name: "Blush", hex: "#DEB8B0", code: "BLU" },
  { name: "Rose", hex: "#E8C4B8", code: "ROS" },
  { name: "Ivory", hex: "#F5F0EB", code: "IVO" },
  { name: "Champagne", hex: "#F5E6CC", code: "CHA" },
  { name: "Pearl", hex: "#F8F4F0", code: "PEA" },
];

// ---------------------------------------------------------------------------
// Violetta Product Descriptions (sensual editorial, 60-100 words)
// ---------------------------------------------------------------------------

const violettaProducts = [
  {
    name: "Violetta Balconette Bra",
    slug: "violetta-balconette-bra",
    description:
      "Sculpted from shadow-black French leavers lace with hand-cut scalloped edges that trace the décolletage like calligraphy. Burgundy silk charmeuse lines each underwire cradle, while adjustable straps crisscross at the back in a geometry of tension and release. A single jet crystal catches the light at the centre gore — a dark star against the skin. The balconette cut lifts and frames with architectural precision, transforming lingerie into a meditation on form, shadow, and the art of undressing before you are ever touched.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "violetta",
    categories: ["lingerie-sets", "bras"],
    needsCups: true,
    imageCount: 5,
  },
  {
    name: "Violetta High-Waist Brief",
    slug: "violetta-high-waist-brief",
    description:
      "Rising high on the hip and descending into full-coverage lace at the back, this brief is a study in tension — opaque burgundy silk at the front panel dissolves into sheer floral leavers lace across the sides, revealing and concealing in equal measure. The elastic-free waistband sits flush against the skin, finished with a satin binding that whispers rather than grips. A single row of gold-toned rings traces the hip bone, catching the light and the eye, inviting the hand to follow.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "violetta",
    categories: ["lingerie-sets", "briefs-thongs"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Violetta Suspender Belt",
    slug: "violetta-suspender-belt",
    description:
      "A wasp-waist suspender belt cut from the same shadow-black lace as its coordinating balconette. Six adjustable satin straps descend from a wide contour band, each terminating in a gold-toned clip engineered to hold tension without slipping. The front panel is lined in silk charmeuse, while the back laces through gunmetal-finished eyelets — a corset gesture that cinches the waist into an hourglass. Wear it over the matching brief or against bare skin; either way, it frames the body like a dark sonnet.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "violetta",
    categories: ["suspender-belts", "lingerie-sets"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Violetta Lace-Top Stockings",
    slug: "violetta-lace-top-stockings",
    description:
      "Italian-knit sheer stockings with a broad band of floral leavers lace at the thigh — no silicone, no elastic, just the elegant tension of lace against skin. The reinforced heel and toe are knit with a barely-there shadow welt for durability without sacrificing translucency. Each pair is finished with a hand-sewn back seam that traces a long, unbroken line from heel to lace top, elongating the leg into a column of dark poetry. Designed to pair with the Violetta Suspender Belt or to be worn alone, held by confidence.",
    price: 59,
    compareAtPrice: null,
    collectionSlug: "violetta",
    categories: ["hosiery"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Violetta Sheer Robe",
    slug: "violetta-sheer-robe",
    description:
      "A floor-length robe of unlined burgundy silk chiffon that floats behind the body like a shadow given breath. The long, open-front sleeves catch the air with every movement, while a single concealed tie at the waist allows the fabric to drape and part as it pleases. The lapels and cuffs are bound in black French leavers lace — the same lace that composes the Violetta bra and brief — creating a dark halo at every edge. Layer it over the full set for a ritual of unveiling that begins at the threshold and ends with skin.",
    price: 299,
    compareAtPrice: null,
    collectionSlug: "violetta",
    categories: ["robes-kimonos"],
    needsCups: false,
    imageCount: 6,
  },
  {
    name: "Violetta Body Harness",
    slug: "violetta-body-harness",
    description:
      "Supple black leather straps trace a cage across the torso — over the shoulders, down the sternum, around the ribcage, and across the waist — in a web of architectural restraint. Each intersection is punctuated by a 24k gold-dipped ring, and every strap adjusts independently through gunmetal buckles that hold their position with quiet authority. The harness fastens at the back with a single magnetic clasp that releases at the lightest touch. Wear it against bare skin for maximum contrast, or layered over the Violetta balconette bra for a composed study in power.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "violetta",
    categories: ["harnesses-body-chains"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Violetta Choker",
    slug: "violetta-choker",
    description:
      "A close-fitting collar of black French leavers lace backed in silk satin, measuring just wide enough to frame the throat without overwhelming it. A single jet crystal pendant, teardrop-cut and bezel-set in 24k gold, hangs from the centre front — a dark drop of light that draws the gaze down. The choker fastens at the nape with a gold lobster clasp on an adjustable chain, allowing the wearer to control the tension: close and intimate, or loose and grazing. Pairs with the Violetta Body Harness for a complete neck-to-waist architecture.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "violetta",
    categories: ["accessories"],
    needsCups: false,
    imageCount: 4,
  },
  {
    name: "Violetta Crotchless Brief",
    slug: "violetta-crotchless-brief",
    description:
      "A provocative reimagining of the Violetta High-Waist Brief, cut from the same floral leavers lace and burgundy silk but engineered with a concealed open-crotch construction that preserves the silhouette while offering uninhibited access. The opening is framed in a delicate scalloped edge that lies flat against the body, invisible beneath clothing, and the high-waist band retains its signature gold-toned ring detail. Designed for the woman who carries her secrets beneath her clothes and chooses exactly when to reveal them.",
    price: 59,
    compareAtPrice: null,
    collectionSlug: "violetta",
    categories: ["briefs-thongs"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Violetta Full Set",
    slug: "violetta-full-set",
    description:
      "The complete Violetta vision — balconette bra, high-waist brief, suspender belt, lace-top stockings, and sheer robe — presented together in a keepsake box lined in black silk moiré. Each piece is crafted from the same lot of French leavers lace, ensuring perfect continuity of pattern and colour across the ensemble. The box includes a numbered certificate of authenticity, a hand-poured candle fragranced with damask rose and oud, and a black velvet storage bag. This is not a purchase; it is an induction into the dark romance of VIOLETTA.",
    price: 990,
    compareAtPrice: 1190,
    collectionSlug: "violetta",
    categories: ["lingerie-sets"],
    needsCups: true,
    imageCount: 6,
  },
];

// ---------------------------------------------------------------------------
// ELARA Product Descriptions — champagne silk bridal elegance
// ---------------------------------------------------------------------------

const elaraProducts = [
  {
    name: "Elara Plunge Bra",
    slug: "elara-plunge-bra",
    description:
      "Cut from champagne silk charmeuse with a deep-V plunge that draws the eye down the sternum like a whispered promise. Ivory French leavers lace traces each cup in a scalloped embrace, while pearl-beaded straps arch over the shoulders with bridal grace. The underwire cradle is lined in whisper-weight silk that vanishes against the skin, and a single freshwater pearl nestles at the centre gore — a talisman of the day yet to unfold. Designed to disappear beneath the gown and command attention once it falls away.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "elara",
    categories: ["lingerie-sets", "bras", "bridal-lingerie"],
    needsCups: true,
    imageCount: 5,
  },
  {
    name: "Elara Cheeky Brief",
    slug: "elara-cheeky-brief",
    description:
      "A low-rise brief cut from ivory silk jersey with a sheer champagne lace back panel that traces the curve of the cheek like a blush revealing itself. The waistband is a ribbon of silk satin, tied at each hip in a bow that can be loosened with a single pull. Lined in breathable cotton voile at the gusset, the brief combines the innocence of a bridal trousseau with the knowing confidence of a woman who understands that the most powerful unveiling begins with what lies beneath.",
    price: 59,
    compareAtPrice: null,
    collectionSlug: "elara",
    categories: ["briefs-thongs", "bridal-lingerie"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Elara Garter Belt",
    slug: "elara-garter-belt",
    description:
      "A whisper of champagne silk tulle wraps the waist in this garter belt, anchored by an ivory satin band embroidered with seed pearls. Four adjustable suspender straps descend in delicate satin ribbons, each tipped with a gold-toned clip cast in the shape of a rose bud. The back panel is cut from the same French leavers lace as the Elara Plunge Bra, creating a seamless visual line from bust to thigh. Intended to be worn as the bridge between ceremony and consummation, innocence and experience.",
    price: 59,
    compareAtPrice: null,
    collectionSlug: "elara",
    categories: ["suspender-belts", "bridal-lingerie"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Elara Silk Kimono",
    slug: "elara-silk-kimono",
    description:
      "An ankle-length kimono robe cut from liquid champagne silk charmeuse that pools and flows with every movement like sunlight across a marble floor. The wide, open sleeves are bound in ivory French lace at the cuff, and the shawl collar drapes in a soft reverie across the décolletage. A concealed silk tie cinches the waist, while the robe falls open at the front to reveal whatever lies beneath — or nothing at all. Finished with hand-rolled edges and a single pearl button at the nape. The bride's first garment of the morning, and her last at night.",
    price: 399,
    compareAtPrice: null,
    collectionSlug: "elara",
    categories: ["robes-kimonos", "bridal-lingerie"],
    needsCups: false,
    imageCount: 6,
  },
  {
    name: "Elara Seamless Thong",
    slug: "elara-seamless-thong",
    description:
      "A barely-there thong cut from a single piece of champagne microfiber that vanishes beneath even the most unforgiving bias-cut gown. The front panel is seamless and smooth, while the back disappears into a fine silk thread that sits flush against the body without a single visible line. The waistband is bonded, not sewn — no elastic, no stitching, no trace. Available in ivory, champagne, blush, and white to match every shade of bridal. This is the thong you wear when you want the gown to do all the talking, and the lingerie to keep its secrets.",
    price: 59,
    compareAtPrice: null,
    collectionSlug: "elara",
    categories: ["briefs-thongs", "bridal-lingerie"],
    needsCups: false,
    imageCount: 4,
  },
  {
    name: "Elara Lace Bralette",
    slug: "elara-lace-bralette",
    description:
      "An unstructured bralette of ivory French leavers lace with no underwire, no padding — just the architecture of lace against skin. The triangle cups are lined in a single layer of sheer silk chiffon, and the straps adjust at the front with blush pink silk ribbons tied in bows that rest just above the collarbone. The underband is a band of scalloped eyelash lace that kisses the ribcage without constraining it. Designed for the bride who wants shape without structure, presence without performance — a love letter in lace to the body that wears it.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "elara",
    categories: ["bras", "bridal-lingerie"],
    needsCups: true,
    imageCount: 5,
  },
  {
    name: "Elara Bridal Corset",
    slug: "elara-bridal-corset",
    description:
      "A waist-cinching bridal corset constructed with spiral steel boning encased in ivory silk satin and overlaid with hand-appliquéd champagne leavers lace. The sweetheart neckline frames the décolletage, while the back laces through gold-toned eyelets with a blush pink silk ribbon that winds like a vow. Each panel is lined in silk charmeuse, and the modesty panel at the back is edged in seed pearls. The corset reduces the waist by up to two inches and transforms the torso into an hourglass — structured, sculpted, and impossibly romantic.",
    price: 499,
    compareAtPrice: null,
    collectionSlug: "elara",
    categories: ["corsets-bustiers", "bridal-lingerie"],
    needsCups: true,
    imageCount: 6,
  },
  {
    name: "Elara Full Bridal Set",
    slug: "elara-full-bridal-set",
    description:
      "The complete Elara trousseau — plunge bra, cheeky brief, garter belt, seamless thong, and silk kimono — presented in a keepsake box lined in ivory silk moiré. Each piece is cut from the same bolt of champagne silk charmeuse and the same pattern of French leavers lace, ensuring perfect continuity across the ensemble. Includes a numbered certificate of authenticity, a hand-poured candle fragranced with white peony and cashmere, and an ivory velvet storage pouch. This is the bridal set for the woman who understands that the most important dress of the day is the one no one else sees.",
    price: 599,
    compareAtPrice: 699,
    collectionSlug: "elara",
    categories: ["lingerie-sets", "bridal-lingerie"],
    needsCups: true,
    imageCount: 6,
  },
];

// ---------------------------------------------------------------------------
// SERAPHINA Product Descriptions — black leather gold hardware dominatrix luxe
// ---------------------------------------------------------------------------

const seraphinaProducts = [
  {
    name: "Seraphina Leather Bustier",
    slug: "seraphina-leather-bustier",
    description:
      "A sculptural bustier cut from full-grain black lambskin leather with a mirror gloss finish that catches the light like armour. The sweetheart neckline is edged in gold-toned hardware, and the waist is cinched by a row of gold buckle straps that adjust independently for a custom fit. Each bust cup is underwired and lined in silk charmeuse, while the back laces through gold grommets with a leather cord. Spiral steel boning shapes the torso into a weapon — sharp, commanding, and devastatingly elegant.",
    price: 399,
    compareAtPrice: null,
    collectionSlug: "seraphina",
    categories: ["corsets-bustiers", "harnesses-body-chains"],
    needsCups: true,
    imageCount: 5,
  },
  {
    name: "Seraphina High-Cut Brief",
    slug: "seraphina-high-cut-brief",
    description:
      "A high-cut brief cut from supple black lambskin leather at the front with a sheer mesh back panel that disappears between the cheeks. The leg openings are cut high on the hip — elongating the line of the thigh into architecture — and bound in gold-toned trim. A single gold O-ring punctuates each hip, and the waistband is a thin leather strap secured with a gold buckle. Lined in silk at the gusset, the brief is as functional as it is commanding. Wear it with the Seraphina Leather Bustier for the complete silhouette.",
    price: 59,
    compareAtPrice: null,
    collectionSlug: "seraphina",
    categories: ["briefs-thongs"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Seraphina Body Harness",
    slug: "seraphina-body-harness",
    description:
      "An architectural body harness constructed from black leather straps that encircle the shoulders, descend across the sternum, and wrap the waist in a geometry of controlled restraint. Each intersection is anchored by a 24k gold-dipped O-ring, and every strap adjusts independently through gold-toned buckles that hold their position under tension. The harness fastens at the back with a single magnetic clasp — easy to release, impossible to ignore. Wear it against bare skin to command every gaze in the room, or layered over the Seraphina Leather Bustier for a composed study in dominance.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "seraphina",
    categories: ["harnesses-body-chains"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Seraphina Leather Cuffs Set",
    slug: "seraphina-leather-cuffs-set",
    description:
      "A set of four black lambskin leather cuffs — two for the wrists, two for the ankles — each lined in silk charmeuse and secured by a gold-toned buckle. A gold O-ring at each cuff provides an anchor point for the included double-ended gold clasp chain, allowing the wearer or her partner to configure the restraints in endless geometries. The leather is double-stitched at the edges and burnished to a soft glow against the skin. Presented in a black velvet pouch with a numbered certificate. Power, quite simply, you can hold.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "seraphina",
    categories: ["accessories", "harnesses-body-chains"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Seraphina Open-Cup Bra",
    slug: "seraphina-open-cup-bra",
    description:
      "A shelf bra of black patent leather straps that lifts and frames the bust while leaving the breasts entirely exposed — a study in architecture over concealment. The underband is a wide panel of matte black lambskin secured with gold buckles, and the adjustable shoulder straps trace a cage-like geometry across the décolletage. Gold O-rings punctuate each strap intersection, and the back fastens with a wide hook-and-eye closure engineered to hold. Designed for the woman who understands that the most powerful reveal is the one that offers everything at once.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "seraphina",
    categories: ["bras", "harnesses-body-chains"],
    needsCups: true,
    imageCount: 5,
  },
  {
    name: "Seraphina Patent Thong",
    slug: "seraphina-patent-thong",
    description:
      "A minimalist thong cut from glossy black patent leather at the front panel and vanishing into a fine leather string at the back. The waistband is an adjustable leather strap with a gold buckle at the centre front, and the leg openings are cut high and bare — no trim, no distraction, just the liquid gleam of patent leather against the hip bone. Lined in silk charmeuse at the gusset. This is the thong for the woman who wants her lingerie to glint like a blade beneath her clothes, a secret sheathed against the skin.",
    price: 59,
    compareAtPrice: null,
    collectionSlug: "seraphina",
    categories: ["briefs-thongs"],
    needsCups: false,
    imageCount: 4,
  },
  {
    name: "Seraphina Collar with Gold O-Ring",
    slug: "seraphina-collar-gold-o-ring",
    description:
      "A close-fitting collar of black lambskin leather, wide enough to frame the throat with authority, anchored at the centre front by a heavy 24k gold-dipped O-ring. The collar fastens at the back with a locking gold buckle and is lined in silk charmeuse for all-day comfort. The O-ring is engineered to bear tension — attach a leash, a chain, or nothing at all; the statement is complete on its own. The leather is burnished at the edges and conditioned to a soft patina that deepens with wear, like devotion itself.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "seraphina",
    categories: ["accessories", "harnesses-body-chains"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Seraphina Full Domme Set",
    slug: "seraphina-full-domme-set",
    description:
      "The complete Seraphina arsenal — leather bustier, high-cut brief, body harness, leather cuffs set, open-cup bra, patent thong, and gold O-ring collar — presented in a black velvet-lined keepsake box with gold foil insignia. Each piece is crafted from the same full-grain black lambskin, with consistent gold-toned hardware throughout. Includes a numbered certificate of authenticity, a hand-poured candle fragranced with black oud and leather, a silk blindfold, and a velvet storage pouch. This is not a purchase. It is an investiture.",
    price: 499,
    compareAtPrice: 599,
    collectionSlug: "seraphina",
    categories: ["lingerie-sets", "harnesses-body-chains"],
    needsCups: true,
    imageCount: 6,
  },
];

// ---------------------------------------------------------------------------
// CELESTE Product Descriptions — sheer baby blue ethereal softness
// ---------------------------------------------------------------------------

const celesteProducts = [
  {
    name: "Celeste Sheer Balconette",
    slug: "celeste-sheer-balconette",
    description:
      "An impossibly light balconette bra cut from sheer baby blue tulle so fine it reads as morning mist against the skin. The cups are traced with hand-embroidered wildflowers in powder pink and lilac thread, and the underwire is wrapped in pale blue silk charmeuse that vanishes against the body. Scalloped eyelash lace edges each cup, while the adjustable straps are whisper-thin satin ribbons tied in bows at the shoulder. Designed for the woman who wants her lingerie to feel like a secret the sky told only to her — weightless, luminous, and kissed by the first light of dawn.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "celeste",
    categories: ["lingerie-sets", "bras"],
    needsCups: true,
    imageCount: 5,
  },
  {
    name: "Celeste Cheeky Brief",
    slug: "celeste-cheeky-brief",
    description:
      "A low-rise cheeky brief cut from powder pink microfiber with sheer baby blue mesh side panels that trace the hip bone like a watercolour wash. The back is a single layer of translucent tulle embroidered with tiny meadow flowers that seem to float across the skin, while the front panel is lined in whisper-light cotton voile. The waistband is a folded ribbon of satin in the softest lilac, finished with a small pearl button at the centre front. Weightless against the body and invisible beneath clothing, save for the faintest blush of colour against the skin.",
    price: 29,
    compareAtPrice: null,
    collectionSlug: "celeste",
    categories: ["briefs-thongs"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Celeste Suspender Belt",
    slug: "celeste-suspender-belt",
    description:
      "A delicate suspender belt crafted from a single layer of sheer baby blue tulle, gathered at the waist with a powder pink satin ribbon that ties in a soft bow at the centre front. Four adjustable satin suspender straps descend in graduated pastels — sky to cloud to pearl to lavender — each ending in a petite silver-toned clip cast in the shape of a forget-me-not. The back panel is sheer and seamless, while the front is traced with hand-stitched floral embroidery. This is the suspender belt for the woman who wants her lingerie to bloom like a garden after rainfall.",
    price: 59,
    compareAtPrice: null,
    collectionSlug: "celeste",
    categories: ["suspender-belts"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Celeste Mesh Robe",
    slug: "celeste-mesh-robe",
    description:
      "A floor-length robe of unlined baby blue silk mesh that drifts behind the body like a clear summer sky given form. The wide bishop sleeves are gathered at the cuff with lilac silk ribbons, and the shawl collar is embroidered with a constellation of tiny wildflowers in satin thread. A single concealed tie at the waist allows the robe to drape and part as it pleases, while the hem is finished with a hand-rolled edge that catches the light. Layer it over the Celeste Sheer Balconette and Cheeky Brief for a morning ritual as soft as the hour between sleep and waking.",
    price: 199,
    compareAtPrice: null,
    collectionSlug: "celeste",
    categories: ["robes-kimonos"],
    needsCups: false,
    imageCount: 6,
  },
  {
    name: "Celeste Lace Bralette",
    slug: "celeste-lace-bralette",
    description:
      "An unstructured bralette cut from powder pink French leavers lace with no underwire — just the gentle architecture of lace cradling the bust. The triangle cups are lined in a single layer of sheer baby blue silk chiffon, and the underband is a band of scalloped eyelash lace that rests against the ribcage like a soft exhale. The straps are slim satin ribbons that adjust at the front with lilac bows, and a single freshwater pearl hangs from the centre front. Designed for the woman who wants shape without restraint — a petal on the skin, not a cage around it.",
    price: 59,
    compareAtPrice: null,
    collectionSlug: "celeste",
    categories: ["bras"],
    needsCups: true,
    imageCount: 5,
  },
  {
    name: "Celeste Seamless Thong",
    slug: "celeste-seamless-thong",
    description:
      "A barely-there thong cut from a single piece of cloud-coloured microfiber that vanishes beneath even the most unforgiving silk slip. The front panel is seamless and smooth, while the back narrows to a fine thread edged in the softest powder pink trim. The waistband is bonded, not sewn — no elastic, no stitching, no trace of its presence against the skin. Available in four Celeste shades, each as translucent as a watercolour wash. This is the thong you reach for when you want to feel as though you are wearing nothing at all, and look as though you were dressed by the wind.",
    price: 29,
    compareAtPrice: null,
    collectionSlug: "celeste",
    categories: ["briefs-thongs"],
    needsCups: false,
    imageCount: 4,
  },
  {
    name: "Celeste Babydoll",
    slug: "celeste-babydoll",
    description:
      "A frothy babydoll dress cut from layer upon layer of sheer baby blue tulle that floats from the bust to the upper thigh in a cascade of ether. The empire waist is cinched with a lavender silk ribbon that ties at the back, and the cups are formed from gathered cloud-white chiffon embroidered with tiny meadow flowers. The skirt is split at the centre front, parting to reveal a glimpse of the matching cheeky brief beneath. Adjustable satin straps tie at the shoulders in bows. This is the babydoll for the woman who wakes at dawn and wants her lingerie to match the sky.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "celeste",
    categories: ["chemises-slips", "lingerie-sets"],
    needsCups: true,
    imageCount: 6,
  },
  {
    name: "Celeste Sheer Bodysuit",
    slug: "celeste-sheer-bodysuit",
    description:
      "A one-piece bodysuit cut from sheer baby blue mesh that maps the entire torso in a watercolour of translucency. The high neckline is edged in powder pink satin piping, while the back plunges to the waist in a dramatic V framed by hand-embroidered wildflowers. The gusset fastens with two pearl buttons, and the legs are cut high on the hip to elongate the line of the body. Long sleeves in matching sheer mesh are gathered at the wrist with lilac ribbons. Wear it as a standalone statement or as the secret foundation beneath an evening gown — either way, it transforms the body into a canvas of light and air.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "celeste",
    categories: ["bodysuits-teddies", "lingerie-sets"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Celeste Full Set",
    slug: "celeste-full-set",
    description:
      "The complete Celeste vision — sheer balconette, cheeky brief, suspender belt, mesh robe, lace bralette, and seamless thong — presented in a keepsake box lined in baby blue silk moiré. Each piece is cut from the same bolts of French tulle and silk chiffon, with matching hand-embroidered wildflower motifs across the ensemble. Includes a numbered certificate of authenticity, a hand-poured candle fragranced with linen and white tea, and a sky-blue velvet storage pouch. This is the set for the woman who understands that the most ethereal beauty is also the most carefully composed — a garden of lingerie, blooming in the quiet light of morning.",
    price: 199,
    compareAtPrice: 249,
    collectionSlug: "celeste",
    categories: ["lingerie-sets"],
    needsCups: true,
    imageCount: 6,
  },
];

// ---------------------------------------------------------------------------
// MORGANA Product Descriptions — emerald velvet occult seduction
// ---------------------------------------------------------------------------

const morganaProducts = [
  {
    name: "Morgana Velvet Bustier",
    slug: "morgana-velvet-bustier",
    description:
      "A sculptural bustier cut from crushed emerald silk velvet that shifts and gleams like a dark forest floor under moonlight. The sweetheart neckline is bound in gold satin piping, and the waist is cinched by a row of gold-toned hook-and-eye closures that run the length of the centre front. Each cup is underwired and lined in black silk charmeuse, while the back panels are cut from stretch velvet devoré — the burnout pattern revealing glimpses of skin through gilded foliage. Spiral steel boning shapes the torso into the silhouette of a woman who knows that seduction, at its most potent, is a form of alchemy.",
    price: 299,
    compareAtPrice: null,
    collectionSlug: "morgana",
    categories: ["corsets-bustiers", "lingerie-sets"],
    needsCups: true,
    imageCount: 5,
  },
  {
    name: "Morgana High-Waist Brief",
    slug: "morgana-high-waist-brief",
    description:
      "A high-waist brief cut from deep forest green silk jersey with sheer emerald mesh panels that trace the hip bones like ivy climbing stone. The front panel is opaque and sculpting, while the sides dissolve into gold-thread embroidery that catches the light in serpentine patterns. The back is cut from velvet devoré — the burnout revealing arched windows of bare skin framed by gilded leaves. The waistband is a band of folded silk satin, secured at the centre back with a gold-toned clasp in the shape of a serpent biting its own tail. A talisman worn against the skin, as intimate as it is arcane.",
    price: 29,
    compareAtPrice: null,
    collectionSlug: "morgana",
    categories: ["briefs-thongs"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Morgana Body Chain",
    slug: "morgana-body-chain",
    description:
      "An intricate body chain of 24k gold-dipped brass links that drape across the torso in a geometry of occult elegance. The chain traces a double strand from the throat to the waist, branching across the décolletage and descending the back in a single luminous line. Each intersection is punctuated by a small emerald-hued crystal, and the chain fastens at the nape with a gold lobster clasp. Adjustable at every junction, the body chain can be worn against bare skin for maximum contrast or layered over the Morgana Velvet Bustier for a composed study in gilded seduction.",
    price: 59,
    compareAtPrice: null,
    collectionSlug: "morgana",
    categories: ["harnesses-body-chains", "accessories"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Morgana Velvet Choker",
    slug: "morgana-velvet-choker",
    description:
      "A close-fitting choker of blackened gold-toned chain draped in emerald silk velvet ribbon that wraps the throat with quiet authority. At the centre front hangs a teardrop-cut obsidian cabochon, bezel-set in 24k gold and flanked by two smaller emerald-hued crystals that catch the light like eyes in the dark. The choker fastens at the nape with an adjustable gold chain and lobster clasp, allowing the wearer to control the tension — grazing the skin or holding it close. Pairs with the Morgana Body Chain for a complete neck-to-waist cartography of the arcane.",
    price: 29,
    compareAtPrice: null,
    collectionSlug: "morgana",
    categories: ["accessories"],
    needsCups: false,
    imageCount: 4,
  },
  {
    name: "Morgana Open-Back Brief",
    slug: "morgana-open-back-brief",
    description:
      "A dramatically cut brief with a full emerald silk front panel that plunges into an entirely open back, connected only by a single horizontal gold chain that drapes across the lower back like a secret written in gilded script. The front is lined in silk charmeuse and edged in gold satin piping, while the leg openings are cut high and bound in velvet ribbon that ties at each hip. Each tie terminates in a gold bead, and the centre front is embroidered with an occult motif in gold thread — a sigil of seduction visible only to the wearer and those she invites to look.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "morgana",
    categories: ["briefs-thongs"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Morgana Velvet Robe",
    slug: "morgana-velvet-robe",
    description:
      "A floor-length robe cut from liquid emerald silk velvet devoré that pools and flows with the weight of centuries. The burnout pattern reveals a gold-thread underlayer that catches the light in shifting, vegetal arabesques — a garden of gilded shadows that moves as the body moves. The wide shawl collar is bound in gold satin, and the bell sleeves are lined in black silk charmeuse. A concealed velvet tie cinches the waist, while the robe falls open at the front to frame whatever lies beneath. This is the robe for the woman who understands that the most powerful garment is the one removed last.",
    price: 499,
    compareAtPrice: null,
    collectionSlug: "morgana",
    categories: ["robes-kimonos"],
    needsCups: false,
    imageCount: 6,
  },
  {
    name: "Morgana Lace-Up Corset",
    slug: "morgana-lace-up-corset",
    description:
      "A waist-training corset constructed with spiral steel boning encased in black silk velvet and overlaid with gold-thread embroidery in an arcane botanical motif. The front closes with a row of gold hook-and-eye fastenings, while the back laces through gold-toned grommets with an emerald silk ribbon that can be drawn tight to reduce the waist by up to three inches. The sweetheart neckline is bound in gold satin, and each panel is lined in black silk charmeuse. A modesty panel at the back prevents the lacing from touching the skin. This is the corset for the woman who treats transformation as ritual, and her own body as the altar.",
    price: 399,
    compareAtPrice: null,
    collectionSlug: "morgana",
    categories: ["corsets-bustiers", "lingerie-sets"],
    needsCups: true,
    imageCount: 6,
  },
  {
    name: "Morgana Velvet Gloves",
    slug: "morgana-velvet-gloves",
    description:
      "Opera-length gloves cut from stretch emerald silk velvet that moulds to every curve of the arm from fingertip to shoulder. The velvet is backed in whisper-weight silk charmeuse, and the cuffs are bound in gold satin piping with a small gold serpent button at the inner wrist. The gloves are unlined through the palm for grip and sensuality — the velvet against the wearer's own skin, warm and alive. Designed to be worn with the Morgana Velvet Bustier or alone against bare skin, they transform the arm into a column of dark elegance, as compelling as the gaze that follows it.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "morgana",
    categories: ["accessories"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Morgana Full Set",
    slug: "morgana-full-set",
    description:
      "The complete Morgana grimoire — velvet bustier, high-waist brief, body chain, velvet choker, open-back brief, velvet robe, lace-up corset, and velvet gloves — presented in a keepsake box lined in black silk velvet with gold foil occult insignia. Each piece is crafted from coordinating bolts of emerald velvet and gold-thread embroidery, with consistent gold-toned hardware throughout. Includes a numbered certificate of authenticity, a hand-poured candle fragranced with patchouli, black rose, and smouldering amber, and an emerald velvet storage pouch. This is an induction into the mysteries of MORGANA — lingerie as incantation, the body as spell.",
    price: 299,
    compareAtPrice: 399,
    collectionSlug: "morgana",
    categories: ["lingerie-sets"],
    needsCups: true,
    imageCount: 6,
  },
];

// ---------------------------------------------------------------------------
// VALENTINA Product Descriptions — red satin classic femme fatale
// ---------------------------------------------------------------------------

const valentinaProducts = [
  {
    name: "Valentina Satin Balconette",
    slug: "valentina-satin-balconette",
    description:
      "Cut from liquid crimson silk satin with a mirror finish that gleams like a sports car under streetlight. The balconette neckline lifts the bust into a dramatic silhouette, each cup underwired and lined in silk charmeuse for a fit that sculpts as it caresses. Black French leavers lace edges the cups in a dark frame, while adjustable satin straps crisscross at the back in a geometry of tension. A single ruby-hued crystal catches the light at the centre gore — a drop of fire against the skin. The classic femme fatale bra, reimagined for the woman who enters a room and claims every gaze as tribute.",
    price: 59,
    compareAtPrice: null,
    collectionSlug: "valentina",
    categories: ["lingerie-sets", "bras"],
    needsCups: true,
    imageCount: 5,
  },
  {
    name: "Valentina Cheeky Brief",
    slug: "valentina-cheeky-brief",
    description:
      "A low-rise cheeky brief cut from crimson silk satin that catches the light in liquid waves across the hip. The front panel is clean and sculpting, while the back is a single layer of black French leavers lace that frames the cheek in a scalloped embrace. The waistband is a folded ribbon of black satin, tied at each hip in a bow that can be undone with a single pull. Lined in silk at the gusset. Designed to be worn with the Valentina Satin Balconette for a silhouette that owes everything to old Hollywood and nothing to restraint.",
    price: 59,
    compareAtPrice: null,
    collectionSlug: "valentina",
    categories: ["briefs-thongs"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Valentina Suspender Belt",
    slug: "valentina-suspender-belt",
    description:
      "A dramatic suspender belt cut from a wide panel of crimson silk satin that wraps the waist and fastens at the centre front with a gold-toned clasp. Six adjustable suspender straps in black satin descend from the hem, each tipped with a gold clip engineered to hold tension through the longest nights. The front is traced with scalloped French lace, and the back panel is sheer mesh for an invisible finish beneath clothing. The belt cinches the waist into an hourglass and frames the hip in fire-engine red — a declaration worn against the skin.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "valentina",
    categories: ["suspender-belts"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Valentina Satin Kimono",
    slug: "valentina-satin-kimono",
    description:
      "A floor-length kimono robe cut from crimson silk charmeuse that pools and flows with the liquid weight of wine. The wide obi-style sash ties at the waist, while the shawl collar drapes low across the décolletage — framing whatever lies beneath in a curtain of fire. The sleeves are wide and open, bound at the cuff in black satin, and the hem is finished with a hand-rolled edge. The robe falls open at the front with every step, revealing and concealing in a rhythm of its own. This is the kimono for the woman who answers the door in silk and nothing else.",
    price: 359,
    compareAtPrice: null,
    collectionSlug: "valentina",
    categories: ["robes-kimonos"],
    needsCups: false,
    imageCount: 6,
  },
  {
    name: "Valentina Lace Thong",
    slug: "valentina-lace-thong",
    description:
      "A minimalist thong cut from black French leavers lace at the front and vanishing into a fine satin string at the back. The front panel is edged in crimson silk piping that traces a delicate line against the hip bone, and the waistband is a single strand of satin cord that sits low and weightless. Lined in whisper-thin silk at the gusset, the thong is designed to be invisible beneath even the most unforgiving bias-cut gown. Available in noir and crimson — the thong for the woman who wants her lingerie to be the last secret the dress gives away.",
    price: 59,
    compareAtPrice: null,
    collectionSlug: "valentina",
    categories: ["briefs-thongs"],
    needsCups: false,
    imageCount: 4,
  },
  {
    name: "Valentina Satin Bustier",
    slug: "valentina-satin-bustier",
    description:
      "A sculpted bustier of wine-coloured silk satin that cinches the waist and lifts the bust into a silhouette worthy of the silver screen. Spiral steel boning shapes the torso into an hourglass, while each cup is underwired and lined in silk charmeuse. The sweetheart neckline is bound in black satin piping, and the back laces through gold-toned grommets with a crimson silk ribbon. The centre front closes with a row of covered buttons running from bust to waist. Wear it beneath a blazer for the boardroom or alone for the boudoir — either way, Valentina commands the frame.",
    price: 199,
    compareAtPrice: null,
    collectionSlug: "valentina",
    categories: ["corsets-bustiers", "lingerie-sets"],
    needsCups: true,
    imageCount: 5,
  },
  {
    name: "Valentina Garter Set",
    slug: "valentina-garter-set",
    description:
      "A coordinated garter ensemble pairing the Valentina Suspender Belt with a matching crimson satin garter at the thigh. The set includes two thigh garters — one for each leg — each cut from a band of silk satin with a gold-toned clasp and a trailing black satin ribbon that grazes the skin. The suspender belt and garters share the same gold hardware and scalloped lace edging, creating a continuous visual line from waist to knee. Designed to be worn with the Valentina Lace-Top Stockings (sold separately) for the complete femme fatale leg.",
    price: 59,
    compareAtPrice: null,
    collectionSlug: "valentina",
    categories: ["suspender-belts", "accessories"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Valentina Full Set",
    slug: "valentina-full-set",
    description:
      "The complete Valentina ensemble — satin balconette, cheeky brief, suspender belt, satin kimono, lace thong, satin bustier, and garter set — presented in a keepsake box lined in crimson silk moiré with gold foil insignia. Each piece is cut from the same bolts of crimson and wine silk satin and black French leavers lace, with consistent gold-toned hardware throughout. Includes a numbered certificate of authenticity, a hand-poured candle fragranced with red rose, amber, and vanilla bean, and a black velvet storage pouch. This is the set for the woman who knows that power is the most intoxicating perfume.",
    price: 499,
    compareAtPrice: 599,
    collectionSlug: "valentina",
    categories: ["lingerie-sets"],
    needsCups: true,
    imageCount: 6,
  },
];

// ---------------------------------------------------------------------------
// LUNA Product Descriptions — black mesh crystals celestial body
// ---------------------------------------------------------------------------

const lunaProducts = [
  {
    name: "Luna Mesh Bra",
    slug: "luna-mesh-bra",
    description:
      "A darkly romantic bra cut from black silk mesh embroidered with a constellation of tiny crystal beads that catch the light like stars scattered across a night sky. The triangle cups are unlined — the mesh itself is the architecture, the crystals the ornament — and the underband is a band of sheer black tulle that vanishes against the ribcage. Adjustable straps trace a delicate line over the shoulders, fastening at the back with a silver-toned clasp. A single crescent moon charm in brushed silver hangs from the centre gore. Designed for the woman who navigates by starlight and dresses in constellations.",
    price: 59,
    compareAtPrice: null,
    collectionSlug: "luna",
    categories: ["lingerie-sets", "bras"],
    needsCups: true,
    imageCount: 5,
  },
  {
    name: "Luna Crystal Thong",
    slug: "luna-crystal-thong",
    description:
      "A minimalist thong crafted from sheer black mesh with a front panel embroidered in crystal beads that trace a crescent moon and scattered stars. The back vanishes into a fine mesh string that sits flush against the skin, and the waistband is a band of transparent tulle with a single crystal at the centre front. Lined in whisper-weight silk at the gusset. The crystals are hand-sewn and catch the light with every movement — a constellation that shifts and glimmers against the body. Wear with the Luna Mesh Bra for a celestial pairing as old as the night itself.",
    price: 29,
    compareAtPrice: null,
    collectionSlug: "luna",
    categories: ["briefs-thongs"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Luna Body Harness",
    slug: "luna-body-harness",
    description:
      "A delicate body harness of silver-toned chain draped with strands of black mesh that trace the shoulders, descend the sternum, and wrap the waist in a cartography of celestial restraint. Crystal beads punctuate each chain intersection, catching the light like distant stars, and every strap adjusts independently through silver-toned rings. The harness fastens at the back with a magnetic clasp that releases at the lightest touch. Designed to be worn against bare skin — the chain against the body, the crystals against the dark — mapping the night sky onto the architecture of desire.",
    price: 29,
    compareAtPrice: null,
    collectionSlug: "luna",
    categories: ["harnesses-body-chains"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Luna Mesh Robe",
    slug: "luna-mesh-robe",
    description:
      "A floor-length robe of unlined black silk mesh that drifts behind the body like the tail of a comet. The wide sleeves are embroidered with crystal constellations that glitter at the cuff, and the shawl collar is traced in silver-thread stitching that catches the light in shifting patterns. A single concealed tie at the waist allows the robe to drape open, framing the body in a curtain of stars. The hem is finished with a hand-rolled edge, and the back is embroidered with a large crescent moon in crystal beads. Layer it over the Luna Mesh Bra and Crystal Thong for a ritual of unveiling written in starlight.",
    price: 259,
    compareAtPrice: null,
    collectionSlug: "luna",
    categories: ["robes-kimonos"],
    needsCups: false,
    imageCount: 6,
  },
  {
    name: "Luna Seamless Brief",
    slug: "luna-seamless-brief",
    description:
      "A mid-rise brief cut from midnight-black microfiber with sheer mesh side panels that trace the hip bones in a whisper of translucency. The front panel is seamless and sculpting, while the back is cut from a single layer of embroidered mesh — crystal stars scattered across the cheek like a fragment of night sky. The waistband is bonded without stitching, and the leg openings are cut high and bound in the softest elastic-free trim. Designed for all-day wear that feels like nothing and looks like a secret the dark told only to you.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "luna",
    categories: ["briefs-thongs"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Luna Crystal Choker",
    slug: "luna-crystal-choker",
    description:
      "A close-fitting choker of black velvet ribbon anchored at the centre front by a crescent moon pendant, pavé-set in clear crystal and suspended from a silver-toned chain. The ribbon is backed in silk satin for comfort against the throat, and the choker fastens at the nape with an adjustable silver lobster clasp. Small crystal beads are spaced along the ribbon at intervals, catching the light like stars emerging one by one after dusk. Pairs with the Luna Body Harness for a complete neck-to-waist celestial architecture, or worn alone as a talisman of the night.",
    price: 59,
    compareAtPrice: null,
    collectionSlug: "luna",
    categories: ["accessories"],
    needsCups: false,
    imageCount: 4,
  },
  {
    name: "Luna Mesh Bodysuit",
    slug: "luna-mesh-bodysuit",
    description:
      "A one-piece bodysuit cut from sheer black mesh that maps the entire torso in a constellation of crystal bead embroidery. The high neckline is traced in silver-thread stitching, while the back plunges to the sacrum in a dramatic V framed by scattered crystal stars. The gusset fastens with two silver-toned snaps, and the legs are cut high on the hip. Long sleeves in matching mesh are gathered at the wrist with velvet ribbon. The bodysuit is unlined — the mesh is meant to be seen through, the crystals meant to be counted. A map of the night sky, worn against the skin.",
    price: 99,
    compareAtPrice: null,
    collectionSlug: "luna",
    categories: ["bodysuits-teddies", "lingerie-sets"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Luna Full Set",
    slug: "luna-full-set",
    description:
      "The complete Luna celestial atlas — mesh bra, crystal thong, body harness, mesh robe, seamless brief, crystal choker, and mesh bodysuit — presented in a keepsake box lined in midnight silk moiré with silver foil celestial insignia. Each piece is crafted from coordinating bolts of black silk mesh, with matching crystal beadwork and silver-toned hardware throughout. Includes a numbered certificate of authenticity, a hand-poured candle fragranced with moonflower, white musk, and bergamot, and a velvet storage pouch in midnight blue. This is the set for the woman who navigates by starlight and dresses like the sky.",
    price: 299,
    compareAtPrice: 399,
    collectionSlug: "luna",
    categories: ["lingerie-sets"],
    needsCups: true,
    imageCount: 6,
  },
];

// ---------------------------------------------------------------------------
// AURORA Product Descriptions — blush pink organza romantic innocence
// ---------------------------------------------------------------------------

const auroraProducts = [
  {
    name: "Aurora Organza Balconette",
    slug: "aurora-organza-balconette",
    description:
      "A whisper-weight balconette bra cut from layer upon layer of blush pink silk organza that floats against the skin like the first light of dawn. The cups are formed from gathered organza petals — each one hand-cut and stitched into a flower-like silhouette — while the underwire is wrapped in ivory silk charmeuse. Adjustable straps are slim satin ribbons that tie at the shoulder in bows, and the centre gore is punctuated by a single freshwater pearl. The balconette cut lifts with gentle precision, framing the décolletage in a bloom of the softest pink — lingerie as a love letter, written in organza.",
    price: 29,
    compareAtPrice: null,
    collectionSlug: "aurora",
    categories: ["lingerie-sets", "bras", "bridal-lingerie"],
    needsCups: true,
    imageCount: 5,
  },
  {
    name: "Aurora Cheeky Brief",
    slug: "aurora-cheeky-brief",
    description:
      "A low-rise cheeky brief cut from blush pink silk jersey with sheer organza side panels that trace the hip like a watercolour bloom. The back is a single layer of ivory French leavers lace scattered with hand-stitched organza petals that appear to float across the skin. The waistband is a folded ribbon of champagne silk satin, finished with a small pearl button at the centre front. Lined in whisper-light cotton voile at the gusset. Weightless against the body and invisible beneath even the most delicate gown — the brief for the woman who wants her lingerie to feel like a secret blush.",
    price: 49,
    compareAtPrice: null,
    collectionSlug: "aurora",
    categories: ["briefs-thongs", "bridal-lingerie"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Aurora Suspender Belt",
    slug: "aurora-suspender-belt",
    description:
      "A delicate suspender belt crafted from a single layer of blush pink silk organza, gathered at the waist with a champagne satin ribbon that ties in a soft bow. Four adjustable satin suspender straps descend in graduated shades of pink — blush to rose to pearl to champagne — each ending in a gold-toned clip cast in the shape of a rose bud. The back panel is sheer organza, and the front is traced with hand-stitched floral embroidery in ivory thread. This is the suspender belt for the woman who wants her trousseau to bloom like a garden at dawn.",
    price: 29,
    compareAtPrice: null,
    collectionSlug: "aurora",
    categories: ["suspender-belts", "bridal-lingerie"],
    needsCups: false,
    imageCount: 5,
  },
  {
    name: "Aurora Organza Robe",
    slug: "aurora-organza-robe",
    description:
      "A floor-sweeping robe of blush pink silk organza layered over ivory silk chiffon that drifts behind the body like a sunrise given form. The wide bishop sleeves are gathered at the cuff with champagne silk ribbons, and the shawl collar is embroidered with hand-stitched rose buds in satin thread. A concealed tie at the waist allows the robe to drape and part, while the hem is finished with a scalloped eyelash lace edge. Layer it over the Aurora Organza Balconette for a morning ritual as soft as the hour of waking — when the light is pink and the world has not yet spoken.",
    price: 299,
    compareAtPrice: null,
    collectionSlug: "aurora",
    categories: ["robes-kimonos", "bridal-lingerie"],
    needsCups: false,
    imageCount: 6,
  },
  {
    name: "Aurora Lace Bralette",
    slug: "aurora-lace-bralette",
    description:
      "An unstructured bralette cut from ivory French leavers lace with no underwire — just the gentle embrace of flower-patterned lace against the skin. The triangle cups are lined in a single layer of blush pink silk chiffon, and the underband is a band of scalloped eyelash lace that rests against the ribcage like petal on petal. The straps are slim champagne satin ribbons that adjust at the front with tiny pearl buttons, and a single freshwater pearl hangs from the centre front. Designed for the woman who wants shape without structure, romance without restraint — a garden on the skin, not a cage around it.",
    price: 89,
    compareAtPrice: null,
    collectionSlug: "aurora",
    categories: ["bras", "bridal-lingerie"],
    needsCups: true,
    imageCount: 5,
  },
  {
    name: "Aurora Seamless Thong",
    slug: "aurora-seamless-thong",
    description:
      "A barely-there thong cut from a single piece of blush pink microfiber that vanishes beneath even the most unforgiving silk slip. The front panel is seamless and smooth, while the back narrows to a fine thread edged in ivory trim. The waistband is bonded, not sewn — no elastic, no stitching, no trace of its presence against the skin. Available in blush, rose, ivory, champagne, and pearl to match every shade of the Aurora palette. This is the thong you reach for on the morning of — invisible, weightless, and as soft as the promise you are about to make.",
    price: 49,
    compareAtPrice: null,
    collectionSlug: "aurora",
    categories: ["briefs-thongs", "bridal-lingerie"],
    needsCups: false,
    imageCount: 4,
  },
  {
    name: "Aurora Organza Babydoll",
    slug: "aurora-organza-babydoll",
    description:
      "A frothy babydoll dress cut from layer upon layer of blush pink silk organza that floats from the bust to the mid-thigh in a cascade of petals. The empire waist is cinched with an ivory satin ribbon tied at the back, and the cups are formed from gathered organza flowers that frame the décolletage in bloom. The skirt is split at the centre front, parting to reveal a glimpse of the matching cheeky brief beneath. Adjustable satin straps tie at the shoulders in bows. This is the babydoll for the bride who greets the dawn in organza and rose light.",
    price: 59,
    compareAtPrice: null,
    collectionSlug: "aurora",
    categories: ["chemises-slips", "bridal-lingerie"],
    needsCups: true,
    imageCount: 6,
  },
  {
    name: "Aurora Bridal Set",
    slug: "aurora-bridal-set",
    description:
      "The complete Aurora trousseau — organza balconette, cheeky brief, suspender belt, organza robe, lace bralette, seamless thong, and organza babydoll — presented in a keepsake box lined in blush pink silk moiré with gold foil insignia. Each piece is cut from coordinating bolts of blush pink organza, ivory lace, and champagne silk charmeuse, with matching freshwater pearls and rose gold-toned hardware throughout. Includes a numbered certificate of authenticity, a hand-poured candle fragranced with peony, soft musk, and pink pepper, and an ivory velvet storage pouch. This is the set for the bride who wears the dawn.",
    price: 399,
    compareAtPrice: 499,
    collectionSlug: "aurora",
    categories: ["lingerie-sets", "bridal-lingerie"],
    needsCups: true,
    imageCount: 6,
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌙 Nocturne — seeding database...\n");

  // ------------------------------------------------------------------
  // 1. Delete existing data (reverse dependency order)
  // ------------------------------------------------------------------

  console.log("Clearing existing data…");
  await prisma.productCategory.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productTranslation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.collection.deleteMany();
  console.log("  ✓ All existing data deleted.\n");

  // ------------------------------------------------------------------
  // 2. Collections
  // ------------------------------------------------------------------

  console.log("Creating collections…");
  const collectionMap: Record<string, number> = {};
  for (const c of collections) {
    const created = await prisma.collection.create({ data: c });
    collectionMap[created.slug] = created.id;
  }
  console.log(`  ✓ ${collections.length} collections created.\n`);

  // ------------------------------------------------------------------
  // 3. Categories
  // ------------------------------------------------------------------

  console.log("Creating categories…");
  const categoryMap: Record<string, number> = {};
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[created.slug] = created.id;
  }
  console.log(`  ✓ ${categories.length} categories created.\n`);

  // ------------------------------------------------------------------
  // 4. Products (with translations, images, variants, category links)
  // ------------------------------------------------------------------

  console.log("Creating VIOLETTA products…");
  let productCount = 0;
  let variantCount = 0;
  let imageCount = 0;

  for (const p of violettaProducts) {
    // 4a. Product record
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        collectionId: collectionMap[p.collectionSlug],
        isActive: true,
      },
    });
    productCount++;

    // 4b. EN translation
    await prisma.productTranslation.create({
      data: {
        productId: product.id,
        locale: "en",
        name: p.name,
        description: p.description,
        seoTitle: `${p.name} | NOCTURNE — Dark Luxury Lingerie`,
        seoDesc: p.description.substring(0, 155),
      },
    });

    // 4c. Images
    const images = generateImages(product.id, p.slug, p.imageCount);
    for (const img of images) {
      await prisma.productImage.create({ data: img });
      imageCount++;
    }

    // 4d. Variants
    const productPrefix = p.slug
      .replace(/^violetta-/, "VIO-")
      .replace(/-/g, "_")
      .toUpperCase()
      ;
    const variants = generateVariants(
      product.id,
      productPrefix,
      violettaColors,
      commonSizes,
      p.needsCups ? cupSizes : undefined
    );
    for (const v of variants) {
      await prisma.productVariant.create({ data: v });
      variantCount++;
    }

    // 4e. Category links
    for (const catSlug of p.categories) {
      const categoryId = categoryMap[catSlug];
      if (categoryId) {
        await prisma.productCategory.create({
          data: { productId: product.id, categoryId },
        });
      }
    }
  }

  console.log(`  ✓ ${productCount} products created.`);
  console.log(`  ✓ ${variantCount} variants created.`);
  console.log(`  ✓ ${imageCount} images created.`);
  console.log(`  ✓ Category links created.\n`);

  // ------------------------------------------------------------------
  // 5. ELARA Products
  // ------------------------------------------------------------------

  console.log("Creating ELARA products…");

  for (const p of elaraProducts) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        collectionId: collectionMap[p.collectionSlug],
        isActive: true,
      },
    });
    productCount++;

    await prisma.productTranslation.create({
      data: {
        productId: product.id,
        locale: "en",
        name: p.name,
        description: p.description,
        seoTitle: `${p.name} | NOCTURNE — Dark Luxury Lingerie`,
        seoDesc: p.description.substring(0, 155),
      },
    });

    const images = generateImages(product.id, p.slug, p.imageCount);
    for (const img of images) {
      await prisma.productImage.create({ data: img });
      imageCount++;
    }

    const productPrefix = p.slug
      .replace(/^elara-/, "ELA-")
      .replace(/-/g, "_")
      .toUpperCase()
      ;
    const variants = generateVariants(
      product.id,
      productPrefix,
      elaraColors,
      commonSizes,
      p.needsCups ? cupSizes : undefined
    );
    for (const v of variants) {
      await prisma.productVariant.create({ data: v });
      variantCount++;
    }

    for (const catSlug of p.categories) {
      const categoryId = categoryMap[catSlug];
      if (categoryId) {
        await prisma.productCategory.create({
          data: { productId: product.id, categoryId },
        });
      }
    }
  }

  console.log(`  ✓ ${elaraProducts.length} ELARA products created.\n`);

  // ------------------------------------------------------------------
  // 6. SERAPHINA Products
  // ------------------------------------------------------------------

  console.log("Creating SERAPHINA products…");

  for (const p of seraphinaProducts) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        collectionId: collectionMap[p.collectionSlug],
        isActive: true,
      },
    });
    productCount++;

    await prisma.productTranslation.create({
      data: {
        productId: product.id,
        locale: "en",
        name: p.name,
        description: p.description,
        seoTitle: `${p.name} | NOCTURNE — Dark Luxury Lingerie`,
        seoDesc: p.description.substring(0, 155),
      },
    });

    const images = generateImages(product.id, p.slug, p.imageCount);
    for (const img of images) {
      await prisma.productImage.create({ data: img });
      imageCount++;
    }

    const productPrefix = p.slug
      .replace(/^seraphina-/, "SER-")
      .replace(/-/g, "_")
      .toUpperCase()
      ;
    const variants = generateVariants(
      product.id,
      productPrefix,
      seraphinaColors,
      commonSizes,
      p.needsCups ? cupSizes : undefined
    );
    for (const v of variants) {
      await prisma.productVariant.create({ data: v });
      variantCount++;
    }

    for (const catSlug of p.categories) {
      const categoryId = categoryMap[catSlug];
      if (categoryId) {
        await prisma.productCategory.create({
          data: { productId: product.id, categoryId },
        });
      }
    }
  }

  console.log(`  ✓ ${seraphinaProducts.length} SERAPHINA products created.\n`);

  // ------------------------------------------------------------------
  // 7. CELESTE Products
  // ------------------------------------------------------------------

  console.log("Creating CELESTE products…");

  for (const p of celesteProducts) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        collectionId: collectionMap[p.collectionSlug],
        isActive: true,
      },
    });
    productCount++;

    await prisma.productTranslation.create({
      data: {
        productId: product.id,
        locale: "en",
        name: p.name,
        description: p.description,
        seoTitle: `${p.name} | NOCTURNE — Dark Luxury Lingerie`,
        seoDesc: p.description.substring(0, 155),
      },
    });

    const images = generateImages(product.id, p.slug, p.imageCount);
    for (const img of images) {
      await prisma.productImage.create({ data: img });
      imageCount++;
    }

    const productPrefix = p.slug
      .replace(/^celeste-/, "CEL-")
      .replace(/-/g, "_")
      .toUpperCase()
      ;
    const variants = generateVariants(
      product.id,
      productPrefix,
      celesteColors,
      commonSizes,
      p.needsCups ? cupSizes : undefined
    );
    for (const v of variants) {
      await prisma.productVariant.create({ data: v });
      variantCount++;
    }

    for (const catSlug of p.categories) {
      const categoryId = categoryMap[catSlug];
      if (categoryId) {
        await prisma.productCategory.create({
          data: { productId: product.id, categoryId },
        });
      }
    }
  }

  console.log(`  ✓ ${celesteProducts.length} CELESTE products created.\n`);

  // ------------------------------------------------------------------
  // 8. MORGANA Products
  // ------------------------------------------------------------------

  console.log("Creating MORGANA products…");

  for (const p of morganaProducts) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        collectionId: collectionMap[p.collectionSlug],
        isActive: true,
      },
    });
    productCount++;

    await prisma.productTranslation.create({
      data: {
        productId: product.id,
        locale: "en",
        name: p.name,
        description: p.description,
        seoTitle: `${p.name} | NOCTURNE — Dark Luxury Lingerie`,
        seoDesc: p.description.substring(0, 155),
      },
    });

    const images = generateImages(product.id, p.slug, p.imageCount);
    for (const img of images) {
      await prisma.productImage.create({ data: img });
      imageCount++;
    }

    const productPrefix = p.slug
      .replace(/^morgana-/, "MOR-")
      .replace(/-/g, "_")
      .toUpperCase()
      .toUpperCase();
    const variants = generateVariants(
      product.id,
      productPrefix,
      morganaColors,
      commonSizes,
      p.needsCups ? cupSizes : undefined
    );
    for (const v of variants) {
      await prisma.productVariant.create({ data: v });
      variantCount++;
    }

    for (const catSlug of p.categories) {
      const categoryId = categoryMap[catSlug];
      if (categoryId) {
        await prisma.productCategory.create({
          data: { productId: product.id, categoryId },
        });
      }
    }
  }

  console.log(`  ✓ ${morganaProducts.length} MORGANA products created.\n`);

  // ------------------------------------------------------------------
  // 9. VALENTINA Products
  // ------------------------------------------------------------------

  console.log("Creating VALENTINA products…");

  for (const p of valentinaProducts) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        collectionId: collectionMap[p.collectionSlug],
        isActive: true,
      },
    });
    productCount++;

    await prisma.productTranslation.create({
      data: {
        productId: product.id,
        locale: "en",
        name: p.name,
        description: p.description,
        seoTitle: `${p.name} | NOCTURNE — Dark Luxury Lingerie`,
        seoDesc: p.description.substring(0, 155),
      },
    });

    const images = generateImages(product.id, p.slug, p.imageCount);
    for (const img of images) {
      await prisma.productImage.create({ data: img });
      imageCount++;
    }

    const productPrefix = p.slug
      .replace(/^valentina-/, "VAL-")
      .replace(/-/g, "_")
      .toUpperCase();
    const variants = generateVariants(
      product.id,
      productPrefix,
      valentinaColors,
      commonSizes,
      p.needsCups ? cupSizes : undefined
    );
    for (const v of variants) {
      await prisma.productVariant.create({ data: v });
      variantCount++;
    }

    for (const catSlug of p.categories) {
      const categoryId = categoryMap[catSlug];
      if (categoryId) {
        await prisma.productCategory.create({
          data: { productId: product.id, categoryId },
        });
      }
    }
  }

  console.log(`  ✓ ${valentinaProducts.length} VALENTINA products created.\n`);

  // ------------------------------------------------------------------
  // 10. LUNA Products
  // ------------------------------------------------------------------

  console.log("Creating LUNA products…");

  for (const p of lunaProducts) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        collectionId: collectionMap[p.collectionSlug],
        isActive: true,
      },
    });
    productCount++;

    await prisma.productTranslation.create({
      data: {
        productId: product.id,
        locale: "en",
        name: p.name,
        description: p.description,
        seoTitle: `${p.name} | NOCTURNE — Dark Luxury Lingerie`,
        seoDesc: p.description.substring(0, 155),
      },
    });

    const images = generateImages(product.id, p.slug, p.imageCount);
    for (const img of images) {
      await prisma.productImage.create({ data: img });
      imageCount++;
    }

    const productPrefix = p.slug
      .replace(/^luna-/, "LUN-")
      .replace(/-/g, "_")
      .toUpperCase();
    const variants = generateVariants(
      product.id,
      productPrefix,
      lunaColors,
      commonSizes,
      p.needsCups ? cupSizes : undefined
    );
    for (const v of variants) {
      await prisma.productVariant.create({ data: v });
      variantCount++;
    }

    for (const catSlug of p.categories) {
      const categoryId = categoryMap[catSlug];
      if (categoryId) {
        await prisma.productCategory.create({
          data: { productId: product.id, categoryId },
        });
      }
    }
  }

  console.log(`  ✓ ${lunaProducts.length} LUNA products created.\n`);

  // ------------------------------------------------------------------
  // 11. AURORA Products
  // ------------------------------------------------------------------

  console.log("Creating AURORA products…");

  for (const p of auroraProducts) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        collectionId: collectionMap[p.collectionSlug],
        isActive: true,
      },
    });
    productCount++;

    await prisma.productTranslation.create({
      data: {
        productId: product.id,
        locale: "en",
        name: p.name,
        description: p.description,
        seoTitle: `${p.name} | NOCTURNE — Dark Luxury Lingerie`,
        seoDesc: p.description.substring(0, 155),
      },
    });

    const images = generateImages(product.id, p.slug, p.imageCount);
    for (const img of images) {
      await prisma.productImage.create({ data: img });
      imageCount++;
    }

    const productPrefix = p.slug
      .replace(/^aurora-/, "AUR-")
      .replace(/-/g, "_")
      .toUpperCase();
    const variants = generateVariants(
      product.id,
      productPrefix,
      auroraColors,
      commonSizes,
      p.needsCups ? cupSizes : undefined
    );
    for (const v of variants) {
      await prisma.productVariant.create({ data: v });
      variantCount++;
    }

    for (const catSlug of p.categories) {
      const categoryId = categoryMap[catSlug];
      if (categoryId) {
        await prisma.productCategory.create({
          data: { productId: product.id, categoryId },
        });
      }
    }
  }

  console.log(`  ✓ ${auroraProducts.length} AURORA products created.\n`);

  // ------------------------------------------------------------------
  // 12. Promo Codes
  // ------------------------------------------------------------------

  console.log("Creating promo codes…");
  await prisma.promoCode.createMany({
    data: [
      {
        code: "WELCOME10",
        type: "percentage",
        value: 10,
        minOrderAmount: 0,
        isActive: true,
      },
      {
        code: "SAVE20",
        type: "percentage",
        value: 20,
        minOrderAmount: 100,
        isActive: true,
      },
      {
        code: "FREESHIP",
        type: "fixed",
        value: 0,
        minOrderAmount: 0,
        maxUses: 999,
        isActive: true,
      },
    ],
  });
  console.log("  ✓ 3 promo codes created.\n");

  // ------------------------------------------------------------------
  // Sample Reviews — realistic, detailed, product-specific
  // ------------------------------------------------------------------

  console.log("Creating sample reviews…");

  const violettaReviewMap: Record<string, { authorName: string; rating: number; title: string; body: string; isVerified: boolean; daysAgo: number }[]> = {
    "violetta-balconette-bra": [
      { authorName: "Olivia Bennett", rating: 5, title: "Finally — a balconette that actually supports a 34DD", body: "I have spent years searching for a balconette bra that gives lift without making me feel trussed up like a Victorian corset. As a 34DD, underwire usually digs in by hour three, but this piece is lined in silk charmeuse that genuinely disappears against the skin. I wore it for a full workday under a silk blouse and forgot I had it on — which, for anyone with a larger bust, is the highest possible compliment. The jet crystal at the centre gore is such a beautiful, unexpected detail. I'm ordering the matching brief immediately.", isVerified: true, daysAgo: 8 },
      { authorName: "Madison Torres", rating: 5, title: "Wore this for our anniversary trip to Paris", body: "Ordered the Violetta set for our trip and I cannot overstate how incredible I felt. The lace pattern is somehow both dark and delicate — it catches candlelight beautifully. I'm 5′4″, 130lbs, usually a 34B, and the size guide was spot-on. The adjustable straps actually stay where you put them, which is a minor miracle. It arrived in four days flat, discreetly packaged exactly as advertised. My husband's jaw literally dropped. Already browsing my next NOCTURNE purchase.", isVerified: true, daysAgo: 14 },
      { authorName: "Charlotte Reed", rating: 5, title: "I've tried Honey Birdette, Agent Provocateur, and Bluebella — this competes", body: "I'm somewhat of a lingerie collector and was cautiously optimistic about a newer brand at this price point. The French leavers lace is genuine — you can feel the weight and see the scalloped hand-cut edging. The underwire casing is wrapped rather than exposed, which makes a noticeable difference in comfort. I would say the fit is true to size, but the band runs slightly firm, which I actually prefer — it doesn't ride up. For the price, this genuinely competes with pieces I've paid twice as much for. Highly impressed.", isVerified: true, daysAgo: 22 },
      { authorName: "Sophia Walsh", rating: 4, title: "Gorgeous lace, straps could be a touch wider for fuller cups", body: "Absolutely stunning bra — the burgundy silk against the black lace is pure drama in the best way. I'm a 38G and the XL fits well in the band and cup, no spillover. My one small note: the straps are elegant and thin, which looks beautiful, but after a few hours of wear I found I was adjusting them more than I'd like. For a DDD+ cup, a ¼″ wider strap option would make this absolutely perfect. Still keeping it and still love it — just something to consider if you need serious strap support.", isVerified: true, daysAgo: 35 },
      { authorName: "Harper Quinn", rating: 5, title: "The centre crystal is such a gorgeous detail", body: "I bought this on a whim during a late-night browsing session and honestly expected to return it. Instead, it's become my absolute favourite bra. The jet crystal at the centre gore catches light in this subtle, almost hypnotic way — it's like wearing a tiny piece of jewelry under your clothes. I'm a 32A so I often feel like lingerie isn't designed with smaller busts in mind, but the balconette cut actually creates beautiful shape without gaping. The lace lies completely flat under a t-shirt too, which surprised me. Five stars, no notes.", isVerified: false, daysAgo: 3 },
    ],
    "violetta-high-waist-brief": [
      { authorName: "Isabella Knight", rating: 5, title: "The most flattering high-waist brief I've ever owned", body: "I have a long torso and most high-waist briefs hit at an awkward spot about two inches below my natural waist. This one actually rises to where it should — right at the narrowest point — and the elastic-free waistband means zero digging or rolling. The front panel in opaque burgundy silk is substantial enough that I feel held in without compression, and the lace side panels are so beautiful they almost feel like part of the design rather than an afterthought. The gold-toned rings at the hip are subtle but catch the eye. I bought the matching balconette and the set together is genuinely the most beautiful lingerie I've owned.", isVerified: true, daysAgo: 17 },
      { authorName: "Ava Morrison", rating: 4, title: "Beautiful but runs slightly small — order up if between sizes", body: "Ordered my usual medium and found the fit to be quite snug through the hip. I typically wear a 6-8 in pants and should have gone with a large. That said, the exchange process was super easy — NOCTURNE sent a return label within hours and the replacement arrived before I'd even sent the original back. The large fits much better. The quality is undeniable: the lace is soft against the skin (not scratchy like some lace-edged briefs), the silk is cool and smooth, and the waistband truly doesn't leave marks. Just factor in sizing up if you have wider hips or prefer a more relaxed fit through the rear.", isVerified: true, daysAgo: 42 },
      { authorName: "Mia Gallagher", rating: 5, title: "Wore this under a silk slip dress — completely invisible", body: "Bought specifically because I needed something that wouldn't show lines under a bias-cut slip dress for a wedding. The brief delivered beautifully — the waistband lies completely flat and the lace side panels, despite being quite decorative, didn't create any visible texture through the dress. I was comfortable all night, never needed to adjust, and honestly forgot I was wearing it until I got home and remembered how gorgeous it looked in the mirror. The burgundy color is so rich — much deeper and more sophisticated than typical lingerie shades. Already bought a second pair in noir.", isVerified: true, daysAgo: 11 },
      { authorName: "Evelyn Drake", rating: 4, title: "Stunning lace, wish there was one more hook setting for curvier hips", body: "I have a 44″ hip measurement and ordered the 3XL based on the size chart. The waist fits beautifully — no rolling, which is rare — but I found myself wishing the garter belt and brief had one additional hook setting for a slightly more relaxed hip fit. It's not uncomfortable by any means, and the piece is so beautiful I'm keeping it regardless, but for truly curvy figures a tiny bit more room through the rear would make this perfect. The quality of the lace and silk is exceptional — I'd rather a brand err on the side of sculpting than baggy, and this absolutely sculpts.", isVerified: true, daysAgo: 28 },
      { authorName: "Amelia Cross", rating: 5, title: "The gold ring detail sold me — even better in person", body: "I'll admit I was drawn in by the aesthetic — the gold-toned rings along the hip bone are such a unique and beautiful detail. In person they're even nicer: they have a substantial weight that feels luxurious, not costume-y, and the satin binding on the waistband is soft rather than stiff. I ordered both the noir and gothic burgundy colorways and they coordinate beautifully with pieces I already own. The brief washes well too — I hand wash in cold water with a silk detergent and it looks brand new after several wears. If you're on the fence, just get it. You won't regret it.", isVerified: false, daysAgo: 5 },
    ],
    "violetta-suspender-belt": [
      { authorName: "Olivia Bennett", rating: 5, title: "Actually stays in place — a suspender belt miracle", body: "I have a love-hate relationship with suspender belts. They either slide down, the clips pop open, or the whole contraption requires a PhD in engineering to put on. This one? None of those things. The six straps distribute tension evenly, the gold-toned clips actually grip, and the wide contour band stays exactly where I put it. I wore it with the Violetta lace-top stockings for an evening out and nothing budged — through dinner, dancing, and a very long walk back to the hotel. The corset-style lace-up back lets you adjust the waist cinch to exactly your comfort level. This is the suspender belt I've been searching for for years.", isVerified: true, daysAgo: 31 },
      { authorName: "Charlotte Reed", rating: 5, title: "Finally a suspender that actually works for real bodies", body: "As someone with a softer midsection, I was worried about this rolling down. Not only did it stay put for an entire evening, but it actually created the most beautiful hourglass silhouette. The six-strap design means the tension is distributed rather than concentrated on two or four points. The front silk panel is opaque enough that I felt covered and supported, and the lace back is just stunning. I wore it under a fitted dress and the waist cinching effect was genuinely noticeable. I'm buying the second colorway immediately.", isVerified: true, daysAgo: 19 },
      { authorName: "Sophia Walsh", rating: 4, title: "Beautifully made — wish the clips were slightly easier to fasten", body: "This is a seriously beautiful suspender belt — the shadow-black lace matches my Violetta balconette perfectly, and the gold-toned hardware gives it this dark luxury feel that's impossible to capture in photos. The only reason I'm giving 4 stars instead of 5 is that the suspender clips, while very secure once fastened, are quite stiff when you're trying to attach them to stockings. I had to do a few practice runs at home before I could do it quickly, and I definitely recommend attaching the belt and stockings before you put on your dress rather than trying to do it in reverse. That said, once clipped in, they didn't budge all night — which is the real test.", isVerified: true, daysAgo: 66 },
      { authorName: "Harper Quinn", rating: 5, title: "This paired with the lace-top stockings is an EXPERIENCE", body: "Look, I'm just going to say it: this suspender belt makes you feel like the main character. I wore it with the matching Violetta stockings for a date night and I have never felt more powerful getting dressed. The corset back lacing is such a beautiful detail — you can cinch it as much or as little as you want, and the eyelets are gunmetal-finished, which is a nice touch. The lace is the same pattern as the bra and brief, so the whole set looks completely cohesive. Arrived in discreet packaging in four days. Treat yourself.", isVerified: false, daysAgo: 19 },
      { authorName: "Amelia Cross", rating: 5, title: "The waist cinching is real — I looked snatched", body: "Genuinely surprised by how much waist definition this belt creates. The wide band is cut on a contour so it sits perfectly at the natural waist, and the six-strap design pulls everything into proportion beautifully. I'm 5′7″, 155 lbs and ordered a medium — it laces up at the back so you can customize the fit completely. I've worn it three times now: once with stockings for a full set look, once over a slip dress for a fashion moment, and once just with the matching brief because I wanted to feel amazing getting ready. All three scenarios, absolute perfection.", isVerified: true, daysAgo: 10 },
    ],
  };

  let reviewCount = 0;
  for (const [slug, reviews] of Object.entries(violettaReviewMap)) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) continue;
    for (const review of reviews) {
      await prisma.review.create({
        data: {
          productId: product.id,
          authorName: review.authorName,
          rating: review.rating,
          title: review.title,
          body: review.body,
          isVerified: review.isVerified,
          createdAt: new Date(Date.now() - review.daysAgo * 24 * 60 * 60 * 1000),
        },
      });
      reviewCount++;
    }
  }
  console.log(`  ✓ ${reviewCount} sample reviews created.\n`);

  // ------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------

  const counts = {
    collections: await prisma.collection.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    variants: await prisma.productVariant.count(),
    images: await prisma.productImage.count(),
    translations: await prisma.productTranslation.count(),
    categoryLinks: await prisma.productCategory.count(),
  };

  console.log("🌙 Seed complete. Database summary:\n");
  console.table(counts);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
