---
tags: [architecture, stack]
updated: 2026-06-17
sources: [docs/02-architecture.md, CLAUDE.md, lib/queries.ts]
---

# Architecture

## High-level diagram

```
┌─────────────────────────────────────────────────────────────┐
│              Next.js 14 App Router (PWA, max-w-md)           │
│  Server Components (data) + Client Components (gestures)    │
│  /biz BizApp · /inf CreatorApp · onboarding wizards         │
└──────────────────────────┬──────────────────────────────────┘
                           │
              lib/queries.ts (single data-access layer)
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Supabase                                  │
│  Postgres + RLS · Storage · (Auth deferred)                 │
└──────────┬─────────────────────────────┬────────────────────┘
           │                             │
    Weekly cron (planned)          Stripe Connect (Phase 3)
           │                             │
    Meta Instagram Graph API      Escrow charge / release
    (OAuth live; insights mock/seed)
```

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind |
| Backend | Next.js Route Handlers, Server Components |
| Database | Supabase Postgres + RLS |
| Storage | Supabase buckets: `pitches`, `avatars`, `post-thumbs` |
| Auth (current) | Instagram OAuth + httpOnly cookies |
| Auth (target) | Supabase Auth linked to `app_users.auth_user_id` |
| PWA | `app/manifest.ts`, `public/sw.js`, installable shell |

Brand: `#ff4d6d` (`bg-brand`). Mobile-first `max-w-md` container.

## Data-access rule (critical)

**All pages import only from `lib/queries.ts`.** No raw Supabase in `app/` or `components/`.

```
Supabase DB
  └─ lib/queries.ts
       ├─ serverClient()  — RLS reads
       ├─ adminClient()   — bypass RLS (lookbook, invites, deals)
       └─ fallback → lib/mock-data.ts | lib/biz-data.ts | lib/inf-data.ts
```

Domain types: `lib/types.ts`. Row → UI mapping: `lib/inf-map.ts`.

## Three Supabase clients (`lib/supabase.ts`)

| Client | Use |
|--------|-----|
| `browserClient()` | Client components |
| `serverClient()` | Server components / routes with RLS |
| `adminClient()` | Invites, lookbook by ID, deal writes, onboarding complete |

`isSupabaseConfigured` = both `NEXT_PUBLIC_SUPABASE_URL` and publishable key set. Missing config → entire app runs on mock seeds.

## Caching philosophy

The swipe deck **must never call Meta at request time**. Metrics live in `influencer_stats` (denormalized). Engagement rate computed in DB trigger `set_engagement_rate()` and mirrored in `lib/metrics.ts` for client-side display.

Planned: weekly cron per influencer to refresh stats (see [integrations.md](integrations.md)).

## App shells vs legacy routes

| Route | Pattern |
|-------|---------|
| `/biz` | Authenticated business SPA (primary business UX) |
| `/inf` | Authenticated creator SPA (primary creator UX) |
| `/swipe` | Legacy standalone swipe deck (`getDeck()`) |
| `/influencer/[id]` | Public Lookbook (server component) |

## Security

- RLS on all tables (`20260610000002_policies.sql`)
- Service role key server-only (never `NEXT_PUBLIC_`)
- IG tokens stored in `ig_token_ref` (MVP: raw token; target: Vault)
- Business `approved` gate on `/biz` until admin sets `true` in DB

## Environments

| Mode | Behavior |
|------|----------|
| Local, no `.env` | Mock data everywhere |
| Local + Supabase | Live DB, mock IG if no `META_*` |
| Staging/Prod | Supabase + Meta Advanced Access + Stripe |

## Related

- [data-model.md](data-model.md)
- [auth-and-sessions.md](auth-and-sessions.md)
- [file-map.md](file-map.md)
