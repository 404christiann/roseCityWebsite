# Rose City FC Website

Production website and protected club-management portal for Rose City Futbol
Club, a semi-professional UPSL team based in Pasadena, California.

Built with:

- `Next.js 14` App Router
- `TypeScript`
- `Tailwind CSS`
- `GSAP`
- `Supabase` PostgreSQL, Storage, and Auth
- `Vercel`

## What This Project Includes

The platform includes:

- a cinematic homepage
- a homepage "Next Match" card with team crests, optional per-match sponsor,
  and a live countdown
- active and historical season-aware rosters
- fixture and schedule management, including opponent-logo uploads
- player, match, and season statistics
- independently managed database-backed kit presentations for the homepage
  and shop page
- a protected admin portal for roster, schedule, seasons, stats, shop, branding, and platform billing
- footer social and partner links

## Design Direction

The visual language is intentionally:

- editorial, club-forward, and premium on public pages
- dense, dark, and operational in the admin portal
- heavy on bold display typography
- black / white / red / green brand palette

Main fonts:

- display: local `LEMON MILK` Bold Italic
- body: `DM Sans`

Core brand colors:

- red: `#E7001B`
- black: `#141414`
- white: `#FFFFFF`

## Shop Experience

- The homepage and `/shop` reuse the same `ShopKitSection` component while
  loading separate content and photo sets.
- Each presentation's content and one to six ordered photos come from Supabase. Multiple Kit Photos
  autoplay as a hands-off slideshow with no public controls; one photo remains static.
- `/admin/shop` lets approved club managers switch between Homepage and Shop
  Page, then independently edit each presentation with plain-language labels,
  manage up to eight ordered product bullet points, edit multiline store
  information, upload/reorder photos, and preview the exact public component.
- The admin editor adapts to mobile layouts.
- The cinematic shop slideshow remains implemented but is temporarily hidden
  with `SHOW_SHOP_HERO = false` in `lib/site-flags.ts`.

The shop schema, grants, row-level security, seed content, and Storage policies
are recorded in `db/migrations/2026-07-shop-kit-section.sql`. The production
database setup is already complete; do not rerun it by default. Existing
environments need the additive `db/migrations/2026-07-shop-kit-details.sql`
before bullet points and store information can be saved. The independent
homepage/shop production rows and policies were verified on 2026-07-17;
`db/migrations/2026-07-shop-kit-surfaces.sql` remains the setup path for new
environments and copies existing content without removing data.

## Shop Page Photo Row

- Below the kit section on `/shop` only (not the homepage), a static row of
  up to six admin-uploaded photos shows all at once — no autoplay, no
  arrows, no motion. Each photo is cropped to a fixed portrait shape so the
  row always looks uniform and gapless regardless of source-photo
  proportions or how many are uploaded.
- On mobile, the row scrolls horizontally instead of wrapping, since six
  columns don't fit a phone width.
- Managed from a "Photo Row" tab on `/admin/shop`, next to "Content" and
  "Kit Photos" tabs (the admin editor was split into tabs so only one
  section's fields render at a time, instead of one very long page).
- Backed by the `shop_carousel_photos` table (name predates the current
  static design; kept as-is since the schema didn't need to change). See
  `db/migrations/2026-07-shop-carousel.sql`, already run in production.
- The kit image uses the same white fade on the homepage and `/shop`, creating
  the intended transition into the photo row without exposing slideshow controls.

## Shared Club Logo

- `/admin/branding` lets an approved club manager upload the main club logo
  once and preview it on light and dark backgrounds.
- The saved logo updates website navigation and footer, the Next Match card,
  admin login/sidebar, player photo placeholders, and the browser tab icon.
- Player records without a real photo retain an empty semantic value, so their
  placeholder follows future logo changes without rewriting roster data.
- Uploads use the public `logos_v2/club-branding` path. Previous files are
  retained as a safety measure; saving only changes the active logo setting.

The production `site_branding` row, public `logos_v2` bucket, and signed-in
upload policies were manually verified on 2026-07-16. New environments must
run the additive `db/migrations/2026-07-site-branding.sql` before testing a
Branding save; it does not change the existing crest file.

## Next Match Card

- The homepage "Next Match" section (`components/NextMatchCard.tsx`) presents
  Rose City on the left, the opponent crest on the right, a large red title,
  an optional linked match sponsor, and a live Days/Hours/Min/Sec countdown.
- `/admin/schedule` lets club managers upload an opponent logo and set an
  optional competition label per match. It also manages sponsor name, logo,
  and optional website link; new matches prefill only sponsor fields from the
  latest match in the selected season. Logos without an upload fall back to
  an initial-monogram circle via the shared `components/OpponentCrest.tsx`,
  which is also used to show opponent crests on the public `/schedule`
  fixture list.
- Opponent logos upload to the public `opponent-logos` Storage bucket.
  `matches.opponent_logo_url` and `matches.competition` are recorded in
  `db/migrations/2026-07-next-match-card.sql`. The production database setup
  is already complete; do not rerun it by default.

Per-match sponsor columns and authenticated uploads to the public `sponsors`
bucket are recorded in `db/migrations/2026-07-match-sponsors.sql`. Production
was verified on 2026-07-17; apply the migration only in environments that do
not yet have these fields and policies. Existing matches are intentionally
left without a sponsor.

## Platform Billing

- Rose City FC pays Christian $65.00/mo for this platform via `/admin/payments`,
  visible to everyone on `ADMIN_ALLOWED_EMAILS` but only actionable by the
  single `BILLING_ADMIN_EMAIL`; other admins see a read-only status.
- Stripe's hosted Checkout and Billing Portal handle subscribe, cancel,
  undo-cancellation, card updates, and invoices — there's no custom payment
  UI anywhere in this app.
- A Supabase `stripe_subscription` singleton row is kept in sync by
  `app/api/stripe/webhook/route.ts`; `middleware.ts` reads it (never calling
  Stripe directly) to decide lockout state.
- If the subscription lapses, `/admin/*` soft-locks behind `/admin/payments`
  immediately (zero grace, since that's exactly what was already paid for).
  The public site (`/`, `/roster`, `/schedule`, `/shop`) gets an *additional*
  7-day buffer before it also locks, serving a neutral `503` placeholder with
  no billing language and `X-Robots-Tag: noindex`. `FORCE_PUBLIC_SITE_ONLINE=true`
  overrides only the public lock, as a manual courtesy switch.
- Full design/decision record and the Stripe Dashboard setup steps (test mode,
  then go-live) are in `docs/stripe-subscription-plan.md`.
- Local dev and production share one Supabase project. Local Stripe testing
  with test-mode keys writes into the same `stripe_subscription` row
  production reads — clear or re-sync it afterward before trusting it live.

## Social Links

Footer links currently point to:

- Instagram: `https://www.instagram.com/rosecityfutbolclub/`
- Facebook: `https://www.facebook.com/search/top?q=rose%20city%20futbol%20club`
- TikTok: `https://www.tiktok.com/@rosecityfc`
- X: `https://x.com/RoseCityFutbol`
- YouTube: `https://www.youtube.com/@RoseCityFC`

## Project Structure

Key folders:

- `app/` — public and protected admin routes
- `components/` — reusable public and admin UI
- `lib/` — Supabase clients, queries, types, hooks, and helpers
- `db/migrations/` — manually executed Supabase runbooks
- `public/` — local fonts, images, and brand assets
- `styles/` — global styling

Important files:

- `app/(public)/page.tsx` — homepage composition
- `app/(public)/shop/page.tsx` — public shop page
- `app/admin/(protected)/shop/page.tsx` — admin shop editor
- `app/admin/(protected)/branding/page.tsx` — shared club-logo editor
- `components/ClubBrandingProvider.tsx` — site-wide active-logo context
- `components/ShopKitSection.tsx` — shared public kit presentation
- `components/admin/AdminSaveFeedback.tsx` — shared save-state notification
- `lib/queries.ts` — Supabase data queries
- `lib/shop-kit.ts` — shop display and photo-diff helpers
- `app/admin/(protected)/payments/page.tsx` — Subscribe/Manage Billing (billing-admin only)
- `app/api/stripe/webhook/route.ts` — verifies Stripe signatures, syncs the subscription mirror
- `lib/stripe-subscription-state.ts` — pure admin (0-day) and public (+7-day) lockout logic
- `middleware.ts` — admin auth/allowlist/lockout and public-route subscription lockout

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Required environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_ALLOWED_EMAILS
BILLING_ADMIN_EMAIL
STRIPE_SECRET_KEY
STRIPE_PRICE_ID
STRIPE_WEBHOOK_SECRET
FORCE_PUBLIC_SITE_ONLINE   # optional
```

## Verification

Run before deployment:

```bash
npm test
npx tsc --noEmit --pretty false
npm run build
```

Current application baseline is commit `0d4150bf` on `main`. It includes
Stripe subscription billing (admin + public lockout), the homepage fixture
sponsor/countdown presentation, independent homepage/shop kit content and
photos, responsive player/staff card refinements, the static shop Photo Row,
and all earlier multi-season and branding work. Verification is 183/183
Vitest tests, passing TypeScript, and a passing production build. Pushes to
`main` trigger the Vercel deployment — but never push without the user's
explicit permission for that specific push.
