"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Chart, registerables } from "chart.js";
import { fetchRoster } from "@/lib/queries";
import { Player, GoalkeeperStats, FieldStats } from "@/lib/data";

Chart.register(...registerables);

// ── Helpers ───────────────────────────────────

function isGK(stats: GoalkeeperStats | FieldStats): stats is GoalkeeperStats {
  return "saves" in stats;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

type PositionKey = "All" | "Goalkeeper" | "Defender" | "Midfielder" | "Forward";

// ── Main page ─────────────────────────────────

export default function AnalyticsPage() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [seasonLabel, setSeasonLabel] = useState("2025–26");
  const [loading, setLoading] = useState(true);
  const [posFilter, setPosFilter] = useState<PositionKey>("All");
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    fetchRoster().then(({ goalkeepers, defenders, midfielders, forwards, seasonLabel: sl }) => {
      setAllPlayers([...goalkeepers, ...defenders, ...midfielders, ...forwards]);
      setSeasonLabel(sl);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (posFilter === "All") return allPlayers;
    return allPlayers.filter((p) => p.position === posFilter);
  }, [allPlayers, posFilter]);

  // Reset selected player when filter changes
  useEffect(() => { setSelectedIdx(0); }, [posFilter]);

  const player = filtered[selectedIdx] ?? null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-display text-sm tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
          Loading analytics…
        </p>
      </div>
    );
  }

  if (!allPlayers.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-display text-sm tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
          No players found.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-display font-black uppercase text-white leading-none"
          style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}
        >
          Analytics
        </h1>
        <p className="font-body mt-1" style={{ fontSize: "1rem", color: "rgba(255,255,255,0.35)" }}>
          {seasonLabel} · Player performance dashboard
        </p>
      </div>

      {/* Position filters + player select */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {(["All", "Goalkeeper", "Defender", "Midfielder", "Forward"] as PositionKey[]).map((pos) => (
          <button
            key={pos}
            onClick={() => setPosFilter(pos)}
            className="font-display font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all duration-150"
            style={{
              fontSize: "0.75rem",
              backgroundColor: posFilter === pos ? "#dc2626" : "#1a1a1a",
              color: posFilter === pos ? "#fff" : "rgba(255,255,255,0.4)",
              border: posFilter === pos ? "1px solid #dc2626" : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {pos}
          </button>
        ))}

        <select
          value={selectedIdx}
          onChange={(e) => setSelectedIdx(Number(e.target.value))}
          className="ml-auto rounded-lg px-3 py-2 font-display font-bold uppercase tracking-widest"
          style={{
            fontSize: "0.8rem",
            backgroundColor: "#1a1a1a",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.12)",
            outline: "none",
          }}
        >
          {filtered.map((p, i) => (
            <option key={i} value={i}>#{p.number} {p.name}</option>
          ))}
        </select>
      </div>

      {player && (
        <PlayerDashboard
          player={player}
          allPlayers={allPlayers}
          positionPeers={filtered}
          seasonLabel={seasonLabel}
        />
      )}
    </div>
  );
}

// ── Player dashboard ───────────────────────────

function PlayerDashboard({
  player,
  allPlayers,
  positionPeers,
  seasonLabel,
}: {
  player: Player;
  allPlayers: Player[];
  positionPeers: Player[];
  seasonLabel: string;
}) {
  const gk = isGK(player.stats);
  const stats = player.stats;

  // ── KPI data ─────────────────────────────────
  const kpis = useMemo(() => {
    if (gk) {
      const s = stats as GoalkeeperStats;
      const peers = positionPeers.filter((p) => isGK(p.stats)).map((p) => p.stats as GoalkeeperStats);
      const avgSaves = avg(peers.map((p) => p.saves));
      const avgCS = avg(peers.map((p) => p.cleanSheets));
      return [
        { label: "Saves",        value: s.saves,       delta: s.saves > avgSaves ? `+${s.saves - avgSaves} vs avg` : `Avg: ${avgSaves}` },
        { label: "Clean Sheets", value: s.cleanSheets, delta: s.cleanSheets > avgCS ? `+${s.cleanSheets - avgCS} vs avg` : `Avg: ${avgCS}` },
        { label: "Goals Against",value: s.goalsAgainst,delta: `${s.starts} starts` },
        { label: "Minutes",      value: s.mins,        delta: s.starts > 0 ? `${Math.round(s.mins / s.starts)} min/game` : "—" },
      ];
    } else {
      const s = stats as FieldStats;
      const peers = positionPeers.filter((p) => !isGK(p.stats)).map((p) => p.stats as FieldStats);
      const avgGoals = avg(peers.map((p) => p.goals));
      const avgAssists = avg(peers.map((p) => p.assists));
      const teamHighGoals = Math.max(...allPlayers.filter((p) => !isGK(p.stats)).map((p) => (p.stats as FieldStats).goals));
      return [
        { label: "Goals",   value: s.goals,   delta: s.goals === teamHighGoals ? "Team high" : `+${Math.max(0, s.goals - avgGoals)} vs avg` },
        { label: "Assists", value: s.assists,  delta: s.assists > avgAssists ? `+${s.assists - avgAssists} vs avg` : `Avg: ${avgAssists}` },
        { label: "Starts",  value: s.starts,   delta: `of ${Math.max(...allPlayers.map((p) => p.stats.starts))} games` },
        { label: "Minutes", value: s.mins,     delta: s.starts > 0 ? `${Math.round(s.mins / s.starts)} min/game` : "—" },
      ];
    }
  }, [player, positionPeers, allPlayers, gk, stats]);

  // ── Radar attrs (normalized 0–100 vs position group) ─────────────
  const radarAttrs = useMemo(() => {
    if (gk) {
      const s = stats as GoalkeeperStats;
      const peers = allPlayers.filter((p) => isGK(p.stats)).map((p) => p.stats as GoalkeeperStats);
      const maxSaves = Math.max(...peers.map((p) => p.saves), 1);
      const maxCS    = Math.max(...peers.map((p) => p.cleanSheets), 1);
      const maxMins  = Math.max(...peers.map((p) => p.mins), 1);
      return [
        { l: "Reflexes",     v: Math.round((s.saves / maxSaves) * 100) },
        { l: "Clean Sheets", v: Math.round((s.cleanSheets / maxCS) * 100) },
        { l: "Availability", v: Math.round((s.mins / maxMins) * 100) },
        { l: "Discipline",   v: Math.max(0, 100 - s.yellow * 15 - s.red * 30) },
        { l: "Starts",       v: Math.round((s.starts / Math.max(...peers.map((p) => p.starts), 1)) * 100) },
      ];
    } else {
      const s = stats as FieldStats;
      const peers = allPlayers.filter((p) => !isGK(p.stats)).map((p) => p.stats as FieldStats);
      const maxG  = Math.max(...peers.map((p) => p.goals), 1);
      const maxA  = Math.max(...peers.map((p) => p.assists), 1);
      const maxT  = Math.max(...peers.map((p) => p.tackles), 1);
      const maxM  = Math.max(...peers.map((p) => p.mins), 1);
      return [
        { l: "Scoring",    v: Math.round((s.goals / maxG) * 100) },
        { l: "Creativity", v: Math.round((s.assists / maxA) * 100) },
        { l: "Defending",  v: Math.round((s.tackles / maxT) * 100) },
        { l: "Stamina",    v: Math.round((s.mins / maxM) * 100) },
        { l: "Discipline", v: Math.max(0, 100 - s.yellow * 15 - s.red * 30) },
      ];
    }
  }, [player, allPlayers, gk, stats]);

  // ── Comparison: player vs position avg ───────
  const comparisonData = useMemo(() => {
    if (gk) {
      const s = stats as GoalkeeperStats;
      const peers = allPlayers.filter((p) => isGK(p.stats)).map((p) => p.stats as GoalkeeperStats);
      return {
        labels: ["Saves", "Clean Sheets", "Starts", "Minutes / 10"],
        player: [s.saves, s.cleanSheets, s.starts, Math.round(s.mins / 10)],
        teamAvg: [
          avg(peers.map((p) => p.saves)),
          avg(peers.map((p) => p.cleanSheets)),
          avg(peers.map((p) => p.starts)),
          Math.round(avg(peers.map((p) => p.mins)) / 10),
        ],
      };
    } else {
      const s = stats as FieldStats;
      const peers = allPlayers.filter((p) => !isGK(p.stats)).map((p) => p.stats as FieldStats);
      return {
        labels: ["Goals", "Assists", "Tackles", "Starts"],
        player: [s.goals, s.assists, s.tackles, s.starts],
        teamAvg: [
          avg(peers.map((p) => p.goals)),
          avg(peers.map((p) => p.assists)),
          avg(peers.map((p) => p.tackles)),
          avg(peers.map((p) => p.starts)),
        ],
      };
    }
  }, [player, allPlayers, gk, stats]);

  const utilizationPct = useMemo(() => {
    const maxStarts = Math.max(...allPlayers.map((p) => p.stats.starts), 1);
    const maxMins = maxStarts * 90;
    return Math.min(100, Math.round((player.stats.mins / maxMins) * 100));
  }, [player, allPlayers]);

  return (
    <div className="flex flex-col gap-4">

      {/* Player header card */}
      <div
        className="flex items-center gap-4 rounded-xl px-5 py-4"
        style={{ backgroundColor: "#141414", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center font-display font-black text-white flex-shrink-0"
          style={{ backgroundColor: "#dc2626", fontSize: "1rem" }}
        >
          {initials(player.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-black uppercase text-white" style={{ fontSize: "1.2rem" }}>
            {player.name}
          </p>
          <p className="font-display text-xs tracking-widest uppercase mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {player.position} · #{player.number} · {seasonLabel}
          </p>
        </div>
        <span
          className="font-display font-black select-none flex-shrink-0"
          style={{ fontSize: "3.5rem", lineHeight: 1, color: "rgba(255,255,255,0.05)" }}
        >
          {player.number}
        </span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl px-4 py-4 text-center"
            style={{ backgroundColor: "#141414", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="font-display font-black text-white" style={{ fontSize: "2rem", lineHeight: 1 }}>
              {k.value.toLocaleString()}
            </p>
            <p className="font-display text-xs tracking-widest uppercase mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              {k.label}
            </p>
            <p className="font-body text-xs mt-2" style={{ color: "#dc2626" }}>
              {k.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Radar + comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RadarCard attrs={radarAttrs} title="Player profile" />
        <ComparisonCard data={comparisonData} title="vs position average" />
      </div>

      {/* Utilization + Discipline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UtilizationCard pct={utilizationPct} mins={player.stats.mins} starts={player.stats.starts} />
        <DisciplineCard stats={player.stats} gk={gk} />
      </div>

    </div>
  );
}

// ── Radar card ────────────────────────────────

function RadarCard({ attrs, title }: { attrs: { l: string; v: number }[]; title: string }) {
  const cx = 100, cy = 105, r = 72, n = attrs.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, scale: number) => [
    cx + scale * r * Math.cos(angle(i)),
    cy + scale * r * Math.sin(angle(i)),
  ];
  const poly = (scale: number) => attrs.map((_, i) => pt(i, scale).join(",")).join(" ");
  const dataPoly = attrs.map((a, i) => pt(i, a.v / 100).join(",")).join(" ");

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: "#141414", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="font-display text-xs tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
        {title}
      </p>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 200 210" width="180" height="190" role="img" aria-label="Radar chart showing player profile">
          {[0.25, 0.5, 0.75, 1].map((s) => (
            <polygon key={s} points={poly(s)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
          ))}
          {attrs.map((_, i) => {
            const [x, y] = pt(i, 1);
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />;
          })}
          <polygon points={dataPoly} fill="rgba(220,38,38,0.15)" stroke="#dc2626" strokeWidth="1.5" />
          {attrs.map((a, i) => {
            const [x, y] = pt(i, 1.22);
            return (
              <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.45)" fontSize="9">
                {a.l}
              </text>
            );
          })}
        </svg>
        <div className="flex flex-col gap-2 flex-1">
          {attrs.map((a) => (
            <div key={a.l} className="flex items-center gap-2">
              <span style={{ fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", width: 70, flexShrink: 0 }}>
                {a.l}
              </span>
              <div style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                <div style={{ width: `${a.v}%`, height: "100%", borderRadius: 2, backgroundColor: "#dc2626" }} />
              </div>
              <span className="font-display font-black text-white" style={{ fontSize: "0.75rem", width: 28, textAlign: "right", flexShrink: 0 }}>
                {a.v}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Comparison bar chart ───────────────────────

function ComparisonCard({ data, title }: { data: { labels: string[]; player: number[]; teamAvg: number[] }; title: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: data.labels,
        datasets: [
          { label: "Player", data: data.player, backgroundColor: "#dc2626", borderRadius: 4, barPercentage: 0.55 },
          { label: "Position avg", data: data.teamAvg, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 4, barPercentage: 0.55 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: "rgba(255,255,255,0.4)", font: { size: 10 } },
            grid: { color: "rgba(255,255,255,0.04)" },
            border: { display: false },
          },
          y: {
            ticks: { color: "rgba(255,255,255,0.4)", font: { size: 10 } },
            grid: { color: "rgba(255,255,255,0.06)" },
            border: { display: false },
          },
        },
      },
    });
    return () => { chartRef.current?.destroy(); };
  }, [data]);

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: "#141414", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="font-display text-xs tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
        {title}
      </p>
      <div className="flex gap-4 mb-3">
        {[{ label: "Player", color: "#dc2626" }, { label: "Position avg", color: "rgba(255,255,255,0.2)" }].map((l) => (
          <span key={l.label} className="flex items-center gap-1.5" style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: l.color, display: "inline-block" }} />
            {l.label}
          </span>
        ))}
      </div>
      <div style={{ position: "relative", height: 160 }}>
        <canvas ref={canvasRef} role="img" aria-label={`Bar chart comparing player stats vs position average`}>
          Player vs position average comparison.
        </canvas>
      </div>
    </div>
  );
}

// ── Utilization donut ─────────────────────────

function UtilizationCard({ pct, mins, starts }: { pct: number; mins: number; starts: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        datasets: [{
          data: [pct, 100 - pct],
          backgroundColor: ["#dc2626", "rgba(255,255,255,0.06)"],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
      },
    });
    return () => { chartRef.current?.destroy(); };
  }, [pct]);

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: "#141414", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="font-display text-xs tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
        Minutes utilization
      </p>
      <div className="flex items-center gap-6">
        <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
          <canvas ref={canvasRef} role="img" aria-label={`Donut chart showing ${pct}% minutes utilization`}>
            {pct}% minutes utilization.
          </canvas>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
            <p className="font-display font-black text-white" style={{ fontSize: "1.4rem", lineHeight: 1 }}>{pct}%</p>
            <p style={{ fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginTop: 3 }}>used</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <p className="font-display font-black text-white" style={{ fontSize: "1.4rem", lineHeight: 1 }}>{mins.toLocaleString()}</p>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginTop: 3 }}>Minutes played</p>
          </div>
          <div>
            <p className="font-display font-black text-white" style={{ fontSize: "1.4rem", lineHeight: 1 }}>{starts}</p>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginTop: 3 }}>Starts</p>
          </div>
          <div>
            <p className="font-display font-black text-white" style={{ fontSize: "1.4rem", lineHeight: 1 }}>
              {starts > 0 ? Math.round(mins / starts) : 0}
            </p>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginTop: 3 }}>Avg min/game</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Discipline card ───────────────────────────

function DisciplineCard({ stats, gk }: { stats: GoalkeeperStats | FieldStats; gk: boolean }) {
  const items = gk
    ? [
        { label: "Yellow Cards",  value: stats.yellow },
        { label: "Red Cards",     value: stats.red },
        { label: "Goals Against", value: (stats as GoalkeeperStats).goalsAgainst },
        { label: "Saves",         value: (stats as GoalkeeperStats).saves },
      ]
    : [
        { label: "Yellow Cards",   value: stats.yellow },
        { label: "Red Cards",      value: stats.red },
        { label: "Fouls",          value: (stats as FieldStats).fouls },
        { label: "Fouls Suffered", value: (stats as FieldStats).foulsSuffered },
      ];

  const disciplineScore = Math.max(0, 100 - stats.yellow * 15 - stats.red * 30);

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: "#141414", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between mb-4">
        <p className="font-display text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
          Discipline
        </p>
        <span
          className="font-display font-black text-xs tracking-widest uppercase px-3 py-1 rounded-full"
          style={{
            backgroundColor: disciplineScore >= 85 ? "rgba(34,197,94,0.15)" : disciplineScore >= 60 ? "rgba(234,179,8,0.15)" : "rgba(220,38,38,0.15)",
            color: disciplineScore >= 85 ? "#22c55e" : disciplineScore >= 60 ? "#eab308" : "#dc2626",
            fontSize: "0.65rem",
          }}
        >
          {disciplineScore >= 85 ? "Clean" : disciplineScore >= 60 ? "Caution" : "High Risk"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg px-3 py-3 text-center"
            style={{ backgroundColor: "#1a1a1a" }}
          >
            <p className="font-display font-black text-white" style={{ fontSize: "1.6rem", lineHeight: 1 }}>
              {item.value}
            </p>
            <p style={{ fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="flex justify-between mb-1">
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Discipline score</span>
          <span className="font-display font-black text-white" style={{ fontSize: "0.75rem" }}>{disciplineScore}/100</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <div style={{
            width: `${disciplineScore}%`, height: "100%", borderRadius: 2,
            backgroundColor: disciplineScore >= 85 ? "#22c55e" : disciplineScore >= 60 ? "#eab308" : "#dc2626",
          }} />
        </div>
      </div>
    </div>
  );
}
