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

The shipped baseline before the admin-managed shop release was `9568beb1` on
`main`. The worktree may contain the generated cache file
`tsconfig.tsbuildinfo`; do not treat it as product work or commit it by default.
Always inspect `git status` and current diffs before editing because this
repository has previously contained work from multiple agents.

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

## Verification

Latest release checks for the admin-managed shop work:

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
- Authenticated admin CRUD can receive an additional browser pass using safe
  test records if Christian explicitly requests it.
- `PartnerStrip.tsx` may still use older local partner artwork; the completed
  sponsor replacement specifically applies to the footer.
- The existing lint warnings above can be cleaned up separately.

## Working Rules

- Do not make broad reversions or erase unrelated dirty-worktree changes.
- Preserve the established visual system and recently tuned gradient/modal
  behavior unless Christian explicitly asks to change it.
- Keep all season-aware reads and writes scoped by `season_id`.
- Do not rerun the completed destructive database migration by default.
- Use `apply_patch` for edits, add focused tests for behavior changes, and run
  TypeScript, Vitest, and a production build before calling a change Vercel
  ready.
