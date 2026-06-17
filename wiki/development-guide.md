---
tags: [dev, setup]
updated: 2026-06-17
sources: [CLAUDE.md, docs/TEST_ACCOUNTS.md, .env.example]
---

# Development Guide

## Prerequisites

- Node.js 20+
- npm
- Optional: Supabase CLI, Playwright (for e2e scripts)

## Quick start (mock mode)

No credentials required — the app renders with `lib/mock-data.ts` fallbacks.

```bash
npm install
npm run dev    # http://localhost:3000
```

## Commands

```bash
npm run dev        # dev server :3000
npm run build      # production build + type-check
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

## Environment

Copy `.env.example` → `.env` (or `.env.local` for overrides).

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | For live DB | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | For live DB | Anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | adminClient, deal writes |
| `SUPABASE_DB_PASSWORD` | Migrations | `supabase db push` |
| `META_APP_ID`, `META_APP_SECRET`, `META_REDIRECT_URI` | Real IG | OAuth (else mock) |
| `STRIPE_*` | Phase 3 | Payments |

**Pitfall:** Empty values in `.env.local` override real values from `.env` for server-only vars.

## Database

Schema source of truth: `db/schema.sql` (mirrored in `supabase/migrations/20260610000001_init.sql`).

```bash
# Push migrations (needs access token + db url — see CLAUDE.md)
supabase db push --workdir . --yes

# Seed
psql $DATABASE_URL -f supabase/seed.sql
```

Reset invite for retest:

```sql
UPDATE invites SET used_at = NULL, used_by = NULL WHERE token = '<token>';
```

Approve business:

```sql
UPDATE business_profiles SET approved = true WHERE handle = '@your.handle';
```

## Test flows

See [docs/TEST_ACCOUNTS.md](../docs/TEST_ACCOUNTS.md) for seeded influencers and invite tokens.

| Flow | URL / action |
|------|----------------|
| Welcome | `/` |
| Mock creator onboard | `/onboarding/mock-onboard-deepa` → mock IG button |
| Mock business | `/` → "I'm a Business" → mock IG |
| Business app (approved) | `/biz` (needs `bus_uid` cookie) |
| Creator app | `/inf` (needs `inf_uid` cookie) |
| Lookbook | `/influencer/<uuid>` |
| Login (username) | `/login` |

Mock Instagram (dev only): `GET /api/auth/instagram/mock?role=creator|business`

## Project conventions

1. **Data access:** add functions to `lib/queries.ts`, not in pages.
2. **Types:** extend `lib/types.ts` when schema changes.
3. **Mappers:** DB → UI shapes in `lib/inf-map.ts` for creator/biz models.
4. **Mobile-first:** inline styles + `lib/ob-tokens.ts` (`T.*`) in newer components.
5. **Optimistic UI:** SPAs POST fire-and-forget; errors non-fatal.

## CI

PRs to `main` run `npm run typecheck` and `npm run lint` (`.github/workflows/ci.yml`).

## Debugging tips

| Symptom | Check |
|---------|-------|
| Mock data despite `.env` | `isSupabaseConfigured` in `lib/supabase.ts` |
| `/biz` pending forever | `business_profiles.approved` |
| `/inf` redirects to login | `inf_uid` cookie + matching `influencer_profiles` row |
| Lookbook 404 / mock | `adminClient` + profile UUID from seed |
| IG button goes mock | `isInstagramConfigured` — need all `META_*` vars |

## Related

- [auth-and-sessions.md](auth-and-sessions.md)
- [file-map.md](file-map.md)
- [CLAUDE.md](../CLAUDE.md)
