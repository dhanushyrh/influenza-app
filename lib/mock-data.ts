// Deterministic mock data so the skeleton runs with no Supabase/Meta creds.
// Replace with real DB queries in Phase 2 (see docs/tasks/00-foundation.md).

import { BusinessProfile, InfluencerProfile, Invite, InfluencerService, ServicePackage } from "./types";
import { engagementRate } from "./metrics";

const blr = () => ({ id: 1, city: "Bengaluru", geoLat: 12.9716, geoLng: 77.5946 });

const baseServices = (mult: number): InfluencerService[] => [
  { id: "svc_post", code: "post", title: "Instagram Post", price: 3000 * mult, currency: "INR", negotiable: false },
  { id: "svc_reel", code: "reel", title: "Instagram Reel", price: 6000 * mult, currency: "INR", negotiable: true },
  { id: "svc_story", code: "story", title: "Instagram Story", price: 1500 * mult, currency: "INR", negotiable: false },
];

const launchCombo = (mult: number): ServicePackage => ({
  id: "pkg_launch",
  name: "Launch Combo",
  description: "1 reel + 1 post + 3 stories",
  price: 9000 * mult,
  currency: "INR",
  negotiable: true,
  items: [
    { serviceCode: "reel", quantity: 1 },
    { serviceCode: "post", quantity: 1 },
    { serviceCode: "story", quantity: 3 },
  ],
});

function makeInfluencer(
  id: string,
  displayName: string,
  handle: string,
  followers: number,
  avgLikes: number,
  avgComments: number,
  subtopic: string,
  priceMult = 1
): InfluencerProfile {
  return {
    id,
    displayName,
    handle,
    bio: "Bengaluru food explorer 🍜 | reviews & hidden gems",
    avatarUrl: undefined,
    location: blr(),
    niches: [{ id: 1, category: "food_drinks", subtopic }],
    videoPitchUrl: undefined,
    services: baseServices(priceMult),
    packages: [launchCombo(priceMult)],
    posts: [],
    published: true,
    stats: {
      followers,
      avgViews: Math.round(avgLikes * 7.5),
      avgLikes,
      avgComments,
      reach24h: Math.round(followers * 0.74),
      impressions24h: Math.round(followers * 1.13),
      profileViews24h: Math.round(followers * 0.05),
      postsSampled: 12,
      engagementRate: engagementRate(avgLikes, avgComments, followers),
      computedAt: "2026-06-08T00:00:00Z",
    },
    demographics: {
      ageBuckets: { "13-17": 3.2, "18-24": 41.0, "25-34": 38.5, "35-44": 12.1, "45+": 5.2 },
      genderSplit: { female: 59.5, male: 39.0, other: 1.5 },
      topLocations: [
        { city: "Bengaluru", pct: 68.4 },
        { city: "Mysuru", pct: 7.1 },
        { city: "Chennai", pct: 4.3 },
      ],
    },
  };
}

export const MOCK_INFLUENCERS: InfluencerProfile[] = [
  makeInfluencer("inf_1", "Aisha Khan", "@aisha.eats", 8200, 540, 38, "cafe"),
  makeInfluencer("inf_2", "Rohan Mehta", "@rohan.bites", 15400, 980, 61, "street_food", 1.5),
  makeInfluencer("inf_3", "Priya Nair", "@priya.plates", 4300, 410, 52, "fine_dining", 0.8),
  makeInfluencer("inf_4", "Karan Shetty", "@karaneats", 22100, 1240, 73, "street_food", 2),
  makeInfluencer("inf_5", "Sneha Rao", "@snehaforks", 6800, 600, 44, "cafe"),
];

export const MOCK_BUSINESS: BusinessProfile = {
  id: "biz_1",
  name: "Third Wave Coffee — Indiranagar",
  handle: "@thirdwave.ind",
  bio: "Specialty coffee ☕ | small-batch roasts | community space",
  location: blr(),
  hiringStatus: "actively_looking",
  target: { ageMin: 18, ageMax: 35, gender: "any", area: "Indiranagar" },
  pitchText: "Looking for food creators to feature our new cold brew menu.",
  stats: {
    followers: 14200,
    avgViews: 5200,
    avgLikes: 720,
    avgComments: 41,
    reach24h: 9800,
    impressions24h: 15200,
    profileViews24h: 880,
    postsSampled: 12,
    engagementRate: engagementRate(720, 41, 14200),
    computedAt: "2026-06-08T00:00:00Z",
  },
  posts: Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    thumbnailUrl: "",
    caption: `Post ${i + 1}`,
  })),
};

export const MOCK_INVITES: Record<string, Invite> = {
  "demo-token-123": {
    token: "demo-token-123",
    role: "influencer",
    email: "newcreator@example.com",
    expiresAt: "2030-01-01T00:00:00Z",
    revoked: false,
  },
};

export function getInfluencer(id: string): InfluencerProfile | undefined {
  return MOCK_INFLUENCERS.find((i) => i.id === id);
}

export function getInvite(token: string): Invite | undefined {
  return MOCK_INVITES[token];
}
