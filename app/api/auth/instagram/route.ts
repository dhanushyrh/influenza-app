import { NextRequest, NextResponse } from "next/server";
import { getAuthorizeUrl, isInstagramConfigured } from "@/lib/instagram";

// Step 1: kick off Business Login for Instagram.
// /api/auth/instagram?role=<creator|business>&token=<invite> → redirects to Instagram consent.
export function GET(req: NextRequest) {
  if (!isInstagramConfigured) {
    return NextResponse.json(
      { error: "Instagram not configured. Set META_APP_ID / META_APP_SECRET / META_REDIRECT_URI." },
      { status: 503 }
    );
  }
  const role        = req.nextUrl.searchParams.get("role") ?? "creator";
  const inviteToken = req.nextUrl.searchParams.get("token") ?? "";
  const state       = encodeURIComponent(JSON.stringify({ t: inviteToken, role }));
  return NextResponse.redirect(getAuthorizeUrl(state));
}
