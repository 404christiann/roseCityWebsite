import { describe, expect, it } from "vitest";
import {
  canAddCarouselPhoto,
  carouselDisplayMode,
  carouselPhotoAlt,
  diffCarouselPhotos,
  MAX_CAROUSEL_PHOTOS,
} from "@/lib/shop-carousel";

describe("carouselPhotoAlt", () => {
  it("numbers photos from one", () => {
    expect(carouselPhotoAlt(0, 3)).toBe("Rose City FC gear photo 1 of 3");
  });

  it("labels the final photo correctly", () => {
    expect(carouselPhotoAlt(3, 4)).toBe("Rose City FC gear photo 4 of 4");
  });

  it("labels a single static photo", () => {
    expect(carouselPhotoAlt(0, 1)).toBe("Rose City FC gear photo 1 of 1");
  });
});

describe("carouselDisplayMode", () => {
  it.each([
    [0, "hidden"],
    [1, "static"],
    [2, "auto"],
    [3, "auto"],
    [4, "auto"],
  ])("returns %s for %i photos", (count, expected) => {
    expect(carouselDisplayMode(count as number)).toBe(expected);
  });

  it("treats negative counts as hidden", () => {
    expect(carouselDisplayMode(-1)).toBe("hidden");
  });
});

describe("canAddCarouselPhoto", () => {
  it("caps the carousel at four photos", () => {
    expect(MAX_CAROUSEL_PHOTOS).toBe(4);
  });

  it.each([
    [0, true],
    [1, true],
    [2, true],
    [3, true],
    [4, false],
    [5, false],
  ])("returns %s at %i photos", (count, expected) => {
    expect(canAddCarouselPhoto(count as number)).toBe(expected);
  });
});

describe("diffCarouselPhotos", () => {
  const original = [
    { id: "a", sort_order: 0 },
    { id: "b", sort_order: 1 },
  ];

  it("returns no writes when nothing changed", () => {
    expect(diffCarouselPhotos(original, [
      { id: "a", url: "a.jpg" },
      { id: "b", url: "b.jpg" },
    ])).toEqual({ toDelete: [], toInsert: [], toUpdate: [] });
  });

  it("inserts a new photo at its draft position", () => {
    expect(diffCarouselPhotos(original, [
      { id: "a", url: "a.jpg" },
      { id: "b", url: "b.jpg" },
      { id: null, url: "c.jpg" },
    ])).toEqual({
      toDelete: [],
      toInsert: [{ url: "c.jpg", sort_order: 2 }],
      toUpdate: [],
    });
  });

  it("deletes every row when the carousel is emptied", () => {
    expect(diffCarouselPhotos(original, [])).toEqual({
      toDelete: ["a", "b"],
      toInsert: [],
      toUpdate: [],
    });
  });

  it("handles deletion, insertion, and reorder in one diff", () => {
    const threeOriginal = [
      ...original,
      { id: "c", sort_order: 2 },
    ];
    expect(diffCarouselPhotos(threeOriginal, [
      { id: "c", url: "c.jpg" },
      { id: null, url: "d.jpg" },
      { id: "a", url: "a.jpg" },
    ])).toEqual({
      toDelete: ["b"],
      toInsert: [{ url: "d.jpg", sort_order: 1 }],
      toUpdate: [
        { id: "c", sort_order: 0 },
        { id: "a", sort_order: 2 },
      ],
    });
  });
});
