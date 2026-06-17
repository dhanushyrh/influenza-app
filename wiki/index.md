# Influenza — LLM Wiki Index

**Start here:** [overview.md](overview.md) → [architecture.md](architecture.md) → [file-map.md](file-map.md)

Catalog of all wiki pages. Updated on every ingest.

## Core

| Page | Summary |
|------|---------|
| [overview.md](overview.md) | Product vision, users, MVP scope, monetization |
| [architecture.md](architecture.md) | Stack, layers, data flow, mock vs live |
| [implementation-status.md](implementation-status.md) | **What's built vs planned** — use before `docs/tasks/` |
| [development-guide.md](development-guide.md) | Run locally, env, DB, test accounts, CI |

## Subsystems

| Page | Summary |
|------|---------|
| [business-app.md](business-app.md) | `/biz` SPA — Discover, Search, Collabs, Profile, campaigns |
| [creator-app.md](creator-app.md) | `/inf` SPA — Home, Briefs, Collabs, Wallet, Profile, credits |
| [onboarding.md](onboarding.md) | Creator invite wizard + business wizard + completion APIs |
| [auth-and-sessions.md](auth-and-sessions.md) | Instagram OAuth, mock auth, cookies, identity resolution |
| [deal-pipeline.md](deal-pipeline.md) | Pitches → deals → escrow stages, DealRoom, `deal-actions.ts` |
| [credits-and-campaigns.md](credits-and-campaigns.md) | Creator credits, referrals, business campaigns / briefs |

## Reference

| Page | Summary |
|------|---------|
| [routes-and-pages.md](routes-and-pages.md) | All routes, server vs client, redirects |
| [api-reference.md](api-reference.md) | Every `app/api/**` route handler |
| [data-model.md](data-model.md) | Postgres tables, enums, RLS, migrations |
| [integrations.md](integrations.md) | Instagram (Meta), Stripe (Phase 3), cron |
| [file-map.md](file-map.md) | **Feature → file** lookup for fixes and enhancements |
| [glossary.md](glossary.md) | Domain terms (Lookbook, pitch, brief, etc.) |

## Meta

| Page | Summary |
|------|---------|
| [log.md](log.md) | Chronological wiki maintenance log |
| [../WIKI.md](../WIKI.md) | Schema: how to ingest, query, and lint this wiki |
| [../raw/index.md](../raw/index.md) | Immutable raw source catalog |
