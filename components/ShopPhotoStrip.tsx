"use client";

import Image from "next/image";
import type { DBShopCarouselPhoto } from "@/lib/db-types";
import { photoStripDisplayMode, photoStripPhotoAlt } from "@/lib/shop-photo-strip";

interface ShopPhotoStripProps {
  photos: DBShopCarouselPhoto[];
}

export default function ShopPhotoStrip({ photos }: ShopPhotoStripProps) {
  const mode = photoStripDisplayMode(photos.length);

  if (mode === "hidden") return null;

  return (
    <section className="w-full" style={{ backgroundColor: "var(--color-white)" }}>
      <div className="mx-auto max-w-7xl overflow-x-auto px-6 pt-10 lg:px-10 lg:pt-14">
        <div className="flex justify-start md:justify-center">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className="relative aspect-[9/20] h-[300px] shrink-0 sm:h-[360px] md:h-[460px]"
            >
              <Image
                src={photo.url}
                alt={photoStripPhotoAlt(i, photos.length)}
                fill
                sizes="(min-width: 768px) 230px, 160px"
                className="object-cover object-center"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
