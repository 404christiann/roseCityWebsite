// ─────────────────────────────────────────────
//  Raw row types from Supabase — mirrors the DB schema exactly.
//  Do NOT use these directly in components; use the mapped types
//  from lib/data.ts via lib/queries.ts instead.
// ─────────────────────────────────────────────

export type DBPlayer = {
  id: number;
  number: number;
  name: string;
  caption: string | null;
  nationality: string;
  position: "Goalkeeper" | "Defender" | "Midfielder" | "Forward";
  height: string;
  weight: string;
  hometown: string;
  age: number;
  school: string | null;
  previous_club: string | null;
  photo_url: string;
  active: boolean;
};

export type DBStaff = {
  id: number;
  initials: string;
  name: string;
  role: string;
  hometown: string;
  photo_url: string;
  active: boolean;
};

export type DBMatch = {
  id: number;
  date: string;
  time: string;
  opponent: string;
  home: boolean;
  venue: string;
  address: string | null;
};

export type DBPlayerMatchStats = {
  id: number;
  player_id: number;
  match_id: number;
  goals: number;
  assists: number;
  tackles: number;
  starts: number;
  yellow: number;
  red: number;
  mins: number;
};

export type DBGoalkeeperMatchStats = {
  id: number;
  player_id: number;
  match_id: number;
  goals_against: number;
  saves: number;
  clean_sheets: number;
  starts: number;
  yellow: number;
  red: number;
  mins: number;
};
