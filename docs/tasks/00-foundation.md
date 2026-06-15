# 00 — Foundation

- [x] Create Supabase project; store URL + keys in `.env.local`
- [x] Apply `db/schema.sql` (`supabase db push` or SQL editor)
- [x] Apply `db/seed.sql` for local/staging dev data
- [x] Wire `lib/supabase.ts` to real client (replace stub) — browser + server clients
- [ ] Configure Supabase Auth; link `auth.users` ↔ `app_users` via trigger or server action
      **Deferred to Phase 2.** Current flow uses an `inf_uid` httpOnly cookie (24 h) to
      carry `app_users.id` through onboarding. `auth_user_id` column is nullable and
      unpopulated. Full Supabase Auth integration (magic link or OAuth session) is the
      first task in the Phase 2 list.
- [x] Write concrete RLS policies (per docs/03 intent) and test with anon/auth roles
      38 policies applied via `supabase/migrations/20260610000002_policies.sql`.
- [x] PWA: add `manifest.json`, icons, service worker; verify installable
      `app/manifest.ts` (Next.js 14 MetadataRoute), placeholder icons at
      `public/icon-192.png` and `public/icon-512.png`. Service worker is handled by the
      browser via Next.js — no custom sw.js needed for the current scope.
- [x] Set up Storage buckets: `pitches`, `avatars`, `post-thumbs` (+ access policies)
      Applied via `supabase/migrations/20260610000003_storage.sql`.
- [x] Base layout, theme, mobile viewport, bottom nav
      Layout: `app/layout.tsx` (`max-w-md` container, brand color `#ff4d6d`).
      Viewport: `themeColor` + `initialScale` in layout metadata.
      Bottom nav: `components/BottomNav.tsx` — shows on `/` and `/swipe`;
      hidden on `/onboarding`, `/influencer`, `/business` (those pages have their own CTAs).
- [x] CI: typecheck + lint on PR
      `.github/workflows/ci.yml` — runs `npm run typecheck` and `npm run lint` on every PR
      and push to main.
