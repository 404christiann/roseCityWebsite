"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FixtureRow from "@/components/FixtureRow";
import { schedule } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

// Parse "May 2, 2026" style dates into a comparable Date object
// We treat each fixture as ending at midnight after match time
function fixtureDate(fixture: { date: string; time: string }): Date {
  return new Date(`${fixture.date} ${fixture.time}`);
}

function getNextMatchIndex(): number {
  const now = new Date();
  const idx = schedule.findIndex((f) => fixtureDate(f) >= now);
  return idx === -1 ? schedule.length : idx; // -1 means all matches played
}

export default function SchedulePage() {
  const heroRef      = useRef<HTMLDivElement>(null);
  const listRef      = useRef<HTMLDivElement>(null);
  const nextMatchIdx = getNextMatchIndex();

  useEffect(() => {
    gsap.fromTo(
      heroRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.15 }
    );

    const ctx = gsap.context(() => {
      gsap.fromTo(
        listRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: listRef.current, start: "top 85%" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div style={{ backgroundColor: "var(--color-white)" }}>

      {/* Hero */}
      <div
        ref={heroRef}
        className="pt-36 pb-14 px-6 lg:px-10 max-w-7xl mx-auto"
        style={{ opacity: 0 }}
      >
        <p
          className="font-display font-bold tracking-widest uppercase mb-3"
          style={{ color: "var(--color-red)", fontSize: "clamp(0.85rem, 1.5vw, 1.1rem)" }}
        >
          2025 – 2026 Season
        </p>
        <h1
          className="font-display font-black uppercase leading-none"
          style={{ fontSize: "clamp(4rem, 10vw, 8rem)", color: "var(--color-black)" }}
        >
          Fixtures
        </h1>
        <div className="w-16 h-1 mt-6" style={{ backgroundColor: "var(--color-red)" }} />
      </div>

      {/* Fixture list */}
      <div
        ref={listRef}
        className="max-w-7xl mx-auto pb-32"
        style={{ opacity: 0 }}
      >
        {/* Column headers */}
        <div
          className="hidden sm:flex items-center px-6 md:px-8 py-3"
          style={{ borderBottom: "2px solid var(--color-black)" }}
        >
          <span className="w-8 flex-shrink-0" />
          <span
            className="font-display font-black text-sm tracking-widest uppercase w-44 flex-shrink-0"
            style={{ color: "var(--color-black)" }}
          >
            Date · Time
          </span>
          <span
            className="font-display font-black text-sm tracking-widest uppercase flex-1 px-6"
            style={{ color: "var(--color-black)" }}
          >
            Opponent
          </span>
        </div>

        {/* Rows */}
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
          {schedule.map((fixture, i) => (
            <FixtureRow
              key={i}
              fixture={fixture}
              isNext={i === nextMatchIdx}
              isPast={i < nextMatchIdx}
              index={i}
            />
          ))}
        </div>

        {/* Footer note */}
        <p
          className="font-display font-bold text-sm tracking-widest uppercase text-center mt-10 px-6"
          style={{ color: "var(--color-black)" }}
        >
          All home games at Arcadia City Hall Stadium · 240 W Huntington Dr, Arcadia, CA
        </p>
      </div>
    </div>
  );
}
