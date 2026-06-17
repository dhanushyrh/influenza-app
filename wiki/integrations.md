---
tags: [integrations]
updated: 2026-06-17
sources: [lib/instagram.ts, docs/04-instagram-integration.md, docs/05-payments-escrow.md]
---

# Integrations

## Instagram / Meta Graph API

### Current state

| Capability | Status |
|------------|--------|
| OAuth authorize + callback | ✅ `lib/instagram.ts` |
| Code → short → long-lived token | ✅ |
| Account fetch | 🟡 Real when configured; else `MockInstagramService` |
| Insights, demographics, media | ⬜ Mock/seed data |
| Weekly cron refresh | ⬜ Not implemented |
| Webhooks (token expiry) | ⬜ |

### Configuration

```env
META_APP_ID=
META_APP_SECRET=
META_REDIRECT_URI=
```

`isInstagramConfigured` gates real vs mock links in UI.

### Scopes (target)

`instagram_business_basic`, `instagram_business_manage_insights`

### Constraints (from PRD)

- Professional accounts only
- Metrics ≤90 days retention
- Rate limit: one user at a time → **must cache** in `influencer_stats`
- Advanced Access + App Review + Privacy Policy URL required for prod

### Key files

- `lib/instagram.ts` — `getAuthorizeUrl`, token exchange, `fetchAccount`
- `lib/auth-persist.ts` — persist after OAuth
- `app/api/auth/instagram/*` — route handlers

## Stripe Connect (Phase 3)

### Current state

- UI simulates fund/release in DealRoom
- `deals` status transitions without PaymentIntent
- `payments` table in schema unused

### Target flow

1. Pitch accepted → `deals` row with 10% `platform_fee`
2. `fund` → charge business card, hold escrow
3. Creator submits → verify post (manual MVP)
4. `release` → transfer 90% to creator Connected account

See [../docs/05-payments-escrow.md](../docs/05-payments-escrow.md).

### Configuration

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Background jobs (planned)

Weekly per-influencer metrics refresh:

- Supabase Edge Function or Vercel Cron → protected route
- Stagger calls, upsert `influencer_stats`, recompute engagement
- Handle &lt;100 followers and missing insights gracefully

## Supabase services

| Service | Usage |
|---------|-------|
| Postgres | All app data |
| Storage | pitches, avatars, post-thumbs |
| Auth | Deferred — cookies today |
| Realtime | Target for messaging; partial via direct inserts |
| Vault | Target for IG token storage |

## Related

- [auth-and-sessions.md](auth-and-sessions.md)
- [deal-pipeline.md](deal-pipeline.md)
- [implementation-status.md](implementation-status.md)
