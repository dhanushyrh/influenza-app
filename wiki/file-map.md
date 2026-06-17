---
tags: [navigation, map]
updated: 2026-06-17
---

# File Map — Feature → Code

Use this page to jump straight to edit locations. Paths relative to repo root.

## "I need to change…"

### Business swipe / discover deck

| What | Where |
|------|-------|
| Drag physics, thresholds | `components/biz-discover.tsx` |
| Deck data query | `lib/queries.ts` → `getCreatorDeck()` |
| Creator card types | `lib/biz-data.ts` → `Creator`, `CREATORS` seed |
| Legacy `/swipe` page | `app/swipe/page.tsx`, `components/SwipeDeck.tsx` |

### Business search & filters

| What | Where |
|------|-------|
| Filter UI | `components/biz-search.tsx` |
| Taxonomy constants | `lib/biz-data.ts` → `CAT`, `SIZE`, `AREAS`, `BUDGETS` |

### Lookbook (public creator profile)

| What | Where |
|------|-------|
| Page | `app/influencer/[id]/page.tsx` |
| Query | `lib/queries.ts` → `getInfluencerById()` |
| UI sections | `components/biz-lookbook.tsx` (reused in BizApp overlay) |

### Business pitch / reach out

| What | Where |
|------|-------|
| Composer UI | `components/biz-reachout.tsx` |
| API | `app/api/business/pitch/route.ts` |
| Optimistic deal create | `lib/biz-data.ts` → `makePitchDeal()` |

### Deal room & pipeline

| What | Where |
|------|-------|
| Shared UI | `components/deal-room.tsx` |
| State machine writes | `lib/deal-actions.ts` |
| Business API | `app/api/business/deal/route.ts` |
| Creator API | `app/api/creator/deal/route.ts` |
| DB → UI mapping | `lib/inf-map.ts` → `mapDeal`, `mapPitch` |
| Biz collabs list | `components/biz-collabs.tsx` |
| Creator collabs | `components/inf-collabs.tsx` |

### Campaigns & briefs

| What | Where |
|------|-------|
| Create campaign UI | `components/biz-campaigns.tsx` |
| API | `app/api/business/campaign/route.ts` |
| Creator briefs list | `components/inf-briefs.tsx` |
| Briefs query | `lib/queries.ts` → `getBriefs()` |
| Campaign mapper | `lib/inf-map.ts` → `campaignToOpp()` |

### Creator credits

| What | Where |
|------|-------|
| UI hub | `components/inf-credits.tsx` |
| Constants / seed | `lib/inf-data.ts` |
| Query | `lib/queries.ts` → `getCreatorCredits()` |
| API | `app/api/creator/credits/route.ts` |
| Proposal gate | `app/inf/CreatorApp.tsx` |

### Creator profile autosave

| What | Where |
|------|-------|
| Debounced save | `app/inf/CreatorApp.tsx` |
| API | `app/api/creator/profile/route.ts` |
| Profile tab UI | `components/inf-profile.tsx` |

### Onboarding wizards

| What | Where |
|------|-------|
| Creator wizard | `app/onboarding/[token]/Wizard.tsx` |
| Business wizard | `app/business-onboarding/Wizard.tsx` |
| Step catalogs | `lib/ob-data.ts` |
| Design tokens | `lib/ob-tokens.ts` |
| Shared UI | `components/ob-primitives.tsx`, `ob-icons.tsx` |
| Complete APIs | `app/api/onboarding/creator/complete/route.ts`, `business/complete/route.ts` |

### Auth & Instagram

| What | Where |
|------|-------|
| OAuth routes | `app/api/auth/instagram/route.ts`, `callback/route.ts`, `mock/route.ts` |
| IG client | `lib/instagram.ts` |
| Persist sign-in | `lib/auth-persist.ts` |
| Cookie resolution | `lib/inf-auth.ts` |
| Welcome / entry | `components/WelcomeScreen.tsx` |
| Login | `app/login/LoginPage.tsx` |

### Data layer (always check here first)

| What | Where |
|------|-------|
| **All DB reads for pages** | `lib/queries.ts` |
| Domain types | `lib/types.ts` |
| Supabase clients | `lib/supabase.ts` |
| Mock fallback | `lib/mock-data.ts`, `lib/biz-data.ts`, `lib/inf-data.ts` |
| Engagement formula | `lib/metrics.ts` |

### Database schema

| What | Where |
|------|-------|
| Canonical SQL | `db/schema.sql` |
| Migrations | `supabase/migrations/*.sql` |
| Seed data | `supabase/seed.sql`, `db/seed.sql` |
| Test accounts doc | `docs/TEST_ACCOUNTS.md` |

### App shells

| What | Where |
|------|-------|
| Business SPA root | `app/biz/page.tsx`, `app/biz/BizApp.tsx` |
| Creator SPA root | `app/inf/page.tsx`, `app/inf/CreatorApp.tsx` |
| Layout / PWA | `app/layout.tsx`, `components/PWARegister.tsx` |

### Styling & brand

| What | Where |
|------|-------|
| Tailwind config | `tailwind.config.ts` — `bg-brand` = `#ff4d6d` |
| Global CSS | `app/globals.css` |
| Inline token palette | `lib/ob-tokens.ts` |

## Query functions cheat sheet (`lib/queries.ts`)

| Function | Used by |
|----------|---------|
| `getDeck()` | `/swipe` |
| `getCreatorDeck()` | `/biz` discover/search |
| `getInfluencerById()` | Lookbook |
| `getBusinessById()` | `/business/[id]` (mock) |
| `getMyCreator()` | `/inf` |
| `getBriefs()` | `/inf` briefs |
| `getCreatorCredits()` | `/inf` |
| `getCreatorDeals()` | `/inf` collabs |
| `getBusinessDeals()` | `/biz` collabs |
| `getBusinessCampaigns()` | `/biz` profile |
| `getInviteByToken()` | onboarding |

## Design handoff → production

| What | Where |
|------|-------|
| Porting guide (Supabase rules) | `designs/influenza/README.md` |
| Primary prototype | `designs/influenza/project/Influenza Prototype.html` |
| Prototype modules | `designs/influenza/project/Influenza Prototype/*.jsx` |

Port **visuals** into `components/*`; never copy `localStorage` auth or inline seeds as runtime data.

## Related

- [wiki/index.md](index.md)
- [implementation-status.md](implementation-status.md)
