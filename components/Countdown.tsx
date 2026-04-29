"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { nextMatch } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft {
  // nextMatch.date = "May 2, 2026", nextMatch.time = "8:00 PM"
  const target = new Date(`${nextMatch.date} ${nextMatch.time}`);
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function Countdown() {
  const [time, setTime] = useState<TimeLeft>(getTimeLeft());
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const tick = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const isMatchPast = time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;

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

        <h2
          className="font-display font-black uppercase leading-none mb-6"
          style={{
            fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
            color: "var(--color-black)",
          }}
        >
          Rose City FC vs {nextMatch.opponent}
        </h2>

        {/* Date / time / venue — broken into clear pieces */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0 mb-10">
          <span
            className="font-display font-semibold tracking-wide uppercase"
            style={{ color: "var(--color-black)", fontSize: "clamp(1rem, 2vw, 1.2rem)" }}
          >
            {nextMatch.date}
          </span>
          <span className="hidden sm:block mx-4 text-gray-300">|</span>
          <span
            className="font-display font-semibold tracking-wide uppercase"
            style={{ color: "var(--color-black)", fontSize: "clamp(1rem, 2vw, 1.2rem)" }}
          >
            {nextMatch.time}
          </span>
          <span className="hidden sm:block mx-4 text-gray-300">|</span>
          <span
            className="font-body"
            style={{ color: "var(--color-gray-mid)", fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)" }}
          >
            {nextMatch.venue}
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
              { value: time.days, label: "Days" },
              { value: time.hours, label: "Hours" },
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

        <Link
          href="/schedule"
          className="inline-block mt-10 font-display font-bold text-xs tracking-widest uppercase px-8 py-3 border-2 transition-all duration-200"
          style={{
            borderColor: "var(--color-green)",
            color: "var(--color-green)",
          }}
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
