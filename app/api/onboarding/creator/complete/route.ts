import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { ensureAuthUserAndLink } from "@/lib/auth-persist";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const appUserId = cookieStore.get("inf_uid")?.value;
  if (!appUserId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const {
    profileId,
    name,
    email,
    phone,
    cities,
    video,
    categories,
    services,
    packages,
    password,
  } = body;

  // Support both array-of-slugs (new) and legacy single category string
  const category: string | undefined = Array.isArray(categories) ? categories[0] : body.category;
  const subs: string[] = Array.isArray(categories) ? categories.slice(1) : (Array.isArray(body.subs) ? body.subs : []);

  const supabase = adminClient();

  // Update app_users: email + phone
  const userUpdates: Record<string, string> = {};
  if (email) userUpdates.email = email;
  if (phone) userUpdates.phone = phone;
  if (Object.keys(userUpdates).length) {
    await supabase.from("app_users").update(userUpdates).eq("id", appUserId);
  }

  // Update influencer_profiles
  if (profileId) {
    const profileUpdates: Record<string, unknown> = {};
    if (name) profileUpdates.display_name = name;
    if (video) profileUpdates.video_pitch_url = video;
    if (Array.isArray(cities) && cities.length > 0) profileUpdates.coverage_cities = cities;
    if (Array.isArray(categories) && categories.length > 0) profileUpdates.creator_categories = categories;

    if (Object.keys(profileUpdates).length) {
      await supabase
        .from("influencer_profiles")
        .update(profileUpdates)
        .eq("id", profileId);
    }

    // Upsert services
    if (Array.isArray(services) && services.length > 0) {
      const serviceRows = services.map(
        (s: { typeId: number; price: number; negotiable: boolean }) => ({
          influencer_id: profileId,
          service_type_id: s.typeId,
          price: s.price,
          negotiable: s.negotiable ?? false,
          active: true,
        })
      );
      await supabase
        .from("influencer_services")
        .upsert(serviceRows, { onConflict: "influencer_id,service_type_id" });
    }

    // Insert packages (delete old ones first to keep it simple)
    if (Array.isArray(packages) && packages.length > 0) {
      await supabase
        .from("service_packages")
        .delete()
        .eq("influencer_id", profileId);
      const pkgRows = packages.map(
        (p: { name: string; price: number; negotiable: boolean }) => ({
          influencer_id: profileId,
          name: p.name,
          price: p.price,
          negotiable: p.negotiable ?? false,
          active: true,
        })
      );
      await supabase.from("service_packages").insert(pkgRows);
    }

    // Upsert niches — resolve category + subs to niche rows
    if (category) {
      const nicheCodes = [category, ...(Array.isArray(subs) ? subs : [])];
      const { data: nicheRows } = await supabase
        .from("niches")
        .select("id, category, subtopic")
        .in("category", [category]);

      if (nicheRows) {
        // delete old niches then insert
        await supabase
          .from("influencer_niches")
          .delete()
          .eq("influencer_id", profileId);

        const topLevel = nicheRows.find((n) => !n.subtopic);
        const subNiches = nicheRows.filter((n) =>
          nicheCodes.includes(n.subtopic ?? "")
        );
        const toInsert = [topLevel, ...subNiches]
          .filter(Boolean)
          .map((n) => ({ influencer_id: profileId, niche_id: n!.id }));
        if (toInsert.length) {
          await supabase.from("influencer_niches").insert(toInsert);
        }
      }
    }
  }

  // Create/link Supabase Auth user for password login (idempotent, non-fatal)
  if (password && email) {
    await ensureAuthUserAndLink(email, password, appUserId);
  }

  return NextResponse.json({ ok: true });
}
