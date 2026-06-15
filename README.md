# Influenza — Hyper-local Influencer Marketplace (MVP)

A two-sided marketplace connecting **local businesses** with **hyper-local micro-influencers**, using a gamified, Tinder-style swipe interface. Both sides authenticate via Instagram to verify identity and pull performance metrics.

> This repository is the **MVP scaffold**: planning docs, database design, and a runnable Next.js skeleton with key screens stubbed. Instagram (Meta Graph API) and payments (Stripe Connect) are **stubbed with mock data** in this phase and wired up later per the roadmap.

## What's here

```
Influenza/
├── README.md                 ← you are here
├── docs/                     ← planning, PRD, architecture, integration plans
│   ├── 01-mvp-prd.md
│   ├── 02-architecture.md
│   ├── 03-database-design.md
│   ├── 04-instagram-integration.md
│   ├── 05-payments-escrow.md
│   ├── 06-onboarding-flows.md
│   └── tasks/                ← granular task lists per feature area
├── db/
│   ├── schema.sql            ← Supabase/Postgres migration (source of truth)
│   └── seed.sql              ← demo data for local dev
├── app/                      ← Next.js App Router skeleton (stubbed screens)
├── components/               ← shared UI (swipe card, stat bars, etc.)
├── lib/                      ← types, mock data, supabase client stub
└── public/
```

## Stack

- **Frontend:** Next.js (App Router) — mobile-first PWA, responsive swipe UI
- **Backend:** Supabase (Postgres + Auth + Realtime + Storage)
- **Background sync:** scheduled cron to refresh influencer metrics weekly (avoids Meta rate limits)
- **Integrations (later):** Meta Instagram Graph API, Stripe Connect

## Run the skeleton

```bash
npm install
npm run dev          # http://localhost:3000
```

The skeleton runs entirely on **mock data** (`lib/mock-data.ts`) — no Supabase or Meta credentials needed to see the screens.

## MVP scope (single market: Bengaluru, single niche: food)

1. Dual onboarding (Influencer via invite link, Business via Instagram login)
2. Verified influencer "Lookbook" profiles with calculated engagement
3. Business profiles with hiring-status toggle
4. Tinder-style swipe deck of cached local influencer cards
5. Business → influencer **interest** (right swipe) and **pitch** messaging
6. (Phase 3) Stripe Connect escrow loop

See `docs/01-mvp-prd.md` for full detail and `docs/tasks/` for the implementation checklist.

## Next step

Review the docs and DB schema, then we implement feature-by-feature against `docs/tasks/`.
