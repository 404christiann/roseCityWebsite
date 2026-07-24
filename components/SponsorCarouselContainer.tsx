"use client";

import { useEffect, useState } from "react";
import SponsorCarousel from "@/components/SponsorCarousel";
import type { DBSiteSponsorLogo } from "@/lib/db-types";
import { DEFAULT_CAROUSEL_SPONSORS } from "@/lib/sponsor-content";
import { fetchSiteSponsorLogos } from "@/lib/queries";

export default function SponsorCarouselContainer() {
  const [sponsors, setSponsors] = useState<DBSiteSponsorLogo[]>(DEFAULT_CAROUSEL_SPONSORS);

  useEffect(() => {
    fetchSiteSponsorLogos("carousel")
      .then(setSponsors)
      .catch((error) => {
        console.error("SponsorCarouselContainer:", error);
        setSponsors(DEFAULT_CAROUSEL_SPONSORS);
      });
  }, []);

  return <SponsorCarousel sponsors={sponsors} />;
}
