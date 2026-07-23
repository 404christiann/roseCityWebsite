# Claude Entry Point

Read the root `CLAUDE.md` first, then read:

- `HANDOFF.md`
- `SUMMARY.md`
- `docs/new-agent-handoff-2026-07-15.md`
- `docs/multi-season-implementation-plan.md`
- `docs/stripe-subscription-plan.md`

The database gate and app implementation for multi-season support are complete.
Do not rerun completed destructive schema steps unless the user explicitly asks
and the target database has been re-verified. Use the new-agent handoff for the
current shipped UI at `0d4150bf`, admin lifecycle contract, independent
homepage/shop content, match-sponsor workflow, roster-card behavior, shared
branding workflow, verification status, and known remaining work. Stripe
subscription billing (admin + public lockout) is live in production — see
`docs/stripe-subscription-plan.md` before touching `middleware.ts`,
`lib/stripe-subscription-state.ts`, or anything under `app/api/stripe/`.
