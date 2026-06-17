---
tags: [onboarding]
updated: 2026-06-17
sources: [app/onboarding, app/business-onboarding, lib/auth-persist.ts]
---

# Onboarding

Two wizards: **creator** (invite-gated, 6 steps) and **business** (open, 5 steps).

## Creator flow

```
Invite link /onboarding/[token]
  → validate token (getInviteByToken)
  → Step 1: Instagram OAuth or mock
  → persistInfluencerSignIn() → inf_uid cookie
  → Steps 2–6: details, location, video, category, services
  → POST /api/onboarding/creator/complete
  → Done (Lookbook link with ?pid=)
```

### Wizard file

`app/onboarding/[token]/Wizard.tsx` — client component.

URL params after IG: `?ig=connected&pid=<uuid>&name=&handle=`

Steps (from `lib/ob-data.ts` catalogs):

1. **IG** — link to `/api/auth/instagram?role=creator&token=` or mock
2. **Details** — display name, email, phone
3. **Location** — up to 3 cities from `locations` (`coverage_cities`)
4. **Video** — pitch URL
5. **Category** — creator categories taxonomy
6. **Services** — rate card from `SERVICE_CATALOG`

### Completion API

`POST /api/onboarding/creator/complete` — auth via `inf_uid`. Uses `adminClient()`. Non-blocking on error (wizard still shows done).

Persists: display_name, email, phone, coverage_areas/cities, video_pitch_url, categories, services (upsert), packages (replace).

## Business flow

```
/ or WelcomeScreen → IG (role=business)
  → persistBusinessSignIn() → bus_uid cookie
  → /business-onboarding?pid=...
  → 5-step Wizard
  → POST /api/onboarding/business/complete
  → approved=false until admin enables
```

### Wizard file

`app/business-onboarding/Wizard.tsx`

Steps: IG → details → business info → prefs (creator size, budget) → hiring status

Hiring mapping to DB enum:

| UI | DB `hiring_status` |
|----|-------------------|
| open | `looking_out` |
| scouting | `actively_looking` |
| closed | `not_looking` |

### Approval gate

`business_profiles.approved` default `false`. `/biz` shows pending UI until SQL update.

## Shared primitives

- `components/ob-icons.tsx`, `ob-primitives.tsx` — wizard UI kit
- `lib/ob-tokens.ts` — design tokens (`T.bg`, `T.rose`, etc.)
- `lib/ob-data.ts` — `CITIES`, `CATEGORIES`, `SERVICE_CATALOG`

## Invite management

Table `invites`: single-use token, expiry, `used_at`. Concierge creates rows manually or via seed.

Reset: `UPDATE invites SET used_at = NULL WHERE token = '...'`

## Edge cases (planned)

- Personal IG account → `needs_professional` error on welcome
- &lt;100 followers → limited metrics (documented in PRD)
- Resumable steps — not implemented

## Related

- [auth-and-sessions.md](auth-and-sessions.md)
- [routes-and-pages.md](routes-and-pages.md)
- [../docs/06-onboarding-flows.md](../docs/06-onboarding-flows.md)
