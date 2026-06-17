---
tags: [glossary]
updated: 2026-06-17
---

# Glossary

| Term | Meaning |
|------|---------|
| **Lookbook** | Public influencer profile page (`/influencer/[id]`) — stats, demographics, video pitch, rate card |
| **Deck** | Stack of creator cards for business discovery (swipe UI) |
| **Brief / Opp** | Business opportunity shown to creators — from `campaigns` or synthesized from business profile |
| **Pitch** | Business-initiated outreach to a creator (`pitches` table, stage 0) |
| **Proposal** | Creator-initiated response to a brief (debits credits) |
| **Deal** | Negotiation record after pitch acceptance (`deals` table) |
| **Deal room** | Full-screen chat + stage tracker for a single deal |
| **Collabs** | Tab listing all deals/pitches in pipeline |
| **Hiring status** | Business flag: actively looking, looking out, not looking — affects visibility |
| **Published** | `influencer_profiles.published` — controls deck visibility (not Lookbook direct URL) |
| **Approved** | `business_profiles.approved` — gate for `/biz` app |
| **Coverage cities** | Up to 3 cities a creator serves (`coverage_cities` jsonb) |
| **Engagement rate** | `(avg_likes + avg_comments) / followers * 100` — cached in `influencer_stats` |
| **Cached stats** | Pre-computed IG metrics — UI never calls Meta at request time |
| **inf_uid / bus_uid** | httpOnly session cookies holding `app_users.id` |
| **Mock mode** | No Supabase or no Meta env — app uses `lib/mock-data.ts` seeds |
| **Concierge** | Manual operator who issues invite links and approves businesses |
| **Escrow** | Phase 3 — hold business payment until deliverable verified |
| **Platform fee** | 10% retained on deals (`FEE_PCT` in `lib/biz-data.ts`) |
| **PWA** | Progressive Web App — installable mobile shell |
| **SPA** | `/biz` and `/inf` — client tab navigation without route changes |
| **RLS** | Row Level Security — Postgres policies per Supabase role |
| **adminClient** | Supabase service-role client bypassing RLS for server writes |

## Related

- [overview.md](overview.md)
- [data-model.md](data-model.md)
