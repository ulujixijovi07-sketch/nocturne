const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  await p.productVariant.deleteMany({});
  await p.productTranslation.deleteMany({});
  await p.productImage.deleteMany({});
  await p.productCategory.deleteMany({});
  await p.product.deleteMany({});
  console.log("Cleared:", await p.product.count(), "products remaining");
  await p.$disconnect();
})().catch(e => console.error("Failed:", e.message.slice(0, 100)));
