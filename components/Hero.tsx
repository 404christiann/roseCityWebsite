"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";

export default function Hero() {
  const ctaRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    gsap.fromTo(
      ctaRef.current,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.8 }
    );
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden">
      {/* Background video */}
      <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/hero-poster.jpg"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "177.78vh",
            height: "56.25vw",
            minWidth: "100%",
            minHeight: "100%",
            transform: "translate(-50%, -50%)",
            objectFit: "cover",
            pointerEvents: "none",
          }}
        >
          <source
            src="https://nsgtkwqkbyxkiwrhzsje.supabase.co/storage/v1/object/public/videos/Pan_Bench_Land_ready.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.52)", zIndex: 1 }}
      />

      {/* Green gradient at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          zIndex: 2,
          background: "linear-gradient(to top, rgba(27,77,62,0.55) 0%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div
        className="absolute inset-0 flex flex-col items-end justify-end text-center px-6 pb-28"
        style={{ zIndex: 3 }}
      >
        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
          style={{ opacity: 0 }}
        >
          <Link
            href="/schedule"
            className="font-display font-bold text-sm tracking-widest uppercase px-8 py-4 transition-all duration-200"
            style={{ backgroundColor: "var(--color-red)", color: "#fff" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-red-dark)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-red)")
            }
          >
            Next Match →
          </Link>
          <Link
            href="/roster"
            className="font-display font-bold text-sm tracking-widest uppercase px-8 py-4 border border-white/50 text-white transition-all duration-200 hover:border-white hover:bg-white/10"
          >
            Meet the Squad
          </Link>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 4 }}
      >
        <span className="font-display text-xs tracking-widest uppercase text-white/50">
          Scroll
        </span>
        <div className="w-px h-8 bg-white/30" />
      </div>
    </section>
  );
}
