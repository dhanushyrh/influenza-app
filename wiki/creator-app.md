---
tags: [creator, spa]
updated: 2026-06-17
sources: [app/inf/CreatorApp.tsx, lib/inf-data.ts, components/inf-*.tsx]
---

# Creator App (`/inf`)

Primary authenticated experience for influencers/creators.

## Entry

`app/inf/page.tsx`:

1. `getCreatorIds()` from `inf_uid` cookie → redirect `/login`
2. Parallel: `getMyCreator()`, `getCreatorCredits()`, `getCreatorDeals()`, `getBriefs()`
3. Renders `<CreatorApp />`

## Tabs (`InfBottomNav`)

| Tab | Component | Purpose |
|-----|-----------|---------|
| **home** | `inf-home.tsx` | Dashboard, stats, quick actions |
| **briefs** | `inf-briefs.tsx` | Business campaigns / opportunities |
| **collabs** | `inf-collabs.tsx` | Active deals pipeline |
| **wallet** | `inf-wallet.tsx` | Earnings, payout summary |
| **profile** | `inf-profile.tsx` | Edit profile, services, availability |

## Credits economy

State in `CreatorApp`: balance, ledger, referrals, promos.

| UI | Component | Behavior |
|----|-----------|----------|
| Credits hub | `inf-credits.tsx` | Ledger, referrals, promos |
| Credit gate | `CreditGateSheet` | Blocks proposal if insufficient credits |
| Buy credits | `BuyCreditsSheet` | UI stub — no payment processor |
| Burst animation | `CreditBurst` | Reward feedback |

Constants in `lib/inf-data.ts`: `START_CREDITS=3`, `REFERRAL_REWARD=5`, promo caps.

Proposal flow debits credits optimistically; `POST /api/creator/proposal` persists.

## Profile autosave

`useEffect` debounced 800ms → `POST /api/creator/profile` on changes to name, bio, cities, categories, services, avatar/cover URLs.

## Briefs feed

`getBriefs()`:

1. Prefer `campaigns` with `status=live` from approved businesses
2. Fallback: synthesize opps from `business_profiles` rows

Mapped via `campaignToOpp()` / `mapOpp()` in `lib/inf-map.ts`.

## Deal interactions

Same `deal-room.tsx` as business app. Creator actions via `POST /api/creator/deal`:

- accept, decline, counter, submit, message

`makeProposalDeal()` creates optimistic deal when pitching a brief.

## Key types

- `MyCreator` — profile + earnings stats (`lib/inf-data.ts`)
- `Opp` — brief/card in feed
- Shared `Deal` / `DealRuntime` from `lib/biz-data.ts`

## Related

- [business-app.md](business-app.md)
- [credits-and-campaigns.md](credits-and-campaigns.md)
- [deal-pipeline.md](deal-pipeline.md)
