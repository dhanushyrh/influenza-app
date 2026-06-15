import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getBusinessIds } from "@/lib/inf-auth";

// Business pitches a creator: inserts a pitch (from_role='business') + thread.
// Mirrors the creator proposal route in the opposite direction.
export async function POST(req: NextRequest) {
  const ids = await getBusinessIds();
  if (!ids) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const supabase = adminClient();
  const { influencerId, title, message, amount, deliverables } = await req.json();
  if (!influencerId) return NextResponse.json({ error: "Missing influencerId" }, { status: 400 });

  const { data: pitch } = await supabase.from("pitches").insert({
    business_id: ids.businessId,
    influencer_id: influencerId,
    message: message ?? "",
    title: title ?? null,
    deliverables: deliverables ?? [],
    budget: amount ?? null,
    status: "sent",
    from_role: "business",
  }).select("id").maybeSingle();

  await supabase.from("threads").upsert(
    { business_id: ids.businessId, influencer_id: influencerId, pitch_id: pitch?.id ?? null },
    { onConflict: "business_id,influencer_id" },
  );

  return NextResponse.json({ ok: true, pitchId: pitch?.id });
}
