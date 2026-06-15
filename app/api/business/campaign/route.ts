import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getBusinessIds } from "@/lib/inf-auth";
import { mapCampaign } from "@/lib/inf-map";

// Create a campaign (business brief). Surfaces in the creator Briefs feed.
export async function POST(req: NextRequest) {
  const ids = await getBusinessIds();
  if (!ids) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const supabase = adminClient();
  const { title, catKey, blurb, deliv, lo, hi, sizes, deadline, status } = await req.json();
  if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 });

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      business_id: ids.businessId,
      title,
      category: catKey ?? null,
      blurb: blurb ?? null,
      deliverables: deliv ?? {},
      budget_lo: lo ?? null,
      budget_hi: hi ?? null,
      sizes: sizes ?? [],
      deadline: deadline ?? null,
      status: status ?? "live",
    })
    .select("*")
    .maybeSingle();

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });
  return NextResponse.json({ ok: true, campaign: mapCampaign(data) });
}

// Update campaign status (e.g. close / reopen).
export async function PATCH(req: NextRequest) {
  const ids = await getBusinessIds();
  if (!ids) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const supabase = adminClient();
  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });

  const { error } = await supabase
    .from("campaigns")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("business_id", ids.businessId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
