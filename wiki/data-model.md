---
tags: [database, schema]
updated: 2026-06-17
sources: [db/schema.sql, supabase/migrations]
---

# Data Model

Postgres on Supabase. **Source of truth:** `db/schema.sql`. Applied via `supabase/migrations/`.

## Enums

| Enum | Values |
|------|--------|
| `user_role` | influencer, business, admin |
| `hiring_status` | actively_looking, looking_out, not_looking |
| `swipe_direction` | left, right |
| `pitch_status` | sent, accepted, declined, expired |
| `deal_status` | draft, accepted, funded, in_progress, submitted, verified, released, completed, disputed, refunded, cancelled |

## Core identity

### `app_users`

Links IG account to role. `auth_user_id` nullable (future Supabase Auth). `username` for login. `ig_token_ref`, `phone`.

### `invites`

Single-use onboarding tokens: `token`, `role`, `expires_at`, `used_at`, `revoked`.

## Influencer domain

| Table | Purpose |
|-------|---------|
| `influencer_profiles` | Profile, `published`, `coverage_cities`, `creator_categories`, `video_pitch_url` |
| `influencer_stats` | **Cached metrics** — deck reads only this |
| `audience_demographics` | age_buckets, gender_split, top_locations (jsonb) |
| `influencer_niches` | M2M to `niches` |
| `influencer_services` | Rate card per `service_types` |
| `service_packages` | Bundled deliverables |
| `influencer_posts` | Cached IG media thumbnails |

**Trigger:** `set_engagement_rate()` on stats update.

## Business domain

| Table | Purpose |
|-------|---------|
| `business_profiles` | `approved`, `hiring_status`, `target_*`, `category` |
| `business_stats` | Cached follower metrics |
| `business_posts` | Vibe grid (6 posts) |
| `campaigns` | Live briefs for creator feed |

## Marketplace actions

| Table | Purpose |
|-------|---------|
| `swipes` | left/right per business+creator |
| `interests` | right-swipe interest |
| `pitches` | Business → creator pitch |
| `deals` | Negotiation + escrow state, `log` jsonb |
| `threads` / `messages` | Messaging (unique business_id+influencer_id) |
| `payments` | Phase 3 Stripe records |

## Creator economy

| Table | Purpose |
|-------|---------|
| `creator_credits` | Balance |
| `creator_credit_ledger` | Transactions |
| `creator_referrals` | Referral program |
| `creator_promos` | Promo redemptions |

## Reference

| Table | Purpose |
|-------|---------|
| `locations` | Cities (Bengaluru focus) |
| `niches` | category + subtopic |
| `service_types` | post, reel, story, campaign |
| `creator_categories` | Taxonomy for creator profile |

## Migrations (chronological)

| File | Adds |
|------|------|
| `20260610000001_init` | Base schema |
| `20260610000002_policies` | RLS |
| `20260610000003_storage` | Buckets |
| `20260610000004_mvp_seed` | Demo data |
| `20260610000005_influencer_media` | Posts media |
| `20260611000006_business_approval` | `approved` column |
| `20260611000007_wizard_data` | phone, category, targets |
| `20260612000008_coverage_cities` | coverage_cities jsonb |
| `20260612000009_creator_categories` | taxonomy table |
| `20260613000010_creator_credits` | credits balance |
| `20260614000011_inf_pipeline_fields` | deal/pitch fields |
| `20260614000012_creator_credit_ledger` | ledger |
| `20260614000013_username` | username login |
| `20260614000014_campaigns` | campaigns |
| `20260614000015_inf_creator_categories_col` | profile categories col |

## RLS

38 policies in `20260610000002_policies.sql`. Businesses see published influencers only. Users edit own profiles.

## TypeScript mirror

`lib/types.ts` — `InfluencerProfile`, `BusinessProfile`, `Invite`, etc.

Row mapping: `lib/queries.ts` (`mapInfluencer`), `lib/inf-map.ts` (SPA models).

## Related

- [architecture.md](architecture.md)
- [../docs/03-database-design.md](../docs/03-database-design.md)
