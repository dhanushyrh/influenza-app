# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## LLM Wiki

Structured project knowledge lives in **`wiki/`** (synthesized) and **`raw/`** (source catalog). Maintenance rules: **[WIKI.md](WIKI.md)**.

| Start here | Purpose |
|------------|---------|
| [wiki/index.md](wiki/index.md) | Wiki page catalog |
| [wiki/file-map.md](wiki/file-map.md) | Feature → file paths |
| [wiki/implementation-status.md](wiki/implementation-status.md) | Built vs planned |
| [wiki/overview.md](wiki/overview.md) | Product context |

When shipping features, update the relevant wiki pages and `wiki/log.md`.

## Commands

```bash
npm run dev        # start dev server (localhost:3000)
npm run build      # production build + type-check
npm run typecheck  # tsc --noEmit only
npm run lint       # next lint
```

**Database:**
```bash
# Push pending migrations to the remote Supabase project
SUPABASE_ACCESS_TOKEN=<token> supabase db push \
  --db-url "postgresql://postgres:<password>@db.xvplmdtswmbqtwrbjewy.supabase.co:5432/postgres" \
  --workdir . --yes

# Run the seed file directly (after schema is applied)
PGPASSWORD=<password> psql "postgresql://postgres:<password>@db.xvplmdtswmbqtwrbjewy.supabase.co:5432/postgres" \
  -f supabase/seed.sql
```

Credentials live in `.env` (gitignored). `.env.local` must NOT define empty overrides for server-only vars (`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_PASSWORD`) — empty values in `.env.local` override the real values from `.env`.

## Architecture

### Stack
Next.js 14 App Router · TypeScript · Tailwind CSS · Supabase (Postgres + RLS + Storage)

Mobile-first, max-width `max-w-md` container. Brand color: `#ff4d6d` (`bg-brand`).

### Data flow

```
Supabase DB
  └─ lib/queries.ts          ← single data-access layer (server only)
       ├─ serverClient()     ← reads with user RLS session (anon/authenticated)
       ├─ adminClient()      ← bypasses RLS (invite validation, Lookbook by ID)
       └─ fallback → lib/mock-data.ts  (when Supabase is not configured)
```

All pages import only from `lib/queries.ts`. No raw Supabase calls in `app/` or `components/`. Domain types are in `lib/types.ts`.

`lib/metrics.ts` — engagement rate formula (`(avg_likes + avg_comments) / followers * 100`), mirrors the DB trigger `set_engagement_rate()`. Use this for any client-side engagement calculation.

### Three Supabase clients (`lib/supabase.ts`)

| Client | When to use |
|--------|-------------|
| `browserClient()` | Client components |
| `serverClient()` | Server components / route handlers that need RLS |
| `adminClient()` | Invite validation, Lookbook by-ID, cron writes — bypasses RLS |

### Instagram / Auth flow

`GET /api/auth/instagram?role=creator&token=<invite>` → redirects to Meta OAuth.  
`GET /api/auth/instagram?role=business` → redirects to Meta OAuth (no invite required).  
`GET /api/auth/instagram/callback` → exchanges code → long-lived token → branches on `role`:
  - `creator` → `persistInfluencerSignIn()` → `/onboarding/<token>?ig=connected&...` → sets `inf_uid` cookie  
  - `business` → `persistBusinessSignIn()` → `/business-onboarding?pid=...` → sets `bus_uid` cookie  
`GET /api/auth/instagram/mock?role=creator|business&token=<invite>` → same persist path, deterministic fake persona. **Dev only — returns 404 in production.**

`lib/auth-persist.ts`:
- `persistInfluencerSignIn()` — validates invite → upserts `app_users` (role: influencer) → upserts `influencer_profiles` → seeds `influencer_stats` → marks invite used.
- `persistBusinessSignIn()` — upserts `app_users` (role: business) → creates `business_profiles` with `approved: false` → seeds `business_stats`. No invite required.

Session during onboarding: `inf_uid` httpOnly cookie (24 h) for creators, `bus_uid` (24 h) for businesses — both hold `app_users.id`. No Supabase Auth session until Phase 2.

### Onboarding completion API

`POST /api/onboarding/creator/complete` — authenticated via `inf_uid` cookie. Persists all creator wizard data: display_name, email, phone, coverage_areas, video_pitch_url, category/niches, services (upserted), packages (replaced).

`POST /api/onboarding/business/complete` — authenticated via `bus_uid` cookie. Persists business wizard data: name, email, phone, category, bio, target_creator_size, target_budget, hiring_status (mapped: open→actively_looking, scouting→looking_out, closed→not_looking). Both routes use `adminClient()` and are non-blocking on error (wizard proceeds to done regardless).

### Database

Schema source of truth: `db/schema.sql` (mirrored into `supabase/migrations/20260610000001_init.sql`).  
Migrations live in `supabase/migrations/` — tracked by `supabase db push`.  
Seed in `supabase/seed.sql` + `supabase/migrations/20260610000004_mvp_seed.sql`.  
Test account details: `docs/TEST_ACCOUNTS.md`.

Key design decisions:
- `influencer_stats` is **denormalized and pre-computed** — the swipe deck reads only this table, never the live Meta API.
- `published` on `influencer_profiles` controls swipe deck visibility. The Lookbook at `/influencer/<uuid>` uses `adminClient()` and is accessible by direct URL regardless of `published`.
- `ig_token_ref` stores the long-lived IG token directly (MVP shortcut). Phase 3 target: Supabase Vault reference.
- Invites are single-use. Reset for testing: `UPDATE invites SET used_at = NULL, used_by = NULL WHERE token = '<token>';`
- `business_profiles.approved` defaults to `false`. Admin sets true in DB to activate the business on the swipe deck.

New columns (migration `20260611000007_wizard_data.sql`):
- `app_users.phone text` — collected on both creator and business details step
- `business_profiles.category text` — food_drinks | service | product
- `business_profiles.target_creator_size jsonb` — ["nano","micro",...] from prefs step
- `business_profiles.target_budget text` — "micro" | "mid" | "big" from prefs step

Migration `20260612000008_coverage_cities.sql`:
- `influencer_profiles.coverage_cities jsonb` (renamed from `coverage_areas`) — up to 3 cities the creator covers; values are city name strings loaded from the `locations` table

### Pages

| Route | Type | Description |
|-------|------|-------------|
| `/` | client | Welcome / role selection (WelcomeScreen) |
| `/swipe` | server | Business swipe deck — calls `getDeck()` |
| `/biz` | server + client | **Business SPA** — reads `bus_uid` cookie, checks `approved`, renders `BizApp` |
| `/influencer/[id]` | server | Influencer Lookbook — calls `getInfluencerById()` via `adminClient` |
| `/business/[id]` | server | Business profile — mock only |
| `/onboarding/[token]` | server + client | Creator onboarding wizard (6 steps: ig→details→location→video→category→services) |
| `/business-onboarding` | server + client | Business onboarding wizard (5 steps: ig→details→info→prefs→hiring) |

BottomNav is hidden on `/`, `/onboarding/*`, `/business-onboarding/*`, `/influencer/*`, `/business/*`, `/api/*`, `/biz/*`.

### Business SPA (`/biz` + `app/biz/BizApp.tsx`)

4-tab authenticated SPA: **Discover** (Tinder swipe deck) · **Search** (filterable grid/list) · **Collabs** (deal pipeline) · **Profile** (business management).

All tab navigation is client-side state (no route changes). Overlays (Lookbook, ReachOut sheet, Deal Room) are rendered full-screen inside BizApp with a state machine.

Key files:
- `lib/biz-data.ts` — types, CREATORS (8), DEALS (3 seed), MY_BIZ, taxonomy, `makePitchDeal()`
- `components/biz-nav.tsx` — BizBottomNav, PageHead, BizSegmented, BizToast, StatChip, HiringPill
- `components/biz-discover.tsx` — Tinder-style drag deck with pointer physics (threshold 96px, fly-out 520px)
- `components/biz-search.tsx` — FilterSheet + GridCard/ListRow, full filter set (cat/age/size/eng/budget/area/avail)
- `components/biz-lookbook.tsx` — Full creator profile with AgeBars, SectionCard, WorkViewer
- `components/biz-reachout.tsx` — Pitch composer: deliverable steppers, budget presets, escrow note
- `components/biz-collabs.tsx` — MiniProgress bar + CollabCard, grouped by deal stage
- `components/biz-profile.tsx` — Hero card, stats, prefs, credits chip, EditSheet
- `components/deal-room.tsx` — Chat timeline + StageTracker + 6 action sheets (EscrowSheet, SubmitSheet, CounterSheet, ReviewSheet, SummarySheet, ReleaseSheet)

Deal stage machine (client state only, Phase 3 for DB): 0=Pitched → 1=Accepted → 2=Funded → 3=Reviewing → 4=Released. `DealRuntime` holds live stage/amount/log per deal.

### Onboarding Wizard (`app/onboarding/[token]/Wizard.tsx`)

Client component. After the OAuth/mock redirect, `?ig=connected&pid=<profile_uuid>&name=<username>&handle=<handle>` is read from the URL in `useEffect` to populate state. The `pid` param is used for the "View my Lookbook" link on the Done step. When `igConfigured` is false, the mock link (`/api/auth/instagram/mock`) is shown instead of the real OAuth link. On the final services step, calls `POST /api/onboarding/creator/complete` before transitioning to done.

### Mock data (`lib/mock-data.ts`)

Used as a fallback throughout `lib/queries.ts` when Supabase is not reachable. Five influencers (`inf_1`…`inf_5`) and one business (`biz_1`). `MockInstagramService` in `lib/instagram.ts` returns deterministic fake data for the IG API interface.
