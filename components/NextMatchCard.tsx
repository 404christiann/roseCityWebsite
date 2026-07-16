"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fetchSchedule } from "@/lib/queries";
import { Fixture } from "@/lib/data";
import { ROSE_CITY_PATCH_URL } from "@/lib/roster-images";
import OpponentCrest from "@/components/OpponentCrest";

gsap.registerPlugin(ScrollTrigger);

/** Converts "YYYY-MM-DD" + "HH:MM" into a Date object using the multi-arg constructor — reliable on all browsers including Safari. */
function fixtureToDate(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = (timeStr ?? "00:00").split(":").map(Number);
  return new Date(year, month - 1, day, hours || 0, minutes || 0);
}

/** "2026-05-08" → "Saturday" */
function formatDayOfWeek(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { weekday: "long" });
}

/** "2026-05-08" → "Sat, May 8" */
function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
}

/** "19:00" → "7:00 PM" */
function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  const [hourStr, minStr] = timeStr.split(":");
  let hours = parseInt(hourStr, 10);
  const minutes = parseInt(minStr, 10);
  const ampm = hours >= 12 ? "PM" : "AM";
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${hours}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

export default function NextMatchCard() {
  const sectionRef = useRef<HTMLElement>(null);
  const [nextFixture, setNextFixture] = useState<Fixture | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule().then((fixtures) => {
      const now = Date.now();
      const todayStr = new Date().toISOString().split("T")[0];

      const next = fixtures.find((f) => {
        if (!f.date || f.date < todayStr) return false;
        const d = fixtureToDate(f.date, f.time ?? "00:00");
        if (isNaN(d.getTime())) return false;
        return d.getTime() > now;
      }) ?? null;

      setNextFixture(next);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [loading]);

  return (
    <section
      ref={sectionRef}
      className="py-20 px-6 border-b"
      style={{
        backgroundColor: "var(--color-white)",
        borderColor: "#e5e5e5",
        opacity: 0,
      }}
    >
      <div className="max-w-5xl mx-auto text-center">
        {/* Eyebrow */}
        <p
          className="font-display font-bold tracking-widest uppercase mb-8"
          style={{ color: "var(--color-red)", fontSize: "clamp(0.85rem, 1.5vw, 1.1rem)" }}
        >
          Next Match
        </p>

        {loading ? (
          <p
            className="font-display font-bold uppercase tracking-widest"
            style={{ color: "var(--color-gray-mid)", fontSize: "1rem" }}
          >
            Loading…
          </p>
        ) : !nextFixture ? (
          <p
            className="font-display font-bold uppercase tracking-widest"
            style={{ color: "var(--color-gray-mid)", fontSize: "1rem" }}
          >
            No upcoming fixtures scheduled.
          </p>
        ) : (
          <>
            {/* Crests + VS */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
              <OpponentCrest name="Rose City FC" logoUrl={ROSE_CITY_PATCH_URL} size={96} />
              <span
                className="font-display font-black uppercase italic"
                style={{ color: "var(--color-red)", fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)" }}
              >
                VS
              </span>
              <OpponentCrest name={nextFixture.opponent} logoUrl={nextFixture.opponentLogoUrl} size={96} />
            </div>

            {/* Competition pill */}
            {nextFixture.competition && (
              <span
                className="inline-block font-display font-bold uppercase tracking-widest px-4 py-1.5 mb-6"
                style={{
                  backgroundColor: "var(--color-black)",
                  color: "var(--color-white)",
                  fontSize: "clamp(0.7rem, 1.2vw, 0.85rem)",
                }}
              >
                {nextFixture.competition}
              </span>
            )}

            {/* Day of week */}
            <h2
              className="font-display font-black uppercase italic leading-none mb-4"
              style={{ fontSize: "clamp(3rem, 9vw, 6.5rem)", color: "var(--color-red)" }}
            >
              {formatDayOfWeek(nextFixture.date)}
            </h2>

            {/* Date · kickoff · venue */}
            <p
              className="font-display font-semibold tracking-wide uppercase"
              style={{ color: "var(--color-black)", fontSize: "clamp(0.9rem, 1.8vw, 1.1rem)" }}
            >
              {formatShortDate(nextFixture.date)}
              <span style={{ color: "var(--color-gray-mid)" }}> · </span>
              Kickoff {formatTime(nextFixture.time)}
              <span style={{ color: "var(--color-gray-mid)" }}> · </span>
              {nextFixture.venue}
            </p>
          </>
        )}

        <Link
          href="/schedule"
          className="inline-block mt-10 font-display font-bold text-xs tracking-widest uppercase px-8 py-3 border-2 transition-all duration-200"
          style={{ borderColor: "var(--color-green)", color: "var(--color-green)" }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = "var(--color-green)";
            el.style.color = "var(--color-white)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = "transparent";
            el.style.color = "var(--color-green)";
          }}
        >
          Full Schedule
        </Link>
      </div>
    </section>
  );
}
