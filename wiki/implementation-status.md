---
tags: [status, roadmap]
updated: 2026-06-17
---

# Implementation Status

**Authoritative progress view.** The checkboxes in `docs/tasks/*.md` are often stale; trust this page first, then verify in code.

Legend: ✅ Done · 🟡 Partial / UI-only · ⬜ Not started

## Foundation

| Item | Status | Notes |
|------|--------|-------|
| Supabase project + migrations | ✅ | 15 migrations in `supabase/migrations/` |
| `lib/supabase.ts` real clients | ✅ | browser, server, admin |
| RLS policies | ✅ | `20260610000002_policies.sql` |
| Storage buckets | ✅ | pitches, avatars, post-thumbs |
| PWA manifest + SW | ✅ | `app/manifest.ts`, `public/sw.js` |
| CI typecheck + lint | ✅ | `.github/workflows/ci.yml` |
| Supabase Auth ↔ `app_users` | ⬜ | Cookie sessions only (`inf_uid`, `bus_uid`) |

## Influencer onboarding

| Item | Status | Notes |
|------|--------|-------|
| Invite token validation | ✅ | `getInviteByToken()`, wizard route |
| `/onboarding/[token]` wizard (6 steps) | ✅ | IG → details → location → video → category → services |
| Instagram OAuth + mock | ✅ | `lib/auth-persist.ts`, mock route dev-only |
| `POST /api/onboarding/creator/complete` | ✅ | Persists wizard fields |
| Initial IG insights pull | 🟡 | Mock persona stats; real Graph API stubbed |
| Video pitch → Storage | 🟡 | URL field; upload flow in wizard |
| Resumable per-step save | ⬜ | Single submit at end |
| Admin invite generator UI | ⬜ | SQL / seed only |

## Business onboarding

| Item | Status | Notes |
|------|--------|-------|
| `/business-onboarding` wizard (5 steps) | ✅ | IG → details → info → prefs → hiring |
| `POST /api/onboarding/business/complete` | ✅ | Maps hiring status enums |
| `business_profiles.approved` gate | ✅ | `/biz` shows pending screen |
| Auto-pull 6 posts from IG | 🟡 | Mock on signup; schema has `business_posts` |
| Land on swipe after onboard | 🟡 | Redirects to wizard done → login flow |

## Instagram integration

| Item | Status | Notes |
|------|--------|-------|
| OAuth authorize + callback | ✅ | `lib/instagram.ts` |
| Long-lived token exchange | ✅ | In callback route |
| Graph API insights client | ⬜ | `MockInstagramService` fallback |
| Token Vault encryption | ⬜ | `ig_token_ref` stores token directly (MVP) |
| Weekly metrics cron | ⬜ | Designed, not implemented |
| Meta App Review / Advanced Access | ⬜ | Env placeholders in `.env.example` |

## Discovery & profiles

| Item | Status | Notes |
|------|--------|-------|
| Swipe deck query (`getDeck`, `getCreatorDeck`) | ✅ | Published profiles + stats join |
| Biz Discover drag deck | ✅ | `components/biz-discover.tsx` |
| Biz Search filters | ✅ | `components/biz-search.tsx` |
| Lookbook `/influencer/[id]` | ✅ | `getInfluencerById()` via admin |
| Business profile `/business/[id]` | 🟡 | Mock only (`getBusinessById`) |
| Persist swipes / interests to DB | ⬜ | Schema exists; deck uses in-memory UX |
| Free-swipe cap + business credits | ⬜ | Creator credits built; business cap not wired |

## Pitches, deals, messaging

| Item | Status | Notes |
|------|--------|-------|
| Pitch composer (business) | ✅ | `biz-reachout.tsx` + `POST /api/business/pitch` |
| Creator proposal + credit gate | ✅ | `CreatorApp` + `POST /api/creator/proposal` |
| Deal room UI | ✅ | `components/deal-room.tsx` shared |
| Deal DB persistence | ✅ | `lib/deal-actions.ts`, pitches → deals promotion |
| Deal APIs | ✅ | `/api/business/deal`, `/api/creator/deal` |
| Realtime thread UI | 🟡 | Messages inserted on deal `message` action |
| Credit purchase checkout | ⬜ | Buy sheet UI; no Stripe |
| Subscription gating | ⬜ | Stub |

## Campaigns & briefs

| Item | Status | Notes |
|------|--------|-------|
| `campaigns` table + migration | ✅ | `20260614000014_campaigns.sql` |
| Business create campaign | ✅ | `biz-campaigns.tsx` + API |
| Creator briefs feed | ✅ | `getBriefs()` prefers live campaigns |
| Symmetric swipe for creators | ⬜ | Briefs list, not swipe deck |

## Creator credits

| Item | Status | Notes |
|------|--------|-------|
| `creator_credits` + ledger tables | ✅ | Migrations `20260613000010`, `20260614000012` |
| Credits hub UI | ✅ | `components/inf-credits.tsx` |
| Referrals + promos | ✅ | Seed + DB read in `getCreatorCredits()` |

## Payments (Phase 3)

| Item | Status | Notes |
|------|--------|-------|
| Stripe Connect | ⬜ | All stages UI-simulated in DealRoom |
| `payments` table usage | ⬜ | Schema exists |
| Escrow fund / release | 🟡 | Client stage machine + DB status updates, no charge |

## When enhancing a feature

1. Find the row above.
2. Jump to [file-map.md](file-map.md) for edit locations.
3. Update this page after shipping.
