"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { useState } from "react";
import { SHOW_SHOP_HERO } from "@/lib/site-flags";
import ShopKitSectionContainer from "@/components/ShopKitSectionContainer";
import ShopPhotoStripContainer from "@/components/ShopPhotoStripContainer";
import ShopPurchaseDetailsContainer from "@/components/ShopPurchaseDetailsContainer";
import type { ShopKitVariant } from "@/lib/db-types";

const ShopHero      = dynamic(() => import("@/components/ShopHero"),      { ssr: false });

gsap.registerPlugin(ScrollTrigger);

export default function ShopPage() {
  const [selectedKitVariant, setSelectedKitVariant] =
    useState<ShopKitVariant>("home");

  return (
    <div className={SHOW_SHOP_HERO ? "pt-20 sm:pt-0" : "pt-24 sm:pt-28"} style={{ backgroundColor: "var(--color-white)" }}>

      {/* ── Cinematic hero slideshow ── */}
      {SHOW_SHOP_HERO && <ShopHero />}

      <ShopKitSectionContainer
        surface="shop"
        headingTag="h1"
        fadeImageToWhite
        selectedVariant={selectedKitVariant}
        onVariantChange={setSelectedKitVariant}
      />

      <ShopPhotoStripContainer variant={selectedKitVariant} />

      <ShopPurchaseDetailsContainer />
    </div>
  );
}
