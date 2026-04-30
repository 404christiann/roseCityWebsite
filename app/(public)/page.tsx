import dynamic from "next/dynamic";

const Hero           = dynamic(() => import("@/components/Hero"),           { ssr: false });
const Countdown      = dynamic(() => import("@/components/Countdown"),      { ssr: false });
const ChampionsBadge = dynamic(() => import("@/components/ChampionsBadge"), { ssr: false });
const PhotoSlideshow = dynamic(() => import("@/components/PhotoSlideshow"), { ssr: false });
const JerseySection   = dynamic(() => import("@/components/JerseySection"),   { ssr: false });
const BehindTheRose   = dynamic(() => import("@/components/BehindTheRose"),   { ssr: false });

export default function HomePage() {
  return (
    <>
      <Hero />
      <Countdown />
      <ChampionsBadge />
      <PhotoSlideshow />
      <JerseySection />
      <BehindTheRose />
    </>
  );
}
