"use client";

import { useState } from "react";
import Image from "next/image";
import { Player, GoalkeeperStats, FieldStats } from "@/lib/data";
import PlayerModal from "@/components/PlayerModal";

function isGK(stats: GoalkeeperStats | FieldStats): stats is GoalkeeperStats {
  return "saves" in stats;
}

const FLAG_CODES: Record<string, string> = {
  "🇲🇽": "mx",
  "🇺🇸": "us",
  "🇨🇲": "cm",
};

export default function PlayerCard({ player }: { player: Player }) {
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const stats = player.stats;
  const gk = isGK(stats);

  return (
    <>
      <div
        className="relative overflow-hidden cursor-pointer group"
        style={{ backgroundColor: "var(--color-black)", aspectRatio: "3/4" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setModalOpen(true)}
      >
        {/* Player photo */}
        <Image
          src={player.image}
          alt={player.name}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Always-visible gradient + info at bottom */}
        <div
          className="absolute inset-x-0 bottom-0 pt-16 pb-4 px-4"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.5) 60%, transparent 100%)",
            zIndex: 2,
          }}
        >
          {/* Jersey number */}
          <span
            className="font-display font-black leading-none block"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              color: "var(--color-red)",
              lineHeight: 1,
            }}
          >
            {player.number}
          </span>

          {/* Name + captain badge */}
          <h3
            className="font-display font-bold uppercase text-white leading-tight mt-1"
            style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}
          >
            {player.name}
            {player.caption && (
              <span className="ml-2 text-sm" style={{ color: "var(--color-red)" }}>
                {player.caption}
              </span>
            )}
          </h3>

          {/* Position + flag */}
          <div className="flex items-center gap-2 mt-1">
            <span
              className="font-display text-xs tracking-widest uppercase"
              style={{ color: "var(--color-gray-mid)" }}
            >
              {player.position}
            </span>
            {player.nationality && FLAG_CODES[player.nationality] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://flagcdn.com/w40/${FLAG_CODES[player.nationality]}.png`}
                alt={player.nationality}
                width={28}
                height={21}
                style={{ display: "inline-block", borderRadius: "2px", flexShrink: 0 }}
              />
            )}
          </div>

          {/* Stats overlay — slides up on hover */}
          <div
            className="overflow-hidden"
            style={{
              maxHeight: hovered ? "120px" : "0px",
              opacity: hovered ? 1 : 0,
              transition: "max-height 0.35s ease, opacity 0.3s ease",
            }}
          >
            <div
              className="mt-3 pt-3 grid grid-cols-3 gap-2 text-center"
              style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
            >
              {isGK(stats) ? (
                <>
                  <StatBox label="Saves" value={stats.saves} />
                  <StatBox label="Clean" value={stats.cleanSheets} />
                  <StatBox label="Mins" value={stats.mins} />
                </>
              ) : (
                <>
                  <StatBox label="Goals" value={stats.goals} />
                  <StatBox label="Assists" value={stats.assists} />
                  <StatBox label="Mins" value={stats.mins} />
                </>
              )}
            </div>
            {/* Tap hint */}
            <p
              className="font-display text-xs tracking-widest uppercase text-center mt-3"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Tap for full profile
            </p>
          </div>
        </div>
      </div>

      {/* Full profile modal */}
      {modalOpen && (
        <PlayerModal player={player} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display font-black text-white text-lg leading-none">{value}</span>
      <span className="font-display text-xs tracking-widest uppercase mt-0.5" style={{ color: "var(--color-gray-mid)" }}>
        {label}
      </span>
    </div>
  );
}
