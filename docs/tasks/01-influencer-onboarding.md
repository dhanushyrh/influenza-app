# 01 — Influencer Onboarding (invite-link)

- [ ] Admin/concierge: generate single-use invite (`invites` row) + shareable link
- [ ] `/onboarding/[token]` route: validate token (exists, not expired, not used, not revoked)
- [ ] Friendly error states: invalid / expired / already-used token
- [ ] Step 1 — Instagram OAuth; require Professional (Business/Creator) account
- [ ] Persist `ig_user_id`, account type, encrypted token ref (Vault), expiry
- [ ] Pull initial insights + recent media; create first `influencer_stats` snapshot
- [ ] Step 2 — confirm name/handle (prefilled from IG), bio
- [ ] Step 3 — location: city → area picker (from `locations`)
- [ ] Step 4 — niche/topic multi-select (`niches`) → `influencer_niches`
- [ ] Step 5 — record/upload 15–30s video pitch → Storage → `video_pitch_url`
- [ ] Optional — self-reported rate card
- [ ] Resumable progress (save per step)
- [ ] Publish profile; mark invite `used_at` / `used_by`
- [ ] Edge cases: < 100 followers (limited metrics), personal account (block w/ guidance)
