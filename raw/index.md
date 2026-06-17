# Raw Sources — Index

Immutable source-of-truth documents for the Influenza LLM wiki. Agents **read** from these paths; they do not modify them during wiki synthesis. When new planning docs or major specs are added, append an entry here.

## Planning & product

| Path | Summary |
|------|---------|
| [Executive Summary - Influencers.txt](../Executive%20Summary%20-%20Influencers.txt) | High-level business vision and influencer-market positioning |
| [docs/01-mvp-prd.md](../docs/01-mvp-prd.md) | MVP product requirements, roadmap phases, monetization |
| [docs/02-architecture.md](../docs/02-architecture.md) | System architecture diagram, data flows, folder layout |
| [docs/03-database-design.md](../docs/03-database-design.md) | Database design rationale (companion to schema) |
| [docs/04-instagram-integration.md](../docs/04-instagram-integration.md) | Meta Graph API integration plan |
| [docs/05-payments-escrow.md](../docs/05-payments-escrow.md) | Stripe Connect escrow design (Phase 3) |
| [docs/06-onboarding-flows.md](../docs/06-onboarding-flows.md) | Dual onboarding flow specifications |
| [docs/TEST_ACCOUNTS.md](../docs/TEST_ACCOUNTS.md) | Seeded test users, invite tokens, mock auth URLs |

## Task checklists (may lag implementation)

| Path | Summary |
|------|---------|
| [docs/tasks/README.md](../docs/tasks/README.md) | Ordered task list index |
| [docs/tasks/00-foundation.md](../docs/tasks/00-foundation.md) through [07-payments-escrow.md](../docs/tasks/07-payments-escrow.md) | Per-feature implementation checklists |

> For **current** build status, prefer [wiki/implementation-status.md](../wiki/implementation-status.md) over unchecked boxes in `docs/tasks/`.

## Database (source of truth)

| Path | Summary |
|------|---------|
| [db/schema.sql](../db/schema.sql) | Canonical Postgres schema |
| [db/seed.sql](../db/seed.sql) | Local dev seed (mirror of migrations seed) |
| [supabase/migrations/](../supabase/migrations/) | Applied migration history (15 files) |
| [supabase/seed.sql](../supabase/seed.sql) | Remote seed script |

## Application entry points

| Path | Summary |
|------|---------|
| [CLAUDE.md](../CLAUDE.md) | Agent coding guide: commands, auth flow, key files |
| [package.json](../package.json) | Scripts and dependencies |
| [.env.example](../.env.example) | Required environment variables |

## Data access & domain

| Path | Summary |
|------|---------|
| [lib/types.ts](../lib/types.ts) | TypeScript domain types (mirror schema) |
| [lib/queries.ts](../lib/queries.ts) | **Single data-access layer** — all pages import from here |
| [lib/supabase.ts](../lib/supabase.ts) | browser / server / admin Supabase clients |
| [lib/auth-persist.ts](../lib/auth-persist.ts) | Instagram OAuth persist (creator + business) |
| [lib/inf-auth.ts](../lib/inf-auth.ts) | Cookie → profile ID resolution |
| [lib/deal-actions.ts](../lib/deal-actions.ts) | Deal state machine (DB writes) |
| [lib/instagram.ts](../lib/instagram.ts) | Meta OAuth + Graph API (mock fallback) |
| [lib/metrics.ts](../lib/metrics.ts) | Engagement rate formula |
| [lib/mock-data.ts](../lib/mock-data.ts) | Fallback mock influencers/business |
| [lib/biz-data.ts](../lib/biz-data.ts) | Business SPA types + seed deals/creators |
| [lib/inf-data.ts](../lib/inf-data.ts) | Creator SPA types + seed briefs/credits |
| [lib/inf-map.ts](../lib/inf-map.ts) | DB row → UI model mappers |

## Apps (routes)

| Path | Summary |
|------|---------|
| [app/page.tsx](../app/page.tsx) | Welcome / role selection |
| [app/biz/](../app/biz/) | Business authenticated SPA |
| [app/inf/](../app/inf/) | Creator authenticated SPA |
| [app/onboarding/](../app/onboarding/) | Creator onboarding wizard |
| [app/business-onboarding/](../app/business-onboarding/) | Business onboarding wizard |
| [app/api/](../app/api/) | Route handlers (auth, onboarding, deals, campaigns) |
| [components/](../components/) | Shared UI (swipe, lookbook, deal room, nav) |

## Design handoff (Claude Design)

| Path | Summary |
|------|---------|
| [designs/influenza/README.md](../designs/influenza/README.md) | **Design → Supabase porting guide** (read before visual work) |
| [designs/influenza/project/Influenza Prototype.html](../designs/influenza/project/Influenza%20Prototype.html) | Primary HTML prototype shell |
| [designs/influenza/project/Influenza Prototype/](../designs/influenza/project/Influenza%20Prototype/) | Unified JSX modules (auth, biz, creator, deal) |

## CI & tooling

| Path | Summary |
|------|---------|
| [.github/workflows/ci.yml](../.github/workflows/ci.yml) | PR typecheck + lint |
| [test-onboarding.mjs](../test-onboarding.mjs) | Playwright onboarding tests |
| [scripts/seed-demo.mjs](../scripts/seed-demo.mjs) | Demo data seeding script |
