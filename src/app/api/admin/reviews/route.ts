import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const runtime = "nodejs";

async function uploadToCloudinary(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const timestamp = Math.round(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(`folder=nocturne/reviews&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const uploadForm = new FormData();
  uploadForm.append("file", `data:${file.type};base64,${base64}`);
  uploadForm.append("api_key", apiKey);
  uploadForm.append("timestamp", String(timestamp));
  uploadForm.append("signature", signature);
  uploadForm.append("folder", "nocturne/reviews");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: uploadForm }
  );

  const data = await res.json();
  if (data.secure_url) return data.secure_url;
  throw new Error(data.error?.message || "Image upload failed");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  const reviews = await prisma.review.findMany({
    where: {
      isDeleted: false,
      ...(productId ? { productId: parseInt(productId) } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, slug: true } },
      images: true,
    },
  });

  return NextResponse.json(reviews);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const productIdRaw = formData.get("productId");
    const authorNameRaw = formData.get("authorName");
    const ratingRaw = formData.get("rating");
    const titleRaw = formData.get("title");
    const bodyRaw = formData.get("body");

    if (!productIdRaw) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }
    if (!authorNameRaw || !String(authorNameRaw).trim()) {
      return NextResponse.json({ error: "authorName is required" }, { status: 400 });
    }
    if (!bodyRaw || !String(bodyRaw).trim()) {
      return NextResponse.json({ error: "body is required" }, { status: 400 });
    }

    const productId = parseInt(String(productIdRaw));
    const authorName = String(authorNameRaw).trim();
    const rating = ratingRaw ? parseFloat(String(ratingRaw)) : 5;
    const title = titleRaw ? String(titleRaw).trim() || null : null;
    const body = String(bodyRaw).trim();
    const isVerifiedRaw = formData.get("isVerified");
    const isVerified = isVerifiedRaw ? String(isVerifiedRaw) === "true" : false;

    if (isNaN(productId) || productId <= 0) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Upload images to Cloudinary
    const imageUrls: string[] = [];
    const imageFiles: File[] = [];
    formData.forEach((value, key) => {
      if (key === "images" && value instanceof File && value.size > 0) {
        imageFiles.push(value);
      }
    });

    for (const file of imageFiles) {
      try {
        const url = await uploadToCloudinary(file);
        imageUrls.push(url);
      } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
    }

    const review = await prisma.review.create({
      data: {
        productId,
        authorName,
        rating,
        title,
        body,
        isVerified,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
