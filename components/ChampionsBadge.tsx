"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ChampionsBadge() {
  const sectionRef = useRef<HTMLElement>(null);
  const trophyRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        trophyRef.current,
        { y: 50, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
      gsap.fromTo(
        textRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power2.out",
          delay: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-28 px-6"
      style={{ backgroundColor: "var(--color-green)" }}
    >
      {/* Mobile: fade bottom into black (slideshow bg) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 md:hidden pointer-events-none"
        style={{ background: "linear-gradient(to top, #000, transparent)", zIndex: 5 }}
      />

      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20 relative z-10">
        {/* Trophy */}
        <div ref={trophyRef} className="flex-shrink-0" style={{ opacity: 0 }}>
          <div className="relative drop-shadow-2xl" style={{ width: "520px", height: "520px", maxWidth: "90vw", maxHeight: "90vw" }}>
            <Image
              src="/images/home/trophy.png"
              alt="UPSL Championship Trophy"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Text block */}
        <div ref={textRef} style={{ opacity: 0 }}>
          {/* Eyebrow */}
          <p
            className="font-display font-bold tracking-widest uppercase mb-4"
            style={{ color: "var(--color-red)", fontSize: "clamp(1rem, 2vw, 1.4rem)" }}
          >
            UPSL Southwest Conference
          </p>

          <h2
            className="font-display font-black uppercase text-white leading-none"
            style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
          >
            2024
            <br />
            Champions
          </h2>

          <div
            className="mt-6 w-16 h-1"
            style={{ backgroundColor: "var(--color-red)" }}
          />

          <p
            className="font-body text-white/70 mt-6 max-w-md leading-relaxed"
            style={{ fontSize: "1.0625rem" }}
          >
            Rose City Futbol Club captured the 2024 UPSL Southwest Conference
            Championship, cementing our place as Pasadena&apos;s premier club.
            The journey continues — and the best is still ahead.
          </p>
        </div>
      </div>
    </section>
  );
}
