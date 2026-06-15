# 04 — Swipe Deck

- [ ] Deck query: `influencer_profiles` ⋈ `influencer_stats`, filter by business city + niche,
      exclude already-swiped (`swipes`), order by engagement/recency, limit 10–20
- [ ] Serve deck from cache (DB only — never a live Meta call)
- [ ] Swipe card UI: photo, handle, followers, engagement rate, niche, area
- [ ] Gesture layer (drag/throw) + buttons fallback; smooth on mobile
- [ ] Right swipe → insert `swipes(right)` + `interests`; open Lookbook
- [ ] Left swipe → insert `swipes(left)`; hide card
- [ ] Empty state when deck exhausted ("check back as new creators join")
- [ ] Free-swipe cap → prompt credits beyond limit
- [ ] `actively_looking` businesses surfaced to influencers w/ campaign brief (symmetric)
- [ ] Prefetch next batch for instant feel
