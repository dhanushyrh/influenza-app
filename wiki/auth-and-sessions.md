---
tags: [auth, security]
updated: 2026-06-17
sources: [lib/auth-persist.ts, lib/instagram.ts, lib/inf-auth.ts, app/api/auth]
---

# Auth & Sessions

## Current model (MVP)

**No Supabase Auth session.** Identity is carried by httpOnly cookies set after Instagram OAuth:

| Cookie | Role | TTL | Value |
|--------|------|-----|-------|
| `inf_uid` | Creator | 24h | `app_users.id` |
| `bus_uid` | Business | 24h | `app_users.id` |

Resolution: `lib/inf-auth.ts` → `getCreatorIds()` / `getBusinessIds()` joins to profile tables.

Phase 2 target: populate `app_users.auth_user_id` from Supabase Auth.

## Instagram OAuth flow

```
GET /api/auth/instagram?role=creator&token=<invite>
GET /api/auth/instagram?role=business
  → getAuthorizeUrl(state)  // lib/instagram.ts
  → Meta OAuth

GET /api/auth/instagram/callback?code=&state=
  → exchangeCodeForToken → getLongLivedToken
  → fetchAccount (or mock)
  → branch on role in state:
       creator  → persistInfluencerSignIn() → redirect onboarding
       business → persistBusinessSignIn() → redirect business-onboarding
```

### Mock auth (development)

`GET /api/auth/instagram/mock?role=&token=` — **404 in production**.

Deterministic fake persona via `MockInstagramService`. Same persist path as real OAuth.

### Error redirects

Welcome screen reads `?ig_error=` — see `IG_ERRORS` in `WelcomeScreen.tsx`.

## Persist layer (`lib/auth-persist.ts`)

### `persistInfluencerSignIn(input)`

1. Validate invite token (not used/expired/revoked)
2. Upsert `app_users` (role: influencer)
3. Upsert `influencer_profiles` + seed `influencer_stats`
4. Mark invite used
5. Set `inf_uid` cookie

### `persistBusinessSignIn(input)`

1. Upsert `app_users` (role: business)
2. Create `business_profiles` (`approved: false`)
3. Seed `business_stats`
4. Set `bus_uid` cookie

### `ensureAuthUserAndLink`

Helper for future Supabase Auth linkage.

## Username login

`/login` → `LoginPage` → `POST /api/auth/login` — alternative entry (username-based; see migration `20260614000013_username.sql`).

## Logout

`POST /api/auth/logout` — clears session cookies. Used by BizApp sign-out.

## Configuration

`isInstagramConfigured` = `META_APP_ID` + `META_APP_SECRET` + `META_REDIRECT_URI`.

If false, WelcomeScreen and wizards show mock IG links.

## Security notes

- `ig_token_ref` stores long-lived token (MVP); migrate to Vault
- `adminClient()` used for persist and deal routes — never expose service key client-side
- RLS still applies for `serverClient()` reads

## Related

- [onboarding.md](onboarding.md)
- [api-reference.md](api-reference.md#auth)
- [integrations.md](integrations.md)
