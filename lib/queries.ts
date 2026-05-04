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
  DBSeason,
} from "@/lib/db-types";

// ── Helpers ───────────────────────────────────

function defaultGKStats(): GoalkeeperStats {
  return { goalsAgainst: 0, saves: 0, cleanSheets: 0, starts: 0, yellow: 0, red: 0, mins: 0 };
}

function defaultFieldStats(): FieldStats {
  return { goals: 0, assists: 0, tackles: 0, starts: 0, yellow: 0, red: 0, mins: 0, offsides: 0, fouls: 0, foulsSuffered: 0 };
}

function mapPlayer(row: DBPlayer, stats: GoalkeeperStats | FieldStats, actionPhotos: string[] = []): Player {
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
    bio: row.bio ?? undefined,
    pronunciation: row.pronunciation ?? undefined,
    foot: row.foot ?? undefined,
    actionPhotos: actionPhotos.length > 0 ? actionPhotos : undefined,
  };
}

function mapStaff(row: DBStaff): Staff {
  return {
    initials: row.initials,
    name: row.name,
    role: row.role,
    hometown: row.hometown,
    nationality: row.nationality ?? "",
    bio: row.bio ?? null,
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
 * with season-aggregate stats joined in for the active season.
 */
export async function fetchRoster(): Promise<{
  goalkeepers: Player[];
  defenders: Player[];
  midfielders: Player[];
  forwards: Player[];
  seasonLabel: string;
}> {
  // 1. Fetch active season
  const { data: seasonData } = await supabase
    .from("seasons")
    .select("*")
    .eq("active", true)
    .limit(1)
    .single();

  const activeSeason = seasonData as DBSeason | null;
  const seasonLabel = activeSeason?.label ?? "Current Season";

  // 2. Fetch all active players
  const { data: rows, error } = await supabase
    .from("players")
    .select("*")
    .eq("active", true)
    .order("number", { ascending: true });

  if (error) throw new Error(`fetchRoster players: ${error.message}`);
  if (!rows || rows.length === 0) {
    return { goalkeepers: [], defenders: [], midfielders: [], forwards: [], seasonLabel };
  }

  const players = rows as DBPlayer[];
  const playerIds = players.map((p) => p.id);

  // 3. Fetch season stats filtered by active season
  const fieldQuery = supabase
    .from("player_season_stats")
    .select("*")
    .in("player_id", playerIds);

  const gkQuery = supabase
    .from("goalkeeper_season_stats")
    .select("*")
    .in("player_id", playerIds);

  if (activeSeason) {
    fieldQuery.eq("season_id", activeSeason.id);
    gkQuery.eq("season_id", activeSeason.id);
  }

  const { data: fieldSeasonRows } = await fieldQuery;
  const { data: gkSeasonRows } = await gkQuery;

  const fieldStatsByPlayer = new Map<string, FieldStats>();
  (fieldSeasonRows ?? []).forEach((r: Record<string, number>) => {
    fieldStatsByPlayer.set(r.player_id as unknown as string, {
      goals: r.goals, assists: r.assists, tackles: r.tackles,
      starts: r.starts, yellow: r.yellow, red: r.red, mins: r.mins,
      offsides: r.offsides ?? 0, fouls: r.fouls ?? 0, foulsSuffered: r.fouls_suffered ?? 0,
    });
  });

  const gkStatsByPlayer = new Map<string, GoalkeeperStats>();
  (gkSeasonRows ?? []).forEach((r: Record<string, number>) => {
    gkStatsByPlayer.set(r.player_id as unknown as string, {
      goalsAgainst: r.goals_against, saves: r.saves, cleanSheets: r.clean_sheets,
      starts: r.starts, yellow: r.yellow, red: r.red, mins: r.mins,
    });
  });

  // 3. Fetch action photos
  const { data: photoRows } = await supabase
    .from("player_photos")
    .select("player_id, url, sort_order")
    .in("player_id", playerIds)
    .order("sort_order", { ascending: true });

  const photosByPlayer = new Map<string, string[]>();
  (photoRows ?? []).forEach((r: { player_id: string; url: string; sort_order: number }) => {
    const arr = photosByPlayer.get(r.player_id) ?? [];
    arr.push(r.url);
    photosByPlayer.set(r.player_id, arr);
  });

  // 4. Map each player to the UI type with season stats + action photos
  const mapped = players.map((row) => {
    const photos = photosByPlayer.get(row.id) ?? [];
    if (row.position === "Goalkeeper") {
      return mapPlayer(row, gkStatsByPlayer.get(row.id) ?? defaultGKStats(), photos);
    } else {
      return mapPlayer(row, fieldStatsByPlayer.get(row.id) ?? defaultFieldStats(), photos);
    }
  });

  return {
    goalkeepers: mapped.filter((p) => p.position === "Goalkeeper"),
    defenders:   mapped.filter((p) => p.position === "Defender"),
    midfielders: mapped.filter((p) => p.position === "Midfielder"),
    forwards:    mapped.filter((p) => p.position === "Forward"),
    seasonLabel,
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
 *
 * Dates are stored as "YYYY-MM-DD" and times as "HH:MM" (24h) from the
 * admin's <input type="date"> / <input type="time">.
 * Concatenating them as "YYYY-MM-DDTHH:MM" produces a valid ISO 8601 string
 * that new Date() parses correctly on every browser, including mobile Safari.
 * As a bonus, ISO date strings also sort correctly as plain strings, so we
 * use string comparison as the primary key (no Date object needed).
 */
export async function fetchSchedule(): Promise<Fixture[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("*");

  if (error) throw new Error(`fetchSchedule: ${error.message}`);

  const fixtures = (data as DBMatch[]).map(mapFixture);

  // "YYYY-MM-DD" + "HH:MM" sorts lexicographically = chronologically
  return fixtures.sort((a, b) => {
    const keyA = `${a.date}T${a.time ?? "00:00"}`;
    const keyB = `${b.date}T${b.time ?? "00:00"}`;
    return keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
  });
}
