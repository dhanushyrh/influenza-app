import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getCreatorIds } from "@/lib/inf-auth";

// Persists creator profile edits (bio, availability, rates, etc). Non-fatal:
// mirrors app/api/onboarding/creator/complete/route.ts.
export async function POST(req: NextRequest) {
  const ids = await getCreatorIds();
  if (!ids) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const { displayName, bio, available, cities, categories, avatarUrl, coverUrl, services } = body;
  const supabase = adminClient();

  const updates: Record<string, unknown> = {};
  if (displayName != null) updates.display_name = displayName;
  if (bio != null) updates.bio = bio;
  if (available != null) updates.available = available;
  if (Array.isArray(cities)) updates.coverage_cities = cities;
  if (Array.isArray(categories)) updates.creator_categories = categories;
  if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
  if (coverUrl !== undefined) updates.cover_url = coverUrl;
  if (Object.keys(updates).length) {
    await supabase.from("influencer_profiles").update(updates).eq("id", ids.profileId);
  }

  // Upsert services — resolve code -> service_type_id
  if (Array.isArray(services) && services.length) {
    const { data: types } = await supabase.from("service_types").select("id, code");
    const codeToId = new Map((types ?? []).map((t) => [t.code, t.id]));
    const rows = services
      .filter((s: { code: string }) => codeToId.has(s.code))
      .map((s: { code: string; title?: string; price?: number; negotiable?: boolean }) => ({
        influencer_id: ids.profileId,
        service_type_id: codeToId.get(s.code),
        title: s.title ?? null,
        price: s.price ?? null,
        negotiable: s.negotiable ?? false,
        active: true,
      }));
    if (rows.length) {
      await supabase.from("influencer_services").upsert(rows, { onConflict: "influencer_id,service_type_id" });
    }
  }

  return NextResponse.json({ ok: true });
}
