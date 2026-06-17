---
tags: [routes]
updated: 2026-06-17
---

# Routes & Pages

## Public

| Route | Type | Component / handler | Notes |
|-------|------|---------------------|-------|
| `/` | Server | `WelcomeScreen` | Role selection, IG errors |
| `/login` | Server | `LoginPage` | Username login |
| `/forgot-password` | Page | — | Password reset shell |
| `/reset-password` | Page | — | Reset shell |
| `/influencer/[id]` | Server | Lookbook | `getInfluencerById()` — any ID via admin |
| `/business/[id]` | Server | Business profile | Mock data only |
| `/swipe` | Server | Legacy swipe deck | `getDeck()` + `SwipeDeck` |
| `/api/health` | API | Liveness | |

## Onboarding (no bottom nav)

| Route | Type | Notes |
|-------|------|-------|
| `/onboarding/[token]` | Server + client | Creator wizard |
| `/business-onboarding` | Server + client | Business wizard |

## Authenticated SPAs

| Route | Cookie | Redirect | App |
|-------|--------|----------|-----|
| `/biz` | `bus_uid` | `/login` | `BizApp` — needs `approved` |
| `/inf` | `inf_uid` | `/login` | `CreatorApp` |

## Auth API (redirects)

| Route | Method |
|-------|--------|
| `/api/auth/instagram` | GET → Meta |
| `/api/auth/instagram/callback` | GET |
| `/api/auth/instagram/mock` | GET (dev) |
| `/api/auth/login` | POST |
| `/api/auth/logout` | POST |

## Bottom navigation

`components/BottomNav.tsx` — shown on `/`, `/swipe` only.

Hidden on: `/`, `/onboarding/*`, `/business-onboarding/*`, `/influencer/*`, `/business/*`, `/api/*`, `/biz/*`, `/inf/*`.

Biz/Creator apps use their own nav: `biz-nav.tsx`, `inf-nav.tsx`.

## PWA

`app/manifest.ts` — metadata route for install prompt.  
`components/PWARegister.tsx` — SW registration in layout.

## Loading states

`loading.tsx` alongside: `app/biz`, `app/inf`, `app/swipe`, `app/login`, `app/onboarding/[token]`, `app/influencer/[id]`.

## Related

- [api-reference.md](api-reference.md)
- [business-app.md](business-app.md) · [creator-app.md](creator-app.md)
