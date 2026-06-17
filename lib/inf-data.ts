// Creator-side data: ME (logged-in creator), deals, businesses, opportunities, credit economy.
import {
  CREATORS, type Creator, type Deal, type Deliverable, type BizParty, type CreatorParty, type LogEvent,
} from "@/lib/biz-data";

// ── Credit economy types ─────────────────────────────────────
export interface CreditLedgerEntry {
  id: string;
  kind: "spend" | "promote" | "referral" | "buy" | "welcome";
  label: string;
  when: string;
  amount: number;
  note?: string;
}

export interface Referral {
  id: string;
  name: string;
  handle: string;
  emoji: string;
  from: string;
  to: string;
  status: "invited" | "joined" | "verifying" | "verified";
  when: string;
  earned: number;
}

export interface Promo {
  id: string;
  type: string;
  emoji: string;
  when: string;
  reach: number;
  status: "pending" | "ready" | "claimed";
  credits: number;
  hrsLeft: number;
  overperform?: boolean;
}

// ── Credit economy constants ──────────────────────────────────
export const START_CREDITS = 3;
export const PROMO_PER = 5;
export const PROMO_CAP = 10;
export const REFERRAL_REWARD = 5;
export const LEDGER_TOTAL = 41;

export const CREDIT_PACKS = [
  { id: "p10", credits: 10, price: 500,  tag: null,          bonus: 0  },
  { id: "p25", credits: 25, price: 1000, tag: "Most popular", bonus: 5  },
  { id: "p60", credits: 60, price: 2000, tag: "Best value",   bonus: 20 },
] as const;

export const SEED_REFERRALS: Referral[] = [
  { id: "r_priya", name: "Priya R.",    handle: "@priyaeats",    emoji: "🍜", from: "#ffe4cc", to: "#ffb27a", status: "verified",  when: "Jun 1",     earned: 5 },
  { id: "r_rohan", name: "Rohan K.",    handle: "@rohanframes",  emoji: "📸", from: "#e9d6ff", to: "#b48af0", status: "verified",  when: "May 18",    earned: 5 },
  { id: "r_devs",  name: "Devika S.",   handle: "@devs.makes",   emoji: "🎨", from: "#ffd9e2", to: "#f2a0b8", status: "verifying", when: "2h ago",    earned: 0 },
  { id: "r_aman",  name: "Aman",        handle: "@amanonwheels", emoji: "🛵", from: "#cfe0ea", to: "#7fa8c0", status: "joined",    when: "Yesterday", earned: 0 },
  { id: "r_inv1",  name: "Invite sent", handle: "via WhatsApp",  emoji: "📨", from: "#eee7e3", to: "#d8ccc6", status: "invited",   when: "Jun 8",     earned: 0 },
];

export const SEED_PROMOS: Promo[] = [
  { id: "pm_b",   type: "Story", emoji: "✨", when: "5h ago",    reach: 3120,    status: "pending", credits: 0,  hrsLeft: 19 },
  { id: "pm_a",   type: "Story", emoji: "🎬", when: "Yesterday", reach: 24300,   status: "ready",   credits: 0,  hrsLeft: 0 },
  { id: "pm_old", type: "Reel",  emoji: "🔥", when: "Jun 4",     reach: 1180000, status: "claimed", credits: 10, hrsLeft: 0, overperform: true },
];

export const SEED_CREDIT_LEDGER: CreditLedgerEntry[] = [
  { id: "l1", kind: "spend",    label: "Pitch · Forktale Bowls",       when: "Today",  amount: -1 },
  { id: "l2", kind: "spend",    label: "Pitch · Toast & Co.",           when: "Today",  amount: -1 },
  { id: "l3", kind: "promote",  label: "Story overperformed 🎉",        when: "Jun 4",  amount: 10, note: "+5 bonus" },
  { id: "l4", kind: "referral", label: "Priya joined & verified",       when: "Jun 1",  amount: 5  },
  { id: "l5", kind: "spend",    label: "Pitch · Nightjar Rooftop",      when: "May 30", amount: -1 },
  { id: "l6", kind: "buy",      label: "Bought 25 credits",             when: "May 22", amount: 25 },
  { id: "l7", kind: "referral", label: "Rohan joined & verified",       when: "May 18", amount: 5  },
  { id: "l8", kind: "welcome",  label: "Welcome bonus",                 when: "Mar 12", amount: 5  },
];

// ── Extended type for the logged-in creator ──────────────────
export interface MyCreator extends Creator {
  joined: string;
  city: string;
  cities: string[];
  cats: string[];
  completed: number;
  repeatRate: number;
  responseHrs: number;
  payout: { method: string; handle: string };
  totalEarned: number;
  photoUrl?: string | null;
  coverUrl?: string | null;
}

// ── Opportunity (brief) from a hiring business ───────────────
export interface Opp {
  key: string;
  biz: BizParty;
  category: string;
  cats: string[];
  dist: number;
  followers: number;
  hiring: "open" | "scouting" | "closed";
  brief: { title: string; deliv: Deliverable[]; budgetLo: number; budgetHi: number; blurb: string };
  posts: string[];
}

// ── Logged-in creator (Aisha, built from CREATORS[0]) ────────
export const MY_CREATOR: MyCreator = {
  ...(CREATORS.find((c) => c.id === "c_aisha") as Creator),
  available: true,
  joined: "Mar 2026",
  city: "Bengaluru",
  cities: ["Bengaluru"],
  cats: ["food_drink", "lifestyle"],
  completed: 14,
  repeatRate: 64,
  responseHrs: 2,
  payout: { method: "UPI", handle: "aisha@okhdfc" },
  totalEarned: 184500,
};

// ── Business parties (deal counterparties + opp feed) ────────
export const BIZ: Record<string, BizParty> = {
  thirdwave: { name: "Third Wave Coffee", short: "Third Wave",    handle: "@thirdwave.ind",   emoji: "☕", from: "#ffe4cc", to: "#ffb27a", area: "Indiranagar" },
  bloom:     { name: "Bloom Patisserie",  short: "Bloom",        handle: "@bloompatisserie",  emoji: "🎂", from: "#ffd9e8", to: "#ff9ec2", area: "Jayanagar" },
  chai:      { name: "Chai Nivas",        short: "Chai Nivas",   handle: "@chainivas.ind",    emoji: "🍵", from: "#e6f0d8", to: "#a7c47a", area: "HSR Layout" },
  forktale:  { name: "Forktale Bowls",    short: "Forktale",     handle: "@forktale.blr",     emoji: "🥗", from: "#dCeccb", to: "#9cc079", area: "Indiranagar" },
  toast:     { name: "Toast & Co.",       short: "Toast & Co.",  handle: "@toastandco",       emoji: "🥐", from: "#f3dcb8", to: "#d9a55f", area: "Koramangala" },
  nightjar:  { name: "Nightjar Rooftop",  short: "Nightjar",     handle: "@nightjar.blr",     emoji: "🍸", from: "#e9d6ff", to: "#b48af0", area: "MG Road" },
};

// ── Deliverable builder ───────────────────────────────────────
const dl = (reel: number, post: number, story: number): Deliverable[] =>
  [
    reel  ? { label: "Reel",      qty: reel,  emoji: "🎬" } : null,
    post  ? { label: "Feed post", qty: post,  emoji: "📷" } : null,
    story ? { label: "Story",     qty: story, emoji: "✨" } : null,
  ].filter(Boolean) as Deliverable[];

const meParty = (): CreatorParty => ({
  name:      MY_CREATOR.name,
  handle:    MY_CREATOR.handle,
  emoji:     MY_CREATOR.emoji,
  from:      MY_CREATOR.from,
  to:        MY_CREATOR.to,
  followers: MY_CREATOR.followers,
  eng:       MY_CREATOR.eng,
});

type SubPayload = { emoji: string; from: string; to: string; caption: string; link: string; likes: number; views: number; comments: number };
const sub = (emoji: string, from: string, to: string, caption: string, link: string, likes: number, views: number, comments: number): SubPayload =>
  ({ emoji, from, to, caption, link, likes, views, comments });

// ── Incoming deals across stages 0–4 ─────────────────────────
export const INF_DEALS: Deal[] = [
  {
    id: "inf_bloom", business: BIZ.bloom, creator: meParty(),
    title: "Festive hamper feature", deliverables: dl(1, 1, 3), offer: 8000, counter: null, stage: 0,
    submission: sub("🧁", "#ffd9c2", "#ff9e7a", "the prettiest festive hampers in town 🎁 @bloompatisserie did THAT", "instagram.com/reel/Bl2p…", 0, 0, 0),
    review: { rating: 5, text: "" },
    log: [
      { type: "date", label: "Today" },
      { type: "brief", by: "business", time: "11:20 AM" },
      { type: "text", by: "business", time: "11:21 AM", text: "Hi Aisha! We're launching festive hampers and your styling is exactly the vibe. Would love a reel + a post + a few stories before Diwali 🎁" },
    ] as LogEvent[],
  },
  {
    id: "inf_toast", business: BIZ.toast, creator: meParty(),
    title: "Weekend brunch launch", deliverables: dl(1, 0, 3), offer: 7500, counter: null, stage: 0,
    submission: sub("🥐", "#f3dcb8", "#d9a55f", "weekend brunch just got a glow-up @toastandco 🥐", "instagram.com/reel/Tc8a…", 0, 0, 0),
    review: { rating: 5, text: "" },
    log: [
      { type: "date", label: "Today" },
      { type: "brief", by: "business", time: "9:05 AM" },
      { type: "text", by: "business", time: "9:06 AM", text: "Loved your croissant reel last month! We're rolling out a weekend brunch menu — keen to have you cover the launch 🍳" },
    ] as LogEvent[],
  },
  {
    id: "inf_thirdwave", business: BIZ.thirdwave, creator: meParty(),
    title: "Cold brew menu launch", deliverables: dl(1, 1, 3), offer: 9000, counter: null, stage: 1,
    submission: sub("🧋", "#d8c3a5", "#a9805a", "new cold brew flight at @thirdwave.ind ☕ my honest take ↓", "instagram.com/reel/Cx9d…", 3120, 21400, 188),
    review: { rating: 5, text: "" },
    log: [
      { type: "date", label: "Yesterday" },
      { type: "brief", by: "business", time: "2:02 PM" },
      { type: "text", by: "business", time: "2:03 PM", text: "Hi Aisha! Launching a 4-drink cold brew flight — your audience is a perfect fit 🙌" },
      { type: "text", by: "creator", time: "2:30 PM", text: "Love this! Cold brew season is my favourite to shoot ☕ Count me in." },
      { type: "system", kind: "accepted", amount: 9000, time: "2:31 PM" },
    ] as LogEvent[],
  },
  {
    id: "inf_chai", business: BIZ.chai, creator: meParty(),
    title: "Monsoon menu collab", deliverables: dl(1, 1, 3), offer: 11000, counter: null, stage: 2,
    submission: sub("☔", "#cfe0ea", "#7fa8c0", "rainy day = chai weather 🍵 swipe for the monsoon menu @chainivas.ind", "instagram.com/reel/Mn4k…", 4210, 28800, 241),
    review: { rating: 5, text: "" },
    log: [
      { type: "date", label: "Mon, Jun 8" },
      { type: "brief", by: "business", time: "10:14 AM" },
      { type: "text", by: "creator", time: "11:02 AM", text: "Monsoon menus are my favourite to shoot 🌧️ moody reel + 3 behind-the-counter stories. In!" },
      { type: "system", kind: "accepted", amount: 11000, time: "11:40 AM" },
      { type: "escrow", amount: 11000, time: "12:05 PM" },
      { type: "text", by: "business", time: "12:06 PM", text: "Funds are in escrow ✅ kitchen's all yours this week." },
    ] as LogEvent[],
  },
  {
    id: "inf_forktale", business: BIZ.forktale, creator: meParty(),
    title: "High-protein bowl drop", deliverables: dl(1, 0, 3), offer: 8500, counter: null, stage: 3,
    submission: sub("🥗", "#d4e8bc", "#94bf6a", "the salad bowl actually worth ₹400 @forktale.blr 🥗", "instagram.com/reel/Fk2m…", 2240, 15600, 132),
    review: { rating: 5, text: "" },
    log: [
      { type: "date", label: "Fri, Jun 5" },
      { type: "brief", by: "business", time: "3:10 PM" },
      { type: "system", kind: "accepted", amount: 8500, time: "3:40 PM" },
      { type: "escrow", amount: 8500, time: "4:00 PM" },
      { type: "submission", by: "creator", time: "Jun 9 · 7:20 PM" },
      { type: "text", by: "creator", time: "Jun 9 · 7:21 PM", text: "It's live! Already getting saves 🙌 link above." },
    ] as LogEvent[],
  },
  {
    id: "inf_nightjar", business: BIZ.nightjar, creator: meParty(),
    title: "Sundowner menu feature", deliverables: dl(1, 1, 4), offer: 14000, counter: null, stage: 4,
    submission: sub("🍸", "#d8c0f0", "#9c70d8", "best sundowners in the city, ranked 🍸 @nightjar.blr", "instagram.com/reel/Nj7p…", 6240, 41200, 388),
    review: { rating: 5, text: "Aisha's reel sold out our Friday slots two weeks running. Effortless to work with — already rebooked her." },
    log: [
      { type: "date", label: "Fri, May 30" },
      { type: "brief", by: "business", time: "1:00 PM" },
      { type: "system", kind: "accepted", amount: 14000, time: "1:30 PM" },
      { type: "escrow", amount: 14000, time: "1:45 PM" },
      { type: "submission", by: "creator", time: "Jun 2 · 6:00 PM" },
      { type: "release", amount: 14000, time: "Jun 3 · 10:10 AM" },
      { type: "review", by: "business", time: "Jun 3 · 10:12 AM" },
    ] as LogEvent[],
  },
];

// ── Opportunity feed ─────────────────────────────────────────
export const OPPS: Opp[] = [
  {
    key: "thirdwave", biz: BIZ.thirdwave, category: "food_drink", cats: ["food_drink", "lifestyle"], dist: 0.8, followers: 14200, hiring: "scouting",
    brief: { title: "Cold brew menu launch",     deliv: dl(1, 1, 3), budgetLo: 8000,  budgetHi: 12000, blurb: "Launching a 4-drink cold brew flight. Want a creator who can make filter coffee look irresistible." },
    posts: ["☕", "🥐", "🧋", "🌿", "🍰", "✨"],
  },
  {
    key: "bloom", biz: BIZ.bloom, category: "food_drink", cats: ["food_drink", "art_photography"], dist: 6.4, followers: 9800, hiring: "open",
    brief: { title: "Festive hamper feature",    deliv: dl(1, 2, 4), budgetLo: 6000,  budgetHi: 9000,  blurb: "Diwali hampers dropping soon. Looking for warm, beautifully styled content." },
    posts: ["🎂", "🧁", "🍮", "🍪", "🥧", "🍩"],
  },
  {
    key: "forktale", biz: BIZ.forktale, category: "health_fitness", cats: ["health_fitness", "food_drink"], dist: 1.4, followers: 6400, hiring: "scouting",
    brief: { title: "New high-protein menu",     deliv: dl(1, 0, 3), budgetLo: 7000,  budgetHi: 10000, blurb: "Macro-friendly bowls for the gym crowd. Honest, high-energy reels preferred." },
    posts: ["🥗", "🥑", "🍓", "🫐", "🍲", "🥥"],
  },
  {
    key: "toast", biz: BIZ.toast, category: "food_drink", cats: ["food_drink", "lifestyle"], dist: 3.1, followers: 11200, hiring: "open",
    brief: { title: "Weekend brunch launch",     deliv: dl(1, 0, 3), budgetLo: 6000,  budgetHi: 9000,  blurb: "All-day brunch menu launching this month. Croissant content very welcome." },
    posts: ["🥐", "🍳", "☕", "🥞", "🧇", "🥓"],
  },
  {
    key: "nightjar", biz: BIZ.nightjar, category: "lifestyle", cats: ["lifestyle", "food_drink"], dist: 4.6, followers: 31800, hiring: "scouting",
    brief: { title: "Rooftop sundowner menu",    deliv: dl(1, 1, 4), budgetLo: 12000, budgetHi: 20000, blurb: "New cocktail menu + skyline views. After-dark, cinematic edits." },
    posts: ["🍸", "🍹", "🥂", "🍷", "🍾", "🌃"],
  },
];

// ── Proposal → new deal ──────────────────────────────────────
export function makeProposalDeal(
  opp: Opp,
  me: MyCreator,
  payload: { title: string; deliverables: Deliverable[]; amount: number; message: string },
): Deal {
  const b = opp.biz;
  return {
    id: "prop_" + opp.key + "_" + Date.now(),
    fresh: true,
    sent: true,
    business: b,
    creator: { name: me.name, handle: me.handle, emoji: me.emoji, from: me.from, to: me.to, followers: me.followers, eng: me.eng },
    title: payload.title,
    deliverables: payload.deliverables,
    offer: payload.amount,
    counter: null,
    stage: 0,
    submission: { emoji: opp.posts[0], from: b.from, to: b.to, caption: "", link: "", likes: 0, views: 0, comments: 0 },
    review: { rating: 5, text: "" },
    log: [
      { type: "date", label: "Today" },
      { type: "text", by: "creator", time: "Now", text: payload.message },
      { type: "offer", byName: me.name.split(" ")[0], amount: payload.amount, prev: payload.amount, time: "Now" },
    ] as LogEvent[],
  };
}
