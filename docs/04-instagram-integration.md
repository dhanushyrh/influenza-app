# 04 — Instagram / Meta Graph API Integration (stubbed in MVP)

> **Status in scaffold:** stubbed. DB fields + a typed service interface exist; data is mocked. Real integration is wired during Phase 2 once Meta App Review is approved.

## Why it gates everything
Identity verification and performance metrics both come from Instagram. No IG = no verified Lookbook. But Meta's rules are strict and approval takes weeks, so we design the data model and interfaces now and swap the mock for live calls later.

## Legal / developer prerequisites
- Register as a **Meta Developer**, create an app in the dashboard.
- Live, compliant **Privacy Policy URL** (mandatory for IG Login approval).
- Because we serve professional accounts we don't own → need **Advanced Access** + pass **App Review** (incl. a screencast demoing data usage).

## Auth & permissions
- Use **"Instagram API with Instagram Login"** (or Facebook Login for Business) + a **webhooks** server.
- Permissions: `instagram_business_basic`, `instagram_business_manage_insights`.

## Endpoints we use
| Need | Endpoint | Notes |
|---|---|---|
| Account metrics (impressions, profile_views, reach) | `GET /<IG_USER_ID>/insights` | 24h window |
| Per-post engagement | `GET /<IG_MEDIA_ID>/insights` | engagement, impressions, reach |
| Audience demographics (age, gender, locations) | audience insights on auth | only on professional accounts |
| Last 6 posts ("vibe check" grid) | `GET /<IG_USER_ID>/media` | thumbnails to Storage |

## Hard limitations (design around these)
- Professional (Business/Creator) accounts **only** — not personal.
- Metrics stored by Meta **≤ 90 days**.
- Some metrics **unavailable < 100 followers**.
- **One user at a time** — no bulk pulls → **cache on signup + weekly cron refresh**.
- **Location not exposed** → manual selection at onboarding.
- **Last-active not exposed** → no presence feature.

## Engagement calculation (we compute & cache)
```
engagement_rate = ((avg_likes + avg_comments) / followers) * 100
```
Averaged over the most recent N posts (default 12). Stored in `influencer_stats`.

## Service interface (see `lib/instagram.ts` stub)
```ts
interface InstagramService {
  exchangeCodeForToken(code: string): Promise<IgToken>;
  getAccount(userId: string): Promise<IgAccount>;          // followers, bio, account_type
  getAccountInsights(userId: string): Promise<IgInsights>; // reach, impressions, profile_views (24h)
  getRecentMedia(userId: string, limit?: number): Promise<IgMedia[]>;
  getAudienceDemographics(userId: string): Promise<IgDemographics>; // age, gender%, locations
}
```
The mock implementation returns deterministic fake data so the UI is fully testable offline.

## Cron refresh job
Weekly per-influencer: pull fresh insights + recent media → recompute aggregates → upsert `influencer_stats` (`computed_at = now()`). Stagger calls to respect rate limits.

## Webhooks
Subscribe to account changes / token expiry so we can prompt re-auth before tokens lapse.
