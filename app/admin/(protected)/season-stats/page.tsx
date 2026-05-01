"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

// ── Types ─────────────────────────────────────

type Position = "Goalkeeper" | "Defender" | "Midfielder" | "Forward";
const POSITIONS: Position[] = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

type Player = {
  id: string;
  number: number;
  name: string;
  position: Position;
};

type FieldStats = {
  goals: number;
  assists: number;
  tackles: number;
  starts: number;
  yellow: number;
  red: number;
  mins: number;
};

type GKStats = {
  goals_against: number;
  saves: number;
  clean_sheets: number;
  starts: number;
  yellow: number;
  red: number;
  mins: number;
};

type StatsMap = Record<string, FieldStats | GKStats>;

function defaultField(): FieldStats {
  return { goals: 0, assists: 0, tackles: 0, starts: 0, yellow: 0, red: 0, mins: 0 };
}
function defaultGK(): GKStats {
  return { goals_against: 0, saves: 0, clean_sheets: 0, starts: 0, yellow: 0, red: 0, mins: 0 };
}
function isGK(s: FieldStats | GKStats): s is GKStats {
  return "saves" in s;
}

// ── Main component ────────────────────────────

export default function SeasonStatsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats]     = useState<StatsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: playerRows }, { data: fieldRows }, { data: gkRows }] = await Promise.all([
        supabase.from("players").select("id, number, name, position").eq("active", true).order("number"),
        supabase.from("player_season_stats").select("*"),
        supabase.from("goalkeeper_season_stats").select("*"),
      ]);

      const ps = (playerRows ?? []) as Player[];
      setPlayers(ps);

      const map: StatsMap = {};
      ps.forEach((p) => {
        map[p.id] = p.position === "Goalkeeper" ? defaultGK() : defaultField();
      });

      (fieldRows ?? []).forEach((r: Record<string, unknown>) => {
        map[r.player_id as string] = {
          goals:   Number(r.goals),
          assists: Number(r.assists),
          tackles: Number(r.tackles),
          starts:  Number(r.starts),
          yellow:  Number(r.yellow),
          red:     Number(r.red),
          mins:    Number(r.mins),
        } as FieldStats;
      });

      (gkRows ?? []).forEach((r: Record<string, unknown>) => {
        map[r.player_id as string] = {
          goals_against: Number(r.goals_against),
          saves:         Number(r.saves),
          clean_sheets:  Number(r.clean_sheets),
          starts:        Number(r.starts),
          yellow:        Number(r.yellow),
          red:           Number(r.red),
          mins:          Number(r.mins),
        } as GKStats;
      });

      setStats(map);
      setLoading(false);
    }
    load();
  }, []);

  function updateStat(playerId: string, field: string, value: number) {
    setStats((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], [field]: Math.max(0, value) },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const fieldRows: Record<string, unknown>[] = [];
    const gkRows:    Record<string, unknown>[] = [];

    players.forEach((p) => {
      const s = stats[p.id];
      if (!s) return;
      if (p.position === "Goalkeeper" && isGK(s)) {
        gkRows.push({ player_id: p.id, ...s });
      } else if (!isGK(s)) {
        fieldRows.push({ player_id: p.id, ...s });
      }
    });

    const [{ error: fe }, { error: ge }] = await Promise.all([
      fieldRows.length > 0
        ? supabase.from("player_season_stats").upsert(fieldRows, { onConflict: "player_id" })
        : Promise.resolve({ error: null }),
      gkRows.length > 0
        ? supabase.from("goalkeeper_season_stats").upsert(gkRows, { onConflict: "player_id" })
        : Promise.resolve({ error: null }),
    ]);

    if (fe || ge) {
      setError(fe?.message ?? ge?.message ?? "Unknown error");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1
            className="font-display font-black uppercase text-white leading-none"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}
          >
            Season Stats
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            Edit season totals for each player. Changes apply to the public roster page.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {saved && (
            <span className="font-display text-sm tracking-widest uppercase" style={{ color: "rgba(34,197,94,0.9)" }}>
              ✓ Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2.5 rounded-lg font-display font-black uppercase tracking-widest text-white text-xs"
            style={{ backgroundColor: "#dc2626", opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}
          >
            {saving ? "Saving…" : "Save All"}
          </button>
        </div>
      </div>

      {error && (
        <p className="font-body text-sm mb-4" style={{ color: "#dc2626" }}>Error: {error}</p>
      )}

      {loading ? (
        <p className="font-display text-sm tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
          Loading…
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {POSITIONS.map((pos) => {
            const group = players.filter((p) => p.position === pos);
            if (group.length === 0) return null;
            const isGKPos = pos === "Goalkeeper";
            const headers = isGKPos
              ? ["#", "Name", "GA", "Saves", "CS", "Starts", "Y", "R", "Mins"]
              : ["#", "Name", "Goals", "Ast", "Tackles", "Starts", "Y", "R", "Mins"];
            const gridCols = "40px 1fr 56px 56px 56px 56px 44px 44px 64px";

            return (
              <div key={pos} className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                {/* Position header */}
                <div className="px-4 py-3" style={{ backgroundColor: "#161616" }}>
                  <span className="font-display font-black uppercase tracking-widest text-xs" style={{ color: "rgba(255,255,255,0.9)" }}>
                    {pos}s{" "}
                    <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>{group.length}</span>
                  </span>
                </div>

                {/* Column headers */}
                <div
                  className="grid gap-2 px-4 py-2"
                  style={{ gridTemplateColumns: gridCols, backgroundColor: "#111111", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {headers.map((h) => (
                    <span
                      key={h}
                      className="font-display font-bold uppercase text-center"
                      style={{ fontSize: "0.6rem", letterSpacing: "0.08em", color: "rgba(255,255,255,0.9)" }}
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Player rows */}
                {group.map((p, i) => {
                  const s = stats[p.id];
                  if (!s) return null;

                  return (
                    <div
                      key={p.id}
                      className="grid gap-2 items-center px-4 py-2"
                      style={{
                        gridTemplateColumns: gridCols,
                        backgroundColor: i % 2 === 0 ? "#0f0f0f" : "#111111",
                        borderBottom: i < group.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      }}
                    >
                      {/* # */}
                      <span className="font-display font-bold text-center text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {p.number}
                      </span>

                      {/* Name */}
                      <span className="font-body text-sm truncate" style={{ color: "rgba(255,255,255,0.85)" }}>
                        {p.name}
                      </span>

                      {/* Stat inputs */}
                      {isGKPos && isGK(s) ? (
                        <>
                          <StatInput value={s.goals_against} onChange={(v) => updateStat(p.id, "goals_against", v)} />
                          <StatInput value={s.saves}         onChange={(v) => updateStat(p.id, "saves", v)} />
                          <StatInput value={s.clean_sheets}  onChange={(v) => updateStat(p.id, "clean_sheets", v)} />
                          <StatInput value={s.starts}        onChange={(v) => updateStat(p.id, "starts", v)} />
                          <StatInput value={s.yellow}        onChange={(v) => updateStat(p.id, "yellow", v)} />
                          <StatInput value={s.red}           onChange={(v) => updateStat(p.id, "red", v)} />
                          <StatInput value={s.mins}          onChange={(v) => updateStat(p.id, "mins", v)} />
                        </>
                      ) : !isGK(s) ? (
                        <>
                          <StatInput value={s.goals}   onChange={(v) => updateStat(p.id, "goals", v)} />
                          <StatInput value={s.assists}  onChange={(v) => updateStat(p.id, "assists", v)} />
                          <StatInput value={s.tackles}  onChange={(v) => updateStat(p.id, "tackles", v)} />
                          <StatInput value={s.starts}   onChange={(v) => updateStat(p.id, "starts", v)} />
                          <StatInput value={s.yellow}   onChange={(v) => updateStat(p.id, "yellow", v)} />
                          <StatInput value={s.red}      onChange={(v) => updateStat(p.id, "red", v)} />
                          <StatInput value={s.mins}     onChange={(v) => updateStat(p.id, "mins", v)} />
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Stat input ────────────────────────────────

function StatInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
      className="w-full rounded text-center font-display font-bold text-white text-sm outline-none"
      style={{
        backgroundColor: "#0e0e0e",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "4px 2px",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(220,38,38,0.5)")}
      onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
    />
  );
}
