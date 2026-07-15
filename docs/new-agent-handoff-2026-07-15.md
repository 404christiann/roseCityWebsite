# Rose City FC New Agent Handoff - 2026-07-15

## Immediate Context

Christian wants the admin portal to support multiple seasons safely. The
database prep/backfill has been completed manually in Supabase. The next agent
should continue with app implementation, not restart the SQL gate.

The repo is at:

```text
/Users/christianalcala/Downloads/roseCityWebsite
```

## Completed In This Session

### Public Site UI

- Roster player cards changed from black overlay to white/light overlay.
- Roster card text/stat colors were flipped for the white treatment.
- Player-card country flag is positioned on the right, aligned with the bottom
  of the jersey number.
- Brand red changed to `#E7001B`.
- Brand black changed to `#141414`.
- Site-wide white was temporarily tested as `#F7F7F7`, then reverted to
  `#FFFFFF`.
- Navigation/header black accents were included in the color update.
- Lemon Milk font was unpacked from `~/Downloads/lemon_milk.zip` into
  `public/fonts/lemon-milk/`.
- Headings use `LEMON MILK` Bold Italic through local `@font-face` rules.
- Roster player modal was changed to a white/light card treatment.
- Player modal bio is collapsed initially; users can expand it.
- Homepage `Behind the Rose` heading and
  `Behind the Rose · Season 1 · Episode 1` eyebrow were adjusted to stay on one
  line across mobile and desktop.

### Admin Local Login

Local Supabase magic-link admin login was verified after adding redirect URLs:

```text
http://localhost:3000/admin/auth/callback
http://127.0.0.1:3000/admin/auth/callback
https://rose-city-website.vercel.app/admin/auth/callback
```

The login page uses:

```ts
emailRedirectTo: `${window.location.origin}/admin/auth/callback`
```

### Multi-Season Database Gate

Supabase was updated manually through the SQL editor.

Verified active season:

```text
id: e3e7e955-4e7d-4887-821b-06ccc23c2cf3
label: 2025–26
active: true
```

Completed database changes:

- Added `matches.season_id UUID REFERENCES seasons(id)`.
- Backfilled these matches to the active season:
  - `89c360c7-0e2f-4bcd-90f5-2cf12b1fd9a4`
  - `f0e4814d-882d-4bda-abf2-23a8e57569c2`
  - `ad3b0871-5409-4e03-bdee-1a4a5cb8eb03`
  - `769b62b1-d74a-48de-9834-1186429930b8`
  - `8bdf6790-b9f1-436a-ad34-93981b5da050`
- Backfilled null `season_id` rows in `player_season_stats`.
- Backfilled null `season_id` rows in `goalkeeper_season_stats`.
- Replaced season-stat table primary keys:
  - `player_season_stats`: `PRIMARY KEY (player_id, season_id)`
  - `goalkeeper_season_stats`: `PRIMARY KEY (player_id, season_id)`
- Added/kept supporting constraints and indexes:
  - one active season partial unique index
  - `matches_season_id_idx`

Verification results supplied by Christian:

```text
null_match_seasons = 0
null_goalkeeper_stat_seasons = 0
null_player_stat_seasons = 0
```

Constraint verification:

```text
goalkeeper_season_stats_pkey = PRIMARY KEY (player_id, season_id)
player_season_stats_pkey = PRIMARY KEY (player_id, season_id)
```

## Files Already Touched

Likely touched in this session:

- `components/PlayerCard.tsx`
- `components/PlayerModal.tsx`
- `components/BehindTheRose.tsx`
- `components/Nav.tsx`
- `styles/globals.css`
- `tailwind.config.ts`
- `public/fonts/lemon-milk/*`
- `db/migrations/2026-07-multi-season.sql`
- `docs/multi-season-implementation-plan.md`
- `HANDOFF.md`
- `SUMMARY.md`
- `CLAUDE.md`
- `.claude/CLAUDE.md`

There are also uncommitted changes from another agent around analytics/tests:

- `lib/queries.ts`
- `lib/db-types.ts`
- `lib/analytics-helpers.ts`
- `lib/db-utils.ts`
- `lib/__tests__/*`
- `package.json`
- `package-lock.json`
- `vitest.config.ts`
- `vitest.setup.ts`
- `player-viz-directions.html`

Do not revert these unless Christian explicitly asks.

## What Is Still Left

Continue from `docs/multi-season-implementation-plan.md`.

Priority order:

1. Add shared season helpers:
   - `fetchActiveSeason()` in `lib/queries.ts`
   - `lib/use-seasons.ts`
   - `components/admin/SeasonSelect.tsx`
2. Update `/admin/season-stats`:
   - add season selector
   - load and save rows scoped to selected `season_id`
   - use upsert conflict `player_id,season_id`
3. Update `/admin/schedule`:
   - add `season_id` to local types/forms
   - default new matches to active season
   - filter by selected season
   - prevent new `season_id: null` matches
4. Update `/admin/stats`:
   - filter match picker by selected season
   - clear selected match on season change
5. Update dashboard and public schedule:
   - use active season label from DB
   - count/show active-season matches only
6. Update roster admin season workflows:
   - seed zero active-season stats row when adding a player
   - guard season deletion
   - keep active-season update order compatible with the partial unique index
7. Verify:
   - `npx tsc --noEmit --pretty false`
   - `npm test`
   - manual browser check for admin pages

## Important Risks

- Do not implement `onConflict: "player_id,season_id"` in code against a DB
  that has not passed the gate. This project DB has passed, but another
  environment may not.
- Do not let admin schedule inserts create matches with `season_id = null`.
- Historical season rosters should be based on stats rows in that season, not
  `players.active`.
- The worktree is dirty and multi-agent. Inspect diffs before changing shared
  files.

## Useful Existing Docs

- `HANDOFF.md` - broad repo handoff plus latest session status.
- `SUMMARY.md` - quick codebase map.
- `docs/multi-season-implementation-plan.md` - implementation phases.
- `db/migrations/2026-07-multi-season.sql` - SQL runbook/history.
