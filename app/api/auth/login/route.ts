import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { adminClient, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const password: string | undefined = body.password;
  // Username login (= IG handle). Accept `email` too for backwards-compat.
  const rawUsername: string | undefined = body.username;
  const username = rawUsername ? rawUsername.trim().replace(/^@/, "").toLowerCase() : undefined;
  if ((!username && !body.email) || !password)
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });

  const supabase = adminClient();

  // Resolve the login email: from username lookup, or the email field directly.
  let email: string | undefined = body.email;
  if (username) {
    const { data: byName } = await supabase
      .from("app_users")
      .select("email")
      .eq("username", username)
      .maybeSingle();
    if (!byName?.email)
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    email = byName.email;
  }

  const anon = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error } = await anon.auth.signInWithPassword({ email: email!, password });
  if (error || !authData?.user)
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });

  const { data: appUser } = await supabase
    .from("app_users")
    .select("id, role")
    .eq("auth_user_id", authData.user.id)
    .maybeSingle();

  if (!appUser)
    return NextResponse.json({ error: "Account not found" }, { status: 404 });

  let verified = false;
  let profileId = "";

  if (appUser.role === "influencer") {
    const { data: p } = await supabase
      .from("influencer_profiles")
      .select("id, published")
      .eq("user_id", appUser.id)
      .maybeSingle();
    verified = (p as { published: boolean } | null)?.published ?? false;
    profileId = (p as { id: string } | null)?.id ?? "";
  } else {
    const { data: p } = await supabase
      .from("business_profiles")
      .select("id, approved")
      .eq("user_id", appUser.id)
      .maybeSingle();
    verified = (p as { approved: boolean } | null)?.approved ?? false;
    profileId = (p as { id: string } | null)?.id ?? "";
  }

  const cookieName = appUser.role === "business" ? "bus_uid" : "inf_uid";
  const res = NextResponse.json({ ok: true, role: appUser.role, verified, profileId });
  res.cookies.set(cookieName, appUser.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
