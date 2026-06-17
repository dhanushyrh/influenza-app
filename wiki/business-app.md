---
tags: [business, spa]
updated: 2026-06-17
sources: [app/biz/BizApp.tsx, lib/biz-data.ts, components/biz-*.tsx]
---

# Business App (`/biz`)

Primary authenticated experience for businesses. Server page loads data; client `BizApp` handles all tab navigation without route changes.

## Entry

`app/biz/page.tsx`:

1. Reads `bus_uid` cookie → redirects `/login` if missing
2. Loads `business_profiles` via `adminClient`
3. If `approved === false` → pending review screen
4. Parallel fetch: `getCreatorDeck()`, `getBusinessDeals()`, `getBusinessCampaigns()`
5. Renders `<BizApp />`

## Tabs (`BizBottomNav`)

| Tab | Component | Purpose |
|-----|-----------|---------|
| **discover** | `components/biz-discover.tsx` | Tinder-style swipe deck |
| **search** | `components/biz-search.tsx` | Filterable grid/list |
| **collabs** | `components/biz-collabs.tsx` | Deal pipeline by stage |
| **profile** | `components/biz-profile.tsx` | Business settings, hiring, campaigns entry |

## Overlays (full-screen state machine)

| State | Component | Trigger |
|-------|-----------|---------|
| Lookbook | `biz-lookbook.tsx` | Tap creator from discover/search |
| Reach out | `biz-reachout.tsx` | Pitch CTA — deliverables, budget, message |
| Deal room | `deal-room.tsx` | Open collab card |
| Create campaign | `biz-campaigns.tsx` | Profile → campaigns |

## Key types (`lib/biz-data.ts`)

- `Creator` — deck card shape (extends lookbook fields + distance)
- `Deal` / `DealRuntime` — collab with stage 0–4 and log events
- `MyBiz` — logged-in business profile slice
- `Campaign` — live brief published to creators

Stage labels: `STAGES` — Pitched → Accepted → Funded → Reviewing → Released.

Fee: `FEE_PCT = 10` — platform take on escrow (UI; no Stripe yet).

## Client mutations

`BizApp` uses optimistic local state + `POST` helpers:

| Action | API |
|--------|-----|
| Publish campaign | `POST /api/business/campaign` |
| Send pitch | `POST /api/business/pitch` |
| Deal actions | `POST /api/business/deal` |
| Sign out | `POST /api/auth/logout` |

Deal stage advances locally via `advance()` / `mutate()`; server syncs through deal API.

## Discover physics

`biz-discover.tsx`: pointer drag, threshold 96px, fly-out 520px. Right → lookbook + interest path; left → dismiss.

## Search filters

Category, age buckets, creator size, engagement, budget, area, availability — all client-side over `initialDeck`.

## Related

- [creator-app.md](creator-app.md) — other side of deals
- [deal-pipeline.md](deal-pipeline.md)
- [credits-and-campaigns.md](credits-and-campaigns.md)
- [file-map.md](file-map.md#business-features)
