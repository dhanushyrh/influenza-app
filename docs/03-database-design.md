# 03 — Database Design

Source of truth: [`db/schema.sql`](../db/schema.sql). Demo data: [`db/seed.sql`](../db/seed.sql). Target: **Supabase Postgres** with Row Level Security.

## Entity-relationship overview

```
auth.users (Supabase)
     │ 1:1
     ▼
 app_users ───────────────┐
   role: influencer|business|admin
     │ 1:1                │ 1:1
     ▼                    ▼
influencer_profiles   business_profiles
     │                    │
     │ 1:1                │ 1:N
     ▼                    ▼
influencer_stats      business_posts (last 6 "vibe check")
     │ 1:N
     ▼
audience_demographics (age buckets + gender split + top locations)

niches ──< influencer_niches >── influencer_profiles
locations (city + geo centroid) referenced by both profiles

# Services & pricing (replaces flat rate card)
service_types (base catalog: post|reel|story|campaign)
     │ 1:N
influencer_services (influencer's price + negotiable per base type)
     │ M:N via package_items
service_packages (bundle of services, own price + negotiable)

invites ──(used_by)──> app_users

business_stats (cached business metrics — parallels influencer_stats)

# Interaction layer
swipes        (business → influencer, direction left|right)
interests     (right swipe = explicit interest)
pitches       (business → influencer message + optional brief/budget/service/package)
threads / messages   (realtime chat per match)

# Monetization (Phase 3 — tables present, logic later)
credit_ledger · subscriptions · deals · payments
```

## Tables

### Identity
- **app_users** — one row per authenticated user. `role` discriminator, links to `auth.users.id`. Stores Instagram linkage (`ig_user_id`, encrypted token ref, `ig_account_type`).

### Influencer side
- **influencer_profiles** — display name, handle, bio, `location_id`, own `geo_lat/geo_lng` (for proximity/geofencing later), video pitch URL, `published` flag. (No flat rate card — pricing lives in services below.)
- **influencer_stats** — **cached** aggregates (the deck reads only this): `followers`, `avg_views`, `avg_likes`, `avg_comments`, `reach_24h`, `impressions_24h`, `profile_views_24h`, `engagement_rate` (computed), `posts_sampled`, `computed_at`. Refreshed weekly by cron.
- **audience_demographics** — per influencer: age-bucket %s, gender %s, top locations (jsonb). Aggregated only, never per-follower.
- **niches** + **influencer_niches** — `food_drinks | service | product` and subtopics; M:N.

### Services & pricing
- **service_types** — platform-defined base catalog of deliverables: `post | reel | story | campaign` (extensible). Shared reference list.
- **influencer_services** — an influencer *extends* a base `service_type` with their own `price`, `currency`, and a `negotiable` flag. One row per (influencer, service_type).
- **service_packages** — an influencer bundles multiple services under one name with its own `price` + `negotiable` flag.
- **package_items** — which `influencer_services` (and quantities) make up a package (M:N).

### Business side
- **business_profiles** — name, handle, bio, `location_id`, own `geo_lat/geo_lng`, `hiring_status` enum, target demographic (age range, gender focus, target area), optional pitch text/video.
- **business_stats** — **cached** business metrics, parallel to `influencer_stats` (followers, avg likes/comments/views, reach, impressions, engagement rate, computed_at). Refreshed by cron.
- **business_posts** — up to 6 recent IG posts (thumbnail, permalink, caption) for the vibe-check grid.

### Onboarding
- **invites** — single-use tokens for influencer concierge onboarding (`token`, `role`, `expires_at`, `used_at`, `used_by`, `created_by`).

### Interaction
- **swipes** — every swipe `(business_id, influencer_id, direction, created_at)`; left = hide, right = interest. Unique per pair so a card isn't reshown.
- **interests** — materialized right-swipes for fast querying / influencer's "who's interested" view.
- **pitches** — business→influencer outreach: `message`, optional `budget`, `brief`, optional `service_id`/`package_id` (what the pitch is for), `status` (sent|accepted|declined), `credits_charged`.
- **threads** + **messages** — realtime chat once a pitch opens a conversation.

### Monetization (Phase 3 placeholders)
- **credit_ledger** — free + purchased credits, debits per pitch beyond free cap.
- **subscriptions** — agency tiers.
- **deals** — escrow lifecycle states (`draft…released…completed`).
- **payments** — Stripe references, amounts, fee, transfer ids.

## Key design decisions
1. **Cache-first deck.** `influencer_stats` is denormalized and pre-computed so the swipe deck is a single fast indexed read — never a live Meta call. (Meta is rate-limited + one-user-at-a-time.)
2. **Engagement stored, not computed at query time.** `engagement_rate = ((avg_likes+avg_comments)/followers)*100` written by cron; trivial to sort/filter.
3. **Manual location + geo.** `location_id` (city) on both profiles because the API can't supply it; optional `geo_lat/geo_lng` stored now so proximity ranking / geofencing can be added later without a migration. Cities only — no neighbourhood/area table.
3a. **Services over rate card.** Pricing is modelled as `influencer_services` (extending a shared `service_types` catalog) plus `service_packages`, each with a `negotiable` flag — far more flexible than a single rate number and lets the deck/Lookbook show real deliverables.
4. **Demographics as aggregates** (jsonb buckets) for privacy + flexible Meta payload shape.
5. **Swipe uniqueness** via composite unique index prevents duplicate cards and powers "exclude already-swiped" deck queries cheaply.
6. **Monetization tables exist from day one** so the manual Phase-1/2 deals record the same shape the automated Phase-3 flow will use.

## Indexes (see schema)
- `influencer_profiles (location_id, published)` and join to `influencer_niches (niche_id)` → deck filter by city + niche.
- `influencer_stats (engagement_rate desc)` → ranking.
- `swipes (business_id, influencer_id)` unique → exclusion + dedupe.
- `pitches (influencer_id, status)` → influencer inbox.

## Row Level Security (summary)
- Users read/update only their own `app_users` / profile rows.
- Businesses read only `published` influencer profiles + their cached stats.
- Influencers read pitches/interests addressed to them.
- Monetization tables: owner-scoped; writes via service role (server/cron) only.
