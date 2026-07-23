"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const VALUES = [
  {
    title: "Community",
    description: "Rose City FC belongs to Pasadena — every matchday is a reason for this city to gather.",
  },
  {
    title: "Competition",
    description: "We compete to win. Every season, every match, every training session is a step toward silverware.",
  },
  {
    title: "Character",
    description: "On the pitch and off it, the club is built by players and staff who represent this crest with pride.",
  },
];

export default function AboutClubPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
      gsap.fromTo(
        storyRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.15 }
      );
      gsap.fromTo(
        valuesRef.current?.children ?? [],
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1,
          scrollTrigger: { trigger: valuesRef.current, start: "top 85%" },
        }
      );
      gsap.fromTo(
        closingRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: closingRef.current, start: "top 85%" },
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
          The Club
        </p>
        <h1
          className="font-display font-black uppercase leading-none"
          style={{ fontSize: "clamp(3.4rem, 9vw, 7rem)", color: "var(--color-black)" }}
        >
          About Club
        </h1>
        <div className="w-16 h-1 mt-6" style={{ backgroundColor: "var(--color-red)" }} />
      </div>

      {/* Story */}
      <div
        ref={storyRef}
        className="px-6 lg:px-10 max-w-7xl mx-auto pb-24 grid md:grid-cols-5 gap-10 md:gap-16"
        style={{ opacity: 0 }}
      >
        <div className="md:col-span-3 space-y-5">
          <p className="font-body leading-relaxed" style={{ color: "rgba(20,20,20,0.7)", fontSize: "clamp(1rem, 1.5vw, 1.1rem)" }}>
            {/* Placeholder founding story — replace with the real club history. */}
            Rose City FC was founded to give Pasadena a semi-professional club it could call
            its own. What started as a small group with a shared idea has grown into a full
            roster, a coaching staff, and a matchday community that fills the stands at Arcadia
            City Hall Stadium.
          </p>
          <p className="font-body leading-relaxed" style={{ color: "rgba(20,20,20,0.7)", fontSize: "clamp(1rem, 1.5vw, 1.1rem)" }}>
            Since our first season in the UPSL, the club has built its identity on disciplined,
            attacking soccer and a refusal to be outworked. That identity carried us to a UPSL
            Championship in 2024 — a milestone we treat as a beginning, not a destination.
          </p>
          <p className="font-body leading-relaxed" style={{ color: "rgba(20,20,20,0.7)", fontSize: "clamp(1rem, 1.5vw, 1.1rem)" }}>
            Today, Rose City FC is building toward the next level — investing in player
            development, deepening our roots in the Pasadena community, and giving local
            talent a real pathway forward in the sport.
          </p>
        </div>

        <div className="md:col-span-2">
          <div
            className="rounded-xl p-8 h-full flex flex-col justify-center"
            style={{ backgroundColor: "var(--color-black)" }}
          >
            <p
              className="font-display font-black uppercase leading-tight mb-4"
              style={{ fontSize: "clamp(1.3rem, 2vw, 1.7rem)", color: "#ffffff" }}
            >
              &ldquo;This club exists for the City of Roses.&rdquo;
            </p>
            <p
              className="font-body text-sm font-semibold tracking-widest uppercase"
              style={{ color: "var(--color-red)" }}
            >
              Rose City FC
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="px-6 lg:px-10 max-w-7xl mx-auto pb-24">
        <p
          className="font-display font-bold tracking-widest uppercase mb-8"
          style={{ color: "var(--color-black)", fontSize: "clamp(0.8rem, 1.3vw, 1rem)" }}
        >
          Our Values
        </p>
        <div ref={valuesRef} className="grid sm:grid-cols-3 gap-5">
          {VALUES.map((value, i) => (
            <div
              key={value.title}
              className="rounded-xl p-6"
              style={{ border: "1px solid rgba(20,20,20,0.08)" }}
            >
              <p
                className="font-display font-black uppercase leading-none mb-4"
                style={{ fontSize: "1.6rem", color: "var(--color-red)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3
                className="font-display font-black uppercase leading-tight mb-3"
                style={{ fontSize: "1.15rem", color: "var(--color-black)" }}
              >
                {value.title}
              </h3>
              <p className="font-body leading-relaxed" style={{ color: "rgba(20,20,20,0.6)", fontSize: "0.92rem" }}>
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Closing */}
      <div ref={closingRef} className="px-6 lg:px-10 max-w-7xl mx-auto pb-32 text-center" style={{ opacity: 0 }}>
        <p
          className="font-display font-black uppercase leading-tight max-w-3xl mx-auto mb-8"
          style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)", color: "var(--color-black)" }}
        >
          Join us at Arcadia City Hall Stadium this season.
        </p>
        <Link
          href="/schedule"
          className="inline-block font-body text-sm font-bold tracking-widest uppercase px-8 py-4 rounded-full transition-colors duration-300"
          style={{ backgroundColor: "var(--color-black)", color: "#ffffff" }}
        >
          See the Schedule
        </Link>
      </div>
    </div>
  );
}
