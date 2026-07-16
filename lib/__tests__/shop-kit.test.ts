import { describe, expect, it } from "vitest";
import {
  diffShopKitPhotos,
  gridClassForCount,
  kitPhotoAlt,
  titleLines,
} from "@/lib/shop-kit";

describe("titleLines", () => {
  it("splits a multiline title into display lines", () => {
    expect(titleLines("Thorn\nEdition\n2026")).toEqual(["Thorn", "Edition", "2026"]);
  });

  it("returns one line for a single-line title", () => {
    expect(titleLines("Thorn Edition")).toEqual(["Thorn Edition"]);
  });

  it("preserves empty middle lines", () => {
    expect(titleLines("Thorn\n\n2026")).toEqual(["Thorn", "", "2026"]);
  });
});

describe("kitPhotoAlt", () => {
  it("collapses title whitespace and numbers photos from one", () => {
    expect(kitPhotoAlt("Thorn\nEdition\n2026", 0, 2))
      .toBe("Thorn Edition 2026 kit photo 1 of 2");
  });

  it("labels the final photo correctly", () => {
    expect(kitPhotoAlt("Thorn Edition 2026", 3, 4))
      .toBe("Thorn Edition 2026 kit photo 4 of 4");
  });
});

describe("gridClassForCount", () => {
  it.each([
    [1, "grid-cols-1"],
    [2, "grid-cols-2"],
    [3, "grid-cols-3"],
    [4, "grid-cols-2 grid-rows-2"],
  ])("returns the expected grid for %i photos", (count, expected) => {
    expect(gridClassForCount(count)).toBe(expected);
  });
});

describe("diffShopKitPhotos", () => {
  const original = [
    { id: "a", sort_order: 0 },
    { id: "b", sort_order: 1 },
  ];

  it("returns no writes when nothing changed", () => {
    expect(diffShopKitPhotos(original, [
      { id: "a", url: "a.jpg" },
      { id: "b", url: "b.jpg" },
    ])).toEqual({ toDelete: [], toInsert: [], toUpdate: [] });
  });

  it("inserts a new photo at its draft position", () => {
    expect(diffShopKitPhotos(original, [
      { id: "a", url: "a.jpg" },
      { id: "b", url: "b.jpg" },
      { id: null, url: "c.jpg" },
    ])).toEqual({
      toDelete: [],
      toInsert: [{ url: "c.jpg", sort_order: 2 }],
      toUpdate: [],
    });
  });

  it("deletes a removed photo and updates a shifted survivor", () => {
    expect(diffShopKitPhotos(original, [
      { id: "b", url: "b.jpg" },
    ])).toEqual({
      toDelete: ["a"],
      toInsert: [],
      toUpdate: [{ id: "b", sort_order: 0 }],
    });
  });

  it("updates both rows for a reorder swap", () => {
    expect(diffShopKitPhotos(original, [
      { id: "b", url: "b.jpg" },
      { id: "a", url: "a.jpg" },
    ])).toEqual({
      toDelete: [],
      toInsert: [],
      toUpdate: [
        { id: "b", sort_order: 0 },
        { id: "a", sort_order: 1 },
      ],
    });
  });

  it("handles deletion, insertion, and reorder in one diff", () => {
    const threeOriginal = [
      ...original,
      { id: "c", sort_order: 2 },
    ];
    expect(diffShopKitPhotos(threeOriginal, [
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
