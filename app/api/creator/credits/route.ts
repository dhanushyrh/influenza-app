import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getCreatorIds } from "@/lib/inf-auth";
import { REFERRAL_REWARD } from "@/lib/inf-data";

type Supa = ReturnType<typeof adminClient>;

// Adjust the creator's credit balance by delta and append a ledger entry.
async function bumpBalance(
  supabase: Supa, userId: string, delta: number,
  entry: { kind: string; label: string; amount: number; note?: string },
) {
  const { data: cur } = await supabase.from("creator_credits").select("balance").eq("user_id", userId).maybeSingle();
  const next = Math.max(0, (cur?.balance ?? 0) + delta);
  await supabase.from("creator_credits").upsert(
    { user_id: userId, balance: next, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
  await supabase.from("creator_credit_ledger").insert({
    user_id: userId, kind: entry.kind, label: entry.label, amount: entry.amount, note: entry.note ?? null,
  });
  return next;
}

export async function POST(req: NextRequest) {
  const ids = await getCreatorIds();
  if (!ids) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const supabase = adminClient();
  const body = await req.json();
  const { action } = body;

  switch (action) {
    case "buy": {
      const credits = Number(body.credits ?? 0);
      const balance = await bumpBalance(supabase, ids.appUserId, credits, {
        kind: "buy", label: `Bought ${credits} credits`, amount: credits,
      });
      return NextResponse.json({ ok: true, balance });
    }
    case "claim-promo": {
      const total = Number(body.credits ?? 0);
      const bonus = Number(body.bonus ?? 0);
      if (body.promoId) {
        await supabase.from("creator_promos")
          .update({ status: "claimed", credits: total })
          .eq("id", body.promoId).eq("user_id", ids.appUserId);
      }
      const balance = await bumpBalance(supabase, ids.appUserId, total, {
        kind: "promote", label: "Promo reward" + (bonus ? " · overperformed 🎉" : ""), amount: total,
        note: bonus ? "+5 bonus" : undefined,
      });
      return NextResponse.json({ ok: true, balance });
    }
    case "share-promo": {
      const { data } = await supabase.from("creator_promos").insert({
        user_id: ids.appUserId, type: body.type === "Story" ? "Story" : "Feed post",
        status: "pending", reach: 0, credits: 0, hrs_left: 24,
      }).select("id").maybeSingle();
      return NextResponse.json({ ok: true, id: data?.id });
    }
    case "invite-referral": {
      const { data } = await supabase.from("creator_referrals").insert({
        referrer_id: ids.appUserId, status: "invited", earned: 0,
      }).select("id").maybeSingle();
      return NextResponse.json({ ok: true, id: data?.id });
    }
    case "verify-referral": {
      if (body.referralId) {
        await supabase.from("creator_referrals")
          .update({ status: "verified", earned: REFERRAL_REWARD })
          .eq("id", body.referralId).eq("referrer_id", ids.appUserId);
      }
      const balance = await bumpBalance(supabase, ids.appUserId, REFERRAL_REWARD, {
        kind: "referral", label: "Friend joined & verified", amount: REFERRAL_REWARD,
      });
      return NextResponse.json({ ok: true, balance });
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
