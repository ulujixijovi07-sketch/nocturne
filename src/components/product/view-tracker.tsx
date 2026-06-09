"use client";

import { useEffect } from "react";
import { trackProductView, RecentlyViewed } from "./recently-viewed";

type TrackViewProps = {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    image: string;
  };
};

export function ProductViewTracker({ product }: TrackViewProps) {
  useEffect(() => {
    trackProductView(product);
  }, [product]);

  return <RecentlyViewed />;
}
