import Image from "next/image";
import { gridClassForCount } from "@/lib/shop-kit";

export type KitPhoto = {
  url: string;
  alt: string;
};

interface KitImageGridProps {
  photos: KitPhoto[];
  sizes: string;
  priority?: boolean;
}

export default function KitImageGrid({
  photos,
  sizes,
  priority = false,
}: KitImageGridProps) {
  if (photos.length === 0) return null;

  return (
    <div className={`grid h-full w-full ${gridClassForCount(photos.length)}`}>
      {photos.map((photo, index) => (
        <div key={photo.url} className="relative h-full min-w-0">
          <Image
            src={photo.url}
            alt={photo.alt}
            fill
            className="object-contain object-bottom"
            sizes={sizes}
            priority={priority}
            style={
              photos.length === 2
                ? { transform: index === 0 ? "translateX(7%)" : "translateX(-7%)" }
                : undefined
            }
          />
        </div>
      ))}
    </div>
  );
}
