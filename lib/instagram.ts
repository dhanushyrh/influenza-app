// Instagram / Meta Graph API service.
// Real OAuth (Business Login for Instagram) helpers below; MockInstagramService
// stays for offline/dev rendering. See docs/04-instagram-integration.md.

// ---- config -----------------------------------------------------------------
export const IG = {
  appId: process.env.META_APP_ID ?? "",
  appSecret: process.env.META_APP_SECRET ?? "",
  redirectUri: process.env.META_REDIRECT_URI ?? "",
  scopes: ["instagram_business_basic", "instagram_business_manage_insights"],
  graphVersion: "v21.0",
};

export const isInstagramConfigured = Boolean(
  IG.appId && IG.appSecret && IG.redirectUri
);

// Step 1 — where we send the user to log in & grant permission.
export function getAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: IG.appId,
    redirect_uri: IG.redirectUri,
    response_type: "code",
    scope: IG.scopes.join(","),
    state,
  });
  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}

// Step 2 — exchange the callback `code` for a short-lived token + user id.
export async function exchangeCodeForToken(
  code: string
): Promise<{ accessToken: string; userId: string }> {
  const body = new URLSearchParams({
    client_id: IG.appId,
    client_secret: IG.appSecret,
    grant_type: "authorization_code",
    redirect_uri: IG.redirectUri,
    code,
  });
  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body,
  });
  if (!res.ok) throw new Error(`IG token exchange failed: ${res.status}`);
  const json = await res.json();
  return { accessToken: json.access_token, userId: String(json.user_id) };
}

// Step 3 — upgrade to a long-lived token (~60 days).
export async function getLongLivedToken(
  shortToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const params = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: IG.appSecret,
    access_token: shortToken,
  });
  const res = await fetch(
    `https://graph.instagram.com/access_token?${params.toString()}`
  );
  if (!res.ok) throw new Error(`IG long-lived exchange failed: ${res.status}`);
  const json = await res.json();
  return { accessToken: json.access_token, expiresIn: json.expires_in };
}

// Profile fields from the IG User node (not insights).
export async function fetchAccount(accessToken: string) {
  const fields =
    "user_id,username,account_type,followers_count,media_count,biography";
  const res = await fetch(
    `https://graph.instagram.com/${IG.graphVersion}/me?fields=${fields}&access_token=${accessToken}`
  );
  if (!res.ok) throw new Error(`IG account fetch failed: ${res.status}`);
  return res.json() as Promise<{
    user_id: string;
    username: string;
    account_type: string;
    followers_count: number;
    media_count: number;
    biography: string;
  }>;
}


export interface IgToken {
  accessToken: string;
  expiresAt: string;
}
export interface IgAccount {
  igUserId: string;
  username: string;
  bio?: string;
  followers: number;
  accountType: "business" | "creator" | "personal";
}
export interface IgInsights {
  reach24h: number;
  impressions24h: number;
  profileViews24h: number;
}
export interface IgMedia {
  mediaId: string;
  thumbnailUrl: string;
  permalink: string;
  likes: number;
  comments: number;
}
export interface IgDemographics {
  ageBuckets: Record<string, number>;
  genderSplit: Record<string, number>;
  topLocations: { city: string; pct: number }[];
}

export interface InstagramService {
  exchangeCodeForToken(code: string): Promise<IgToken>;
  getAccount(userId: string): Promise<IgAccount>;
  getAccountInsights(userId: string): Promise<IgInsights>;
  getRecentMedia(userId: string, limit?: number): Promise<IgMedia[]>;
  getAudienceDemographics(userId: string): Promise<IgDemographics>;
}

// Deterministic mock used until Meta App Review is approved.
export const MockInstagramService: InstagramService = {
  async exchangeCodeForToken() {
    return { accessToken: "mock", expiresAt: "2030-01-01T00:00:00Z" };
  },
  async getAccount() {
    return {
      igUserId: "ig_mock",
      username: "mock.creator",
      bio: "Mock creator account",
      followers: 8200,
      accountType: "creator",
    };
  },
  async getAccountInsights() {
    return { reach24h: 6100, impressions24h: 9300, profileViews24h: 410 };
  },
  async getRecentMedia(_userId, limit = 6) {
    return Array.from({ length: limit }).map((_, i) => ({
      mediaId: `m_${i}`,
      thumbnailUrl: "",
      permalink: "https://instagram.com/p/mock",
      likes: 500 + i * 20,
      comments: 30 + i,
    }));
  },
  async getAudienceDemographics() {
    return {
      ageBuckets: { "18-24": 41.0, "25-34": 38.5, "35-44": 12.1 },
      genderSplit: { female: 59.5, male: 39.0, other: 1.5 },
      topLocations: [{ city: "Bengaluru", pct: 68.4 }],
    };
  },
};
