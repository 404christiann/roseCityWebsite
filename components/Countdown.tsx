"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fetchSchedule } from "@/lib/queries";
import { Fixture } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/**
 * Converts "YYYY-MM-DD" + "HH:MM" into a Date object.
 * Uses the multi-arg constructor — reliable on all browsers including Safari.
 */
function fixtureToDate(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = (timeStr ?? "00:00").split(":").map(Number);
  return new Date(year, month - 1, day, hours || 0, minutes || 0);
}

function getTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** "2026-05-08" → "May 8, 2026" */
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
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

export default function Countdown() {
  const sectionRef = useRef<HTMLElement>(null);
  const [nextFixture, setNextFixture] = useState<Fixture | null>(null);
  const [loading, setLoading]         = useState(true);
  const [time, setTime]               = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Load schedule and find the next upcoming fixture
  useEffect(() => {
    fetchSchedule().then((fixtures) => {
      const now = Date.now();
      // todayStr e.g. "2026-05-05" — used to cheaply skip clearly-past dates
      // before doing the heavier Date parse + comparison
      const todayStr = new Date().toISOString().split("T")[0];

      const next = fixtures.find((f) => {
        // 1. Cheap string guard: skip any date before today
        if (!f.date || f.date < todayStr) return false;
        // 2. Precise check: skip if the exact kickoff time has already passed
        const d = fixtureToDate(f.date, f.time ?? "00:00");
        if (isNaN(d.getTime())) return false;
        return d.getTime() > now;
      }) ?? null;

      setNextFixture(next);
      if (next) setTime(getTimeLeft(fixtureToDate(next.date, next.time)));
      setLoading(false);
    });
  }, []);

  // Tick countdown every second
  useEffect(() => {
    if (!nextFixture) return;
    const target = fixtureToDate(nextFixture.date, nextFixture.time);
    const tick = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(tick);
  }, [nextFixture]);

  // GSAP scroll animation
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

  const isMatchPast =
    time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;

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
          className="font-display font-bold tracking-widest uppercase mb-4"
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
            <h2
              className="font-display font-black uppercase leading-none mb-6"
              style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", color: "var(--color-black)" }}
            >
              Rose City FC vs {nextFixture.opponent}
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0 mb-10">
              <span
                className="font-display font-semibold tracking-wide uppercase"
                style={{ color: "var(--color-black)", fontSize: "clamp(1rem, 2vw, 1.2rem)" }}
              >
                {formatDate(nextFixture.date)}
              </span>
              <span className="hidden sm:block mx-4 text-gray-300">|</span>
              <span
                className="font-display font-semibold tracking-wide uppercase"
                style={{ color: "var(--color-black)", fontSize: "clamp(1rem, 2vw, 1.2rem)" }}
              >
                {formatTime(nextFixture.time)}
              </span>
              <span className="hidden sm:block mx-4 text-gray-300">|</span>
              <span
                className="font-body"
                style={{ color: "var(--color-gray-mid)", fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)" }}
              >
                {nextFixture.venue}
              </span>
            </div>

            {isMatchPast ? (
              <p
                className="font-display text-3xl font-bold uppercase"
                style={{ color: "var(--color-green)" }}
              >
                Match Day!
              </p>
            ) : (
              <div className="flex items-start justify-center gap-4 sm:gap-10">
                {[
                  { value: time.days,    label: "Days" },
                  { value: time.hours,   label: "Hours" },
                  { value: time.minutes, label: "Min" },
                  { value: time.seconds, label: "Sec" },
                ].map(({ value, label }) => (
                  <div key={label} className="flex flex-col items-center">
                    <span
                      className="font-display font-black tabular-nums leading-none"
                      style={{
                        fontSize: "clamp(3rem, 8vw, 6rem)",
                        color: "var(--color-green)",
                        minWidth: "2ch",
                        display: "block",
                      }}
                    >
                      {pad(value)}
                    </span>
                    <span
                      className="font-display text-xs font-semibold tracking-widest uppercase mt-1"
                      style={{ color: "var(--color-gray-mid)" }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
