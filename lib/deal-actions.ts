// Shared deal state-machine writes for the creator (/inf) and business (/biz)
// pipeline routes. A stage-0 pitch is promoted to a `deals` row on accept;
// counter/decline/message update the pitch row until then.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { pitchLog } from "./inf-map";
import type { LogEvent } from "./biz-data";

type Supa = ReturnType<typeof import("./supabase").adminClient>;

const FEE_PCT = 10;

function pitchClientId(pitchId: string) {
  return `pitch_${pitchId}`;
}

function asPitchRow(row: any) {
  return {
    ...row,
    id: pitchClientId(row.id),
    _isPitch: true,
    log: pitchLog(row),
  };
}

/** Resolve a deal row from a client id ("pitch_<uuid>" or a deal uuid). */
export async function resolveDeal(supabase: Supa, clientId: string, action?: string): Promise<any | null> {
  if (clientId.startsWith("pitch_")) {
    const pitchId = clientId.slice("pitch_".length);
    const { data: existing } = await supabase.from("deals").select("*").eq("pitch_id", pitchId).maybeSingle();
    if (existing) return existing;

    const { data: pitch } = await supabase.from("pitches").select("*").eq("id", pitchId).maybeSingle();
    if (!pitch) return null;

    // Only promote to a deal row when the pitch is accepted.
    if (action !== "accept") return asPitchRow(pitch);

    const amount = Number(pitch.counter ?? pitch.budget ?? 0);
    const log: LogEvent[] = pitchLog(pitch);
    const { data: deal } = await supabase.from("deals").insert({
      pitch_id: pitch.id,
      business_id: pitch.business_id,
      influencer_id: pitch.influencer_id,
      amount,
      counter: pitch.counter ?? null,
      platform_fee: Math.round((amount * FEE_PCT) / 100),
      status: "accepted",
      title: pitch.title ?? null,
      deliverables: pitch.deliverables ?? [],
      log,
    }).select("*").maybeSingle();
    await supabase.from("pitches").update({ status: "accepted", responded_at: new Date().toISOString() }).eq("id", pitch.id);
    return deal;
  }
  const { data } = await supabase.from("deals").select("*").eq("id", clientId).maybeSingle();
  return data;
}

const ACTION_STATUS: Record<string, string> = {
  accept: "accepted", fund: "funded", submit: "submitted", release: "released",
};

/** Apply one action to a deal row, appending the matching log event. */
export async function applyAction(
  supabase: Supa, deal: any, action: string, payload: number | undefined,
  actor: { role: "creator" | "business"; name: string },
  text?: string, attachment?: unknown,
): Promise<any> {
  // ── Stage-0 pitch (not yet a deal row) ──
  if (deal._isPitch) {
    const pitchId = deal.id.replace(/^pitch_/, "");
    const log: LogEvent[] = Array.isArray(deal.log) ? [...deal.log] : pitchLog(deal);
    const amount = Number(deal.counter ?? deal.budget ?? 0);
    const updates: Record<string, unknown> = { responded_at: new Date().toISOString() };

    switch (action) {
      case "accept": {
        // resolveDeal should have promoted; fallback promote here.
        return resolveDeal(supabase, pitchClientId(pitchId), "accept");
      }
      case "decline":
        updates.status = "declined";
        log.push({ type: "text", by: actor.role, time: "Now", text: text || "Sorry, can't take this one on right now 🙏" });
        break;
      case "counter": {
        if (payload == null || Number.isNaN(payload)) return deal;
        updates.counter = payload;
        log.push({ type: "offer", byName: actor.name.split(" ")[0], amount: payload, prev: amount, time: "Now" });
        break;
      }
      case "message":
        log.push(attachment
          ? { type: "text", by: actor.role, time: "Now", text: text || "", attachment: attachment as any }
          : { type: "text", by: actor.role, time: "Now", text: text || "" });
        break;
      default:
        return deal;
    }

    const { data } = await supabase.from("pitches").update(updates).eq("id", pitchId).select("*").maybeSingle();
    return data ? { ...asPitchRow(data), log } : { ...deal, ...updates, log };
  }

  const log: LogEvent[] = Array.isArray(deal.log) ? [...deal.log] : [];
  const amount = Number(deal.counter ?? deal.amount ?? 0);
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  switch (action) {
    case "accept":
      updates.status = "accepted";
      if (!log.some((e) => e.type === "system" && (e as any).kind === "accepted"))
        log.push({ type: "system", kind: "accepted", amount, time: "Now" });
      break;
    case "decline":
      updates.status = "cancelled";
      log.push({ type: "text", by: actor.role, time: "Now", text: text || "Sorry, can't take this one on right now 🙏" });
      break;
    case "counter": {
      if (payload == null || Number.isNaN(payload)) return deal;
      updates.counter = payload;
      log.push({ type: "offer", byName: actor.name.split(" ")[0], amount: payload, prev: amount, time: "Now" });
      break;
    }
    case "fund":
      updates.status = "funded";
      log.push({ type: "escrow", amount, time: "Now" });
      break;
    case "submit":
      updates.status = "submitted";
      log.push({ type: "submission", by: "creator", time: "Now" });
      break;
    case "release":
      updates.status = "released";
      log.push({ type: "release", amount, time: "Now" });
      break;
    case "review":
      if (typeof payload === "number") updates.review = { rating: payload, text: text ?? "" };
      else if (text) updates.review = { rating: 5, text };
      if (!log.some((e) => e.type === "review"))
        log.push({ type: "review", by: "business", time: "Now" });
      break;
    case "message":
      log.push(attachment
        ? { type: "text", by: actor.role, time: "Now", text: text || "", attachment: attachment as any }
        : { type: "text", by: actor.role, time: "Now", text: text || "" });
      break;
    default:
      return deal;
  }

  updates.log = log;
  const { data } = await supabase.from("deals").update(updates).eq("id", deal.id).select("*").maybeSingle();
  return data ?? { ...deal, ...updates };
}
