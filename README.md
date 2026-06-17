# Influenza — Hyper-local Influencer Marketplace

A two-sided marketplace connecting **local businesses** with **hyper-local micro-influencers**, using a gamified, Tinder-style swipe interface. Both sides authenticate via Instagram to verify identity and pull performance metrics.

**Launch focus:** Bengaluru · food & drinks niche · supply-first (concierge creator invites).

## LLM Wiki (start here for development)

This repo includes a [Karpathy-style LLM wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) for compounding project knowledge:

| Path | Purpose |
|------|---------|
| **[wiki/index.md](wiki/index.md)** | Wiki catalog — **start here** |
| [wiki/overview.md](wiki/overview.md) | Product vision & MVP scope |
| [wiki/file-map.md](wiki/file-map.md) | Feature → file lookup (fixes & enhancements) |
| [wiki/implementation-status.md](wiki/implementation-status.md) | What's built vs planned |
| [raw/index.md](raw/index.md) | Immutable source catalog (docs, schema, entry points) |
| [WIKI.md](WIKI.md) | How agents maintain the wiki |

For coding commands and patterns, see also [CLAUDE.md](CLAUDE.md).

## What's built (Phase 2 snapshot)

Beyond the original scaffold, the repo now includes:

- **Business SPA** (`/biz`) — Discover swipe deck, Search, Collabs, Profile, campaigns
- **Creator SPA** (`/inf`) — Home, Briefs, Collabs, Wallet, Profile, credits economy
- **Dual onboarding wizards** — creator (invite) + business (self-serve) with completion APIs
- **Instagram OAuth** + dev mock auth
- **Deal pipeline** — pitches → deals, shared Deal Room, DB persistence
- **Campaigns & briefs** — businesses publish live briefs; creators browse and propose
- **Supabase** — 15 migrations, RLS, storage buckets, seeded test data

Still stubbed: Stripe escrow, IG metrics cron, Supabase Auth sessions, business swipe persistence.

## Repository layout

```
Influenza/
├── wiki/                     ← LLM-maintained knowledge base (read first)
├── raw/                      ← source catalog for wiki ingest
├── WIKI.md                   ← wiki maintenance schema
├── CLAUDE.md                 ← agent coding guide
├── docs/                     ← planning PRD, architecture, task checklists
├── db/                       ← schema.sql + seed (source of truth)
├── supabase/migrations/      ← applied migrations
├── app/                      ← Next.js App Router (pages + API)
│   ├── biz/                  ← business authenticated SPA
│   ├── inf/                  ← creator authenticated SPA
│   ├── onboarding/             ← creator wizard
│   └── api/                  ← route handlers
├── components/               ← UI (swipe, lookbook, deal room, nav)
└── lib/                      ← queries.ts (data layer), types, auth, mocks
```

## Stack

- **Frontend:** Next.js 14 (App Router) — mobile-first PWA
- **Backend:** Supabase (Postgres + RLS + Storage)
- **Auth (current):** Instagram OAuth + httpOnly cookies (`inf_uid`, `bus_uid`)
- **Integrations:** Meta Instagram Graph API (wired; mock without creds) · Stripe Connect (Phase 3)

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

**Mock mode** — no credentials needed; falls back to `lib/mock-data.ts`.

**Live Supabase** — copy `.env.example` → `.env`, fill Supabase keys. See [wiki/development-guide.md](wiki/development-guide.md) and [docs/TEST_ACCOUNTS.md](docs/TEST_ACCOUNTS.md).

```bash
npm run build        # production build + type-check
npm run typecheck
npm run lint
```

## Key routes

| Route | Who | Purpose |
|-------|-----|---------|
| `/` | Public | Welcome / role selection |
| `/biz` | Business | Main business app (needs approval) |
| `/inf` | Creator | Main creator app |
| `/onboarding/[token]` | Creator | Invite onboarding wizard |
| `/business-onboarding` | Business | Business onboarding wizard |
| `/influencer/[id]` | Public | Creator Lookbook |
| `/swipe` | Business | Legacy standalone swipe deck |

## Design handoff

Visual prototypes live in [`designs/influenza/`](designs/influenza/). **Read [`designs/influenza/README.md`](designs/influenza/README.md)** before porting UI — it maps screens to production files and documents Supabase data rules (do not copy prototype `localStorage` auth).

## Documentation map

| Doc | Use when |
|-----|----------|
| [wiki/](wiki/) | Navigating code, building features, understanding what's done |
| [designs/influenza/README.md](designs/influenza/README.md) | Pixel porting from Claude Design prototypes |
| [docs/01-mvp-prd.md](docs/01-mvp-prd.md) | Product requirements (raw) |
| [docs/02-architecture.md](docs/02-architecture.md) | Original architecture notes |
| [docs/tasks/](docs/tasks/) | Granular checklists (may lag — see wiki implementation status) |
| [db/schema.sql](db/schema.sql) | Database schema |

## Roadmap

| Phase | Focus |
|-------|-------|
| 1 | Manual prototype |
| 2 | **Current** — core tech (onboarding, deck, deals, messaging UI) |
| 3 | Stripe Connect escrow, automated metric refresh |
