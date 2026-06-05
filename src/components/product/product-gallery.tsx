"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────

export type GalleryImage = {
  id: number;
  url: string;
  alt: string | null;
};

// ─── Component ────────────────────────────────────────────────────────────

type ProductGalleryProps = {
  images: GalleryImage[];
};

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images.length) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center bg-brand-secondary">
        <p className="font-body text-sm text-text-secondary">No image available</p>
      </div>
    );
  }

  const mainImage = images[selectedIndex];

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* ── Thumbnail strip ─────────────────────────────────────────── */}
      <div
        className={cn(
          "order-2 flex gap-2 overflow-x-auto",
          "lg:order-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden",
          images.length > 5 ? "lg:max-h-[500px]" : ""
        )}
      >
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setSelectedIndex(i)}
            className={cn(
              "relative h-20 w-16 shrink-0 overflow-hidden rounded-sm lg:h-24 lg:w-20",
              "ring-1 ring-offset-1 ring-offset-brand-primary transition-all",
              i === selectedIndex
                ? "ring-brand-gold"
                : "ring-transparent hover:ring-border"
            )}
          >
            <Image
              src={img.url}
              alt={img.alt ?? `View ${i + 1}`}
              fill
              sizes="80px"
              className="object-cover"
              unoptimized
            />
          </button>
        ))}
      </div>

      {/* ── Main image ──────────────────────────────────────────────── */}
      <div
        className={cn(
          "order-1 flex-1 overflow-hidden rounded-sm bg-brand-secondary",
          "lg:order-2"
        )}
      >
        <div className="group relative aspect-[3/4] w-full cursor-crosshair overflow-hidden">
          <Image
            src={mainImage.url}
            alt={mainImage.alt ?? "Product image"}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover transition-transform duration-500 group-hover:scale-150"
            unoptimized
            priority
          />
        </div>
      </div>
    </div>
  );
}
