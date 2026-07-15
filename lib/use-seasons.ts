"use client";

import { useEffect, useState } from "react";
import type { DBSeason } from "@/lib/db-types";
import { createClient } from "@/lib/supabase-browser";

export function useSeasons() {
  const [seasons, setSeasons] = useState<DBSeason[]>([]);
  const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSeasons() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("seasons")
        .select("*")
        .order("start_year", { ascending: false });

      if (cancelled) return;
      if (error) {
        console.error("Failed to load seasons:", error.message);
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as DBSeason[];
      const active = rows.find((season) => season.active) ?? null;
      const defaultSeasonId = active?.id ?? rows[0]?.id ?? "";

      setSeasons(rows);
      setActiveSeasonId(active?.id ?? null);
      setSelectedSeasonId((current) => current || defaultSeasonId);
      setLoading(false);
    }

    loadSeasons();
    return () => { cancelled = true; };
  }, []);

  return {
    seasons,
    activeSeasonId,
    selectedSeasonId,
    setSelectedSeasonId,
    loading,
  };
}
