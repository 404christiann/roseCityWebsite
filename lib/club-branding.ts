export const CLUB_LOGO_BUCKET = "logos_v2";
export const DEFAULT_CLUB_LOGO_PATH = "Rose City FC Patch Color.png";

export function clubLogoUrl(
  path: string = DEFAULT_CLUB_LOGO_PATH,
): string {
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${CLUB_LOGO_BUCKET}/${encodedPath}`;
}
