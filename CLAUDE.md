# Rose City FC Agent Notes

This repo is the Rose City Futbol Club public website plus protected admin
portal. Treat it as a production Next.js/Supabase project for a real club.

## Current Status

- Shipped in `0d4150bf` (built on `a94d4958`/`29f3ada5`): Stripe subscription
  billing for the platform itself — Rose City FC pays Christian $65.00/mo
  (the Starter-tier price, not the originally planned $99.99 Pro price) via a
  new billing-admin-only `/admin/payments` tab. Stripe's hosted Checkout and
  Billing Portal handle subscribe/cancel/undo-cancel/update-card; there is no
  custom payment UI. A Supabase `stripe_subscription` singleton row, kept in
  sync by `app/api/stripe/webhook/route.ts`, is what `middleware.ts` reads to
  decide lockout state — it never calls the Stripe API directly.
  - Admin lockout: once the subscription is genuinely terminal (past what was
    already paid for, zero grace beyond that), every `/admin/*` route except
    `/admin/payments` redirects there.
  - Public lockout: `/`, `/roster`, `/schedule`, `/shop` get an additional
    7-day buffer beyond the admin lockout before serving a neutral `503`
    placeholder (no billing language, no contact info) with
    `X-Robots-Tag: noindex`. `FORCE_PUBLIC_SITE_ONLINE=true` overrides only
    the public lock, never the admin one.
  - Only `BILLING_ADMIN_EMAIL` (`christianjavieralcala@gmail.com`) sees the
    Subscribe/Manage Billing buttons; other `ADMIN_ALLOWED_EMAILS` see a
    read-only status instead.
  - New env vars: `BILLING_ADMIN_EMAIL`, `STRIPE_SECRET_KEY`,
    `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `FORCE_PUBLIC_SITE_ONLINE`.
  - Live Stripe keys, the live webhook
    (`https://rosecityfutbolclub.com/api/stripe/webhook`), and live Vercel
    Production env vars are configured and deployed. As of this handoff the
    first real live charge had not yet been completed — the
    `stripe_subscription` table is intentionally empty (`no_subscription`,
    unlocked), not an error state.
  - Full design/decision record and the Stripe Dashboard setup steps (test
    mode, then go-live) are in `docs/stripe-subscription-plan.md`.
  - Known risk: local dev and production currently share one Supabase
    project. Local Stripe testing with test-mode keys writes into the same
    `stripe_subscription` row production reads — clear or re-sync that row
    after any future local Stripe testing before trusting it in production.
  - Known limitation: admin magic-link login uses Supabase's PKCE flow, which
    requires requesting and opening the link in the same browser/device;
    requesting on one device and opening the email on another will fail.
- Shipped in `5fb0b6fd`: the homepage Next Match section follows the
  crest/VS/Next Match/optional sponsor/countdown hierarchy. Per-match sponsor
  name, logo, and optional link are managed in `/admin/schedule`; Add Match
  carries sponsor fields from the latest scheduled match in that season.
  Existing matches remain unsponsored. The production columns and sponsor
  upload policies were verified on 2026-07-17; retain
  `db/migrations/2026-07-match-sponsors.sql` for new environments.
- Shipped in `5fb0b6fd`: homepage and `/shop` kit presentations are
  independently editable. Each surface has its own heading, title,
  description, bullet points, store note, purchase button/link, and ordered
  Kit Photos. The production surface rows, photo sets, and authenticated write
  policies were verified on 2026-07-17. Retain the surface and RLS migrations
  for new environments and repairs.

- The current application baseline is `0d4150bf` on `main`. It includes
  Stripe subscription billing (admin + public lockout), the fixture
  sponsor/countdown work, independent homepage/shop kit content, responsive
  roster-card refinements, and all earlier admin-managed shop, branding,
  navigation, and multi-season work.
- The shop page gained a static "Photo Row" gallery below the kit section on
  `/shop` only (never the homepage): up to six admin-uploaded photos, all
  shown at once with no motion, each cropped to a fixed portrait shape so the
  row stays gapless and uniform regardless of source-photo proportions or
  count. Shipped as `6fe91a9f` (replacing an earlier autosliding-carousel
  attempt from `e47e3085` that was superseded before release) and tuned in
  `5ce20126`. Key files: `components/ShopPhotoStrip.tsx`,
  `ShopPhotoStripContainer.tsx`, `components/admin/ScaledShopPhotoStripPreview.tsx`,
  `lib/shop-photo-strip.ts`. Backed by the existing `shop_carousel_photos`
  table (name kept as-is; no schema change was needed to raise the max from 4
  to 6) — see `db/migrations/2026-07-shop-carousel.sql`, already run in
  production. Managed from a "Photo Row" tab on `/admin/shop` alongside the
  existing kit-photo editor.
- The kit image now fades into the white page through a dedicated overlay on
  both the homepage and `/shop`, preserving the transition into the photo row.
  The shared gradient and hands-off Kit Photos slideshow were browser-verified
  locally on both public routes.
- The homepage "Next Match" section is `components/NextMatchCard.tsx`: Rose
  City crest, split-line "VS", opponent crest, large red title, optional
  linked "Presented By" sponsor, live Days/Hours/Min/Sec countdown, and the
  retained "Full Schedule" CTA. Rose City stays on the left.
- Homepage section order is Hero → Home kit presentation → trophy feature →
  Next Match → photo slideshow → Behind the Rose.
- Admins can upload an opponent logo and set a competition label per match
  from `/admin/schedule`. Opponent crests also render on the public
  `/schedule` fixture list (`components/FixtureRow.tsx`), sized larger on the
  highlighted next-match row with a dark-background variant for contrast.
  Matches without an uploaded logo fall back to an initial monogram via the
  shared `components/OpponentCrest.tsx`.
- `matches.opponent_logo_url` and `matches.competition` (both nullable text)
  and the public `opponent-logos` Storage bucket exist in production; see
  `db/migrations/2026-07-next-match-card.sql`.
- The Supabase multi-season database gate and app implementation are complete:
  - `matches.season_id` exists.
  - existing matches are backfilled and admin match creation requires a season.
  - `player_season_stats` and `goalkeeper_season_stats` use
    `PRIMARY KEY (player_id, season_id)`.
  - null `season_id` counts for matches/player stats/goalkeeper stats are `0`.
  - season selectors, active-season public data, season management, player
    stat seeding, delete guards, and activation lifecycle handling are live.
- The active season is `2025–26`, id
  `e3e7e955-4e7d-4887-821b-06ccc23c2cf3`.
- The shop slideshow is intentionally hidden, not deleted. Its switch is
  `SHOW_SHOP_HERO` in `lib/site-flags.ts`.
- The homepage and `/shop` reuse the same kit presentation component but load
  independent database-backed content and ordered photo sets selected from
  `/admin/shop`.
- Multiple Kit Photos autoplay as a hands-off horizontal slideshow with no
  public arrows, dots, dragging, or swiping; a single photo remains static.
- The Shop editor supports up to eight editable/reorderable bullet points and
  editable multiline store information. New environments must apply
  `db/migrations/2026-07-shop-kit-details.sql` before those saves.
- `/admin/branding` lets an approved admin upload one shared club logo that
  updates navigation, footer, admin identity, next-match crest, player
  placeholders, and the browser icon. New environments must apply
  `db/migrations/2026-07-site-branding.sql` first.
- Production `site_branding`, the public `logos_v2` bucket, and the signed-in
  Storage policies were manually verified on 2026-07-16. Do not rerun branding
  setup against production by default.
- Admin save actions use the shared subtle saving/success feedback treatment.
- Player card stats remain a desktop-hover treatment; mobile taps open the
  modal directly. Staff cards keep the same white photo fade on mobile and
  show the name, nationality flag, initials badge, and staff title.
- Player modal Bio and Season Stats controls begin expanded but remain
  collapsible.
- The only expected local worktree change after verification is the generated
  TypeScript cache `tsconfig.tsbuildinfo`; do not commit it by default.
- A full continuation packet lives at
  `docs/new-agent-handoff-2026-07-15.md`. The Stripe billing design/decision
  record and Dashboard setup steps live at `docs/stripe-subscription-plan.md`.

## Project Rules

- Do not revert broad worktree changes. Multiple agents have touched this repo.
- Local dev and production share one Supabase project — there is no separate
  test database. Before/after any local Stripe test-mode webhook testing,
  clear or re-sync the `stripe_subscription` row (it's a singleton, `id = 1`)
  so stale test data never gets read by the live site.
- Preserve the local Lemon Milk font setup in `public/fonts/lemon-milk/`.
- Keep brand tokens aligned with current CSS/Tailwind:
  - red: `#E7001B`
  - black: `#141414`
  - white: `#FFFFFF`
- Admin pages should stay dense, dark, and operational.
- Public pages should stay editorial and club-forward.
- Use Supabase schema explicitly and keep season-aware queries scoped by
  `season_id` where admin workflows require it.
- Never `git push` to `main` (or any branch Vercel deploys from) without the
  user's explicit permission for that specific push. A prior push being
  approved does not carry forward — ask again each time, especially during
  active iterative visual tuning.

## Verification

Run these after code changes when possible:

```bash
npx tsc --noEmit --pretty false
npm test
npm run build
```

Current shipped-release result (`0d4150bf`): TypeScript passed, all 183 Vitest tests passed,
and the production build passed. The build still reports non-blocking Next.js lint
warnings for a few raw `<img>` elements and unnecessary analytics `useMemo`
dependencies. Destructive authenticated CRUD should only be tested with safe
test data or explicit approval. The Stripe integration was verified end-to-end
in test mode (subscribe, cancel, undo-cancel, admin lockout, public lockout at
the 7-day boundary) before going live; see `docs/stripe-subscription-plan.md`
for the full verification record.
