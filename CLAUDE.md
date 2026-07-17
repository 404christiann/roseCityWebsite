# Rose City FC Agent Notes

This repo is the Rose City Futbol Club public website plus protected admin
portal. Treat it as a production Next.js/Supabase project for a real club.

## Current Status

- Local pending rollout: the homepage Next Match section now follows the
  crest/VS/Next Match/optional sponsor/countdown hierarchy. Per-match sponsor
  name, logo, and optional link are managed in `/admin/schedule`; Add Match
  carries sponsor fields from the latest scheduled match in that season.
  Existing matches remain unsponsored. The production columns and sponsor
  upload policies were verified on 2026-07-17; retain
  `db/migrations/2026-07-match-sponsors.sql` for new environments.
- Local pending rollout: homepage and `/shop` kit presentations are now
  independently editable. Each surface has its own heading, title,
  description, bullet points, store note, purchase button/link, and ordered
  Kit Photos. The production surface rows, photo sets, and authenticated write
  policies were verified on 2026-07-17. Retain the surface and RLS migrations
  for new environments and repairs.

- The admin-managed shop experience and prior public-site, roster, storefront,
  sponsor, navigation, and multi-season work are shipped on `main` through
  application commit `91d0081e`; the post-release documentation head is
  `1c2b6456`.
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
- The only expected local worktree change after verification is the generated
  TypeScript cache `tsconfig.tsbuildinfo`; do not commit it by default.
- A full continuation packet lives at
  `docs/new-agent-handoff-2026-07-15.md`.

## Project Rules

- Do not revert broad worktree changes. Multiple agents have touched this repo.
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

Current release-candidate result: TypeScript passed, all 153 Vitest tests passed,
and the production build passed. The build still reports non-blocking Next.js lint
warnings for a few raw `<img>` elements and unnecessary analytics `useMemo`
dependencies. Destructive authenticated CRUD should only be tested with safe
test data or explicit approval.
