"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ASSETS = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Aboutassets`;

const ANNOTATED_CREST_IMAGE = `${ASSETS}/ClubLogo_initial_image.png`;
const CREST_PATCH = `${ASSETS}/Rose%20City%20FC%20Patch%20Rose%20City%20Futbol%20Club.png`;
const NAME_ICON = `${ASSETS}/Rose%20City%20FC%20Rose%20City%20Futbol%20Club.png`;
const ROSE_ICON = `${ASSETS}/Rose%20City%20FC%20Red%20Rose.png`;
const ROSE_PATCH = `${ASSETS}/Rose%20City%20FC%20Patch%20Rose.png`;
const CROWN_ICON = `${ASSETS}/Rose%20City%20FC%20Crown.png`;
const CROWN_PATCH = `${ASSETS}/Rose%20City%20FC%20Patch%20Crown.png`;
const KEY_ICON = `${ASSETS}/Rose%20City%20FC%20Key.png`;
const KEY_PATCH = `${ASSETS}/Rose%20City%20FC%20Patch%20Key.png`;
const TWENTY_THREE_ICON = `${ASSETS}/Rose%20City%20FC%2023.png`;
const TWENTY_THREE_PATCH = `${ASSETS}/Rose%20City%20FC%20Patch_23.png`;
const MAP_IMAGE = `${ASSETS}/Rose%20City%20FC%20Official%20Pasadena%20Map%202027.png`;

// Every source PNG carries a lot of transparent padding around its actual
// artwork (measured directly from the files — patches fill ~82-85% of their
// canvas, icons only ~34-62%). iconScale/PATCH_SCALE crop that padding out via
// a CSS transform on an overflow-hidden container instead of re-exporting the
// assets, so the visible mark actually fills its allotted box.
const PATCH_SCALE = 1.1;

type Feature = {
  title: string;
  icon: string;
  iconSize: number;
  iconScale: number;
  patch: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    title: "The Name",
    icon: NAME_ICON,
    iconSize: 70,
    iconScale: 2.25,
    patch: CREST_PATCH,
    description:
      "Rose City's crest reflects Pasadena's rich history and what makes the city special as a global city.",
  },
  {
    title: "The Rose",
    icon: ROSE_ICON,
    iconSize: 50,
    iconScale: 2.25,
    patch: ROSE_PATCH,
    description:
      "The rose symbolizes the world-famous Rose Parade that began January 1, 1890 and has run every year since. Residents, many from the snowy Midwest, covered their horse-drawn wagons in roses to display the area's vitality in winter.",
  },
  {
    title: "The #23",
    icon: TWENTY_THREE_ICON,
    iconSize: 90,
    iconScale: 1.22,
    patch: TWENTY_THREE_PATCH,
    description:
      "Pasadena's 23 square miles is home to 138,000 residents, the Rose Bowl stadium, and is located at the northern origin of the 110 freeway, the first freeway in the U.S.",
  },
  {
    title: "The Crown",
    icon: CROWN_ICON,
    iconSize: 70,
    iconScale: 1.45,
    patch: CROWN_PATCH,
    description:
      "The San Gabriel Mountains crown the area with rugged majesty. Hiking trails lead to mountain peaks overseeing the entire Los Angeles basin.",
  },
  {
    title: "The Key",
    icon: KEY_ICON,
    iconSize: 50,
    iconScale: 2.25,
    patch: KEY_PATCH,
    description:
      "Pasadena is the most prominent city in the San Gabriel Valley and derives its name from the Chippewa language meaning “Key of the Valley” and “Crown of the Valley.” Pasadena is “key” to artistic, educational, and scientific institutions of global renown.",
  },
];

export default function ClubLogoPage() {
  const diagramRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        diagramRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }
      );
      gsap.fromTo(
        rowsRef.current?.children ?? [],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: { trigger: rowsRef.current, start: "top 85%" },
        }
      );
      gsap.fromTo(
        mapRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: mapRef.current, start: "top 85%" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#18181A" }}>
      {/* Top diagram — single pre-composed annotated crest image */}
      <div ref={diagramRef} className="pt-40 pb-6 px-6" style={{ opacity: 0 }}>
        <div className="relative w-full max-w-xl mx-auto" style={{ aspectRatio: "2436 / 1493" }}>
          <Image
            src={ANNOTATED_CREST_IMAGE}
            alt="Rose City FC crest, annotated: Rose City Futbol Club, Crown, Rose, #23, and Key"
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, 576px"
            priority
          />
        </div>
      </div>

      {/* Feature rows */}
      <div ref={rowsRef} className="max-w-2xl mx-auto px-6 pb-10 flex flex-col gap-10">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="flex items-center gap-5 sm:gap-6" style={{ opacity: 0 }}>
            <div className="relative flex-shrink-0 overflow-hidden" style={{ width: 150, height: 150 }}>
              <Image
                src={feature.patch}
                alt={`${feature.title} patch`}
                fill
                className="object-contain"
                style={{ transform: `scale(${PATCH_SCALE})` }}
                sizes="150px"
              />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2
                  className="font-display font-black uppercase text-white leading-none"
                  style={{ fontSize: "1.4rem" }}
                >
                  {feature.title}
                </h2>
                <div
                  className="relative flex-shrink-0 overflow-hidden"
                  style={{ width: feature.iconSize, height: feature.iconSize }}
                >
                  <Image
                    src={feature.icon}
                    alt=""
                    fill
                    className="object-contain"
                    style={{ transform: `scale(${feature.iconScale})` }}
                    sizes={`${feature.iconSize}px`}
                  />
                </div>
              </div>
              <p
                className="font-body leading-normal"
                style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem" }}
              >
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div ref={mapRef} className="max-w-sm mx-auto px-6 pb-32" style={{ opacity: 0 }}>
        <div className="relative w-full" style={{ aspectRatio: "991 / 1281" }}>
          <Image
            src={MAP_IMAGE}
            alt="Map of Pasadena, CA — home of Rose City FC"
            fill
            className="object-contain"
            sizes="384px"
          />
        </div>
      </div>
    </div>
  );
}
