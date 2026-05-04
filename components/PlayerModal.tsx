"use client";

import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Player, GoalkeeperStats, FieldStats } from "@/lib/data";
import { FLAG_CODES } from "@/lib/flags";

function isGK(stats: GoalkeeperStats | FieldStats): stats is GoalkeeperStats {
  return "saves" in stats;
}


interface Props {
  player: Player;
  onClose: () => void;
  seasonLabel?: string;
}

export default function PlayerModal({ player, onClose, seasonLabel = "Current Season" }: Props) {
  const stats = player.stats;
  const flagCode = player.nationality ? FLAG_CODES[player.nationality] : null;

  // Build the full photo array: profile photo first, then action photos
  const allPhotos = [player.image, ...(player.actionPhotos ?? [])];
  // Open on the first action photo if one exists, otherwise the profile shot
  const [photoIdx, setPhotoIdx] = useState(player.actionPhotos?.length ? 1 : 0);
  const hasMultiple = allPhotos.length > 1;

  // Preload all photos as soon as the modal mounts so navigation is instant
  useEffect(() => {
    allPhotos.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function prev() { setPhotoIdx((i) => (i - 1 + allPhotos.length) % allPhotos.length); }
  function next() { setPhotoIdx((i) => (i + 1) % allPhotos.length); }

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
            w-full md:w-[480px] flex flex-col overflow-hidden
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
          {/* Photo carousel */}
          <div
            className="relative flex-shrink-0 w-full h-[340px] md:h-[400px] rounded-t-2xl overflow-hidden"
            style={{ WebkitTransform: "translateZ(0)" }}
          >
            {/* Current photo */}
            <Image
              key={allPhotos[photoIdx]}
              src={allPhotos[photoIdx]}
              alt={player.name}
              fill
              className="object-cover object-top transition-opacity duration-300"
              sizes="(max-width: 768px) 100vw, 480px"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(14,14,14,0.95) 0%, transparent 55%)" }}
            />

            {/* Drag handle — mobile only */}
            <div className="md:hidden absolute top-0 left-0 right-0 flex justify-center pt-3">
              <div className="w-9 h-1 rounded-full bg-white/30" />
            </div>

            {/* Close button — top right always */}
            <button
              onClick={onClose}
              className="absolute top-3 right-4 flex items-center justify-center"
              style={{ color: "#000000" }}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Jersey number */}
            <span
              className="absolute bottom-3 left-4 font-display font-black leading-none select-none"
              style={{ fontSize: "5rem", color: "var(--color-red)", lineHeight: 1, opacity: 0.9 }}
            >
              {player.number}
            </span>

            {/* Prev / Next arrows — only when multiple photos */}
            {hasMultiple && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                  aria-label="Previous photo"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                  aria-label="Next photo"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-3 right-4 flex gap-1.5 items-center">
                  {allPhotos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIdx(i)}
                      aria-label={`Photo ${i + 1}`}
                      style={{
                        width: i === photoIdx ? 16 : 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: i === photoIdx ? "var(--color-red)" : "rgba(255,255,255,0.35)",
                        transition: "width 0.2s ease, background-color 0.2s ease",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col" style={{ colorScheme: "dark" }}>

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

            {/* Bio — collapsible */}
            {player.bio && <CollapsibleBio bio={player.bio} />}

            {/* Stats — collapsible */}
            <CollapsibleStats stats={stats} seasonLabel={seasonLabel} />

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

function CollapsibleStats({ stats, seasonLabel }: { stats: GoalkeeperStats | FieldStats; seasonLabel: string }) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <div className="mb-3" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.07)" }} />
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full mb-2"
      >
        <span
          className="font-display text-xs tracking-widest uppercase"
          style={{ color: "var(--color-gray-mid)" }}
        >
          {seasonLabel}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            color: "rgba(255,255,255,0.3)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
            flexShrink: 0,
          }}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 0.25s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
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
                <StatRow label="Goals"          value={(stats as FieldStats).goals} />
                <StatRow label="Assists"        value={(stats as FieldStats).assists} />
                <StatRow label="Tackles"        value={(stats as FieldStats).tackles} />
                <StatRow label="Offsides"       value={(stats as FieldStats).offsides} />
                <StatRow label="Fouls"          value={(stats as FieldStats).fouls} />
                <StatRow label="Fouls Suffered" value={(stats as FieldStats).foulsSuffered} />
                <StatRow label="Starts"         value={stats.starts} />
                <StatRow label="Yellow Cards"   value={stats.yellow} />
                <StatRow label="Red Cards"      value={stats.red} />
                <StatRow label="Minutes"        value={stats.mins} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function CollapsibleBio({ bio }: { bio: string }) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <div className="mb-3" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.07)" }} />
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full mb-2 group"
      >
        <span
          className="font-display text-xs tracking-widest uppercase"
          style={{ color: "var(--color-gray-mid)" }}
        >
          Bio
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            color: "rgba(255,255,255,0.3)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
            flexShrink: 0,
          }}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 0.25s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <p
            className="font-body text-sm leading-relaxed mb-4"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            {bio}
          </p>
        </div>
      </div>
    </>
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
