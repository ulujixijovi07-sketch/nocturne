import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  const products = getProducts();
  const allReviews = products.flatMap((p) =>
    (p.reviews || []).map((r) => ({ ...r, product: { name: p.name, slug: p.slug } }))
  );

  const filtered = productId
    ? allReviews.filter((r) => r.productId === parseInt(productId))
    : allReviews;

  return NextResponse.json(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
}
