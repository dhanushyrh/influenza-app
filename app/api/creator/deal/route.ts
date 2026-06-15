import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getCreatorIds } from "@/lib/inf-auth";
import { resolveDeal, applyAction } from "@/lib/deal-actions";

// Creator-side deal actions: accept, decline, counter, submit, message.
export async function POST(req: NextRequest) {
  const ids = await getCreatorIds();
  if (!ids) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const supabase = adminClient();
  const { dealId, action, payload, text, attachment } = await req.json();
  if (!dealId || !action) return NextResponse.json({ error: "Missing dealId/action" }, { status: 400 });

  const deal = await resolveDeal(supabase, dealId);
  if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  if (deal.influencer_id !== ids.profileId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: prof } = await supabase.from("influencer_profiles").select("display_name").eq("id", ids.profileId).maybeSingle();
  const updated = await applyAction(supabase, deal, action, payload, { role: "creator", name: prof?.display_name ?? "Creator" }, text, attachment);

  if (action === "message" && text) {
    const { data: thread } = await supabase.from("threads")
      .upsert({ business_id: deal.business_id, influencer_id: deal.influencer_id }, { onConflict: "business_id,influencer_id" })
      .select("id").maybeSingle();
    if (thread?.id) await supabase.from("messages").insert({ thread_id: thread.id, sender_user_id: ids.appUserId, body: text });
  }

  return NextResponse.json({ ok: true, dealId: updated?.id });
}
