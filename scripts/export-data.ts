import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const p = new PrismaClient();

async function main() {
  const [products, collections, categories] = await Promise.all([
    p.product.findMany({
      include: {
        images: true,
        variants: true,
        collection: true,
        reviews: { where: { isDeleted: false } },
      },
    }),
    p.collection.findMany(),
    p.category.findMany(),
  ]);

  fs.mkdirSync("src/data", { recursive: true });
  fs.writeFileSync("src/data/products.json", JSON.stringify(products, null, 2));
  fs.writeFileSync("src/data/collections.json", JSON.stringify(collections, null, 2));
  fs.writeFileSync("src/data/categories.json", JSON.stringify(categories, null, 2));

  console.log(`Exported: ${products.length} products, ${collections.length} collections, ${categories.length} categories`);
  await p.$disconnect();
}

main().catch(console.error);
