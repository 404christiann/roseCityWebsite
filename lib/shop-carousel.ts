/** Maximum number of photos the shop carousel can hold. */
export const MAX_CAROUSEL_PHOTOS = 4;

/** Reuses the table-agnostic kit-photo reorder diff for the carousel table. */
export {
  diffShopKitPhotos as diffCarouselPhotos,
  type DraftKitPhoto as DraftCarouselPhoto,
} from "@/lib/shop-kit";

export type CarouselDisplayMode = "hidden" | "static" | "auto";

/** 0 photos renders nothing, 1 renders static, 2+ autoplays with arrows. */
export function carouselDisplayMode(count: number): CarouselDisplayMode {
  if (count <= 0) return "hidden";
  if (count === 1) return "static";
  return "auto";
}

/** Gates the admin upload control at the 4-photo maximum. */
export function canAddCarouselPhoto(count: number): boolean {
  return count < MAX_CAROUSEL_PHOTOS;
}

/** Builds descriptive alt text for a carousel photo position. */
export function carouselPhotoAlt(index: number, total: number): string {
  return `Rose City FC gear photo ${index + 1} of ${total}`;
}
