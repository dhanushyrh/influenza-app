// Data-access layer. Reads from Supabase when configured and a row is found,
// otherwise falls back to mock data so the skeleton always renders.
// Pages import only from here — they never see raw Supabase rows.

import { serverClient, adminClient, isSupabaseConfigured } from "./supabase";
import {
  BusinessProfile,
  InfluencerPost,
  InfluencerProfile,
  InfluencerService,
  Invite,
  ServiceCode,
  ServicePackage,
} from "./types";
import {
  MOCK_BUSINESS,
  MOCK_INFLUENCERS,
  getInfluencer as mockInfluencer,
  getInvite as mockInvite,
} from "./mock-data";
import {
  MY_CREATOR, INF_DEALS, OPPS, SEED_CREDIT_LEDGER, SEED_REFERRALS, SEED_PROMOS, START_CREDITS,
  type MyCreator, type Opp, type CreditLedgerEntry, type Referral, type Promo,
} from "./inf-data";
import { CREATORS, MY_CAMPAIGNS, type Creator, type Deal, type DealRuntime, type Campaign } from "./biz-data";
import {
  mapMyCreator, mapOpp, mapPitch, mapDeal, mapLedger, mapReferral, mapPromo,
  mapCampaign, campaignToOpp,
} from "./inf-map";

export interface CreatorCredits {
  balance: number;
  ledger: CreditLedgerEntry[];
  referrals: Referral[];
  promos: Promo[];
}
export interface DealBundle {
  deals: Deal[];
  states: Record<string, DealRuntime>;
}

const MY_CREATOR_SELECT = `
  id, display_name, handle, bio, avatar_url, cover_url, available, created_at,
  coverage_cities, creator_categories,
  locations ( city ),
  influencer_stats ( * ),
  audience_demographics ( age_buckets, gender_split ),
  influencer_services ( id, title, price, negotiable, active, service_types ( code, name ) ),
  service_packages ( id, name, description, price ),
  influencer_posts ( thumbnail_url, caption, likes, comments, posted_at, position )
`;

const DEAL_PARTY_SELECT = `
  business_profiles ( id, name, handle, category, target_area, bio, pitch_text, locations ( city ) ),
  influencer_profiles ( id, display_name, handle, influencer_stats ( followers, engagement_rate ) )
`;

const INFLUENCER_SELECT = `
  id, display_name, handle, bio, published, avatar_url,
  locations ( city, geo_lat, geo_lng ),
  influencer_stats ( * ),
  audience_demographics ( age_buckets, gender_split, top_locations ),
  influencer_niches ( niches ( id, category, subtopic ) ),
  influencer_services ( id, title, price, currency, negotiable, service_types ( code, name ) ),
  service_packages ( id, name, description, price, currency, negotiable ),
  influencer_posts ( id, thumbnail_url, permalink, caption, likes, comments, posted_at, position )
`;

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapInfluencer(row: any): InfluencerProfile {
  const stats = row.influencer_stats ?? {};
  const demo = row.audience_demographics ?? {};
  return {
    id: row.id,
    displayName: row.display_name,
    handle: row.handle,
    bio: row.bio ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    location: {
      id: 0,
      city: row.locations?.city ?? "",
      geoLat: row.locations?.geo_lat ?? undefined,
      geoLng: row.locations?.geo_lng ?? undefined,
    },
    niches: (row.influencer_niches ?? []).map((n: any) => ({
      id: n.niches?.id,
      category: n.niches?.category,
      subtopic: n.niches?.subtopic ?? undefined,
    })),
    services: (row.influencer_services ?? []).map(
      (s: any): InfluencerService => ({
        id: s.id,
        code: (s.service_types?.code ?? "post") as ServiceCode,
        title: s.title ?? s.service_types?.name ?? "",
        price: s.price ?? undefined,
        currency: s.currency ?? "INR",
        negotiable: !!s.negotiable,
      })
    ),
    packages: (row.service_packages ?? []).map(
      (p: any): ServicePackage => ({
        id: p.id,
        name: p.name,
        description: p.description ?? undefined,
        price: p.price ?? undefined,
        currency: p.currency ?? "INR",
        negotiable: !!p.negotiable,
        items: [],
      })
    ),
    published: !!row.published,
    posts: ((row.influencer_posts ?? []) as any[])
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((p): InfluencerPost => ({
        id: p.id,
        thumbnailUrl: p.thumbnail_url ?? "",
        permalink: p.permalink ?? undefined,
        caption: p.caption ?? undefined,
        likes: p.likes ?? 0,
        comments: p.comments ?? 0,
        postedAt: p.posted_at ?? undefined,
        position: p.position ?? 0,
      })),
    stats: {
      followers: stats.followers ?? 0,
      avgViews: stats.avg_views ?? 0,
      avgLikes: stats.avg_likes ?? 0,
      avgComments: stats.avg_comments ?? 0,
      reach24h: stats.reach_24h ?? 0,
      impressions24h: stats.impressions_24h ?? 0,
      profileViews24h: stats.profile_views_24h ?? 0,
      postsSampled: stats.posts_sampled ?? 0,
      engagementRate: Number(stats.engagement_rate ?? 0),
      computedAt: stats.computed_at ?? new Date().toISOString(),
    },
    demographics: {
      ageBuckets: demo.age_buckets ?? {},
      genderSplit: demo.gender_split ?? {},
      topLocations: demo.top_locations ?? [],
    },
  };
}

export async function getDeck(): Promise<InfluencerProfile[]> {
  if (!isSupabaseConfigured) return MOCK_INFLUENCERS;
  try {
    const { data, error } = await serverClient()
      .from("influencer_profiles")
      .select(INFLUENCER_SELECT)
      .eq("published", true)
      .limit(20);
    if (error || !data || data.length === 0) return MOCK_INFLUENCERS;
    return data.map(mapInfluencer);
  } catch {
    return MOCK_INFLUENCERS;
  }
}

export async function getInfluencerById(id: string): Promise<InfluencerProfile | undefined> {
  if (!isSupabaseConfigured) return mockInfluencer(id);
  try {
    // Use adminClient so the Lookbook URL works for any profile ID regardless
    // of published status. Discovery (swipe deck) still filters by published=true.
    const { data, error } = await adminClient()
      .from("influencer_profiles")
      .select(INFLUENCER_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return mockInfluencer(id);
    return mapInfluencer(data);
  } catch {
    return mockInfluencer(id);
  }
}

export async function getBusinessById(_id: string): Promise<BusinessProfile> {
  // Mock-only for now; live mapping mirrors the influencer pattern in Phase 2.
  return MOCK_BUSINESS;
}

// ── Creator app (/inf) queries ──────────────────────────────────

export async function getMyCreator(profileId: string): Promise<MyCreator> {
  if (!isSupabaseConfigured) return MY_CREATOR;
  try {
    const supabase = adminClient();
    const { data, error } = await supabase
      .from("influencer_profiles")
      .select(MY_CREATOR_SELECT)
      .eq("id", profileId)
      .maybeSingle();
    if (error || !data) return MY_CREATOR;

    // earnings/completed from released deals
    const { data: done } = await supabase
      .from("deals")
      .select("amount, status, business_id")
      .eq("influencer_id", profileId)
      .in("status", ["released", "completed"]);
    const totalEarned = (done ?? []).reduce((s, d) => s + Number(d.amount ?? 0), 0);
    const completed = (done ?? []).length;
    const distinctBiz = new Set((done ?? []).map((d) => d.business_id)).size;
    const repeatRate = completed > 0 ? Math.round(((completed - distinctBiz) / completed) * 100) : 0;

    return mapMyCreator(data, { totalEarned, completed, repeatRate });
  } catch {
    return MY_CREATOR;
  }
}

export async function getBriefs(_profileId: string): Promise<Opp[]> {
  if (!isSupabaseConfigured) return OPPS;
  try {
    const supabase = adminClient();

    // Prefer live campaigns from approved businesses — these are the real briefs.
    const { data: camps } = await supabase
      .from("campaigns")
      .select(`
        id, title, category, blurb, deliverables, budget_lo, budget_hi, status,
        business_profiles!inner (
          id, name, handle, bio, category, target_area, hiring_status, approved,
          locations ( city ),
          business_stats ( followers )
        )
      `)
      .eq("status", "live")
      .eq("business_profiles.approved", true)
      .order("created_at", { ascending: false })
      .limit(30);
    if (camps && camps.length > 0) return camps.map(campaignToOpp);

    // Fallback: derive a brief per approved business (legacy behaviour).
    const { data, error } = await supabase
      .from("business_profiles")
      .select(`
        id, name, handle, bio, category, target_area, target_budget,
        target_creator_size, hiring_status, pitch_text,
        locations ( city ),
        business_stats ( followers ),
        business_posts ( position )
      `)
      .eq("approved", true)
      .limit(30);
    if (error || !data || data.length === 0) return OPPS;
    return data.map(mapOpp);
  } catch {
    return OPPS;
  }
}

export async function getBusinessCampaigns(businessId: string): Promise<Campaign[]> {
  if (!isSupabaseConfigured) return MY_CAMPAIGNS;
  try {
    const { data, error } = await adminClient()
      .from("campaigns")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });
    if (error || !data) return MY_CAMPAIGNS;
    return data.map(mapCampaign);
  } catch {
    return MY_CAMPAIGNS;
  }
}

export async function getCreatorCredits(appUserId: string): Promise<CreatorCredits> {
  const fallback: CreatorCredits = {
    balance: START_CREDITS, ledger: SEED_CREDIT_LEDGER, referrals: SEED_REFERRALS, promos: SEED_PROMOS,
  };
  if (!isSupabaseConfigured) return fallback;
  try {
    const supabase = adminClient();
    const [credits, ledger, referrals, promos] = await Promise.all([
      supabase.from("creator_credits").select("balance").eq("user_id", appUserId).maybeSingle(),
      supabase.from("creator_credit_ledger").select("*").eq("user_id", appUserId).order("created_at", { ascending: false }),
      supabase.from("creator_referrals").select("*").eq("referrer_id", appUserId).order("created_at", { ascending: false }),
      supabase.from("creator_promos").select("*").eq("user_id", appUserId).order("created_at", { ascending: false }),
    ]);
    return {
      balance: credits.data?.balance ?? START_CREDITS,
      ledger: (ledger.data ?? []).map(mapLedger),
      referrals: (referrals.data ?? []).map(mapReferral),
      promos: (promos.data ?? []).map(mapPromo),
    };
  } catch {
    return fallback;
  }
}

async function buildDealBundle(field: "influencer_id" | "business_id", id: string): Promise<DealBundle> {
  const supabase = adminClient();
  const [pitches, deals] = await Promise.all([
    supabase.from("pitches").select(`*, ${DEAL_PARTY_SELECT}`).eq(field, id).eq("status", "sent").order("created_at", { ascending: false }),
    supabase.from("deals").select(`*, ${DEAL_PARTY_SELECT}`).eq(field, id).order("created_at", { ascending: false }),
  ]);
  const bundle: DealBundle = { deals: [], states: {} };
  for (const row of deals.data ?? []) {
    const { deal, runtime } = mapDeal(row);
    bundle.deals.push(deal);
    bundle.states[deal.id] = runtime;
  }
  for (const row of pitches.data ?? []) {
    const { deal, runtime } = mapPitch(row);
    bundle.deals.push(deal);
    bundle.states[deal.id] = runtime;
  }
  return bundle;
}

export async function getCreatorDeals(profileId: string): Promise<DealBundle> {
  if (!isSupabaseConfigured) return seedBundle();
  try {
    const bundle = await buildDealBundle("influencer_id", profileId);
    return bundle.deals.length ? bundle : seedBundle();
  } catch {
    return seedBundle();
  }
}

// Real published creators for the business Discover/Search (MyCreator extends Creator).
export async function getCreatorDeck(): Promise<Creator[]> {
  if (!isSupabaseConfigured) return CREATORS;
  try {
    const { data, error } = await adminClient()
      .from("influencer_profiles")
      .select(MY_CREATOR_SELECT)
      .eq("published", true)
      .limit(20);
    if (error || !data || data.length === 0) return CREATORS;
    return data.map((row) => mapMyCreator(row));
  } catch {
    return CREATORS;
  }
}

export async function getBusinessDeals(businessId: string): Promise<DealBundle> {
  if (!isSupabaseConfigured) return { deals: [], states: {} };
  try {
    return await buildDealBundle("business_id", businessId);
  } catch {
    return { deals: [], states: {} };
  }
}

function seedBundle(): DealBundle {
  const states: Record<string, DealRuntime> = {};
  for (const d of INF_DEALS) {
    states[d.id] = {
      stage: d.stage, amount: d.counter ?? d.offer, log: d.log.map((e) => ({ ...e })),
      pendingCounter: false, declined: false, reviewed: d.log.some((e) => e.type === "review"),
    };
  }
  return { deals: INF_DEALS, states };
}

export async function getInviteByToken(token: string): Promise<Invite | undefined> {
  if (isSupabaseConfigured) {
    try {
      const { data } = await adminClient()
        .from("invites")
        .select("token, role, email, expires_at, used_at, revoked")
        .eq("token", token)
        .maybeSingle();
      if (data) {
        return {
          token: data.token,
          role: data.role as Invite["role"],
          email: data.email ?? undefined,
          expiresAt: data.expires_at,
          usedAt: data.used_at ?? undefined,
          revoked: data.revoked,
        };
      }
    } catch {
      /* fall through to mock */
    }
  }
  return mockInvite(token);
}
