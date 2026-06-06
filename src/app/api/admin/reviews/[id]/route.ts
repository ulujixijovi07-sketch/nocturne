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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
  }

  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      images: true,
      product: { select: { name: true, slug: true } },
    },
  });

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  return NextResponse.json(review);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
  }

  try {
    const existing = await prisma.review.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // FormData: supports image uploads
      const formData = await request.formData();

      const authorNameRaw = formData.get("authorName");
      const ratingRaw = formData.get("rating");
      const titleRaw = formData.get("title");
      const bodyRaw = formData.get("body");
      const isVerifiedRaw = formData.get("isVerified");
      const isApprovedRaw = formData.get("isApproved");
      const isFeaturedRaw = formData.get("isFeatured");
      const isPinnedRaw = formData.get("isPinned");

      const data: Record<string, unknown> = {};

      if (authorNameRaw) data.authorName = String(authorNameRaw).trim();
      if (ratingRaw) {
        const rating = parseFloat(String(ratingRaw));
        if (isNaN(rating) || rating < 1 || rating > 5) {
          return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
        }
        data.rating = rating;
      }
      if (titleRaw !== null && titleRaw !== undefined) {
        data.title = String(titleRaw).trim() || null;
      }
      if (bodyRaw) data.body = String(bodyRaw).trim();
      if (isVerifiedRaw !== null && isVerifiedRaw !== undefined) {
        data.isVerified = String(isVerifiedRaw) === "true";
      }
      if (isApprovedRaw !== null && isApprovedRaw !== undefined) {
        data.isApproved = String(isApprovedRaw) === "true";
      }
      if (isFeaturedRaw !== null && isFeaturedRaw !== undefined) {
        data.isFeatured = String(isFeaturedRaw) === "true";
      }
      if (isPinnedRaw !== null && isPinnedRaw !== undefined) {
        data.isPinned = String(isPinnedRaw) === "true";
      }

      // Handle images: if new images are provided, replace all
      const imageFiles: File[] = [];
      formData.forEach((value, key) => {
        if (key === "images" && value instanceof File && value.size > 0) {
          imageFiles.push(value);
        }
      });

      if (imageFiles.length > 0) {
        // Delete existing images
        await prisma.reviewImage.deleteMany({ where: { reviewId: id } });

        // Upload new images
        const imageUrls: string[] = [];
        for (const file of imageFiles) {
          try {
            const url = await uploadToCloudinary(file);
            imageUrls.push(url);
          } catch (err: any) {
            return NextResponse.json({ error: err.message }, { status: 500 });
          }
        }

        data.images = { create: imageUrls.map((url) => ({ url })) };
      }

      const review = await prisma.review.update({
        where: { id },
        data,
        include: { images: true },
      });

      return NextResponse.json(review);
    } else {
      // JSON body: text fields only
      const body = await request.json();

      const review = await prisma.review.update({
        where: { id },
        data: {
          ...(body.authorName !== undefined && { authorName: body.authorName }),
          ...(body.rating !== undefined && { rating: body.rating }),
          ...(body.title !== undefined && { title: body.title }),
          ...(body.body !== undefined && { body: body.body }),
          ...(body.isVerified !== undefined && { isVerified: body.isVerified }),
          ...(body.isApproved !== undefined && { isApproved: body.isApproved }),
          ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
          ...(body.isPinned !== undefined && { isPinned: body.isPinned }),
        },
        include: { images: true },
      });

      return NextResponse.json(review);
    }
  } catch (error: any) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
  }

  try {
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Soft delete
    await prisma.review.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
