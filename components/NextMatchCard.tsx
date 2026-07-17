"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useClubBranding } from "@/components/ClubBrandingProvider";
import OpponentCrest from "@/components/OpponentCrest";
import type { Fixture } from "@/lib/data";
import { fetchSchedule } from "@/lib/queries";

gsap.registerPlugin(ScrollTrigger);

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/** Converts the stored local match date and 24-hour time into a Date. */
function fixtureToDate(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = (timeStr ?? "00:00").split(":").map(Number);
  return new Date(year, month - 1, day, hours || 0, minutes || 0);
}

function getTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export default function NextMatchCard() {
  const { clubLogoUrl } = useClubBranding();
  const sectionRef = useRef<HTMLElement>(null);
  const [nextFixture, setNextFixture] = useState<Fixture | null>(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    fetchSchedule()
      .then((fixtures) => {
        const now = Date.now();
        const todayStr = new Date().toISOString().split("T")[0];
        const next =
          fixtures.find((fixture) => {
            if (!fixture.date || fixture.date < todayStr) return false;
            const kickoff = fixtureToDate(fixture.date, fixture.time ?? "00:00");
            return !Number.isNaN(kickoff.getTime()) && kickoff.getTime() > now;
          }) ?? null;

        setNextFixture(next);
        if (next) setTime(getTimeLeft(fixtureToDate(next.date, next.time)));
      })
      .catch((error) => {
        console.error("NextMatchCard:", error);
        setNextFixture(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!nextFixture) return;
    const target = fixtureToDate(nextFixture.date, nextFixture.time);
    const timer = window.setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => window.clearInterval(timer);
  }, [nextFixture]);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%" },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [loading]);

  const isMatchDay = Object.values(time).every((value) => value === 0);
  const sponsorLogo = nextFixture?.sponsorLogoUrl?.trim() || null;
  const sponsorName = nextFixture?.sponsorName?.trim() || "Match sponsor";
  const sponsorLink = nextFixture?.sponsorLink?.trim() || null;

  const sponsorLogoElement = sponsorLogo ? (
    <span className="relative block h-12 w-40 sm:h-14 sm:w-52">
      <Image
        src={sponsorLogo}
        alt={`${sponsorName} logo`}
        fill
        sizes="(min-width: 640px) 208px, 160px"
        className="object-contain"
      />
    </span>
  ) : null;

  return (
    <section
      ref={sectionRef}
      className="border-b px-6 py-10 sm:py-12"
      style={{
        backgroundColor: "var(--color-white)",
        borderColor: "#e5e5e5",
        opacity: 0,
      }}
    >
      <div className="mx-auto max-w-5xl text-center">
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
            <div className="mb-4 flex items-center justify-center gap-3 sm:gap-7">
              <OpponentCrest
                name="Rose City FC"
                logoUrl={clubLogoUrl}
                size={140}
                className="[--opponent-crest-size:96px] sm:[--opponent-crest-size:140px]"
              />

              <div className="flex flex-col items-center gap-2" aria-label="versus">
                <span className="h-6 w-0.5 sm:h-8" style={{ backgroundColor: "var(--color-red)" }} />
                <span
                  className="font-display font-black uppercase leading-none"
                  style={{ color: "var(--color-black)", fontSize: "clamp(2.1rem, 6vw, 3.5rem)" }}
                >
                  VS
                </span>
                <span className="h-6 w-0.5 sm:h-8" style={{ backgroundColor: "var(--color-red)" }} />
              </div>

              <OpponentCrest
                name={nextFixture.opponent}
                logoUrl={nextFixture.opponentLogoUrl}
                size={140}
                className="[--opponent-crest-size:96px] sm:[--opponent-crest-size:140px]"
              />
            </div>

            <h2
              className="font-display font-black uppercase italic leading-none"
              style={{
                color: "var(--color-red)",
                fontSize: "clamp(3rem, 9vw, 5.75rem)",
              }}
            >
              Next Match
            </h2>

            {sponsorLogoElement && (
              <div className="mt-4 flex flex-col items-center">
                <p
                  className="font-body mb-1 uppercase tracking-[0.18em]"
                  style={{ color: "var(--color-black)", fontSize: "0.75rem" }}
                >
                  Presented By
                </p>
                {sponsorLink ? (
                  <a
                    href={sponsorLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${sponsorName}`}
                    className="transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                    style={{ outlineColor: "var(--color-red)" }}
                  >
                    {sponsorLogoElement}
                  </a>
                ) : (
                  sponsorLogoElement
                )}
              </div>
            )}

            <div className="mt-8">
              {isMatchDay ? (
                <div
                  className="mx-auto max-w-xl rounded-xl border px-6 py-5"
                  style={{
                    borderColor: "var(--color-red)",
                    backgroundColor: "var(--color-white)",
                  }}
                >
                  <p
                    className="font-display text-3xl font-black uppercase italic tracking-tight"
                    style={{ color: "var(--color-black)" }}
                  >
                    Match Day
                  </p>
                </div>
              ) : (
                <div
                  className="mx-auto max-w-3xl"
                  role="timer"
                  aria-label={`${time.days} days, ${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds until kickoff`}
                >
                  <div className="flex items-start justify-center gap-1.5 sm:gap-4">
                    {[
                      { value: time.days, label: "Days" },
                      { value: time.hours, label: "Hours" },
                      { value: time.minutes, label: "Minutes" },
                      { value: time.seconds, label: "Seconds" },
                    ].map(({ value, label }, index) => (
                      <div key={label} className="contents">
                        {index > 0 && (
                          <span
                            aria-hidden="true"
                            className="mt-[2.05rem] h-1.5 w-1.5 flex-none rounded-full sm:mt-[3.3rem] sm:h-2 sm:w-2"
                            style={{ backgroundColor: "var(--color-red)" }}
                          />
                        )}
                        <div className="flex min-w-0 flex-1 flex-col items-center sm:flex-none">
                          <div
                            className="flex h-[4.5rem] w-full min-w-0 items-center justify-center rounded-lg border sm:h-[7rem] sm:w-[8rem] sm:rounded-xl"
                            style={{
                              borderColor: "var(--color-red)",
                              backgroundColor: "var(--color-black)",
                            }}
                          >
                            <span
                              className="font-display block min-w-[2ch] tabular-nums leading-none"
                              style={{
                                color: "var(--color-white)",
                                fontSize: "clamp(1.7rem, 6vw, 3.35rem)",
                                fontWeight: 700,
                                letterSpacing: "-0.04em",
                              }}
                            >
                              {pad(value)}
                            </span>
                          </div>
                          <span
                            className="font-display mt-2 text-[0.42rem] font-bold uppercase tracking-[0.08em] sm:mt-3 sm:text-[0.58rem] sm:tracking-[0.14em]"
                            style={{ color: "var(--color-black)" }}
                          >
                            {label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <Link
          href="/schedule"
          className="mt-6 inline-block border-2 px-8 py-2.5 font-display text-xs font-bold uppercase tracking-widest transition-all duration-200"
          style={{ borderColor: "var(--color-black)", color: "var(--color-black)" }}
          onMouseEnter={(event) => {
            event.currentTarget.style.backgroundColor = "var(--color-black)";
            event.currentTarget.style.color = "var(--color-white)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.backgroundColor = "transparent";
            event.currentTarget.style.color = "var(--color-black)";
          }}
        >
          Full Schedule
        </Link>
      </div>
    </section>
  );
}
