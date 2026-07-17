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
  bio: string | null;
  pronunciation: string | null;
  foot: string | null;
};

export type DBStaff = {
  id: string;
  initials: string;
  name: string;
  role: string;
  hometown: string;
  nationality: string;
  bio: string | null;
  photo_url: string;
  active: boolean;
};

export type DBMatch = {
  id: string;
  date: string;
  time: string;
  opponent: string;
  opponent_logo_url: string | null;
  competition: string | null;
  home: boolean;
  venue: string;
  address: string | null;
  season_id: string | null;
};

export type DBSeason = {
  id: string;
  label: string;
  start_year: number;
  end_year: number;
  active: boolean;
  created_at: string;
};

export type DBPlayerPhoto = {
  id: string;
  player_id: string;
  url: string;
  sort_order: number;
  created_at: string;
};

export type DBPlayerMatchStats = {
  id: string;
  player_id: string;
  match_id: string;
  starts: boolean;        // checkbox in the stats entry form
  mins: number;
  goals: number;
  assists: number;
  tackles: number;
  offsides: number;
  fouls: number;
  fouls_suffered: number;
  yellow: number;
  red: number;
  rating: number | null;
};

export type DBGoalkeeperMatchStats = {
  id: string;
  player_id: string;
  match_id: string;
  starts: boolean;        // checkbox in the stats entry form
  mins: number;
  goals_against: number;
  saves: number;
  clean_sheets: number;
  yellow: number;
  red: number;
  rating: number | null;
};

export type DBShopKitSection = {
  id: number;
  eyebrow: string;
  title: string;
  description: string;
  bullet_points: string[];
  store_note: string;
  cta_label: string;
  cta_link: string;
  updated_at: string;
};

export type DBShopKitPhoto = {
  id: string;
  url: string;
  sort_order: number;
  created_at: string;
};

export type DBShopCarouselPhoto = {
  id: string;
  url: string;
  sort_order: number;
  created_at: string;
};

export type DBSiteBranding = {
  id: number;
  club_logo_path: string;
  updated_at: string;
};
