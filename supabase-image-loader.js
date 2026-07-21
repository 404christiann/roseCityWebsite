// Routes next/image requests for Supabase-hosted assets through Supabase's
// own Image Transformation API (Storage > Image Resizing, requires Pro plan)
// instead of Vercel's Image Optimization API. This keeps the site on
// Vercel's free-tier image transformation quota while still serving
// resized/optimized images for anything uploaded to Supabase Storage
// (crests, roster/staff photos, shop photos, sponsor + opponent logos, etc).
//
// Local static assets under /public (e.g. /images/hero-poster.jpg) are not
// hosted on Supabase, so they're passed through unchanged — Next serves them
// as-is without any optimization. There are only a couple of these in the
// codebase today (Hero.tsx, ChampionsBadge.tsx), so the tradeoff is fine.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function supabaseLoader({ src, width, quality }) {
  if (!supabaseUrl || !src.startsWith(supabaseUrl)) {
    return src;
  }

  const transformedSrc = src.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );

  const params = new URLSearchParams({
    width: String(width),
    quality: String(quality ?? 75),
  });

  return `${transformedSrc}?${params.toString()}`;
}
