---
tags: [credits, campaigns]
updated: 2026-06-17
---

# Credits & Campaigns

## Creator credits

### Purpose

Gate **creator-initiated proposals** to briefs — quality filter + future revenue.

### Tables

| Table | Purpose |
|-------|---------|
| `creator_credits` | Current balance per `app_users.id` |
| `creator_credit_ledger` | Append-only debit/credit history |
| `creator_referrals` | Referral tracking |
| `creator_promos` | Promotional credit claims |

Migrations: `20260613000010_creator_credits.sql`, `20260614000012_creator_credit_ledger.sql`.

### Constants (`lib/inf-data.ts`)

- `START_CREDITS = 3`
- `REFERRAL_REWARD = 5`
- `PROMO_PER = 5`, `PROMO_CAP = 10`

### Query

`getCreatorCredits(appUserId)` in `lib/queries.ts` — parallel fetch all four tables; falls back to seed data.

### API

`POST /api/creator/credits` — balance adjustments (see route for actions).

### UI

`components/inf-credits.tsx` — hub, buy sheet (stub), gate sheet before proposal.

## Business campaigns

### Purpose

Businesses publish **live briefs** that appear in creator **Briefs** tab (preferred over legacy business-profile opps).

### Table `campaigns`

Fields: title, category, blurb, deliverables (jsonb), budget_lo/hi, status (`draft` | `live` | ...), business_id.

Migration: `20260614000014_campaigns.sql`.

### Business UI

`components/biz-campaigns.tsx` — `CreateCampaignFlow` inside BizApp profile tab.

`publishCampaign()` → optimistic local state → `POST /api/business/campaign`.

### Creator feed

`getBriefs(profileId)`:

1. Query `campaigns` where `status=live` and business `approved=true`
2. Map with `campaignToOpp()`
3. Else fallback to approved `business_profiles` as synthetic opps

### Business pitch credits

Designed in PRD (`credit_ledger` for businesses) — **not fully wired** in UI. Business pitches via ReachOut do not yet debit business credits.

## Related

- [creator-app.md](creator-app.md)
- [business-app.md](business-app.md)
- [implementation-status.md](implementation-status.md)
