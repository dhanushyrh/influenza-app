import { NextRequest, NextResponse } from "next/server";
import { persistInfluencerSignIn, persistBusinessSignIn } from "@/lib/auth-persist";

// Simulates the full Instagram OAuth callback without real Meta credentials.
// Only active in development.
// Usage: /api/auth/instagram/mock?role=<creator|business>&token=<invite-token>

interface MockPersona {
  igUserId: string; username: string; followersCount: number;
  mediaCount: number; biography: string;
}

const CREATOR_PERSONAS: Record<string, MockPersona> = {
  "mock-onboard-deepa": {
    igUserId: "ig_mock_deepa", username: "deepa.bakes", followersCount: 11800, mediaCount: 142,
    biography: "Bengaluru baker & café hopper 🧁 | pastry reviews & hidden gems",
  },
  "mock-onboard-vikram": {
    igUserId: "ig_mock_vikram", username: "vikram.eats", followersCount: 9200, mediaCount: 98,
    biography: "Street food diaries from Bengaluru 🌶️ | cart-to-table",
  },
  "demo-token-123": {
    igUserId: "ig_mock_demo", username: "demo.creator", followersCount: 5000, mediaCount: 60,
    biography: "Demo creator account 🎯",
  },
};

const BUSINESS_PERSONAS: MockPersona[] = [
  {
    igUserId: "ig_mock_biz_1", username: "thirdwave.ind", followersCount: 14200, mediaCount: 310,
    biography: "Specialty coffee ☕ small-batch roasts · community space",
  },
  {
    igUserId: "ig_mock_biz_2", username: "koramangala.bites", followersCount: 8400, mediaCount: 180,
    biography: "Multi-cuisine restaurant · Koramangala · Bengaluru 🍽️",
  },
];

const DEFAULT_CREATOR  = CREATOR_PERSONAS["mock-onboard-deepa"];
const DEFAULT_BUSINESS = BUSINESS_PERSONAS[0];

export async function GET(req: NextRequest) {
  // Disabled in production unless explicitly opted in (demo deploys without Meta
  // OAuth credentials). Set ALLOW_MOCK_AUTH=true on the host to enable.
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_MOCK_AUTH !== "true") {
    return NextResponse.json({ error: "not available in production" }, { status: 404 });
  }

  const token = req.nextUrl.searchParams.get("token") ?? "";
  const role  = req.nextUrl.searchParams.get("role")  ?? "creator";

  try {
    if (role === "business") {
      const persona = DEFAULT_BUSINESS;
      const { appUserId, profileId, displayName, handle } = await persistBusinessSignIn({
        igUserId:       persona.igUserId,
        username:       persona.username,
        accountType:    "BUSINESS",
        followersCount: persona.followersCount,
        mediaCount:     persona.mediaCount,
        biography:      persona.biography,
        longToken:      `mock_token_${persona.igUserId}_${Date.now()}`,
        expiresIn:      60 * 60 * 24 * 60,
      });
      const next = new URL("/business-onboarding", req.url);
      next.searchParams.set("pid",    profileId);
      next.searchParams.set("name",   displayName);
      next.searchParams.set("handle", handle);
      const response = NextResponse.redirect(next);
      response.cookies.set("bus_uid", appUserId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
      return response;
    }

    // creator
    const persona = CREATOR_PERSONAS[token] ?? DEFAULT_CREATOR;
    const { appUserId, profileId, displayName, handle } = await persistInfluencerSignIn(
      {
        igUserId:       persona.igUserId,
        username:       persona.username,
        accountType:    "CREATOR",
        followersCount: persona.followersCount,
        mediaCount:     persona.mediaCount,
        biography:      persona.biography,
        longToken:      `mock_token_${persona.igUserId}_${Date.now()}`,
        expiresIn:      60 * 60 * 24 * 60,
      },
      token
    );
    const next = new URL(`/onboarding/${token || "direct"}`, req.url);
    next.searchParams.set("ig",     "connected");
    next.searchParams.set("pid",    profileId);
    next.searchParams.set("name",   displayName);
    next.searchParams.set("handle", handle);
    const response = NextResponse.redirect(next);
    response.cookies.set("inf_uid", appUserId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
    return response;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[mock auth] error:", msg);
    if (msg === "invalid_invite") return NextResponse.redirect(new URL("/?ig_error=invalid_invite", req.url));
    const dest = new URL("/?ig_error=mock_failed", req.url);
    dest.searchParams.set("detail", msg);
    return NextResponse.redirect(dest);
  }
}
