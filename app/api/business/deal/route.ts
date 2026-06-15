import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getBusinessIds } from "@/lib/inf-auth";
import { resolveDeal, applyAction } from "@/lib/deal-actions";

// Business-side deal actions: accept (pitch->deal), counter, fund, submit?, review, release, message.
export async function POST(req: NextRequest) {
  const ids = await getBusinessIds();
  if (!ids) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const supabase = adminClient();
  const { dealId, action, payload, text, attachment } = await req.json();
  if (!dealId || !action) return NextResponse.json({ error: "Missing dealId/action" }, { status: 400 });

  const deal = await resolveDeal(supabase, dealId);
  if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  if (deal.business_id !== ids.businessId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: prof } = await supabase.from("business_profiles").select("name").eq("id", ids.businessId).maybeSingle();
  const updated = await applyAction(supabase, deal, action, payload, { role: "business", name: prof?.name ?? "Business" }, text, attachment);

  if (action === "message" && text) {
    const { data: thread } = await supabase.from("threads")
      .upsert({ business_id: deal.business_id, influencer_id: deal.influencer_id }, { onConflict: "business_id,influencer_id" })
      .select("id").maybeSingle();
    if (thread?.id) await supabase.from("messages").insert({ thread_id: thread.id, sender_user_id: ids.appUserId, body: text });
  }

  return NextResponse.json({ ok: true, dealId: updated?.id });
}
