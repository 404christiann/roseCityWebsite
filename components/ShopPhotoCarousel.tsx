"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import type { DBShopCarouselPhoto } from "@/lib/db-types";
import { carouselDisplayMode, carouselPhotoAlt } from "@/lib/shop-carousel";

const AUTOPLAY_MS = 7000;
const SLIDE_SECONDS = 1.1;

interface ShopPhotoCarouselProps {
  photos: DBShopCarouselPhoto[];
}

export default function ShopPhotoCarousel({ photos }: ShopPhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const mode = carouselDisplayMode(photos.length);

  useEffect(() => {
    if (mode !== "auto") return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % photos.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [index, mode, photos.length]);

  useEffect(() => {
    if (!trackRef.current) return;
    tweenRef.current?.kill();
    tweenRef.current = gsap.to(trackRef.current, {
      xPercent: -100 * index,
      duration: SLIDE_SECONDS,
      ease: "power2.inOut",
    });
    return () => {
      tweenRef.current?.kill();
      tweenRef.current = null;
    };
  }, [index]);

  if (mode === "hidden") return null;

  function goTo(delta: -1 | 1) {
    setIndex((current) => (current + delta + photos.length) % photos.length);
  }

  return (
    <section className="w-full" style={{ backgroundColor: "var(--color-white)" }}>
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="flex gap-3 md:gap-5">
          {mode === "auto" && (
            <div className="hidden shrink-0 flex-col gap-3 md:flex">
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`View photo ${i + 1}`}
                  className="relative h-20 w-20 overflow-hidden rounded-md transition-opacity lg:h-24 lg:w-24"
                  style={{
                    border:
                      i === index
                        ? "2px solid var(--color-black)"
                        : "2px solid transparent",
                    opacity: i === index ? 1 : 0.55,
                  }}
                >
                  <Image
                    src={photo.url}
                    alt={carouselPhotoAlt(i, photos.length)}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="relative h-[50vh] max-h-[520px] min-h-[320px] flex-1 overflow-hidden">
            <div ref={trackRef} className="flex h-full w-full">
              {photos.map((photo, i) => (
                <div
                  key={photo.id}
                  className="relative h-full w-full shrink-0 grow-0 basis-full"
                >
                  <Image
                    src={photo.url}
                    alt={carouselPhotoAlt(i, photos.length)}
                    fill
                    sizes="(min-width: 768px) 60vw, 100vw"
                    className="object-contain object-center"
                  />
                </div>
              ))}
            </div>

            {mode === "auto" && (
              <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() => goTo(-1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-black/5"
                  style={{
                    backgroundColor: "var(--color-white)",
                    border: "1px solid rgba(0,0,0,0.15)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M15 5l-7 7 7 7"
                      stroke="var(--color-black)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() => goTo(1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-black/5"
                  style={{
                    backgroundColor: "var(--color-white)",
                    border: "1px solid rgba(0,0,0,0.15)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 5l7 7-7 7"
                      stroke="var(--color-black)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
