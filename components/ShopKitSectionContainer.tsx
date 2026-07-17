"use client";

import { useEffect, useState } from "react";
import ShopKitSection from "@/components/ShopKitSection";
import {
  fetchShopKitContent,
  type ShopKitContent,
} from "@/lib/queries";
import type { ShopKitSurface } from "@/lib/db-types";

export default function ShopKitSectionContainer({
  headingTag = "h2",
  fadeImageToWhite = false,
  surface,
}: {
  headingTag?: "h1" | "h2";
  fadeImageToWhite?: boolean;
  surface: ShopKitSurface;
}) {
  const [content, setContent] = useState<ShopKitContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShopKitContent(surface)
      .then(setContent)
      .catch((error) => {
        console.error("ShopKitSection:", error);
      })
      .finally(() => setLoading(false));
  }, [surface]);

  if (loading) {
    return (
      <div
        className="flex w-full items-center justify-center"
        style={{ minHeight: "70vh", backgroundColor: "var(--color-white)" }}
      >
        <p
          className="font-display font-black uppercase tracking-widest"
          style={{ color: "var(--color-gray-mid)", fontSize: "1rem" }}
        >
          Loading collection…
        </p>
      </div>
    );
  }

  if (!content?.section || content.photos.length === 0) return null;

  return (
    <ShopKitSection
      section={content.section}
      photos={content.photos}
      headingTag={headingTag}
      fadeImageToWhite={fadeImageToWhite}
    />
  );
}
