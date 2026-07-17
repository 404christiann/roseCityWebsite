"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { kitPhotoDisplayMode } from "@/lib/shop-kit";

const AUTO_ADVANCE_MS = 4500;
const SLIDE_TRANSITION_MS = 900;

export type KitPhoto = {
  url: string;
  alt: string;
};

interface KitImageGridProps {
  photos: KitPhoto[];
  sizes: string;
  priority?: boolean;
}

export default function KitImageGrid({
  photos,
  sizes,
  priority = false,
}: KitImageGridProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const displayMode = kitPhotoDisplayMode(photos.length);
  const photoSignature = photos.map((photo) => photo.url).join("|");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    setActiveSlide(0);
    setTransitionEnabled(false);
    const frame = window.requestAnimationFrame(() => setTransitionEnabled(true));
    return () => window.cancelAnimationFrame(frame);
  }, [photoSignature]);

  useEffect(() => {
    if (displayMode === "static" || prefersReducedMotion) return;

    const interval = window.setInterval(() => {
      setTransitionEnabled(true);
      setActiveSlide((current) => current + 1);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(interval);
  }, [displayMode, photoSignature, prefersReducedMotion]);

  if (photos.length === 0) return null;

  if (displayMode === "static") {
    const photo = photos[0];
    return (
      <div className="pointer-events-none relative h-full w-full select-none">
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          className="object-contain object-bottom"
          sizes={sizes}
          priority={priority}
          draggable={false}
        />
      </div>
    );
  }

  const slides = [...photos, photos[0]];

  return (
    <div
      className="pointer-events-none h-full w-full select-none overflow-hidden"
      aria-live="off"
    >
      <div
        className="flex h-full will-change-transform"
        style={{
          transform: `translate3d(-${activeSlide * 100}%, 0, 0)`,
          transition: transitionEnabled && !prefersReducedMotion
            ? `transform ${SLIDE_TRANSITION_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`
            : "none",
        }}
        onTransitionEnd={() => {
          if (activeSlide === photos.length) {
            setTransitionEnabled(false);
            setActiveSlide(0);
          }
        }}
      >
        {slides.map((photo, index) => {
          const isClone = index === photos.length;
          const visibleIndex = activeSlide === photos.length ? 0 : activeSlide;
          return (
            <div
              key={`${photo.url}-${index}`}
              className="relative h-full w-full shrink-0"
              aria-hidden={isClone || index !== visibleIndex}
            >
              <Image
                src={photo.url}
                alt={isClone ? "" : photo.alt}
                fill
                className="object-contain object-bottom"
                sizes={sizes}
                priority={priority}
                draggable={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
