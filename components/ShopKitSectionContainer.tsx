"use client";

import { useEffect, useState } from "react";
import ShopKitSection from "@/components/ShopKitSection";
import {
  fetchShopKitContent,
  type ShopKitContent,
} from "@/lib/queries";

export default function ShopKitSectionContainer({
  headingTag = "h2",
}: {
  headingTag?: "h1" | "h2";
}) {
  const [content, setContent] = useState<ShopKitContent | null>(null);

  useEffect(() => {
    fetchShopKitContent()
      .then(setContent)
      .catch((error) => {
        console.error("ShopKitSection:", error);
      });
  }, []);

  if (!content?.section || content.photos.length === 0) return null;

  return (
    <ShopKitSection
      section={content.section}
      photos={content.photos}
      headingTag={headingTag}
    />
  );
}
