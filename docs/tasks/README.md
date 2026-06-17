# Task Lists — Phase 2 (Core Tech Build)

Granular, reviewable task lists per feature area. Each file is a checklist from the original scaffold plan.

> **Important:** Many items below are still unchecked in these files but **already implemented** in code. For accurate build status, use **[wiki/implementation-status.md](../../wiki/implementation-status.md)** first, then use these lists for remaining work.

## LLM Wiki

| Resource | Purpose |
|----------|---------|
| [wiki/index.md](../../wiki/index.md) | Full wiki catalog |
| [wiki/file-map.md](../../wiki/file-map.md) | Where to edit code for each feature |
| [wiki/implementation-status.md](../../wiki/implementation-status.md) | Done vs planned (authoritative) |

## Task files (dependency order)

1. [00-foundation.md](00-foundation.md) — Supabase project, schema apply, auth, env, PWA shell
2. [01-influencer-onboarding.md](01-influencer-onboarding.md) — invite-link flow + IG login + video pitch
3. [02-business-onboarding.md](02-business-onboarding.md) — IG login, vibe grid, hiring status
4. [03-instagram-integration.md](03-instagram-integration.md) — Meta app, insights, cron refresh
5. [04-swipe-deck.md](04-swipe-deck.md) — cached deck, swipe gestures, interest
6. [05-profiles-lookbook.md](05-profiles-lookbook.md) — influencer Lookbook + business profile pages
7. [06-pitches-messaging.md](06-pitches-messaging.md) — pitch flow, credits, realtime chat
8. [07-payments-escrow.md](07-payments-escrow.md) — Phase 3, Stripe Connect

Legend: `[ ]` todo · `[~]` in progress · `[x]` done

## Suggested next work (from wiki status)

- Supabase Auth ↔ `app_users` linkage
- Persist swipes/interests to DB from discover deck
- Real Graph API insights + weekly cron
- Business pitch credit debit
- Stripe Connect escrow (Phase 3)

After completing tasks, update [wiki/implementation-status.md](../../wiki/implementation-status.md) and append [wiki/log.md](../../wiki/log.md).
