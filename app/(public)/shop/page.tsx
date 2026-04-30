"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { shopProduct } from "@/lib/data";

const ShopHero      = dynamic(() => import("@/components/ShopHero"),      { ssr: false });
const ShopSlideshow = dynamic(() => import("@/components/ShopSlideshow"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

export default function ShopPage() {
  const heroRef    = useRef<HTMLDivElement>(null);
  const nikysRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.15 }
      );
      gsap.fromTo(
        nikysRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: nikysRef.current, start: "top 85%" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="pt-20 sm:pt-0" style={{ backgroundColor: "var(--color-black)" }}>

      {/* ── Cinematic hero slideshow ── */}
      <ShopHero />

      {/* ── Hero product split ── */}
      <div className="flex flex-col md:flex-row md:min-h-screen">

        {/* Slideshow — left / top on mobile */}
        <div
          className="relative w-full flex-shrink-0 bg-[var(--color-black)] px-4 pt-8 pb-2 sm:px-6 md:w-3/5 md:min-h-screen md:bg-transparent md:px-0 md:pt-0 md:pb-0"
        >
          <div className="mb-4 flex items-center gap-3 px-1 md:hidden">
            <div
              className="h-px flex-1"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            />
            <span
              className="font-display text-[0.65rem] font-bold tracking-[0.3em] uppercase"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Shop Detail
            </span>
            <div
              className="h-px flex-1"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            />
          </div>
          <div
            className="relative w-full aspect-[4/5] overflow-hidden sm:aspect-[3/4] md:h-full md:min-h-screen md:aspect-auto"
            style={{ minHeight: "min(80vw, 520px)", maxHeight: "100vh" }}
          >
            <ShopSlideshow images={shopProduct.slideshowImages} />
          </div>
        </div>

        {/* Product details — right / bottom on mobile */}
        <div
          ref={heroRef}
          className="w-full md:w-2/5 flex flex-col justify-start md:justify-center px-8 sm:px-12 md:px-14 lg:px-20 py-12 md:py-24"
          style={{ opacity: 0 }}
        >
          <p
            className="font-display font-bold tracking-widest uppercase mb-4"
            style={{ color: "var(--color-red)", fontSize: "clamp(0.85rem, 1.5vw, 1.1rem)" }}
          >
            2026 Kit · Available Now
          </p>

          <h1
            className="font-display font-black uppercase text-white leading-none mb-6"
            style={{ fontSize: "clamp(2.8rem, 5vw, 5rem)" }}
          >
            Thorn<br />Edition<br />2026
          </h1>

          <div className="w-12 h-0.5 mb-8" style={{ backgroundColor: "var(--color-red)" }} />

          <p
            className="font-body mb-8 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)", fontSize: "clamp(0.9rem, 1.4vw, 1rem)" }}
          >
            {shopProduct.description}
          </p>

          {/* Includes list */}
          <ul className="flex flex-col gap-3 mb-8">
            {shopProduct.includes.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--color-red)" }} />
                <span className="font-body text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>{item}</span>
              </li>
            ))}
            {shopProduct.addOn && (
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
                <span className="font-body text-sm italic" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Add-on: {shopProduct.addOn}
                </span>
              </li>
            )}
          </ul>

          <p className="font-body text-xs mb-8" style={{ color: "rgba(255,255,255,0.25)" }}>
            Sold exclusively at Niky&apos;s Sports<br />
            {shopProduct.storeAddress}
          </p>

          <a
            href={shopProduct.buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center md:inline-flex md:w-auto gap-3 font-display font-bold tracking-widest uppercase px-10 py-4 transition-all duration-200"
            style={{ backgroundColor: "var(--color-red)", color: "#fff", fontSize: "clamp(0.85rem, 1.2vw, 1rem)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-red-dark)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-red)")}
          >
            Buy Now →
          </a>
        </div>
      </div>

      {/* ── Purchase info ── */}
      <div
        ref={nikysRef}
        className="px-6 lg:px-10 max-w-7xl mx-auto py-20 md:py-28"
        style={{ opacity: 0 }}
      >
        <div className="flex items-center gap-4 mb-10 md:mb-14">
          <h2
            className="font-display font-black uppercase text-white leading-none"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
          >
            Purchase Details
          </h2>
          <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {[
            {
              label: "What’s Included",
              title: "Match jersey package",
              body: "Authentic home jersey, any name and number, league patch, sponsor badges, and raffle ticket entry.",
            },
            {
              label: "Customization",
              title: "Personalize the shirt",
              body: "Add your preferred player name and number at checkout. Custom name service is available as an add-on.",
            },
            {
              label: "Available At",
              title: "Niky’s Sports Pasadena",
              body: shopProduct.storeAddress,
            },
            {
              label: "Purchase Options",
              title: "Online or in-store",
              body: "Order through Niky’s online product page or visit the Pasadena shop for in-person pickup and sizing.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="border px-5 py-6 md:px-7 md:py-8"
              style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.02)" }}
            >
              <p
                className="font-display font-bold tracking-widest uppercase mb-3"
                style={{ color: "var(--color-red)", fontSize: "0.72rem" }}
              >
                {item.label}
              </p>
              <h3
                className="font-display font-black uppercase text-white leading-none mb-4"
                style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}
              >
                {item.title}
              </h3>
              <p
                className="font-body leading-relaxed"
                style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem" }}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-10 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div>
            <p
              className="font-display font-bold tracking-widest uppercase mb-1"
              style={{ color: "var(--color-gray-mid)", fontSize: "0.75rem" }}
            >
              Ready To Order
            </p>
            <p className="font-body text-white text-sm">Buy online now or stop by Niky’s Sports in Pasadena.</p>
          </div>
          <a
            href={shopProduct.buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center sm:inline-flex font-display font-bold tracking-widest uppercase px-8 py-3.5 transition-all duration-200"
            style={{ backgroundColor: "var(--color-red)", color: "#fff", fontSize: "0.85rem" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-red-dark)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-red)")}
          >
            Buy Now →
          </a>
        </div>
      </div>
    </div>
  );
}
