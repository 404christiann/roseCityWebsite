# Rose City FC New Agent Handoff - 2026-07-15

## Start Here

Repository:

```text
/Users/christianalcala/Downloads/roseCityWebsite
```

Read these files in order:

1. `CLAUDE.md`
2. `HANDOFF.md`
3. `SUMMARY.md`
4. this file
5. `docs/multi-season-implementation-plan.md`
6. `db/migrations/2026-07-multi-season.sql`

The latest shipped change is `9f39c02b` (`Enlarge and clean up opponent crests
on the public schedule list`) on `main`. This handoff was originally written
at `1737959a` (`Add admin-managed shop experience`); everything below the
"Current Product State" heading still applies as of `9f39c02b` — see the
"Next Match Card And Opponent Logos — 2026-07-16" section below for what
shipped on top of it. The worktree may contain the generated cache file
`tsconfig.tsbuildinfo`; do not treat it as product work or commit it by
default. Always inspect `git status` and current diffs before editing because
this repository has previously contained work from multiple agents.

## Current Product State

The public website and protected Supabase admin portal are production Next.js
applications deployed by Vercel. The visual refresh and multi-season admin work
described in older handoffs are complete; do not restart those phases.

Brand and typography to preserve:

- Lemon Milk for display headings and DM Sans for body/navigation text.
- red `#E7001B`, black `#141414`, and white `#FFFFFF`.
- public pages should feel editorial and club-forward.
- admin pages should remain dense, dark, and operational.

## Multi-Season Implementation - Complete

Supabase gate:

- `matches.season_id` exists and existing matches are backfilled.
- `player_season_stats` and `goalkeeper_season_stats` use
  `PRIMARY KEY (player_id, season_id)`.
- null season counts for matches and both season-stat tables are `0`.
- the active season is `2025–26`, id
  `e3e7e955-4e7d-4887-821b-06ccc23c2cf3`.

Application behavior:

- `fetchActiveSeason()`, `useSeasons`, and the shared admin `SeasonSelect`
  exist.
- `/admin/seasons` is the dedicated, intuitive season-management page.
- `/admin/season-stats` loads and saves the selected season using conflict key
  `(player_id, season_id)`.
- `/admin/schedule` requires a season on every match and filters the list by
  season.
- `/admin/stats` filters its match picker and player cohort by season.
- the dashboard and public schedule use the active-season label and matches.
- adding a player seeds a zero stats row in the active season.
- season deletion is guarded against matches or non-zero stats; permitted
  deletion removes zero seed rows first.

### Player Activation Contract

This lifecycle was added after a public-roster regression:

- the active-season public roster must exclude `players.active = false`.
- historical rosters remain based on season-stat row membership so former
  players still appear in their historical season.
- activating an inactive or older player first upserts a zero active-season
  stats row with `ignoreDuplicates: true`, preserving any existing totals, and
  then sets the player active.
- deactivation keeps season statistics intact.
- admin roster mutations surface errors rather than silently appearing to
  succeed.

Tests cover active to inactive to active, inactive to active to inactive, and
new/older player activation scenarios. Keep these semantics when changing
roster queries or admin actions.

## Shipped Public UI

- Homepage video hero is approximately half-screen on desktop; mobile remains
  immersive.
- The UPSL SoCal North Conference feature is also approximately half-screen.
- Homepage hero CTA is `Team Store`, links to `/shop`, and has no arrow.
- The two-image 2026 kit treatment is used on the homepage immediately after
  the video and on `/shop`; images come from the public Supabase `shop` bucket.
- `/admin/shop` edits the shared kit content, purchase link, and ordered photo
  set. Its scaled preview uses the same public component, and the editor adapts
  to mobile admin layouts.
- Shop form labels use plain language for non-technical club managers.
- Save actions throughout the admin portal use the shared subtle
  saving/success feedback treatment.
- Shop purchase labels are non-bold, detail headings are non-italic, and the
  `Purchase Details` section heading is italic.
- The shop cinematic slideshow remains implemented but is temporarily hidden
  with `SHOW_SHOP_HERO = false` in `lib/site-flags.ts`.
- Navigation shows Rose City, US Soccer, FIFA, Lamar Hunt U.S. Open Cup, and
  UPSL marks from the public `logos_v2` bucket. Only the Rose City mark links,
  and it links home. US Soccer and UPSL remain in color. White variants appear
  over the homepage video, with regular/color variants after scroll and on
  light interior states.
- Navigation labels use DM Sans without changing their established sizing.
- The Rose City color patch from `logos_v2` is shared by the navigation and
  player cards that have no headshot.
- Roster nationality flags come from the public Supabase `flags` bucket and
  hide gracefully when no mapping or asset exists.
- Player and technical-staff cards/modals use the white treatment. Staff roles
  are hidden on the outer cards but remain visible inside the modal.
- Player and staff modal dimensions are bounded by a fixed-yet-responsive
  viewport height with internally scrolling details.
- Player bio and Season Stats sections begin collapsed.
- Footer sponsors, except Tepito Coffee, use the public Supabase `sponsors`
  bucket. They are larger and remain fully visible without hover.
- `Behind the Rose` responsive headings retain their one-line fixes.

## Authentication And Deployment

- Admin auth uses Supabase email magic links.
- Access is controlled by the comma-separated `ADMIN_ALLOWED_EMAILS`
  environment variable; do not hardcode admin emails.
- A user needs a Supabase Auth account/invitation, their email in the Vercel
  environment variable, and a redeploy after environment changes.
- Supabase Redirect URLs must include the deployment callback, for example
  `https://rose-city-website.vercel.app/admin/auth/callback`. A magic link that
  redirects to the site root is a configuration problem, not a reason to
  hardcode a redirect.
- Pushes to `main` trigger Vercel deployment.

## Admin-Managed Shop Data - Complete

- `shop_kit_section` stores the single shared text and purchase-link record.
- `shop_kit_photos` stores one to four ordered public image URLs.
- The homepage and `/shop` both use `ShopKitSectionContainer` and the same
  `ShopKitSection` presentation component.
- `/admin/shop` supports uploads to the public `shop` bucket, photo removal and
  ordering, draft preview, and responsive mobile administration.
- Current unshipped work adds one to eight editable/reorderable product bullet
  points and editable multiline store information to the same editor and exact
  public preview.
- `db/migrations/2026-07-shop-kit-section.sql` records the tables, grants, RLS
  policies, seed content, and storage policies for future environments.
- Production setup is complete. Do not rerun the migration against production
  unless the schema has been re-verified and Christian explicitly requests it.
- The new `bullet_points` and `store_note` columns are an additive follow-up.
  Run `db/migrations/2026-07-shop-kit-details.sql` before testing those saves;
  do not rerun the original Shop migration.

## Shared Club Branding - Current Unshipped Work

- `/admin/branding` provides one plain-language main-logo upload workflow with
  file validation, light/dark previews, and the shared save feedback.
- `site_branding` is a singleton public-read/authenticated-write record. The
  active logo is stored as a `logos_v2` object path rather than a fixed URL.
- `ClubBrandingProvider` supplies navigation, footer, admin login/sidebar,
  next-match crest, and roster placeholder views.
- `/club-logo` dynamically redirects the browser icon to the active crest.
- Missing player photos stay empty in storage. Legacy logo placeholders are
  normalized back to empty on save so they continue following the active crest.
- Run the additive, idempotent
  `db/migrations/2026-07-site-branding.sql` before testing an admin upload.
  It does not remove or replace the current crest, and old uploads are retained.

## Verification

Current unshipped Shop-details and shared-branding worktree:

```text
npm test                         129/129 tests passed across 6 files
npx tsc --noEmit --pretty false passed
npm run build                    passed
```

Latest release checks (2026-07-16, after the Next Match card / opponent-logo
work, commit `9f39c02b`):

```text
npm test                         117/117 tests passed across 5 files
npx tsc --noEmit --pretty false passed
npm run build                    passed
```

Earlier release checks for the admin-managed shop work:

```text
npm test                         117/117 tests passed across 5 files
npx tsc --noEmit --pretty false passed
npm run build                    passed
```

Known non-blocking build warnings:

- raw `<img>` warnings in the analytics page and `Hero.tsx`.
- unnecessary `useMemo` dependency warnings in the analytics page.

Earlier route smoke checks returned `200` for `/roster`, `/schedule`, and
`/admin/login`; `/admin` correctly redirected unauthenticated requests to login.
Do not mutate production data merely to repeat destructive CRUD verification.

## Remaining Work / Known Limitations

- The analytics data layer supports nullable match ratings, but the Match Stats
  admin form does not expose a rating input. Confirm rating columns and unique
  constraints in the target database before implementing it.
- Stat submissions are last-write-wins; there is no approval/review workflow.
- Supabase database types are handwritten, and season-stat paths still contain
  record casts. Generated types would improve safety.
- The shop tables and storage bucket require the grants and RLS policies
  recorded in `db/migrations/2026-07-shop-kit-section.sql`. The production
  database setup has already been completed; do not rerun it by default.
- The Branding editor requires `site_branding` and the scoped
  `logos_v2/club-branding` upload policy from
  `db/migrations/2026-07-site-branding.sql`; this additive migration is not yet
  confirmed in production.
- Authenticated admin CRUD can receive an additional browser pass using safe
  test records if Christian explicitly requests it.
- `PartnerStrip.tsx` may still use older local partner artwork; the completed
  sponsor replacement specifically applies to the footer.
- The existing lint warnings above can be cleaned up separately.

## Next Match Card And Opponent Logos — 2026-07-16

Shipped on top of the `1737959a` baseline above, through commit `9f39c02b`.

- The homepage "Next Match" section was redesigned from a live ticking
  countdown to a static match card. `components/Countdown.tsx` was deleted;
  `components/NextMatchCard.tsx` replaces it and is wired into
  `app/(public)/page.tsx` in its place.
- Card layout: Rose City crest (static `ROSE_CITY_PATCH_URL`, always on the
  left regardless of home/away) — red "VS" — opponent crest — optional black
  competition-label pill (hidden when unset) — giant red italic day-of-week
  word — a small `Month Day · Kickoff H:MM AM/PM · Venue` line, tuned to stay
  on one line on mobile (no weekday abbreviation, tighter tracking/font floor,
  `whitespace-nowrap`) — "Full Schedule" CTA retained below.
- New shared component `components/OpponentCrest.tsx`: circular crest that
  renders an uploaded logo image with no added backdrop or border (shows the
  crest artwork as-is), or falls back to an initial-monogram circle when no
  logo is set or the image fails to load. Takes a `variant: "light" | "dark"`
  prop — `"dark"` swaps the fallback monogram/backdrop to a legible
  white-on-translucent treatment for use on colored backgrounds.
- `components/FixtureRow.tsx` (public `/schedule` list) also renders an
  `OpponentCrest` next to the opponent name — 56px, `dark` variant on the
  highlighted next-match row (that row has a dark green background, so the
  default light-variant fallback was nearly invisible there before this fix).
- `/admin/schedule` gained an optional "Competition" text input and an
  opponent-logo upload control on the add/edit match form (same
  select-file → upload → store public URL pattern as `/admin/shop`), plus a
  crest thumbnail in each match's list row.
- Data model: `matches.opponent_logo_url` and `matches.competition`, both
  nullable `text`. New public Storage bucket `opponent-logos`. Both were
  created manually in Supabase per `db/migrations/2026-07-next-match-card.sql`
  (bucket created via dashboard first, then the SQL runbook for columns,
  grants, and storage policies) — already applied to production; do not
  rerun by default.
- `lib/db-types.ts` (`DBMatch`), `lib/data.ts` (`Fixture`), and
  `lib/queries.ts` (`mapFixture`) were updated to carry the two new fields
  through to the UI layer.
- No new tests were added for this feature (it's presentational/admin-CRUD,
  no new pure logic); the existing 117-test suite still covers everything it
  did before and still passes.

## Working Rules

- Do not make broad reversions or erase unrelated dirty-worktree changes.
- Preserve the established visual system and recently tuned gradient/modal
  behavior unless Christian explicitly asks to change it.
- Keep all season-aware reads and writes scoped by `season_id`.
- Do not rerun the completed destructive database migration by default.
- Use `apply_patch` for edits, add focused tests for behavior changes, and run
  TypeScript, Vitest, and a production build before calling a change Vercel
  ready.
