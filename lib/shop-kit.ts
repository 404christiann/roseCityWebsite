/** Splits raw admin title text into display lines. */
export function titleLines(title: string): string[] {
  return title.split("\n");
}

/** Builds descriptive alt text from the editable title and photo position. */
export function kitPhotoAlt(title: string, index: number, total: number): string {
  const plainTitle = title.replace(/\s+/g, " ").trim();
  return `${plainTitle} kit photo ${index + 1} of ${total}`;
}

/** Returns the fixed Tailwind grid shape for a 1–4 photo kit display. */
export function gridClassForCount(count: number): string {
  switch (count) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-3";
    default:
      return "grid-cols-2 grid-rows-2";
  }
}

export type DraftKitPhoto = {
  id: string | null;
  url: string;
};

/** Computes the row writes needed to make persisted photos match draft order. */
export function diffShopKitPhotos(
  original: { id: string; sort_order: number }[],
  draft: DraftKitPhoto[],
): {
  toDelete: string[];
  toInsert: { url: string; sort_order: number }[];
  toUpdate: { id: string; sort_order: number }[];
} {
  const draftIds = new Set(
    draft
      .filter((photo) => photo.id !== null)
      .map((photo) => photo.id as string),
  );
  const originalById = new Map(original.map((photo) => [photo.id, photo]));

  const toDelete = original
    .filter((photo) => !draftIds.has(photo.id))
    .map((photo) => photo.id);
  const toInsert: { url: string; sort_order: number }[] = [];
  const toUpdate: { id: string; sort_order: number }[] = [];

  draft.forEach((photo, index) => {
    if (photo.id === null) {
      toInsert.push({ url: photo.url, sort_order: index });
      return;
    }
    if (originalById.get(photo.id)?.sort_order !== index) {
      toUpdate.push({ id: photo.id, sort_order: index });
    }
  });

  return { toDelete, toInsert, toUpdate };
}
