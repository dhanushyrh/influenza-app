import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { ensureAuthUserAndLink } from "@/lib/auth-persist";
import { cookies } from "next/headers";

const HIRING_MAP: Record<string, string> = {
  open: "actively_looking",
  scouting: "looking_out",
  closed: "not_looking",
};

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const appUserId = cookieStore.get("bus_uid")?.value;
  if (!appUserId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const {
    profileId,
    name,
    email,
    phone,
    category,
    city,
    areas,
    bio,
    creatorSize,
    budget,
    hiring,
    password,
  } = body;

  const supabase = adminClient();

  // Update app_users: email + phone
  const userUpdates: Record<string, string> = {};
  if (email) userUpdates.email = email;
  if (phone) userUpdates.phone = phone;
  if (Object.keys(userUpdates).length) {
    await supabase.from("app_users").update(userUpdates).eq("id", appUserId);
  }

  // Update business_profiles
  if (profileId) {
    const profileUpdates: Record<string, unknown> = {};
    if (name) profileUpdates.name = name;
    if (bio) profileUpdates.bio = bio;
    if (category) profileUpdates.category = category;
    if (Array.isArray(creatorSize)) profileUpdates.target_creator_size = creatorSize;
    if (budget) profileUpdates.target_budget = budget;
    if (hiring && HIRING_MAP[hiring]) profileUpdates.hiring_status = HIRING_MAP[hiring];

    if (Object.keys(profileUpdates).length) {
      await supabase
        .from("business_profiles")
        .update(profileUpdates)
        .eq("id", profileId);
    }
  }

  // Create/link Supabase Auth user for password login (idempotent, non-fatal)
  if (password && email) {
    await ensureAuthUserAndLink(email, password, appUserId);
  }

  return NextResponse.json({ ok: true });
}
