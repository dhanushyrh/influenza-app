---
tags: [api]
updated: 2026-06-17
---

# API Reference

All handlers under `app/api/`. Auth column: cookie or none.

## Auth

| Method | Path | Auth | Body / query | Response |
|--------|------|------|--------------|----------|
| GET | `/api/auth/instagram` | — | `role=creator\|business`, `token?` | 302 Meta OAuth |
| GET | `/api/auth/instagram/callback` | — | `code`, `state` | 302 app redirect |
| GET | `/api/auth/instagram/mock` | — | `role`, `token?` | 302 (dev only) |
| POST | `/api/auth/login` | — | username/password | session cookies |
| POST | `/api/auth/logout` | — | — | clears cookies |

## Onboarding

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/onboarding/creator/complete` | `inf_uid` | Persist creator wizard |
| POST | `/api/onboarding/business/complete` | `bus_uid` | Persist business wizard |

## Reference data

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/cities` | Locations / coverage cities |
| GET | `/api/categories` | Creator categories taxonomy |

## Creator (`/inf`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/creator/profile` | `inf_uid` | Autosave profile fields |
| POST | `/api/creator/proposal` | creator ids | Pitch a brief (credits) |
| POST | `/api/creator/deal` | creator ids | Deal actions |
| POST | `/api/creator/credits` | creator ids | Credit operations |

## Business (`/biz`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/business/pitch` | business ids | Send pitch to creator |
| POST | `/api/business/deal` | business ids | Deal actions + optional message → thread |
| POST | `/api/business/campaign` | business ids | Create/update campaign |

## System

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check |

## Deal action payload (business & creator)

```json
{
  "dealId": "uuid or pitch_<uuid>",
  "action": "accept | decline | counter | fund | submit | release | message",
  "payload": 5000,
  "text": "optional message",
  "attachment": {}
}
```

Implementation: `lib/deal-actions.ts` + route-specific auth checks.

## Adding a new endpoint

1. Create `app/api/<area>/<name>/route.ts`
2. Use `getCreatorIds()` or `getBusinessIds()` for auth
3. Use `adminClient()` for writes that bypass RLS
4. Add row to this page + [file-map.md](file-map.md)

## Related

- [auth-and-sessions.md](auth-and-sessions.md)
- [deal-pipeline.md](deal-pipeline.md)
