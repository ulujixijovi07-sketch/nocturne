import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import crypto from "crypto";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  // ── Purchase check mode (for client-side UI) ──────────────────────
  if (searchParams.get("checkPurchase") === "true") {
    if (!productId) return NextResponse.json({ purchased: false });
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ purchased: false });

    const order = await prisma.order.findFirst({
      where: {
        customerEmail: session.user.email,
        status: "DELIVERED",
        items: { some: { productId: parseInt(productId) } },
      },
    });

    return NextResponse.json({ purchased: !!order });
  }

  // ── Regular review listing ────────────────────────────────────────
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { productId: parseInt(productId), isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: { images: true },
  });

  return NextResponse.json(reviews);
}

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

export async function POST(request: NextRequest) {
  try {
    // ── Authentication check ────────────────────────────────────────
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const formData = await request.formData();

    const productIdRaw = formData.get("productId");
    const authorNameRaw = formData.get("authorName");
    const ratingRaw = formData.get("rating");
    const titleRaw = formData.get("title");
    const bodyRaw = formData.get("body");

    if (!productIdRaw) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }
    if (!bodyRaw || !String(bodyRaw).trim()) {
      return NextResponse.json({ error: "body is required" }, { status: 400 });
    }

    const productId = parseInt(String(productIdRaw));
    const authorName =
      (authorNameRaw && String(authorNameRaw).trim()) ||
      session.user.name ||
      session.user.email ||
      "Anonymous";
    const rating = ratingRaw ? parseFloat(String(ratingRaw)) : 5;
    const title = titleRaw ? String(titleRaw).trim() || null : null;
    const body = String(bodyRaw).trim();

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

    // ── Purchase verification ───────────────────────────────────────
    const purchaseOrder = await prisma.order.findFirst({
      where: {
        customerEmail: session.user.email!,
        status: "DELIVERED",
        items: { some: { productId } },
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: "You must purchase this product before reviewing" },
        { status: 403 }
      );
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

    // Create review with images
    const review = await prisma.review.create({
      data: {
        productId,
        authorName,
        rating,
        title,
        body,
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
