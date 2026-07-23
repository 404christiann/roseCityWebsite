"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const EXPLORE_CARDS = [
  {
    title: "About Club",
    description: "Our founding story, mission, and the values that drive Rose City FC on and off the pitch.",
    href: "/club/about",
    available: true,
  },
  {
    title: "Club History",
    description: "Season-by-season milestones since our founding, from the boardroom to the UPSL final.",
    href: "#",
    available: false,
  },
  {
    title: "Front Office",
    description: "Meet the ownership group and front office staff building Rose City FC's future.",
    href: "#",
    available: false,
  },
];

const CLUB_STATS = [
  { value: "2021", label: "Founded" },
  { value: "Pasadena, CA", label: "Home City" },
  { value: "UPSL", label: "League" },
  { value: "2024", label: "Champions" },
];

export default function ClubPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
      gsap.fromTo(
        introRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.15 }
      );
      gsap.fromTo(
        statsRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: statsRef.current, start: "top 85%" },
        }
      );
      gsap.fromTo(
        cardsRef.current?.children ?? [],
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1,
          scrollTrigger: { trigger: cardsRef.current, start: "top 85%" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div ref={heroRef} className="pt-36 pb-14 px-6 lg:px-10 max-w-7xl mx-auto" style={{ opacity: 0 }}>
        <p
          className="font-display font-bold tracking-widest uppercase mb-3"
          style={{ color: "var(--color-red)", fontSize: "clamp(0.85rem, 1.5vw, 1.1rem)" }}
        >
          Rose City FC
        </p>
        <h1
          className="font-display font-black uppercase leading-none"
          style={{ fontSize: "clamp(4rem, 10vw, 8rem)", color: "var(--color-black)" }}
        >
          The Club
        </h1>
        <div className="w-16 h-1 mt-6" style={{ backgroundColor: "var(--color-red)" }} />
      </div>

      {/* Intro */}
      <div ref={introRef} className="px-6 lg:px-10 max-w-7xl mx-auto pb-16" style={{ opacity: 0 }}>
        <p
          className="font-body leading-relaxed max-w-3xl"
          style={{ color: "rgba(20,20,20,0.7)", fontSize: "clamp(1rem, 1.6vw, 1.2rem)" }}
        >
          {/* Placeholder copy — replace with the real club mission statement. */}
          Rose City FC is more than a scoreline. Built in Pasadena and playing for the City of
          Roses, we exist to give this community a club worth rallying behind — competitive on
          the pitch, welcoming off it, and rooted in the neighborhoods that show up every
          matchday.
        </p>
      </div>

      {/* Stats strip */}
      <div
        ref={statsRef}
        className="px-6 lg:px-10 max-w-7xl mx-auto pb-20"
        style={{ opacity: 0 }}
      >
        <div
          className="grid grid-cols-2 sm:grid-cols-4 rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(20,20,20,0.08)" }}
        >
          {CLUB_STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="px-6 py-8 text-center"
              style={{
                borderLeft: i === 0 ? "none" : "1px solid rgba(20,20,20,0.08)",
                borderTop: "1px solid rgba(20,20,20,0.08)",
              }}
            >
              <p
                className="font-display font-black uppercase leading-none mb-2"
                style={{ fontSize: "clamp(1.3rem, 2.4vw, 1.9rem)", color: "var(--color-black)" }}
              >
                {stat.value}
              </p>
              <p
                className="font-body text-xs font-semibold tracking-widest uppercase"
                style={{ color: "rgba(20,20,20,0.45)" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Explore section */}
      <div className="px-6 lg:px-10 max-w-7xl mx-auto pb-32">
        <p
          className="font-display font-bold tracking-widest uppercase mb-8"
          style={{ color: "var(--color-black)", fontSize: "clamp(0.8rem, 1.3vw, 1rem)" }}
        >
          Explore
        </p>
        <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {EXPLORE_CARDS.map((card) => {
            const CardInner = (
              <>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3
                    className="font-display font-black uppercase leading-tight"
                    style={{ fontSize: "1.35rem", color: "var(--color-black)" }}
                  >
                    {card.title}
                  </h3>
                  {!card.available && (
                    <span
                      className="font-body text-[0.65rem] font-bold tracking-widest uppercase px-2 py-1 rounded-full flex-shrink-0"
                      style={{ color: "rgba(20,20,20,0.5)", backgroundColor: "rgba(20,20,20,0.06)" }}
                    >
                      Coming Soon
                    </span>
                  )}
                </div>
                <p
                  className="font-body leading-relaxed"
                  style={{ color: "rgba(20,20,20,0.6)", fontSize: "0.95rem" }}
                >
                  {card.description}
                </p>
                {card.available && (
                  <p
                    className="font-body text-xs font-bold tracking-widest uppercase mt-5"
                    style={{ color: "var(--color-red)" }}
                  >
                    Read More →
                  </p>
                )}
              </>
            );

            const cardClassName =
              "block h-full rounded-xl p-6 transition-all duration-300";
            const cardStyle = {
              border: "1px solid rgba(20,20,20,0.08)",
              opacity: card.available ? 1 : 0.6,
              cursor: card.available ? "pointer" : "default",
            };

            return card.available ? (
              <Link
                key={card.title}
                href={card.href}
                className={`${cardClassName} hover:shadow-lg hover:-translate-y-1`}
                style={cardStyle}
              >
                {CardInner}
              </Link>
            ) : (
              <div key={card.title} className={cardClassName} style={cardStyle}>
                {CardInner}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
