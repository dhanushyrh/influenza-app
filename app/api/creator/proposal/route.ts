import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getCreatorIds } from "@/lib/inf-auth";

// Creator sends a proposal to a business: debits 1 credit, inserts a pitch
// (from_role='creator') and ensures a thread exists.
export async function POST(req: NextRequest) {
  const ids = await getCreatorIds();
  if (!ids) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const supabase = adminClient();
  const { businessId, title, message, amount, deliverables } = await req.json();
  if (!businessId) return NextResponse.json({ error: "Missing businessId" }, { status: 400 });

  // Debit 1 credit (best-effort guard)
  const { data: cur } = await supabase.from("creator_credits").select("balance").eq("user_id", ids.appUserId).maybeSingle();
  if ((cur?.balance ?? 0) < 1) return NextResponse.json({ error: "No credits" }, { status: 402 });
  await supabase.from("creator_credits").upsert(
    { user_id: ids.appUserId, balance: Math.max(0, (cur?.balance ?? 0) - 1), updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
  await supabase.from("creator_credit_ledger").insert({
    user_id: ids.appUserId, kind: "spend", label: "Pitch · " + (title ?? "proposal"), amount: -1,
  });

  const { data: pitch } = await supabase.from("pitches").insert({
    business_id: businessId,
    influencer_id: ids.profileId,
    message: message ?? "",
    title: title ?? null,
    deliverables: deliverables ?? [],
    budget: amount ?? null,
    status: "sent",
    from_role: "creator",
    credits_charged: 1,
  }).select("id").maybeSingle();

  // Ensure a thread exists for this pair
  await supabase.from("threads").upsert(
    { business_id: businessId, influencer_id: ids.profileId, pitch_id: pitch?.id ?? null },
    { onConflict: "business_id,influencer_id" },
  );

  return NextResponse.json({ ok: true, pitchId: pitch?.id });
}
