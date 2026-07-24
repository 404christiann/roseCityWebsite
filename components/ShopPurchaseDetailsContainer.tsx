"use client";

import { useEffect, useState } from "react";
import ShopPurchaseDetailsSection from "@/components/ShopPurchaseDetailsSection";
import type { DBShopPurchaseDetails } from "@/lib/db-types";
import { fetchShopPurchaseDetails } from "@/lib/queries";
import { DEFAULT_SHOP_PURCHASE_DETAILS } from "@/lib/shop-purchase-details";

export default function ShopPurchaseDetailsContainer() {
  const [details, setDetails] = useState<DBShopPurchaseDetails>(
    DEFAULT_SHOP_PURCHASE_DETAILS,
  );

  useEffect(() => {
    fetchShopPurchaseDetails()
      .then(setDetails)
      .catch((error) => {
        console.error("ShopPurchaseDetails:", error);
      });
  }, []);

  return <ShopPurchaseDetailsSection details={details} />;
}
