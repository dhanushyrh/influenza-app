# 01 — MVP Product Requirements

## Vision

A two-sided marketplace connecting local businesses with hyper-local micro-influencers without intermediaries. A gamified, Tinder-style swipe interface eliminates decision fatigue and lets businesses rapidly browse verified local creators. Both sides authenticate via Instagram to verify identity and pull performance metrics.

## Strategy: solve supply first

The marketplace has a chicken-and-egg problem. We seed **supply (influencers)** first via concierge onboarding and do not charge businesses until a responsive group of influencers is active. Launch is **hyper-focused**: one city (Bengaluru) and one niche (food & drinks).

## Primary users

| Role | Goal | Onboarding |
|---|---|---|
| **Influencer** | Get discovered by local businesses, receive paid pitches | Invite link → Instagram login → pick location/niche → record video pitch |
| **Business** | Quickly find verified local creators that fit their vibe & budget | Instagram login → confirm bio/posts → set demographic target + hiring status |

## MVP feature set

### 1. Dual onboarding
- **Influencer:** low-friction, **invite-link gated** (concierge controls supply quality). Token-based single-use link → Instagram OAuth → location + niche selection + 15–30s video pitch upload.
- **Business:** open self-serve via Instagram login → confirm profile → set target demographic + hiring status.

### 2. Influencer profile ("Lookbook")
Verified stats pulled/calculated from Instagram + manual onboarding fields:
- Follower count, average views, average likes, average comments
- **Engagement rate** = `((avg_likes + avg_comments) / followers) * 100`
- Reach & impressions (24h account-level insights)
- **Audience demographics:** age-group breakdown, gender %, top locations
- Influencer's own location (manually selected — API doesn't expose it reliably)
- Niche/topic: `food_drinks | service | product` (+ subtopics)
- Video pitch (self-intro), rate card (self-reported)

### 3. Business profile
- Instagram bio, follower count
- "Vibe check" grid of last 6 posts
- Target demographic (age/gender/area they want to reach)
- **Hiring Status toggle:** `actively_looking` (boosted + campaign brief) · `looking_out` (open to pitches) · `not_looking` (hidden)
- Optional video/text pitch to attach to outreach

### 4. Swipe deck
- On business login, backend serves a **cached deck** of 10–20 local influencer cards (pre-computed metrics for instant load).
- **Right swipe = Interest** → opens full Lookbook.
- **Left swipe = hide** card from feed.
- Deck filtered by niche + proximity; `actively_looking` businesses surface campaign briefs to influencers symmetrically.

### 5. Interest → Pitch → Messaging
- Right swipe creates an **interest** record.
- Business sends a **pitch** (message + optional budget/brief). Free swipes are limited; beyond the cap, pitches require credits (quality filter + revenue).
- Lightweight in-app **messaging** thread per match (Supabase Realtime).

### 6. Escrow loop (Phase 3 — designed now, built later)
- Stripe Connect multi-party. On pitch acceptance, business card is charged and funds held.
- On verified post, release 90% to creator, retain 10% platform fee.

## Monetization (phased)
1. **Freemium hook** — free profiles + deck viewing builds supply.
2. **Escrow loop** — 10% fee on on-platform deals.
3. **Pay-per-pitch credits** — e.g. ₹1000 / 10 credits after free swipes exhausted.
4. **Premium subscriptions** — e.g. ₹3000/mo agency tier: unlimited swipes, priority placement, advanced demographic filters.

## Roadmap

| Phase | Weeks | Focus |
|---|---|---|
| **1. Manual prototype** | 1–3 | Manually recruit 20–30 influencers; no-code Lookbook; manually pitch 10–20 businesses; manual 10% cut. |
| **2. Core tech build** | 4–8 | Dual onboarding, Meta API login + metrics, swipe directory (niche + proximity), in-app messaging. **← this scaffold targets Phase 2.** |
| **3. Payment & escrow** | 9–12 | Stripe Connect, escrow charge-on-accept, auto-release on verified post. |

## Out of scope for MVP
- Native iOS/Android apps (PWA first)
- Bulk metric pulls (Meta API is one-user-at-a-time)
- Real-time "online" presence (API doesn't expose it)
- Multi-city / multi-niche expansion

## Key constraints (from Meta API reality)
- Insights only for **Professional (Business/Creator)** accounts, not personal.
- Meta stores user metrics **≤ 90 days**.
- Some metrics unavailable for accounts **< 100 followers**.
- One user at a time → **cache on signup, refresh weekly via cron**.
- Location & last-active not exposed → location is **manual at onboarding**.
- Needs Meta **Advanced Access** + formal **App Review** (screencast) + live **Privacy Policy URL**.

## Success metrics (Phase 2)
- ≥ 30 verified influencers onboarded in Bengaluru food niche
- ≥ 20 businesses active on the swipe deck
- Median deck load < 500ms (cached)
- ≥ 1 accepted pitch leading to a manual/escrow deal
