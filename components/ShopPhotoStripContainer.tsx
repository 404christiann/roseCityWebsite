"use client";

import { useEffect, useState } from "react";
import ShopPhotoStrip from "@/components/ShopPhotoStrip";
import { fetchShopCarouselPhotos } from "@/lib/queries";
import type { DBShopCarouselPhoto } from "@/lib/db-types";

export default function ShopPhotoStripContainer() {
  const [photos, setPhotos] = useState<DBShopCarouselPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShopCarouselPhotos()
      .then(setPhotos)
      .catch((error) => {
        console.error("ShopPhotoStrip:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        className="flex w-full items-center justify-center"
        style={{ minHeight: "260px", backgroundColor: "var(--color-white)" }}
      >
        <p
          className="font-display font-black uppercase tracking-widest"
          style={{ color: "var(--color-gray-mid)", fontSize: "0.9rem" }}
        >
          Loading gallery…
        </p>
      </div>
    );
  }

  if (photos.length === 0) return null;

  return <ShopPhotoStrip photos={photos} />;
}
