# Test Accounts — Influenza MVP

All data is seeded to the live Supabase project (`xvplmdtswmbqtwrbjewy`).  
Run locally with `npm run dev`, then open `http://localhost:3000`.

---

## Pre-seeded Influencers

These profiles are already published and visible on the swipe deck (`/swipe`).  
Click any card to reach the Lookbook (`/influencer/<id>`).

| Handle | Name | Niche | Followers | Lookbook path |
|--------|------|-------|-----------|---------------|
| @aisha.eats | Aisha Khan | café | 8.2K | `/influencer/67346359-69f4-4f75-828f-631031699c19` |
| @rohan.bites | Rohan Mehta | street food | 15.4K | `/influencer/e972115b-60dc-4d79-8a8e-981a37633544` |
| @priya.plates | Priya Nair | fine dining | 4.3K | `/influencer/27dbb9d1-4c5f-4f32-a694-fd4258422fc3` |
| @karaneats | Karan Shetty | street food + café | 22.1K | `/influencer/a4659513-0a8b-42e3-b883-a9f45442874f` |
| @snehaforks | Sneha Rao | café | 6.8K | `/influencer/c319e49b-b3c8-4cf5-bc92-04cd5107ccb0` |

Seed email addresses (not used for login yet — auth is IG-based):

| Handle | Email |
|--------|-------|
| @aisha.eats | aisha@example.com |
| @rohan.bites | rohan@example.com |
| @priya.plates | priya@example.com |
| @karaneats | karan@example.com |
| @snehaforks | sneha@example.com |

---

## Pre-seeded Businesses

| Handle | Name | Status |
|--------|------|--------|
| @thirdwave.ind | Third Wave Coffee — Indiranagar | actively_looking |
| @chainivas.ind | Chai Nivas — Koramangala | actively_looking |

Business view (swipe deck): `/swipe`

---

## Mock Onboarding Flow (no Meta credentials needed)

Two invite tokens are ready for end-to-end onboarding tests.  
The "Continue with Instagram (mock)" button hits `/api/auth/instagram/mock`,
which persists a fake persona to the DB exactly like a real OAuth callback.

### Token 1 — Deepa Sharma

| Field | Value |
|-------|-------|
| URL | `/onboarding/mock-onboard-deepa` |
| Token | `mock-onboard-deepa` |
| Mock persona | @deepa.bakes — café/bakery, 11.8K followers |
| Email | deepa@example.com |

### Token 2 — Vikram Rao

| Field | Value |
|-------|-------|
| URL | `/onboarding/mock-onboard-vikram` |
| Token | `mock-onboard-vikram` |
| Mock persona | @vikram.eats — street food, 9.2K followers |
| Email | vikram@example.com |

### Steps

1. Open the onboarding URL above.
2. Click **"Continue with Instagram (mock)"** — the mock endpoint persists the persona, sets an `inf_uid` cookie, and redirects back with `?ig=connected`.
3. Complete the 5-step wizard: Basics → Location → Niche → Video pitch → Done.
4. On Done, click **"View my Lookbook"** to confirm the profile exists.

> Note: each token is single-use. Once used, the invite is marked `used_at` in the DB.  
> To reset, run the following in the Supabase SQL editor:
> ```sql
> update invites set used_at = null, used_by = null
> where token in ('mock-onboard-deepa','mock-onboard-vikram');
> ```

---

## Existing demo token

`demo-token-123` — email `newcreator@example.com`  
URL: `/onboarding/demo-token-123`  
This token was in the original seed and is **already marked used** after the first
onboarding run. Reset with the SQL above (add `'demo-token-123'` to the list).

---

## Supabase project

- **Project URL:** `https://xvplmdtswmbqtwrbjewy.supabase.co`
- **Supabase dashboard:** https://supabase.com/dashboard/project/xvplmdtswmbqtwrbjewy
- Credentials are in `.env` (gitignored). Never commit them.
