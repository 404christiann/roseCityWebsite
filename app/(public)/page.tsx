import dynamic from "next/dynamic";

const Hero           = dynamic(() => import("@/components/Hero"),           { ssr: false });
const NextMatchCard   = dynamic(() => import("@/components/NextMatchCard"),  { ssr: false });
const ChampionsBadge = dynamic(() => import("@/components/ChampionsBadge"), { ssr: false });
const PhotoSlideshow = dynamic(() => import("@/components/PhotoSlideshow"), { ssr: false });
const ShopKitSection  = dynamic(() => import("@/components/ShopKitSectionContainer"), { ssr: false });
const BehindTheRose   = dynamic(() => import("@/components/BehindTheRose"),   { ssr: false });

export default function HomePage() {
  return (
    <>
      <Hero />
      <ShopKitSection fadeImageToWhite />
      <NextMatchCard />
      <ChampionsBadge />
      <PhotoSlideshow />
      <BehindTheRose />
    </>
  );
}
