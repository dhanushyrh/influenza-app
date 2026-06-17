---
tags: [product, mvp]
updated: 2026-06-17
sources: [docs/01-mvp-prd.md, Executive Summary - Influencers.txt]
---

# Product Overview

## What Influenza is

A **two-sided hyper-local influencer marketplace** connecting neighbourhood businesses with micro-influencers. The core UX is a **Tinder-style swipe deck** for businesses to browse verified local creators, plus symmetric discovery for creators (campaign briefs / business opps).

**Launch focus:** Bengaluru, food & drinks niche. Strategy: seed **supply (influencers)** first via concierge invites; businesses self-serve after a critical mass of creators.

## Users

| Role | Goal | Primary app |
|------|------|-------------|
| **Creator (influencer)** | Get discovered, receive pitches, close paid collabs | `/inf` CreatorApp |
| **Business** | Find creators matching vibe, budget, demographics | `/biz` BizApp |
| **Admin / concierge** | Issue invites, approve businesses (DB today) | Manual / SQL |

## MVP feature pillars

1. **Dual onboarding** — Creator: invite link → IG → wizard. Business: IG → wizard → admin approval.
2. **Lookbook** — Public influencer profile at `/influencer/[id]` with cached IG metrics + demographics.
3. **Swipe / Discover** — Cached deck from `influencer_stats` (no live Meta calls in UI).
4. **Pitch → Deal pipeline** — Business pitches creator; negotiable deal room with staged escrow UI (Stripe Phase 3).
5. **Credits** — Creator-side credit economy for proposals; business pitch credits (partial).
6. **Campaigns** — Businesses publish live campaigns; creators see them as briefs.

## What's stubbed vs real

| Area | Status |
|------|--------|
| UI / SPAs (`/biz`, `/inf`) | **Built** — rich client apps with mock fallbacks |
| Supabase schema + RLS | **Built** — 15 migrations |
| Instagram OAuth | **Wired** — real flow when `META_*` env set; mock otherwise |
| IG metrics refresh cron | **Not built** — stats seeded / snapshot on signup |
| Stripe escrow | **UI only** — deal stages simulated; no PaymentIntent |
| Supabase Auth sessions | **Deferred** — httpOnly cookies (`inf_uid`, `bus_uid`) |
| Realtime messaging | **Partial** — `threads`/`messages` on deal message action |

## Monetization (phased)

1. Freemium profiles + deck viewing
2. 10% platform fee on escrow deals (Phase 3)
3. Pay-per-pitch credits (₹1000 / 10 credits)
4. Premium business subscriptions (advanced filters, unlimited swipes)

## Roadmap phases

| Phase | Focus |
|-------|-------|
| 1 | Manual prototype (concierge, manual cuts) |
| 2 | **Current repo** — core tech: onboarding, metrics cache, swipe, messaging |
| 3 | Stripe Connect escrow, automated release |

## Related pages

- [architecture.md](architecture.md) — technical stack
- [implementation-status.md](implementation-status.md) — detailed build checklist
- [business-app.md](business-app.md) · [creator-app.md](creator-app.md) — main UIs
- [../docs/01-mvp-prd.md](../docs/01-mvp-prd.md) — full PRD (raw)
