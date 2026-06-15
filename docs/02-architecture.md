# 02 — Architecture Overview

## High-level

```
                 ┌──────────────────────────────────────────────┐
                 │          Next.js (App Router) PWA             │
                 │   mobile-first swipe UI · server components    │
                 └───────────────┬───────────────┬───────────────┘
                                 │               │
                  Supabase JS    │               │  Server Actions / Route Handlers
                  (auth, realtime)│               │
                 ┌───────────────▼───────────────▼───────────────┐
                 │                  Supabase                       │
                 │  Postgres + RLS · Auth · Realtime · Storage     │
                 └───────┬─────────────────────┬───────────────────┘
                         │                     │
        ┌────────────────▼──────┐   ┌──────────▼───────────────┐
        │ Cron worker (weekly)  │   │  Stripe Connect (Phase 3) │
        │ refresh IG metrics    │   │  escrow charge / release  │
        └────────────┬──────────┘   └───────────────────────────┘
                     │
        ┌────────────▼───────────────┐
        │  Meta Instagram Graph API   │  ← stubbed in MVP scaffold
        │  insights · demographics    │
        └─────────────────────────────┘
```

## Components

**Next.js App Router (PWA)**
Mobile-first. Server Components for data fetching, client components for the swipe gesture layer. PWA manifest + service worker so businesses can "install" without app-store friction.

**Supabase**
- *Postgres* — single source of truth (see `db/schema.sql`). Row Level Security enforces that businesses only see published influencer cards and that each user edits only their own profile.
- *Auth* — primary login is Instagram OAuth; Supabase Auth holds the session and links to `app_users`.
- *Realtime* — messaging threads + live deck updates.
- *Storage* — video pitches, post thumbnails, avatars.

**Cron worker (background sync)**
Refreshes each influencer's Instagram metrics weekly and recomputes cached aggregates (avg likes/comments, engagement rate). This keeps the swipe deck instant and respects Meta's one-user-at-a-time limit. Implemented as a Supabase Edge Function / scheduled job (or a Vercel Cron hitting a protected route).

**Why caching is core, not optional:** the deck must load instantly and the API is rate-limited and single-user. So metrics are computed on signup and refreshed by cron — the UI never blocks on a live Meta call.

## Data flow: serving the swipe deck
1. Business opens `/swipe`.
2. Server queries `influencer_profiles` joined with `influencer_stats` (cached), filtered by `city` + `niche`, excluding already-swiped cards.
3. Returns a deck of 10–20 cards — pure DB read, no external API.
4. Right swipe → insert `interests` row → opens Lookbook. Left swipe → insert `swipes(direction='left')` → card hidden.

## Data flow: influencer onboarding (invite)
1. Concierge generates a single-use invite (`invites` row, token).
2. Influencer opens `/onboarding/[token]` → token validated.
3. Instagram OAuth → we store IG account id + tokens, pull initial insights.
4. Influencer picks city/area + niche, uploads a video pitch.
5. Profile published; first metrics snapshot cached.

## Environments
- **Local:** mock data, no external creds (`lib/mock-data.ts`).
- **Staging/Prod:** Supabase project + Meta app (Advanced Access) + Stripe.

## Security & compliance
- RLS on every table; service-role key only in server/cron context.
- Instagram tokens encrypted at rest (Supabase Vault).
- Live **Privacy Policy URL** required for Meta App Review.
- PII (demographics) stored aggregated, never per-follower.

## Folder layout (this repo)
```
app/
  onboarding/[token]/   influencer invite onboarding
  swipe/                business swipe deck
  influencer/[id]/      Lookbook profile
  business/[id]/        business profile
  api/health/           liveness check
components/             SwipeCard, StatBar, DemographicBars, HiringBadge...
lib/                    types.ts, mock-data.ts, metrics.ts, supabase.ts (stub)
db/                     schema.sql, seed.sql
```
