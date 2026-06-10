// NOCTURNE Product Seed — 从 Agent 工作流输出批量导入 30 件商品
// 运行: cd D:/projects/nocturne && node prisma/seed.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 读取 Agent 输出
const lister = require("./lister-output.json");
const curator = require("./curator-output.json");
const scout = require("./scout-output.json");

// ═══════════════════════════════════════════════
// Collection 定义
// ═══════════════════════════════════════════════
const COLLECTIONS = [
  {
    name: "Noir Obscura",
    slug: "noir-obscura",
    description: "Dark, daring, and unapologetically bold. Leather, harness, and gothic silhouettes for those who command the shadows.",
  },
  {
    name: "Velvet Dusk",
    slug: "velvet-dusk",
    description: "Opulent textures and midnight glamour. Silk, velvet, and satin pieces that whisper luxury in every fold.",
  },
  {
    name: "Lace Shadows",
    slug: "lace-shadows",
    description: "Delicate yet dangerous. Sheer lace, intricate embroidery, and barely-there silhouettes that leave everything to the imagination.",
  },
];

// ═══════════════════════════════════════════════
// 默认 SKU 矩阵（按品类）
// ═══════════════════════════════════════════════
const DEFAULT_VARIANTS = {
  Bodysuit: {
    colors: [{ name: "Black", hex: "#1A1817" }],
    sizes: ["S", "M", "L", "XL"],
    stockPerVariant: 50,
  },
  Chemise: {
    colors: [{ name: "Black", hex: "#1A1817" }],
    sizes: ["S", "M", "L", "XL"],
    stockPerVariant: 50,
  },
  Robe: {
    colors: [{ name: "Black", hex: "#1A1817" }],
    sizes: ["S/M", "L/XL"],
    stockPerVariant: 40,
  },
  BraSet: {
    colors: [{ name: "Black", hex: "#1A1817" }],
    sizes: ["S", "M", "L", "XL"],
    cup: ["B", "C", "D"],
    stockPerVariant: 30,
  },
  Harness: {
    colors: [{ name: "Black", hex: "#1A1817" }],
    sizes: ["S/M", "L/XL"],
    stockPerVariant: 50,
  },
  Garter: {
    colors: [{ name: "Black", hex: "#1A1817" }],
    sizes: ["S/M", "L/XL"],
    stockPerVariant: 50,
  },
  Corset: {
    colors: [{ name: "Black", hex: "#1A1817" }],
    sizes: ["S", "M", "L", "XL"],
    stockPerVariant: 30,
  },
  Lingerie: {
    colors: [{ name: "Black", hex: "#1A1817" }],
    sizes: ["S", "M", "L", "XL"],
    stockPerVariant: 50,
  },
};

// ═══════════════════════════════════════════════
// 品类缩写（用于 SKU 码）
// ═══════════════════════════════════════════════
const CAT_ABBR = {
  Bodysuit: "BDS", Chemise: "CHM", Robe: "ROB", BraSet: "BRS",
  Harness: "HRN", Garter: "GAR", Corset: "COR", Lingerie: "LIN",
};

// ═══════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════
async function seed() {
  console.log("🌙 NOCTURNE Seed — 30 products");

  // 1. Create Collections
  console.log("\n📁 Creating collections...");
  const colMap = {};
  for (const col of COLLECTIONS) {
    const created = await prisma.collection.upsert({
      where: { slug: col.slug },
      update: { name: col.name, description: col.description },
      create: col,
    });
    colMap[col.name] = created.id;
    console.log(`  ✅ ${col.name} (ID: ${created.id})`);
  }

  // 2. Map collection name to DB ID
  const getCollectionId = (curatorItem) => {
    const name = curatorItem?.collectionName || "Velvet Dusk";
    if (name.includes("Noir")) return colMap["Noir Obscura"];
    if (name.includes("Velvet")) return colMap["Velvet Dusk"];
    return colMap["Lace Shadows"];
  };

  // 3. Create Products
  console.log("\n🛍️ Creating products...");
  let created = 0, skipped = 0;

  for (const item of lister) {
    const t = item.translations;
    const cur = curator.find((c) => c.scoutId === item.scoutId);
    const sco = scout.find((s) => s.scoutId === item.scoutId);
    const collectionId = getCollectionId(cur);
    const cat = item.category || "Lingerie";
    const varConfig = DEFAULT_VARIANTS[cat] || DEFAULT_VARIANTS.Lingerie;
    const abbr = CAT_ABBR[cat] || "LIN";

    try {
      // Check if slug already exists
      const existing = await prisma.product.findUnique({ where: { slug: item.slug } });
      if (existing) {
        console.log(`  ⏭  ${item.slug} already exists`);
        skipped++;
        continue;
      }

      // Create product with translations
      const product = await prisma.product.create({
        data: {
          name: t.en.name,
          slug: item.slug,
          description: t.en.desc || t.en.description || "",
          price: item.price,
          compareAtPrice: item.compareAtPrice || Math.round(item.price * 1.3),
          collectionId,
          status: "ACTIVE",
          isActive: true,

          // 5-language translations
          translations: {
            create: ["en", "fr", "de", "es", "it"].map((locale) => ({
              locale,
              name: t[locale]?.name || t.en.name,
              description: t[locale]?.desc || t[locale]?.description || "",
              seoTitle: t[locale]?.seoTitle || `${t[locale]?.name || t.en.name} | NOCTURNE`,
              seoDesc: t[locale]?.seoDesc || "",
            })),
          },

          // Product images (from 1688 source)
          images: sco?.images?.originalUrls?.length
            ? {
                create: sco.images.originalUrls.slice(0, 3).map((url, idx) => ({
                  url,
                  alt: `${t.en.name} - Image ${idx + 1}`,
                  isPrimary: idx === 0,
                  sortOrder: idx,
                })),
              }
            : undefined,

          // Default SKU variants
          variants: {
            create: varConfig.colors.flatMap((color) =>
              varConfig.sizes.map((size, idx) => {
                const skuStr = `NC-${abbr}-${color.name.slice(0, 3).toUpperCase()}-${size.replace("/", "")}-${item.scoutId.replace("SKU-", "")}`;
                return {
                  sku: `${skuStr}-${idx + 1}`,
                  color: color.name,
                  colorHex: color.hex,
                  size,
                  cup: varConfig.cup ? varConfig.cup[idx % varConfig.cup.length] : null,
                  stock: varConfig.stockPerVariant,
                };
              })
            ),
          },
        },
      });

      console.log(`  ✅ ${product.id}: ${item.slug} — ${t.en.name}`);
      created++;
    } catch (e) {
      console.log(`  ❌ ${item.slug}: ${e.message}`);
      skipped++;
    }
  }

  console.log(`\n🎉 Done! ${created} created, ${skipped} skipped`);
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  prisma.$disconnect();
  process.exit(1);
});
