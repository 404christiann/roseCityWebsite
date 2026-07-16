# Rose City FC Agent Notes

This repo is the Rose City Futbol Club public website plus protected admin
portal. Treat it as a production Next.js/Supabase project for a real club.

## Current Status

- The 2026-07-15 public-site, roster, storefront, sponsor, and navigation
  refresh is shipped on `main` through commit `9568beb1`.
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
- The shared 2026 kit section is editable at `/admin/shop`; the homepage and
  `/shop` render the same database-backed component and ordered photo set.
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

## Verification

Run these after code changes when possible:

```bash
npx tsc --noEmit --pretty false
npm test
npm run build
```

Latest verified result: TypeScript passed, all 117 Vitest tests passed, and the
production build passed. The build still reports non-blocking Next.js lint
warnings for a few raw `<img>` elements and unnecessary analytics `useMemo`
dependencies. Destructive authenticated CRUD should only be tested with safe
test data or explicit approval.
