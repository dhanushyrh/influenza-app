---
tags: [deals, pipeline]
updated: 2026-06-17
sources: [lib/deal-actions.ts, components/deal-room.tsx, lib/biz-data.ts]
---

# Deal Pipeline

End-to-end collab flow from business pitch to escrow release (UI complete; payments stubbed).

## Lifecycle

```
Business sends pitch → pitches (status: sent)
  → Creator accepts / counters
  → pitch promoted to deals row (resolveDeal)
  → stages: draft → accepted → funded → submitted → released
```

### Client stage numbers (`DealRuntime.stage`)

| Stage | Label | DB `deal_status` (approx) |
|-------|-------|----------------------------|
| 0 | Pitched | pitch `sent` or deal `draft` |
| 1 | Accepted | `accepted` |
| 2 | Funded | `funded` |
| 3 | Reviewing | `submitted` |
| 4 | Released | `released` / `completed` |

## Core module: `lib/deal-actions.ts`

### `resolveDeal(supabase, clientId)`

- IDs prefixed `pitch_<uuid>` → lookup or **promote** pitch to new `deals` row
- Copies amount, deliverables, log from pitch
- Marks pitch `accepted`

### `applyAction(supabase, deal, action, ...)`

| Action | Effect |
|--------|--------|
| accept | status → accepted, log event |
| decline | status → cancelled |
| counter | updates `counter`, offer log |
| fund | status → funded, escrow log |
| submit | status → submitted |
| release | status → released, payout log |
| message | appends text log (thread side-effect in route) |

Platform fee: `FEE_PCT = 10` on insert.

## APIs

| Route | Auth | Role |
|-------|------|------|
| `POST /api/business/deal` | `getBusinessIds()` | accept, fund, review, release, message |
| `POST /api/business/pitch` | business | create pitch |
| `POST /api/creator/deal` | `getCreatorIds()` | accept, decline, counter, submit, message |
| `POST /api/creator/proposal` | creator | pitch a brief (credits) |

Business `message` action upserts `threads` and inserts `messages`.

## UI: `components/deal-room.tsx`

Shared by `/biz` and `/inf`. Includes:

- Chat timeline from `DealRuntime.log`
- `StageTracker` progress
- Action sheets: Escrow, Submit, Counter, Review, Summary, Release

Client SPAs mirror server state optimistically; reconcile on API response.

## Data access

- `getBusinessDeals(businessId)` / `getCreatorDeals(profileId)` — `buildDealBundle()` merges `pitches` (sent) + `deals`
- Mappers: `mapPitch()`, `mapDeal()` in `lib/inf-map.ts`

## Phase 3 gaps

- No Stripe PaymentIntent on `fund`
- No automated IG post verification on `submit`
- Dispute/refund paths in schema but not in UI

## Related

- [business-app.md](business-app.md) · [creator-app.md](creator-app.md)
- [data-model.md](data-model.md#deals)
- [../docs/05-payments-escrow.md](../docs/05-payments-escrow.md)
