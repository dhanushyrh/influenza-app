# 03 — Instagram / Meta Integration

## Setup (blocks live data)
- [ ] Register Meta Developer app
- [ ] Host live, compliant Privacy Policy URL
- [ ] Request Advanced Access; prepare App Review screencast
- [ ] Configure Instagram Login + webhooks server
- [ ] Scopes: `instagram_business_basic`, `instagram_business_manage_insights`

## Implementation
- [ ] Replace `lib/instagram.ts` mock with real Graph API client
- [ ] `getAccount` — followers, bio, account_type
- [ ] `getAccountInsights` — reach, impressions, profile_views (24h)
- [ ] `getRecentMedia` — last N posts + per-post insights
- [ ] `getAudienceDemographics` — age buckets, gender %, top locations
- [ ] Token exchange + refresh; encrypt at rest (Vault)
- [ ] Webhook: token expiry / account changes → prompt re-auth

## Cron refresh
- [ ] Weekly scheduled job (Supabase Edge Fn / Vercel Cron) per influencer
- [ ] Recompute aggregates → upsert `influencer_stats` (`computed_at`)
- [ ] Stagger calls to respect rate limits (one user at a time)
- [ ] Handle 90-day data window + < 100 follower gaps gracefully
