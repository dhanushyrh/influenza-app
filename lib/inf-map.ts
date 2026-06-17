// Mappers: normalized Supabase rows -> the presentation-heavy mock types the
// /inf and /biz components render. Presentation-only fields with no DB column
// (gradients, emoji, relative-time strings) are derived deterministically so the
// UI is identical whether data comes from the DB or the mock seeds.
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type Creator, type CreatorService, type Work,
  type Deal, type DealRuntime, type Deliverable, type LogEvent,
  type BizParty, type CreatorParty, type Campaign,
} from "./biz-data";
import { type MyCreator, type Opp, type CreditLedgerEntry, type Referral, type Promo } from "./inf-data";

// ── deterministic presentation helpers ──────────────────────────
const GRADIENTS: { from: string; to: string }[] = [
  { from: "#ffd1c4", to: "#ff8f74" }, { from: "#ffe4cc", to: "#ffb27a" },
  { from: "#ffd9e8", to: "#ff9ec2" }, { from: "#e6f0d8", to: "#a7c47a" },
  { from: "#dCeccb", to: "#9cc079" }, { from: "#e9d6ff", to: "#b48af0" },
  { from: "#cfe0ea", to: "#7fa8c0" }, { from: "#f3dcb8", to: "#d9a55f" },
  { from: "#ffd6e6", to: "#f59ec0" }, { from: "#d8c3a5", to: "#a9805a" },
];
const EMOJIS = ["🍜", "☕", "🎂", "🍵", "🥗", "🍸", "🥐", "🧋", "🍰", "🌮", "🍹", "🍩"];

function hashIdx(seed: string, len: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % len;
}
export function gradientFor(id: string) { return GRADIENTS[hashIdx(id || "x", GRADIENTS.length)]; }
export function emojiFor(id: string) { return EMOJIS[hashIdx(id || "x", EMOJIS.length)]; }

/** ISO timestamp -> short relative label ("Just now", "2h ago", "Jun 1"). */
export function relTime(iso?: string | null): string {
  if (!iso) return "Now";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "Now";
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  return new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function monthYear(iso?: string | null): string {
  if (!iso) return "Mar 2026";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Mar 2026";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ── stats / demographics ────────────────────────────────────────
const AGE_KEYS = ["13–17", "18–24", "25–34", "35–44", "45+"] as const;
function mapAge(buckets: Record<string, any> = {}): { age: Record<string, number>; dom: string } {
  const age: Record<string, number> = {};
  let dom = "18–24", best = -1;
  for (const k of AGE_KEYS) {
    // tolerate "13-17" (DB) vs "13–17" (UI) key shapes
    const v = Number(buckets[k] ?? buckets[k.replace("–", "-")] ?? 0);
    age[k] = Math.round(v);
    if (v > best) { best = v; dom = k; }
  }
  return { age, dom };
}

// ── MyCreator (logged-in creator profile) ───────────────────────
export function mapMyCreator(
  row: any,
  extra?: { totalEarned?: number; completed?: number; repeatRate?: number },
): MyCreator {
  const id = row.id;
  const g = gradientFor(id);
  const stats = row.influencer_stats ?? {};
  const demo = row.audience_demographics ?? {};
  const { age, dom } = mapAge(demo.age_buckets ?? {});
  const gender = demo.gender_split ?? {};
  const cities: string[] = Array.isArray(row.coverage_cities) ? row.coverage_cities : [];
  const cats: string[] = Array.isArray(row.creator_categories) ? row.creator_categories : [];

  const services: CreatorService[] = (row.influencer_services ?? [])
    .filter((s: any) => s.active !== false)
    .map((s: any): CreatorService => ({
      code: s.service_types?.code ?? "post",
      label: s.title ?? s.service_types?.name ?? "Service",
      price: Number(s.price ?? 0),
      negotiable: !!s.negotiable,
    }));
  const rateFrom = services.length ? Math.min(...services.map((s) => s.price || Infinity)) : 0;

  const pkgRow = (row.service_packages ?? [])[0];
  const pkg = pkgRow
    ? { name: pkgRow.name, items: pkgRow.description ?? "", price: Number(pkgRow.price ?? 0) }
    : { name: "", items: "", price: 0 };

  const works: Work[] = (row.influencer_posts ?? [])
    .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
    .map((p: any, i: number): Work => {
      const pg = gradientFor(id + ":" + (p.position ?? i));
      return {
        emoji: emojiFor(id + ":" + (p.position ?? i)),
        from: pg.from, to: pg.to,
        kind: i % 2 === 0 ? "Reel" : "Post",
        views: Number(p.likes ?? 0) * 8,
        likes: Number(p.likes ?? 0),
        caption: p.caption ?? "",
        image: p.thumbnail_url ?? undefined,
      };
    });

  return {
    id,
    name: row.display_name ?? "Creator",
    handle: row.handle ?? "",
    emoji: emojiFor(id),
    from: g.from, to: g.to,
    verified: !!row.published,
    available: row.available ?? true,
    category: cats[0] ?? "food_drink",
    cats,
    area: cities[0] ?? row.locations?.city ?? "Bengaluru",
    dist: 0,
    followers: stats.followers ?? 0,
    avgViews: stats.avg_views ?? 0,
    avgLikes: stats.avg_likes ?? 0,
    avgComments: stats.avg_comments ?? 0,
    eng: Number(stats.engagement_rate ?? 0),
    ageDom: dom,
    age,
    gender: { f: Math.round(Number(gender.female ?? 0)), m: Math.round(Number(gender.male ?? 0)) },
    rating: 5.0,
    reviews: extra?.completed ?? 0,
    rateFrom,
    services,
    pkg,
    bio: row.bio ?? "",
    works,
    // MyCreator extensions
    joined: monthYear(row.created_at),
    city: cities[0] ?? row.locations?.city ?? "Bengaluru",
    cities,
    completed: extra?.completed ?? 0,
    repeatRate: extra?.repeatRate ?? 0,
    responseHrs: 2,
    payout: { method: "UPI", handle: "" },
    totalEarned: extra?.totalEarned ?? 0,
    photoUrl: row.avatar_url ?? null,
    coverUrl: row.cover_url ?? null,
  };
}

// ── BizParty / CreatorParty from joined rows ────────────────────
export function bizPartyFromRow(b: any): BizParty {
  const id = b?.id ?? "biz";
  const g = gradientFor(id);
  const name = b?.name ?? "Business";
  return {
    name,
    short: name.split(" ")[0],
    handle: b?.handle ?? "",
    emoji: emojiFor(id),
    from: g.from, to: g.to,
    area: b?.target_area ?? b?.locations?.city ?? "Bengaluru",
  };
}
export function creatorPartyFromRow(p: any): CreatorParty {
  const id = p?.id ?? "inf";
  const g = gradientFor(id);
  const stats = p?.influencer_stats ?? {};
  return {
    name: p?.display_name ?? "Creator",
    handle: p?.handle ?? "",
    emoji: emojiFor(id),
    from: g.from, to: g.to,
    followers: stats.followers ?? 0,
    eng: Number(stats.engagement_rate ?? 0),
  };
}

// ── Opp (brief) from an approved business ───────────────────────
export function mapOpp(b: any): Opp {
  const stats = b.business_stats ?? {};
  const party = bizPartyFromRow(b);
  const posts: string[] = (b.business_posts ?? [])
    .sort((a: any, c: any) => (a.position ?? 0) - (c.position ?? 0))
    .map((_: any, i: number) => emojiFor((b.id ?? "biz") + ":" + i));
  while (posts.length < 6) posts.push(emojiFor((b.id ?? "biz") + ":" + posts.length));
  const cats: string[] = Array.isArray(b.target_creator_size) ? [] : [];
  const hiring = b.hiring_status === "actively_looking" ? "open" : b.hiring_status === "not_looking" ? "closed" : "scouting";
  const budget = b.target_budget === "big" ? { lo: 25000, hi: 40000 } : b.target_budget === "mid" ? { lo: 8000, hi: 25000 } : { lo: 2000, hi: 8000 };
  return {
    key: b.id,
    biz: party,
    category: b.category ?? "food_drink",
    cats: b.category ? [b.category] : [],
    dist: 0,
    followers: stats.followers ?? 0,
    hiring: hiring as Opp["hiring"],
    brief: {
      title: b.pitch_text ? b.pitch_text.split("\n")[0].slice(0, 60) : `${party.short} collaboration`,
      deliv: [{ label: "Reel", qty: 1, emoji: "🎬" }, { label: "Story", qty: 3, emoji: "✨" }],
      budgetLo: budget.lo, budgetHi: budget.hi,
      blurb: b.bio ?? b.pitch_text ?? "Looking to collaborate with creators in your area.",
    },
    posts: posts.slice(0, 6),
  };
}

// ── Campaign mapping ────────────────────────────────────────────
export function mapCampaign(row: any): Campaign {
  const d = row.deliverables ?? {};
  return {
    id: row.id,
    title: row.title ?? "Untitled campaign",
    catKey: row.category ?? "cafe",
    status: (row.status ?? "live") as Campaign["status"],
    pitches: row.pitches ?? 0,
    newPitches: row.new_pitches ?? 0,
    lo: row.budget_lo ?? 0,
    hi: row.budget_hi ?? 0,
    deliv: { reel: Number(d.reel ?? 0), post: Number(d.post ?? 0), story: Number(d.story ?? 0) },
    blurb: row.blurb ?? "",
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    deadline: row.deadline ?? "Flexible",
  };
}

/** A live campaign row (joined to business_profiles + business_stats) -> creator Opp. */
export function campaignToOpp(row: any): Opp {
  const b = row.business_profiles ?? {};
  const stats = b.business_stats ?? {};
  const party = bizPartyFromRow(b);
  const d = row.deliverables ?? {};
  const deliv: Deliverable[] = [
    d.reel ? { label: "Reel", qty: Number(d.reel), emoji: "🎬" } : null,
    d.post ? { label: "Feed post", qty: Number(d.post), emoji: "📷" } : null,
    d.story ? { label: "Story", qty: Number(d.story), emoji: "✨" } : null,
  ].filter(Boolean) as Deliverable[];
  const posts: string[] = [];
  while (posts.length < 6) posts.push(emojiFor((row.id ?? "cmp") + ":" + posts.length));
  const hiring = b.hiring_status === "actively_looking" ? "open" : b.hiring_status === "not_looking" ? "closed" : "scouting";
  return {
    key: row.id,
    biz: party,
    category: row.category ?? b.category ?? "food_drink",
    cats: [row.category ?? b.category ?? "food_drink"].filter(Boolean),
    dist: 0,
    followers: stats.followers ?? 0,
    hiring: hiring as Opp["hiring"],
    brief: {
      title: row.title ?? `${party.short} collaboration`,
      deliv: deliv.length ? deliv : [{ label: "Reel", qty: 1, emoji: "🎬" }],
      budgetLo: row.budget_lo ?? 0,
      budgetHi: row.budget_hi ?? 0,
      blurb: row.blurb || b.bio || "Looking to collaborate with creators in your area.",
    },
    posts,
  };
}

// ── Deal mapping (pitch row or deal row -> Deal + DealRuntime) ───
const STATUS_TO_STAGE: Record<string, number> = {
  draft: 0, accepted: 1, funded: 2, in_progress: 2, submitted: 3,
  verified: 3, released: 4, completed: 4, disputed: 3, refunded: 4, cancelled: 0,
};

export function pitchLog(row: any): LogEvent[] {
  const by = row.from_role === "creator" ? "creator" : "business";
  const log: LogEvent[] = [
    { type: "date", label: relTime(row.created_at) },
    { type: "text", by, time: relTime(row.created_at), text: row.message ?? "" },
  ];
  const budget = Number(row.budget ?? 0);
  const counter = row.counter != null ? Number(row.counter) : null;
  if (by === "creator" && budget) {
    log.push({ type: "offer", byName: "You", amount: budget, prev: budget, time: relTime(row.created_at) });
  } else if (by === "business") {
    log.unshift({ type: "brief", by: "business", time: relTime(row.created_at) });
    if (budget) log.push({ type: "offer", byName: "Business", amount: budget, prev: budget, time: relTime(row.created_at) });
  }
  if (counter != null && counter !== budget) {
    const counterBy = by === "business" ? "creator" : "business";
    const name = counterBy === "creator" ? "Creator" : "Business";
    log.push({ type: "offer", byName: name, amount: counter, prev: budget, time: relTime(row.responded_at ?? row.created_at) });
  }
  return log;
}

/** A pitch that has no deal yet (stage 0). */
export function mapPitch(row: any): { deal: Deal; runtime: DealRuntime } {
  const biz = bizPartyFromRow(row.business_profiles);
  const creator = creatorPartyFromRow(row.influencer_profiles);
  const amount = Number(row.counter ?? row.budget ?? 0);
  const deliverables: Deliverable[] = Array.isArray(row.deliverables) ? row.deliverables : [];
  const log = pitchLog(row);
  const sent = row.from_role === "creator";
  const deal: Deal = {
    id: "pitch_" + row.id,
    fresh: false, sent,
    business: biz, creator,
    title: row.title ?? "Collaboration",
    deliverables,
    offer: Number(row.budget ?? 0),
    counter: row.counter != null ? Number(row.counter) : null,
    stage: 0,
    submission: { emoji: biz.emoji, from: biz.from, to: biz.to, caption: "", link: "", likes: 0, views: 0, comments: 0 },
    review: { rating: 5, text: "" },
    log,
  };
  const hasCounter = row.counter != null && Number(row.counter) !== Number(row.budget ?? 0);
  return {
    deal,
    runtime: {
      stage: 0, amount: Number(row.counter ?? row.budget ?? 0),
      log: log.map((e) => ({ ...e })),
      pendingCounter: hasCounter,
      declined: row.status === "declined",
      reviewed: false,
    },
  };
}

/** A deal row (stage >= 1). */
export function mapDeal(row: any): { deal: Deal; runtime: DealRuntime } {
  const biz = bizPartyFromRow(row.business_profiles);
  const creator = creatorPartyFromRow(row.influencer_profiles);
  const stage = STATUS_TO_STAGE[row.status] ?? 1;
  const amount = Number(row.counter ?? row.amount ?? 0);
  const deliverables: Deliverable[] = Array.isArray(row.deliverables) ? row.deliverables : [];
  const log: LogEvent[] = Array.isArray(row.log) ? row.log : [];
  const submission = row.submission ?? { emoji: biz.emoji, from: biz.from, to: biz.to, caption: "", link: "", likes: 0, views: 0, comments: 0 };
  const review = row.review ?? { rating: 5, text: "" };
  const deal: Deal = {
    id: row.id,
    business: biz, creator,
    title: row.title ?? "Collaboration",
    deliverables,
    offer: Number(row.amount ?? 0),
    counter: row.counter != null ? Number(row.counter) : null,
    stage,
    submission,
    review,
    log,
  };
  const lastOffer = [...log].reverse().find((e) => e.type === "offer") as { byName?: string; amount?: number } | undefined;
  const pendingCounter = stage === 0 && !!lastOffer && row.counter != null;
  return {
    deal,
    runtime: {
      stage, amount, log: log.map((e) => ({ ...e })),
      pendingCounter,
      declined: row.status === "cancelled",
      reviewed: log.some((e) => e.type === "review"),
    },
  };
}

// ── credit economy rows ─────────────────────────────────────────
export function mapLedger(row: any): CreditLedgerEntry {
  return {
    id: row.id, kind: row.kind, label: row.label,
    when: relTime(row.created_at), amount: row.amount, note: row.note ?? undefined,
  };
}
export function mapReferral(row: any): Referral {
  const g = gradientFor(row.id);
  const joined = row.status !== "invited";
  return {
    id: row.id,
    name: joined ? "Friend" : "Invite sent",
    handle: joined ? "joined via link" : "via link",
    emoji: joined ? "🎉" : "📨",
    from: g.from, to: g.to,
    status: row.status,
    when: relTime(row.created_at),
    earned: row.earned ?? 0,
  };
}
export function mapPromo(row: any): Promo {
  return {
    id: row.id,
    type: row.type,
    emoji: row.type === "Story" ? "✨" : "📷",
    when: relTime(row.created_at),
    reach: row.reach ?? 0,
    status: row.status,
    credits: row.credits ?? 0,
    hrsLeft: row.hrs_left ?? 0,
    overperform: (row.credits ?? 0) > 5,
  };
}
