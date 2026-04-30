"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

type Stats = {
  players: number;
  staff: number;
  matches: number;
  nextMatch: { date: string; opponent: string; home: boolean } | null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const [
        { count: players },
        { count: staff },
        { data: matches },
      ] = await Promise.all([
        supabase.from("players").select("*", { count: "exact", head: true }).eq("active", true),
        supabase.from("staff").select("*", { count: "exact", head: true }).eq("active", true),
        supabase.from("matches").select("date, opponent, home, time"),
      ]);

      // Find next upcoming match
      const now = new Date();
      const upcoming = (matches ?? [])
        .filter((m) => new Date(`${m.date} ${m.time}`) >= now)
        .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());

      setStats({
        players: players ?? 0,
        staff: staff ?? 0,
        matches: matches?.length ?? 0,
        nextMatch: upcoming[0] ?? null,
      });
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-display font-black uppercase text-white leading-none"
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}
        >
          Dashboard
        </h1>
        <p className="font-body text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          2025 – 2026 Season
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Players" value={loading ? "—" : String(stats?.players ?? 0)} />
        <StatCard label="Staff"   value={loading ? "—" : String(stats?.staff ?? 0)} />
        <StatCard label="Matches" value={loading ? "—" : String(stats?.matches ?? 0)} />
        <StatCard
          label="Next Match"
          value={loading ? "—" : stats?.nextMatch ? stats.nextMatch.date : "TBD"}
          sub={!loading && stats?.nextMatch ? `vs ${stats.nextMatch.opponent}` : undefined}
          accent
        />
      </div>

      {/* Quick actions */}
      <div className="mb-4">
        <h2
          className="font-display font-bold uppercase tracking-widest mb-4"
          style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ActionCard
            href="/admin/stats"
            title="Enter Match Stats"
            description="Log goals, assists, saves and minutes for a completed match."
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
          <ActionCard
            href="/admin/roster"
            title="Manage Roster"
            description="Add, edit, or deactivate players and staff members."
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M19 8v6M16 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }
          />
          <ActionCard
            href="/admin/schedule"
            title="Manage Schedule"
            description="Add upcoming fixtures or update match details."
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 14v4M10 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: accent ? "rgba(220,38,38,0.1)" : "#1a1a1a",
        border: `1px solid ${accent ? "rgba(220,38,38,0.25)" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      <p
        className="font-display text-xs tracking-widest uppercase mb-2"
        style={{ color: accent ? "rgba(220,38,38,0.7)" : "rgba(255,255,255,0.3)" }}
      >
        {label}
      </p>
      <p
        className="font-display font-black text-white leading-none"
        style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}
      >
        {value}
      </p>
      {sub && (
        <p className="font-body text-xs mt-1 truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function ActionCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl p-5 transition-all duration-200"
      style={{
        backgroundColor: "#1a1a1a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,38,38,0.3)";
        (e.currentTarget as HTMLElement).style.backgroundColor = "#1e1e1e";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
        (e.currentTarget as HTMLElement).style.backgroundColor = "#1a1a1a";
      }}
    >
      <div className="mb-3" style={{ color: "#dc2626" }}>{icon}</div>
      <h3 className="font-display font-black uppercase text-white text-sm mb-1">
        {title}
      </h3>
      <p className="font-body text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
        {description}
      </p>
    </Link>
  );
}
