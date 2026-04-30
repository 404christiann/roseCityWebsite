// ─────────────────────────────────────────────
//  Raw row types from Supabase — mirrors the DB schema exactly.
//  Do NOT use these directly in components; use the mapped types
//  from lib/data.ts via lib/queries.ts instead.
// ─────────────────────────────────────────────

export type DBPlayer = {
  id: string;
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
  id: string;
  initials: string;
  name: string;
  role: string;
  hometown: string;
  photo_url: string;
  active: boolean;
};

export type DBMatch = {
  id: string;
  date: string;
  time: string;
  opponent: string;
  home: boolean;
  venue: string;
  address: string | null;
};

export type DBPlayerMatchStats = {
  id: string;
  player_id: string;
  match_id: string;
  goals: number;
  assists: number;
  tackles: number;
  starts: number;
  yellow: number;
  red: number;
  mins: number;
};

export type DBGoalkeeperMatchStats = {
  id: string;
  player_id: string;
  match_id: string;
  goals_against: number;
  saves: number;
  clean_sheets: number;
  starts: number;
  yellow: number;
  red: number;
  mins: number;
};
