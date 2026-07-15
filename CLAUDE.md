# Rose City FC Agent Notes

This repo is the Rose City Futbol Club public website plus protected admin
portal. Treat it as a production Next.js/Supabase project for a real club.

## Current Status

- The public-site visual refresh from 2026-07-15 is in progress in the
  worktree: roster cards, roster modal, Lemon Milk headings, brand red/black,
  and `Behind the Rose` responsive heading fixes.
- The Supabase multi-season database gate is complete:
  - `matches.season_id` exists.
  - existing matches are backfilled.
  - `player_season_stats` and `goalkeeper_season_stats` use
    `PRIMARY KEY (player_id, season_id)`.
  - null `season_id` counts for matches/player stats/goalkeeper stats are `0`.
- Continue app work from `docs/multi-season-implementation-plan.md`, starting
  with Phase 1.
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

## Verification

Run these after code changes when possible:

```bash
npx tsc --noEmit --pretty false
npm test
```

Browser verification is still needed for admin multi-season UI changes after
implementation.
