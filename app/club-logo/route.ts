import { NextResponse } from "next/server";
import { clubLogoUrl, DEFAULT_CLUB_LOGO_PATH } from "@/lib/club-branding";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data } = await supabase
    .from("site_branding")
    .select("club_logo_path")
    .eq("id", 1)
    .limit(1);
  const logoPath =
    (data as { club_logo_path?: string }[] | null)?.[0]?.club_logo_path ||
    DEFAULT_CLUB_LOGO_PATH;
  const response = NextResponse.redirect(clubLogoUrl(logoPath));
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
