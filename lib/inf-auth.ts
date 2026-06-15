// Cookie-based identity resolution for the creator (/inf) and business (/biz) apps.
// Mirrors the pattern in app/api/onboarding/creator/complete/route.ts: read the
// httpOnly session cookie, then resolve the profile row via adminClient().
import { cookies } from "next/headers";
import { adminClient, isSupabaseConfigured } from "./supabase";

export interface CreatorIds {
  appUserId: string;
  profileId: string; // influencer_profiles.id
}

export interface BusinessIds {
  appUserId: string;
  businessId: string; // business_profiles.id
}

/** Resolve { appUserId, profileId } from the inf_uid cookie, or null. */
export async function getCreatorIds(): Promise<CreatorIds | null> {
  const appUserId = cookies().get("inf_uid")?.value;
  if (!appUserId || !isSupabaseConfigured) return null;
  const { data } = await adminClient()
    .from("influencer_profiles")
    .select("id")
    .eq("user_id", appUserId)
    .maybeSingle();
  if (!data?.id) return null;
  return { appUserId, profileId: data.id };
}

/** Resolve { appUserId, businessId } from the bus_uid cookie, or null. */
export async function getBusinessIds(): Promise<BusinessIds | null> {
  const appUserId = cookies().get("bus_uid")?.value;
  if (!appUserId || !isSupabaseConfigured) return null;
  const { data } = await adminClient()
    .from("business_profiles")
    .select("id")
    .eq("user_id", appUserId)
    .maybeSingle();
  if (!data?.id) return null;
  return { appUserId, businessId: data.id };
}
