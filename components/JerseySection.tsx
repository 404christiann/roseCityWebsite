"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shopProduct } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

export default function JerseySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef   = useRef<HTMLDivElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.2,
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "var(--color-white)" }}
    >
      <div className="flex flex-col md:flex-row">

        {/* ── Jersey image ── */}
        <div
          ref={imageRef}
          className="relative w-full md:w-1/2"
          style={{ opacity: 0 }}
        >
          {/* Mobile: aspect ratio so full image shows */}
          <div className="relative w-full md:hidden" style={{ aspectRatio: "3/4" }}>
            <Image
              src="/images/shop/rosecityshirt2.jpeg"
              alt="Rose City Thorn Edition 2026 Match Home Jersey"
              fill
              className="object-contain object-center"
              sizes="100vw"
            />
          </div>
          {/* Desktop: fill the flex-stretch height from the text column */}
          <div className="absolute inset-0 hidden md:block">
            <Image
              src="/images/shop/rosecityshirt2.jpeg"
              alt="Rose City Thorn Edition 2026 Match Home Jersey"
              fill
              className="object-contain object-center"
              sizes="50vw"
            />
          </div>
        </div>

        {/* ── Product details ── */}
        <div
          ref={textRef}
          className="w-full md:w-1/2 flex flex-col justify-center px-6 sm:px-10 md:px-14 lg:px-20 py-12 md:py-20"
          style={{ opacity: 0 }}
        >
          {/* Eyebrow */}
          <p
            className="font-display font-bold tracking-widest uppercase mb-4"
            style={{ color: "var(--color-red)", fontSize: "clamp(1rem, 2vw, 1.3rem)" }}
          >
            2026 Kit · Available Now
          </p>

          {/* Title */}
          <h2
            className="font-display font-black uppercase leading-none mb-6"
            style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", color: "var(--color-black)" }}
          >
            Thorn<br />Edition<br />2026
          </h2>

          {/* Red accent line */}
          <div className="w-12 h-0.5 mb-8" style={{ backgroundColor: "var(--color-red)" }} />

          {/* Includes */}
          <ul className="flex flex-col gap-3 mb-8">
            {shopProduct.includes.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "var(--color-red)" }}
                />
                <span className="font-body text-sm" style={{ color: "rgba(0,0,0,0.6)" }}>
                  {item}
                </span>
              </li>
            ))}
            {shopProduct.addOn && (
              <li className="flex items-center gap-3">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "var(--color-red)" }}
                />
                <span className="font-body text-sm" style={{ color: "rgba(0,0,0,0.6)" }}>
                  {shopProduct.addOn}
                </span>
              </li>
            )}
          </ul>

          {/* Store note */}
          <p className="font-body text-xs mb-8" style={{ color: "rgba(0,0,0,0.4)" }}>
            Sold exclusively at Niky&apos;s Sports<br />
            {shopProduct.storeAddress}
          </p>

          {/* CTA — full width on mobile, auto on desktop */}
          <a
            href={shopProduct.buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center md:inline-flex md:w-auto gap-3 font-display font-bold text-sm tracking-widest uppercase px-10 py-4 transition-all duration-200"
            style={{ backgroundColor: "var(--color-red)", color: "#fff" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-red-dark)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-red)")
            }
          >
            Buy Now →
          </a>
        </div>
      </div>
    </section>
  );
}
