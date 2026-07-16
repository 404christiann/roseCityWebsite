import { supabase } from "@/lib/supabase";
import { Player, Staff, Fixture, GoalkeeperStats, FieldStats } from "@/lib/data";
import { DBPlayer, DBStaff, DBMatch, DBSeason } from "@/lib/db-types";
import { coerceRating } from "@/lib/db-utils";

function defaultGKStats(): GoalkeeperStats {
  return { goalsAgainst: 0, saves: 0, cleanSheets: 0, starts: 0, yellow: 0, red: 0, mins: 0 };
}

function defaultFieldStats(): FieldStats {
  return { goals: 0, assists: 0, tackles: 0, starts: 0, yellow: 0, red: 0, mins: 0, offsides: 0, fouls: 0, foulsSuffered: 0 };
}

function mapPlayer(row: DBPlayer, stats: GoalkeeperStats | FieldStats, actionPhotos: string[] = []): Player {
  return {
    id: row.id, number: row.number, name: row.name,
    caption: row.caption ?? undefined, nationality: row.nationality,
    position: row.position, height: row.height, weight: row.weight,
    hometown: row.hometown, age: row.age,
    school: row.school ?? undefined, previousClub: row.previous_club ?? undefined,
    image: row.photo_url, stats,
    bio: row.bio ?? undefined, pronunciation: row.pronunciation ?? undefined,
    foot: row.foot ?? undefined,
    actionPhotos: actionPhotos.length > 0 ? actionPhotos : undefined,
  };
}

function mapStaff(row: DBStaff): Staff {
  return {
    initials: row.initials, name: row.name, role: row.role,
    hometown: row.hometown, nationality: row.nationality ?? "",
    bio: row.bio ?? null, image: row.photo_url,
  };
}

function mapFixture(row: DBMatch): Fixture {
  return {
    date: row.date, time: row.time, opponent: row.opponent,
    home: row.home, venue: row.venue, address: row.address ?? undefined,
  };
}

type MatchMeta = { date: string; opponent: string; seasonId: string | null };

function buildMatchMap(data: unknown): Map<string, MatchMeta> {
  return new Map(
    ((data ?? []) as { id: string; date: string; opponent: string; season_id: string | null }[])
      .map((m) => [m.id, { date: m.date, opponent: m.opponent, seasonId: m.season_id }]),
  );
}

const byDate = <T extends { date: string }>(a: T, b: T) =>
  a.date < b.date ? -1 : a.date > b.date ? 1 : 0;


// ── Types ─────────────────────────────────────────────────────

export type MatchLogRow = {
  matchId:  string;
  date:     string;
  opponent: string;
  mins:     number;
  goals:    number;
  assists:  number;
  rating:   number | null;
};

export type PlayerMatchTrendPoint = {
  date:     string;
  opponent: string;
  value:    number;        // goals+assists for field players, saves for GKs
  mins:     number;
  rating:   number | null;
};


// ── Queries ───────────────────────────────────────────────────

/** Returns all seasons ordered newest first. */
export async function fetchSeasons(): Promise<DBSeason[]> {
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .order("start_year", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as DBSeason[];
}

/** Returns the single active season, or null when none is configured. */
export async function fetchActiveSeason(): Promise<DBSeason | null> {
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("active", true)
    .limit(1);
  if (error) throw new Error(error.message);
  return ((data ?? []) as DBSeason[])[0] ?? null;
}

/**
 * Fetches players grouped by position with season-aggregate stats.
 *
 * The cohort is determined by presence in the selected season's aggregate
 * stats. The active season additionally respects `players.active`, while
 * historical seasons retain players who have since been deactivated.
 * Falls back to the active season when omitted.
 */
export async function fetchRoster(seasonId?: string): Promise<{
  goalkeepers: Player[];
  defenders:   Player[];
  midfielders: Player[];
  forwards:    Player[];
  seasonLabel: string;
  seasonId:    string;
}> {
  let resolvedSeasonId = "";
  let seasonLabel      = "Current Season";
  let isActiveSeason   = false;

  if (seasonId) {
    const { data, error } = await supabase.from("seasons").select("*");
    if (error) throw new Error(`fetchRoster seasons: ${error.message}`);
    const season = ((data ?? []) as DBSeason[]).find((s) => s.id === seasonId) ?? null;
    resolvedSeasonId = seasonId;
    seasonLabel      = season?.label ?? "Season";
    isActiveSeason   = season?.active === true;
  } else {
    const { data, error } = await supabase.from("seasons").select("*").eq("active", true);
    if (error) throw new Error(`fetchRoster active season: ${error.message}`);
    const season = ((data ?? []) as DBSeason[])[0] ?? null;
    resolvedSeasonId = season?.id ?? "";
    seasonLabel      = season?.label ?? "Current Season";
    isActiveSeason   = season?.active === true;
  }

  const [fieldResult, goalkeeperResult] = await Promise.all([
    supabase.from("player_season_stats").select("*").eq("season_id", resolvedSeasonId),
    supabase.from("goalkeeper_season_stats").select("*").eq("season_id", resolvedSeasonId),
  ]);
  const seasonStatsError = fieldResult.error ?? goalkeeperResult.error;
  if (seasonStatsError) throw new Error(`fetchRoster season stats: ${seasonStatsError.message}`);

  const fieldStats = (fieldResult.data      ?? []) as Record<string, unknown>[];
  const gkStats    = (goalkeeperResult.data ?? []) as Record<string, unknown>[];

  const allPlayerIds = [
    ...fieldStats.map((r) => r.player_id as string),
    ...gkStats.map((r)    => r.player_id as string),
  ].filter(Boolean);

  const [playersResult, photosResult] = await Promise.all([
    supabase.from("players").select("*").in("id", allPlayerIds),
    supabase.from("player_photos")
      .select("player_id, url, sort_order")
      .in("player_id", allPlayerIds)
      .order("sort_order", { ascending: true }),
  ]);
  const rosterDataError = playersResult.error ?? photosResult.error;
  if (rosterDataError) throw new Error(`fetchRoster players: ${rosterDataError.message}`);

  const players = ((playersResult.data ?? []) as DBPlayer[]).filter(
    (player) => !isActiveSeason || player.active,
  );

  const photosByPlayer = new Map<string, string[]>();
  ((photosResult.data ?? []) as { player_id: string; url: string; sort_order: number }[]).forEach((r) => {
    const arr = photosByPlayer.get(r.player_id) ?? [];
    arr.push(r.url);
    photosByPlayer.set(r.player_id, arr);
  });

  const fieldStatsByPlayer = new Map<string, FieldStats>();
  fieldStats.forEach((r) => {
    fieldStatsByPlayer.set(r.player_id as string, {
      goals:         r.goals         as number,
      assists:       r.assists        as number,
      tackles:       r.tackles        as number,
      starts:        r.starts         as number,
      yellow:        r.yellow         as number,
      red:           r.red            as number,
      mins:          r.mins           as number,
      offsides:      (r.offsides      as number) ?? 0,
      fouls:         (r.fouls         as number) ?? 0,
      foulsSuffered: (r.fouls_suffered as number) ?? 0,
    });
  });

  const gkStatsByPlayer = new Map<string, GoalkeeperStats>();
  gkStats.forEach((r) => {
    gkStatsByPlayer.set(r.player_id as string, {
      goalsAgainst: r.goals_against as number,
      saves:        r.saves         as number,
      cleanSheets:  r.clean_sheets  as number,
      starts:       r.starts        as number,
      yellow:       r.yellow        as number,
      red:          r.red           as number,
      mins:         r.mins          as number,
    });
  });

  const mapped = players.map((row) => {
    const photos = photosByPlayer.get(row.id) ?? [];
    return row.position === "Goalkeeper"
      ? mapPlayer(row, gkStatsByPlayer.get(row.id)    ?? defaultGKStats(),    photos)
      : mapPlayer(row, fieldStatsByPlayer.get(row.id) ?? defaultFieldStats(), photos);
  });

  return {
    goalkeepers: mapped.filter((p) => p.position === "Goalkeeper"),
    defenders:   mapped.filter((p) => p.position === "Defender"),
    midfielders: mapped.filter((p) => p.position === "Midfielder"),
    forwards:    mapped.filter((p) => p.position === "Forward"),
    seasonLabel,
    seasonId: resolvedSeasonId,
  };
}

/** Fetches all active staff members. */
export async function fetchStaff(): Promise<Staff[]> {
  const { data, error } = await supabase
    .from("staff").select("*").eq("active", true).order("id", { ascending: true });
  if (error) throw new Error(`fetchStaff: ${error.message}`);
  return (data as DBStaff[]).map(mapStaff);
}

/**
 * Fetches per-match stats for a single player as a flat MatchLogRow[],
 * filtered to the given season. Powers the scatter plot, stacked bar,
 * donut, and match-log table.
 */
export async function fetchPlayerMatchLog(
  playerId: string,
  gk: boolean,
  seasonId: string,
): Promise<MatchLogRow[]> {
  const table  = gk ? "goalkeeper_match_stats" : "player_match_stats";
  const fields = gk
    ? "match_id, goals_against, saves, mins, rating"
    : "match_id, goals, assists, mins, rating";

  const { data: statsData, error: statsError } = await supabase
    .from(table).select(fields).eq("player_id", playerId).gt("mins", 0);
  if (statsError) throw new Error(statsError.message);

  const { data: matchData, error: matchError } = await supabase
    .from("matches").select("id, date, opponent, season_id").eq("season_id", seasonId);
  if (matchError) throw new Error(matchError.message);

  const matchMap = buildMatchMap(matchData);

  return ((statsData ?? []) as Record<string, unknown>[])
    .map((r) => {
      const match = matchMap.get(r.match_id as string);
      if (!match || match.seasonId !== seasonId) return null;
      return {
        matchId:  r.match_id as string,
        date:     match.date,
        opponent: match.opponent,
        mins:     Number(r.mins),
        goals:    gk ? 0 : Number(r.goals),
        assists:  gk ? 0 : Number(r.assists),
        rating:   coerceRating(r.rating),
      };
    })
    .filter((r): r is MatchLogRow => r !== null)
    .sort(byDate);
}

/**
 * Fetches per-match stats for a single player sorted chronologically.
 * Only matches where the player played (mins > 0) are included.
 * When `seasonId` is provided, results are scoped to that season.
 */
export async function fetchPlayerMatchTrend(
  playerId: string,
  gk: boolean,
  seasonId?: string,
): Promise<PlayerMatchTrendPoint[]> {
  const table  = gk ? "goalkeeper_match_stats" : "player_match_stats";
  const fields = gk
    ? "match_id, saves, mins, rating"
    : "match_id, goals, assists, mins, rating";

  const [{ data: statsData }, { data: matchData }] = await Promise.all([
    supabase.from(table).select(fields).eq("player_id", playerId).gt("mins", 0),
    supabase.from("matches").select("id, date, opponent, season_id"),
  ]);

  const matchMap = buildMatchMap(matchData);

  return ((statsData ?? []) as unknown as Record<string, unknown>[])
    .map((r) => {
      const match = matchMap.get(r.match_id as string);
      if (!match) return null;
      if (seasonId && match.seasonId !== seasonId) return null;
      return {
        date:     match.date,
        opponent: match.opponent,
        value:    gk ? Number(r.saves) : Number(r.goals) + Number(r.assists),
        mins:     Number(r.mins),
        rating:   coerceRating(r.rating),
      };
    })
    .filter((r): r is PlayerMatchTrendPoint => r !== null)
    .sort(byDate);
}

/** Fetches all matches ordered by date ascending. */
export async function fetchSchedule(seasonId?: string): Promise<Fixture[]> {
  let query = supabase.from("matches").select("*");
  if (seasonId) query = query.eq("season_id", seasonId);
  const { data, error } = await query;
  if (error) throw new Error(`fetchSchedule: ${error.message}`);
  return (data as DBMatch[]).map(mapFixture).sort((a, b) => {
    const ka = `${a.date}T${a.time ?? "00:00"}`;
    const kb = `${b.date}T${b.time ?? "00:00"}`;
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}
