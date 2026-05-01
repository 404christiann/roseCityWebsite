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

  // 2. Fetch season stats from direct-edit tables
  const { data: fieldSeasonRows } = await supabase
    .from("player_season_stats")
    .select("*")
    .in("player_id", playerIds);

  const { data: gkSeasonRows } = await supabase
    .from("goalkeeper_season_stats")
    .select("*")
    .in("player_id", playerIds);

  const fieldStatsByPlayer = new Map<string, FieldStats>();
  (fieldSeasonRows ?? []).forEach((r: Record<string, number>) => {
    fieldStatsByPlayer.set(r.player_id as unknown as string, {
      goals: r.goals, assists: r.assists, tackles: r.tackles,
      starts: r.starts, yellow: r.yellow, red: r.red, mins: r.mins,
    });
  });

  const gkStatsByPlayer = new Map<string, GoalkeeperStats>();
  (gkSeasonRows ?? []).forEach((r: Record<string, number>) => {
    gkStatsByPlayer.set(r.player_id as unknown as string, {
      goalsAgainst: r.goals_against, saves: r.saves, cleanSheets: r.clean_sheets,
      starts: r.starts, yellow: r.yellow, red: r.red, mins: r.mins,
    });
  });

  // 3. Map each player to the UI type with season stats
  const mapped = players.map((row) => {
    if (row.position === "Goalkeeper") {
      return mapPlayer(row, gkStatsByPlayer.get(row.id) ?? defaultGKStats());
    } else {
      return mapPlayer(row, fieldStatsByPlayer.get(row.id) ?? defaultFieldStats());
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
