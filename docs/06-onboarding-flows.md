# 06 — Onboarding Flows

## Influencer — invite-link gated (concierge-controlled supply)

Supply quality is the whole game early on, so influencer signup is **gated by a single-use invite link** the concierge sends after a manual DM recruit.

```
Concierge generates invite ──► influencer_invite row (token, expires_at, created_by)
        │  link: /onboarding/<token>
        ▼
Influencer opens link
   ├─ token invalid/expired/used ─► friendly error
   └─ token valid
        ▼
Step 1  Instagram login (OAuth)
        - require Professional (Business/Creator) account
        - store ig_user_id + tokens, pull initial insights
        ▼
Step 2  Confirm basics (name, handle pulled from IG)
        ▼
Step 3  Location (manual — API can't give it)
        - city → area/locality
        ▼
Step 4  Niche / topic
        - food_drinks | service | product (+ subtopics)
        ▼
Step 5  Video pitch (15–30s self-intro) → Storage
        + optional self-reported rate card
        ▼
Profile published · invite marked used · first stats snapshot cached
```

Single-use, expiring tokens prevent link sharing/spam and keep the concierge in control of who joins.

### Token model
- `invites(token, role, email?, created_by, expires_at, used_at, used_by)`
- One-time use; default expiry 7 days; concierge can revoke.

## Business — open self-serve via Instagram

```
Business opens app ──► "Continue with Instagram"
        ▼
Instagram login (OAuth, Professional account)
        ▼
Confirm profile: bio + follower count + last 6 posts grid (auto-pulled)
        ▼
Set target demographic (age range, gender focus, area to reach)
        ▼
Set Hiring Status: actively_looking | looking_out | not_looking
        ▼
(optional) attach a pitch/brief
        ▼
Lands on /swipe with a cached deck of local influencers
```

## Shared
- All users map to one `app_users` row (role discriminator) linked to Supabase Auth.
- Re-auth prompt when IG token nears expiry (webhook-driven).
- Onboarding is resumable — partial progress saved per step.

## Screens in this scaffold
- `/onboarding/[token]` — influencer multi-step (stubbed steps, mock IG).
- Business onboarding is documented; the scaffold lands businesses straight on `/swipe` with mock identity. (Build out in Phase 2 task list.)
