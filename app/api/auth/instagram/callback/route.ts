import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getLongLivedToken, fetchAccount } from "@/lib/instagram";
import { persistInfluencerSignIn, persistBusinessSignIn } from "@/lib/auth-persist";

export async function GET(req: NextRequest) {
  const code     = req.nextUrl.searchParams.get("code");
  const stateRaw = req.nextUrl.searchParams.get("state") ?? "%7B%7D";
  const err      = req.nextUrl.searchParams.get("error");

  if (err)   return NextResponse.redirect(new URL("/?ig_error=denied", req.url));
  if (!code) return NextResponse.redirect(new URL("/?ig_error=missing_code", req.url));

  let inviteToken = "";
  let role = "creator";
  try {
    const parsed = JSON.parse(decodeURIComponent(stateRaw));
    inviteToken  = parsed.t    ?? "";
    role         = parsed.role ?? "creator";
  } catch { /* ignore malformed state */ }

  try {
    const { accessToken: shortToken }    = await exchangeCodeForToken(code);
    const { accessToken: longToken, expiresIn } = await getLongLivedToken(shortToken);
    const account = await fetchAccount(longToken);

    if (account.account_type === "PERSONAL") {
      return NextResponse.redirect(new URL("/?ig_error=needs_professional", req.url));
    }

    if (role === "business") {
      const { appUserId, profileId, displayName, handle } = await persistBusinessSignIn({
        igUserId:       account.user_id,
        username:       account.username,
        accountType:    account.account_type,
        followersCount: account.followers_count,
        mediaCount:     account.media_count,
        biography:      account.biography,
        longToken,
        expiresIn,
      });
      const next = new URL("/business-onboarding", req.url);
      next.searchParams.set("pid",    profileId);
      next.searchParams.set("name",   displayName);
      next.searchParams.set("handle", handle);
      const response = NextResponse.redirect(next);
      response.cookies.set("bus_uid", appUserId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
      return response;
    }

    // creator / influencer
    const { appUserId, profileId, displayName, handle } = await persistInfluencerSignIn(
      { igUserId: account.user_id, username: account.username, accountType: account.account_type, followersCount: account.followers_count, mediaCount: account.media_count, biography: account.biography, longToken, expiresIn },
      inviteToken
    );
    const next = new URL(`/onboarding/${inviteToken || "direct"}`, req.url);
    next.searchParams.set("ig",     "connected");
    next.searchParams.set("pid",    profileId);
    next.searchParams.set("name",   displayName);
    next.searchParams.set("handle", handle);
    const response = NextResponse.redirect(next);
    response.cookies.set("inf_uid", appUserId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
    return response;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "invalid_invite") return NextResponse.redirect(new URL("/?ig_error=invalid_invite", req.url));
    return NextResponse.redirect(new URL("/?ig_error=exchange_failed", req.url));
  }
}
