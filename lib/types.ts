// Domain types — mirror db/schema.sql. Used across the skeleton.

export type UserRole = "influencer" | "business" | "admin";
export type HiringStatus = "actively_looking" | "looking_out" | "not_looking";
export type NicheCategory = "food_drinks" | "service" | "product";

export interface Location {
  id: number;
  city: string;
  geoLat?: number;
  geoLng?: number;
}

export type ServiceCode = "post" | "reel" | "story" | "campaign";

export interface InfluencerService {
  id: string;
  code: ServiceCode; // from base service_types catalog
  title: string;
  price?: number;
  currency: string;
  negotiable: boolean;
}

export interface ServicePackage {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency: string;
  negotiable: boolean;
  items: { serviceCode: ServiceCode; quantity: number }[];
}

export interface Niche {
  id: number;
  category: NicheCategory;
  subtopic?: string;
}

export interface AudienceDemographics {
  ageBuckets: Record<string, number>; // percent
  genderSplit: Record<string, number>; // percent
  topLocations: { city: string; pct: number }[];
}

export interface InfluencerStats {
  followers: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  reach24h: number;
  impressions24h: number;
  profileViews24h: number;
  postsSampled: number;
  engagementRate: number; // computed & cached
  computedAt: string;
}

export interface InfluencerPost {
  id: number;
  thumbnailUrl: string;
  permalink?: string;
  caption?: string;
  likes: number;
  comments: number;
  postedAt?: string;
  position: number;
}

export interface InfluencerProfile {
  id: string;
  displayName: string;
  handle: string;
  bio?: string;
  avatarUrl?: string;
  location: Location;
  niches: Niche[];
  videoPitchUrl?: string;
  services: InfluencerService[];
  packages: ServicePackage[];
  published: boolean;
  stats: InfluencerStats;
  demographics: AudienceDemographics;
  posts: InfluencerPost[];
}

export interface BusinessPost {
  id: number;
  thumbnailUrl: string;
  permalink?: string;
  caption?: string;
}

// Business cached metrics share the same shape as influencer stats.
export type BusinessStats = InfluencerStats;

export interface BusinessProfile {
  id: string;
  name: string;
  handle: string;
  bio?: string;
  location: Location;
  hiringStatus: HiringStatus;
  target: { ageMin?: number; ageMax?: number; gender?: string; area?: string };
  pitchText?: string;
  stats: BusinessStats;
  posts: BusinessPost[];
}

export interface Invite {
  token: string;
  role: UserRole;
  email?: string;
  expiresAt: string;
  usedAt?: string;
  revoked: boolean;
}
