"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PlayerCard from "@/components/PlayerCard";
import StaffCard from "@/components/StaffCard";
import { goalkeepers, defenders, midfielders, forwards, staff } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

const groups = [
  { label: "Goalkeepers", players: goalkeepers },
  { label: "Defenders",   players: defenders   },
  { label: "Midfielders", players: midfielders },
  { label: "Forwards",    players: forwards    },
];

function RosterGroup({ label, players }: { label: string; players: typeof goalkeepers }) {
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        groupRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: groupRef.current, start: "top 85%" },
        }
      );
    }, groupRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={groupRef} className="mb-20" style={{ opacity: 0 }}>
      {/* Section label */}
      <div className="flex items-center gap-4 mb-8">
        <h2
          className="font-display font-black uppercase leading-none"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--color-black)" }}
        >
          {label}
        </h2>
        <div className="flex-1 h-px" style={{ backgroundColor: "#e5e5e5" }} />
        <span
          className="font-display text-sm font-semibold tracking-widest uppercase"
          style={{ color: "var(--color-gray-mid)" }}
        >
          {players.length}
        </span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {players.map((player) => (
          <PlayerCard key={player.number} player={player} />
        ))}
      </div>
    </div>
  );
}

export default function RosterPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const staffRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      heroRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.2 }
    );

    const ctx = gsap.context(() => {
      gsap.fromTo(
        staffRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: staffRef.current, start: "top 85%" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div style={{ backgroundColor: "var(--color-white)" }}>
      {/* Page hero */}
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
          The Squad
        </h1>
        <div className="w-16 h-1 mt-6" style={{ backgroundColor: "var(--color-red)" }} />
      </div>

      {/* Player groups */}
      <div className="px-6 lg:px-10 max-w-7xl mx-auto pb-10">
        {groups.map((g) => (
          <RosterGroup key={g.label} label={g.label} players={g.players} />
        ))}
      </div>

      {/* Technical Staff */}
      <div
        className="px-6 lg:px-10 max-w-7xl mx-auto pb-24"
      >
        <div ref={staffRef} style={{ opacity: 0 }}>
          <div className="flex items-center gap-4 mb-8">
            <h2
              className="font-display font-black uppercase leading-none"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--color-black)" }}
            >
              Technical Staff
            </h2>
            <div className="flex-1 h-px" style={{ backgroundColor: "#e5e5e5" }} />
            <span
              className="font-display text-sm font-semibold tracking-widest uppercase"
              style={{ color: "var(--color-gray-mid)" }}
            >
              {staff.length}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {staff.map((member) => (
              <StaffCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
