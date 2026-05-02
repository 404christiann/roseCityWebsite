"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FixtureRow from "@/components/FixtureRow";
import { fetchSchedule } from "@/lib/queries";
import { Fixture } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

/**
 * Returns the UTC Date of the fixture's kickoff, treating the game time
 * as America/Los_Angeles (PST/PDT). A game is only "past" once it has
 * actually started in LA time.
 */
function fixtureDateTime(fixture: Fixture): Date {
  const [year, month, day] = fixture.date.split("-").map(Number);

  // Parse "8:00 PM" → 24h hours + minutes
  const timeMatch = fixture.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  let hours = 0, minutes = 0;
  if (timeMatch) {
    hours = parseInt(timeMatch[1]);
    minutes = parseInt(timeMatch[2]);
    if (timeMatch[3].toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (timeMatch[3].toUpperCase() === "AM" && hours === 12) hours = 0;
  }

  // Build a UTC Date as if the hours/minutes are in UTC, then shift by the
  // actual LA→UTC offset at that moment (handles PST −8 and PDT −7 correctly).
  const approxUTC = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const utcStr = approxUTC.toLocaleString("en-US", { timeZone: "UTC" });
  const laStr  = approxUTC.toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
  const offsetMs = new Date(utcStr).getTime() - new Date(laStr).getTime();

  return new Date(Date.UTC(year, month - 1, day, hours, minutes) + offsetMs);
}

function getNextMatchIndex(fixtures: Fixture[], now: Date): number {
  const idx = fixtures.findIndex((f) => fixtureDateTime(f) > now);
  return idx === -1 ? fixtures.length : idx;
}

export default function SchedulePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [now, setNow]           = useState(() => new Date());

  // Tick every 30 seconds so past/next status updates live
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetchSchedule()
      .then(setFixtures)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
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
  }, [loading]);

  const nextMatchIdx = useMemo(
    () => getNextMatchIndex(fixtures, now),
    [fixtures, now]
  );

  return (
    <div style={{ backgroundColor: "var(--color-white)" }}>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center" style={{ minHeight: "100vh" }}>
          <p
            className="font-display font-black uppercase tracking-widest"
            style={{ color: "var(--color-gray-mid)", fontSize: "1rem" }}
          >
            Loading fixtures…
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center justify-center" style={{ minHeight: "100vh" }}>
          <p
            className="font-display font-bold uppercase tracking-widest"
            style={{ color: "var(--color-red)", fontSize: "0.9rem" }}
          >
            Failed to load schedule. Please refresh.
          </p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
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
              {fixtures.map((fixture, i) => (
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
        </>
      )}
    </div>
  );
}
