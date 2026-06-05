import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const product = getProducts().find((p) => p.id === parseInt(productId));
  if (!product) return NextResponse.json([]);

  return NextResponse.json(
    (product.reviews || []).map((r) => ({
      id: r.id, authorName: r.authorName, rating: r.rating,
      title: r.title, body: r.body, isVerified: r.isVerified, createdAt: r.createdAt,
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );
}
