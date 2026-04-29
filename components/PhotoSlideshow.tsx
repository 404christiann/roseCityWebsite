"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const slides = [
  { src: "/images/home/homepageSlideShowPic1.jpeg", alt: "Rose City FC Match Action" },
  { src: "/images/home/homepageSlideShowPic2.jpeg", alt: "Rose City FC Players" },
  { src: "/images/home/homepageSlideShowPic3.jpeg", alt: "Rose City FC Team" },
];

const SLIDE_DURATION = 4500;

export default function PhotoSlideshow() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setPrev(current);
      setCurrent((c) => (c + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [current]);

  // Scroll reveal
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: "85vh", minHeight: "560px", opacity: 0, display: "block", margin: 0, padding: 0 }}
    >
      {/* Images */}
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Subtle dark overlay for legibility */}
      <div className="absolute inset-0 bg-black/10" style={{ zIndex: 1 }} />

      {/* Mobile: fade bottom into jersey section black */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 md:hidden pointer-events-none"
        style={{ background: "linear-gradient(to top, #000, transparent)", zIndex: 2 }}
      />

      {/* Slide counter + indicators */}
      <div
        className="absolute bottom-8 right-8 flex items-center gap-4"
        style={{ zIndex: 2 }}
      >
        <span
          className="font-display text-white/60 text-sm tracking-widest"
        >
          {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setPrev(current); setCurrent(i); }}
              className="transition-all duration-300"
              style={{
                width: i === current ? "2rem" : "0.5rem",
                height: "2px",
                backgroundColor:
                  i === current ? "var(--color-red)" : "rgba(255,255,255,0.4)",
                border: "none",
                cursor: "pointer",
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Optional label bottom-left */}
      <div
        className="absolute bottom-8 left-8 hidden md:block"
        style={{ zIndex: 2 }}
      >
        <p
          className="font-display text-xs font-semibold tracking-widest uppercase"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          2025 – 2026 Season
        </p>
      </div>
    </section>
  );
}
