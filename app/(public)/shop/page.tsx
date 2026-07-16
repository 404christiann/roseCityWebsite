"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { shopProduct } from "@/lib/data";
import { SHOW_SHOP_HERO } from "@/lib/site-flags";
import ShopKitSectionContainer from "@/components/ShopKitSectionContainer";

const ShopHero      = dynamic(() => import("@/components/ShopHero"),      { ssr: false });

gsap.registerPlugin(ScrollTrigger);

export default function ShopPage() {
  const nikysRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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
    <div className={SHOW_SHOP_HERO ? "pt-20 sm:pt-0" : "pt-24 sm:pt-28"} style={{ backgroundColor: "var(--color-white)" }}>

      {/* ── Cinematic hero slideshow ── */}
      {SHOW_SHOP_HERO && <ShopHero />}

      <ShopKitSectionContainer headingTag="h1" />

      {/* ── Purchase info ── */}
      <div style={{ backgroundColor: "var(--color-black)" }}>
      <div
        ref={nikysRef}
        className="px-6 lg:px-10 max-w-7xl mx-auto py-20 md:py-28"
        style={{ opacity: 0 }}
      >
        <div className="flex items-center gap-4 mb-10 md:mb-14">
          <h2
            className="font-display font-black italic uppercase text-white leading-none"
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
                className="font-display font-normal tracking-widest uppercase mb-3"
                style={{ color: "var(--color-red)", fontSize: "0.72rem" }}
              >
                {item.label}
              </p>
              <h3
                className="font-display font-black not-italic uppercase text-white leading-none mb-4"
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
    </div>
  );
}
