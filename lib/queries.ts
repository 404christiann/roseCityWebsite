// ─────────────────────────────────────────────
//  Supabase fetch functions
//  Maps DB row types → the existing Player / Staff / Fixture types
//  so that components (PlayerCard, StaffCard, FixtureRow) need no changes.
// ─────────────────────────────────────────────

import { supabase } from "@/lib/supabase";
import {
  Player,
  Staff,
  Fixture,
  GoalkeeperStats,
  FieldStats,
} from "@/lib/data";
import {
  DBPlayer,
  DBStaff,
  DBMatch,
  DBPlayerMatchStats,
  DBGoalkeeperMatchStats,
} from "@/lib/db-types";

// ── Helpers ───────────────────────────────────

function defaultGKStats(): GoalkeeperStats {
  return { goalsAgainst: 0, saves: 0, cleanSheets: 0, starts: 0, yellow: 0, red: 0, mins: 0 };
}

function defaultFieldStats(): FieldStats {
  return { goals: 0, assists: 0, tackles: 0, starts: 0, yellow: 0, red: 0, mins: 0 };
}

function mapPlayer(row: DBPlayer, stats: GoalkeeperStats | FieldStats): Player {
  return {
    number: row.number,
    name: row.name,
    caption: row.caption ?? undefined,
    nationality: row.nationality,
    position: row.position,
    height: row.height,
    weight: row.weight,
    hometown: row.hometown,
    age: row.age,
    school: row.school ?? undefined,
    previousClub: row.previous_club ?? undefined,
    image: row.photo_url,
    stats,
  };
}

function mapStaff(row: DBStaff): Staff {
  return {
    initials: row.initials,
    name: row.name,
    role: row.role,
    hometown: row.hometown,
    image: row.photo_url,
  };
}

function mapFixture(row: DBMatch): Fixture {
  return {
    date: row.date,
    time: row.time,
    opponent: row.opponent,
    home: row.home,
    venue: row.venue,
    address: row.address ?? undefined,
  };
}

// ── Aggregation helpers ───────────────────────

function aggregateGKStats(rows: DBGoalkeeperMatchStats[]): GoalkeeperStats {
  return rows.reduce(
    (acc, r) => ({
      goalsAgainst: acc.goalsAgainst + r.goals_against,
      saves: acc.saves + r.saves,
      cleanSheets: acc.cleanSheets + r.clean_sheets,
      starts: acc.starts + r.starts,
      yellow: acc.yellow + r.yellow,
      red: acc.red + r.red,
      mins: acc.mins + r.mins,
    }),
    defaultGKStats()
  );
}

function aggregateFieldStats(rows: DBPlayerMatchStats[]): FieldStats {
  return rows.reduce(
    (acc, r) => ({
      goals: acc.goals + r.goals,
      assists: acc.assists + r.assists,
      tackles: acc.tackles + r.tackles,
      starts: acc.starts + r.starts,
      yellow: acc.yellow + r.yellow,
      red: acc.red + r.red,
      mins: acc.mins + r.mins,
    }),
    defaultFieldStats()
  );
}

// ── Public queries ────────────────────────────

/**
 * Fetches all active players grouped by position,
 * with season-aggregate stats joined in.
 */
export async function fetchRoster(): Promise<{
  goalkeepers: Player[];
  defenders: Player[];
  midfielders: Player[];
  forwards: Player[];
}> {
  // 1. Fetch all active players
  const { data: rows, error } = await supabase
    .from("players")
    .select("*")
    .eq("active", true)
    .order("number", { ascending: true });

  if (error) throw new Error(`fetchRoster players: ${error.message}`);
  if (!rows || rows.length === 0) {
    return { goalkeepers: [], defenders: [], midfielders: [], forwards: [] };
  }

  const players = rows as DBPlayer[];
  const playerIds = players.map((p) => p.id);

  // 2. Fetch aggregated field stats for all players in one query
  const { data: fieldRows } = await supabase
    .from("player_match_stats")
    .select("*")
    .in("player_id", playerIds);

  // 3. Fetch aggregated GK stats for all players in one query
  const { data: gkRows } = await supabase
    .from("goalkeeper_match_stats")
    .select("*")
    .in("player_id", playerIds);

  const fieldStatsByPlayer = new Map<string, DBPlayerMatchStats[]>();
  (fieldRows ?? []).forEach((r: DBPlayerMatchStats) => {
    const arr = fieldStatsByPlayer.get(r.player_id) ?? [];
    arr.push(r);
    fieldStatsByPlayer.set(r.player_id, arr);
  });

  const gkStatsByPlayer = new Map<string, DBGoalkeeperMatchStats[]>();
  (gkRows ?? []).forEach((r: DBGoalkeeperMatchStats) => {
    const arr = gkStatsByPlayer.get(r.player_id) ?? [];
    arr.push(r);
    gkStatsByPlayer.set(r.player_id, arr);
  });

  // 4. Map each player to the UI type with aggregated stats
  const mapped = players.map((row) => {
    if (row.position === "Goalkeeper") {
      const gkData = gkStatsByPlayer.get(row.id) ?? [];
      return mapPlayer(row, aggregateGKStats(gkData));
    } else {
      const fieldData = fieldStatsByPlayer.get(row.id) ?? [];
      return mapPlayer(row, aggregateFieldStats(fieldData));
    }
  });

  return {
    goalkeepers: mapped.filter((p) => p.position === "Goalkeeper"),
    defenders:   mapped.filter((p) => p.position === "Defender"),
    midfielders: mapped.filter((p) => p.position === "Midfielder"),
    forwards:    mapped.filter((p) => p.position === "Forward"),
  };
}

/**
 * Fetches all active staff members.
 */
export async function fetchStaff(): Promise<Staff[]> {
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("active", true)
    .order("id", { ascending: true });

  if (error) throw new Error(`fetchStaff: ${error.message}`);
  return (data as DBStaff[]).map(mapStaff);
}

/**
 * Fetches all matches ordered by date ascending.
 */
export async function fetchSchedule(): Promise<Fixture[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("*");

  if (error) throw new Error(`fetchSchedule: ${error.message}`);

  // Sort chronologically — date is stored as "May 2, 2026" so parse it
  const fixtures = (data as DBMatch[]).map(mapFixture);
  return fixtures.sort(
    (a, b) =>
      new Date(`${a.date} ${a.time}`).getTime() -
      new Date(`${b.date} ${b.time}`).getTime()
  );
}
