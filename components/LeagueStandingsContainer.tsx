"use client";

import { useEffect, useState } from "react";
import LeagueStandingsTable from "@/components/LeagueStandingsTable";
import { fetchLeagueStandings } from "@/lib/queries";
import {
  DEFAULT_STANDINGS_ROWS,
  DEFAULT_STANDINGS_SETTINGS,
  type StandingsTableContent,
} from "@/lib/standings-content";

export default function LeagueStandingsContainer() {
  const [content, setContent] = useState<StandingsTableContent>({
    settings: DEFAULT_STANDINGS_SETTINGS,
    rows: DEFAULT_STANDINGS_ROWS,
  });

  useEffect(() => {
    fetchLeagueStandings()
      .then(setContent)
      .catch((error) => {
        console.error("LeagueStandingsContainer:", error);
      });
  }, []);

  return (
    <LeagueStandingsTable
      settings={content.settings}
      rows={content.rows}
    />
  );
}
