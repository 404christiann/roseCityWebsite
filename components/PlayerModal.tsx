"use client";

import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import Image from "next/image";
import { Player, GoalkeeperStats, FieldStats } from "@/lib/data";
import { FLAG_CODES } from "@/lib/flags";

function isGK(stats: GoalkeeperStats | FieldStats): stats is GoalkeeperStats {
  return "saves" in stats;
}


interface Props {
  player: Player;
  onClose: () => void;
}

function getSeasonLabel(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-based
  // UPSL spring season runs Jan–Aug: season started previous year
  // UPSL fall season runs Sep–Dec: season started this year
  const startYear = month <= 8 ? year - 1 : year;
  const endYear = startYear + 1;
  return `${startYear}–${String(endYear).slice(2)} Season`;
}

export default function PlayerModal({ player, onClose }: Props) {
  const stats = player.stats;
  const gk = isGK(stats);
  const flagCode = player.nationality ? FLAG_CODES[player.nationality] : null;
  const seasonLabel = getSeasonLabel();

  return (
    <Dialog open={true} onClose={onClose} className="relative z-[100]">

      {/* Backdrop */}
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm duration-300 ease-out data-closed:opacity-0"
      />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-end md:items-center justify-center">
        <DialogPanel
          transition
          className="
            w-full md:w-[680px] flex flex-col md:flex-row overflow-hidden
            bg-[#0e0e0e]
            rounded-t-2xl md:rounded-2xl
            duration-300 ease-out
            data-closed:opacity-0
            data-closed:translate-y-8
            md:data-closed:translate-y-4
            md:data-closed:scale-95
          "
          style={{ maxHeight: "90vh" }}
        >
          {/* Photo — drag handle overlaid on top for mobile */}
          <div
            className="relative flex-shrink-0 w-full md:w-52 h-[340px] md:h-[240px] rounded-t-2xl md:rounded-none overflow-hidden"
            style={{ WebkitTransform: "translateZ(0)" }}
          >
            <Image
              src={player.image}
              alt={player.name}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 208px"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(14,14,14,0.95) 0%, transparent 55%)" }}
            />
            {/* Drag handle overlaid at top of photo — mobile only */}
            <div className="md:hidden absolute top-0 left-0 right-0 flex justify-center pt-3">
              <div className="w-9 h-1 rounded-full bg-white/30" />
            </div>
            {/* Close button — top right, mobile only */}
            <button
              onClick={onClose}
              className="md:hidden absolute top-3 right-4 flex items-center justify-center"
              style={{ color: "#000000" }}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
            <span
              className="absolute bottom-3 left-4 font-display font-black leading-none select-none"
              style={{ fontSize: "5rem", color: "var(--color-red)", lineHeight: 1, opacity: 0.9 }}
            >
              {player.number}
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col">

            {/* Close button */}
            <button
              onClick={onClose}
              className="hidden md:flex self-end items-center gap-1.5 mb-3 font-display text-xs tracking-widest uppercase transition-opacity duration-200 opacity-40 hover:opacity-100"
              style={{ color: "white" }}
              aria-label="Close"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Close
            </button>

            {/* Name + flag */}
            <div className="flex items-start gap-3 mb-0.5">
              <h2
                className="font-display font-black uppercase text-white leading-none flex-1"
                style={{ fontSize: "clamp(1.5rem, 5vw, 2rem)" }}
              >
                {player.name}
                {player.caption && (
                  <span className="ml-2 text-base" style={{ color: "var(--color-red)" }}>
                    {player.caption}
                  </span>
                )}
              </h2>
              {flagCode && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://flagcdn.com/w40/${flagCode}.png`}
                  alt={player.nationality}
                  width={34}
                  height={25}
                  style={{ borderRadius: 3, flexShrink: 0, marginTop: 4 }}
                />
              )}
            </div>

            {/* Position */}
            <p
              className="font-display text-xs tracking-widest uppercase mb-1"
              style={{ color: "var(--color-red)" }}
            >
              {player.position}
            </p>

            {/* Pronunciation */}
            {player.pronunciation && (
              <p className="font-body text-xs italic mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                {player.pronunciation}
              </p>
            )}

            <div className="mb-4" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.07)" }} />

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
              <MetaRow label="Height"   value={player.height} />
              <MetaRow label="Weight"   value={player.weight} />
              <MetaRow label="Age"      value={`${player.age} yrs`} />
              <MetaRow label="Hometown" value={player.hometown} />
              {player.foot         && <MetaRow label="Foot"       value={player.foot} />}
              {player.school       && <MetaRow label="School"     value={player.school} />}
              {player.previousClub && <MetaRow label="Prev. Club" value={player.previousClub} />}
            </div>

            {/* Bio */}
            {player.bio && (
              <>
                <div className="mb-3" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.07)" }} />
                <p className="font-body text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {player.bio}
                </p>
              </>
            )}

            <div className="mb-4" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.07)" }} />

            {/* Stats */}
            <p className="font-display text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gray-mid)" }}>
              {seasonLabel}
            </p>

            <div className="flex flex-col">
              {isGK(stats) ? (
                <>
                  <StatRow label="Goals Against" value={stats.goalsAgainst} />
                  <StatRow label="Saves"         value={stats.saves} />
                  <StatRow label="Clean Sheets"  value={stats.cleanSheets} />
                  <StatRow label="Starts"        value={stats.starts} />
                  <StatRow label="Yellow Cards"  value={stats.yellow} />
                  <StatRow label="Red Cards"     value={stats.red} />
                  <StatRow label="Minutes"       value={stats.mins} />
                </>
              ) : (
                <>
                  <StatRow label="Goals"          value={stats.goals} />
                  <StatRow label="Assists"        value={stats.assists} />
                  <StatRow label="Tackles"        value={stats.tackles} />
                  <StatRow label="Offsides"       value={stats.offsides} />
                  <StatRow label="Fouls"          value={stats.fouls} />
                  <StatRow label="Fouls Suffered" value={stats.foulsSuffered} />
                  <StatRow label="Starts"         value={stats.starts} />
                  <StatRow label="Yellow Cards"   value={stats.yellow} />
                  <StatRow label="Red Cards"      value={stats.red} />
                  <StatRow label="Minutes"        value={stats.mins} />
                </>
              )}
            </div>

            <p
              className="font-display text-xs tracking-widest uppercase text-center mt-6 mb-1"
              style={{ color: "rgba(255,255,255,0.12)" }}
            >
              Tap outside to dismiss
            </p>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-xs tracking-widest uppercase mb-0.5" style={{ color: "var(--color-gray-mid)" }}>
        {label}
      </p>
      <p className="font-body text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="flex items-center justify-between py-2.5"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <span className="font-display text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
        {label}
      </span>
      <span className="font-display font-black text-white" style={{ fontSize: "1.1rem" }}>{value}</span>
    </div>
  );
}
