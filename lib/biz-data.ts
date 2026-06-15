// Business app types and mock data (deck, deals, taxonomy).

// ── Taxonomy ────────────────────────────────────────────────
export const CAT_MAP: Record<string, { emoji: string; label: string }> = {
  cafe:    { emoji: "☕", label: "Café & Coffee" },
  street:  { emoji: "🌮", label: "Street Food" },
  fine:    { emoji: "🍷", label: "Fine Dining" },
  bakery:  { emoji: "🧁", label: "Bakery & Desserts" },
  healthy: { emoji: "🥗", label: "Healthy & Fitness" },
  bar:     { emoji: "🍸", label: "Bars & Nightlife" },
};
export const CAT = Object.entries(CAT_MAP).map(([key, v]) => ({ key, ...v }));
export const catOf = (k: string) => CAT_MAP[k] ?? CAT_MAP.cafe;

export const SIZE = [
  { key: "nano",  label: "Nano",  range: "1k – 10k",   lo: 0,      hi: 10000 },
  { key: "micro", label: "Micro", range: "10k – 50k",  lo: 10000,  hi: 50000 },
  { key: "mid",   label: "Mid",   range: "50k – 200k", lo: 50000,  hi: 200000 },
  { key: "macro", label: "Macro", range: "200k+",      lo: 200000, hi: 1e9 },
];
export const sizeOf = (f: number) =>
  f < 10000 ? "nano" : f < 50000 ? "micro" : f < 200000 ? "mid" : "macro";

export const AGE_BUCKETS = ["13–17", "18–24", "25–34", "35–44", "45+"];
export const AREAS = ["Indiranagar", "Koramangala", "HSR Layout", "Jayanagar", "Whitefield", "JP Nagar", "MG Road"];
export const BUDGETS = [
  { key: "micro", label: "₹2k – ₹8k",  lo: 0,     hi: 8000 },
  { key: "mid",   label: "₹8k – ₹25k", lo: 8000,  hi: 25000 },
  { key: "big",   label: "₹25k+",      lo: 25000, hi: 1e9 },
];

export const STAGES = [
  { key: "pitched",   step: "Pitch",   tone: "amber" as const,   label: "Awaiting reply" },
  { key: "accepted",  step: "Accept",  tone: "rose" as const,    label: "Awaiting escrow" },
  { key: "funded",    step: "Escrow",  tone: "mint" as const,    label: "In production" },
  { key: "submitted", step: "Deliver", tone: "rose" as const,    label: "Awaiting review" },
  { key: "released",  step: "Release", tone: "mint" as const,    label: "Completed" },
];
export const STEP_LABELS = STAGES.map((s) => s.step);
export const FEE_PCT = 10;
export const feeOf = (n: number) => Math.round(n * FEE_PCT / 100);
export const payoutOf = (n: number) => n - feeOf(n);

// ── Types ────────────────────────────────────────────────────
export interface Work {
  emoji: string; from: string; to: string;
  kind: "Reel" | "Post"; views: number; likes: number; caption: string;
  image?: string; // stock/real photo; falls back to emoji + gradient when absent
}
export interface CreatorService {
  code: string; label: string; price: number; negotiable: boolean;
}
export interface Creator {
  id: string; name: string; handle: string; emoji: string;
  from: string; to: string;
  verified: boolean; available: boolean;
  category: string; area: string; dist: number;
  followers: number; avgViews: number; avgLikes: number; avgComments: number; eng: number;
  ageDom: string;
  age: Record<string, number>;
  gender: { f: number; m: number };
  rating: number; reviews: number;
  rateFrom: number;
  services: CreatorService[];
  pkg: { name: string; items: string; price: number };
  bio: string;
  works: Work[];
  photoUrl?: string | null; // avatar photo; falls back to emoji + gradient
  coverUrl?: string | null; // profile cover photo
}
export interface Deliverable { label: string; qty: number; emoji: string; }
export interface Attachment { type: "url" | "image"; value: string; name?: string; }
export type LogEvent =
  | { type: "date"; label: string }
  | { type: "brief"; by: string; time: string }
  | { type: "text"; by: string; time: string; text: string; attachment?: Attachment }
  | { type: "system"; kind: string; amount: number; time: string }
  | { type: "offer"; byName: string; amount: number; prev: number; time: string }
  | { type: "escrow"; amount: number; time: string }
  | { type: "submission"; by: string; time: string }
  | { type: "release"; amount: number; time: string }
  | { type: "review"; by: string; time: string };

export interface BizParty { name: string; short: string; handle: string; emoji: string; from: string; to: string; area: string; }
export interface CreatorParty { name: string; handle: string; emoji: string; from: string; to: string; followers: number; eng: number; }
export interface Deal {
  id: string; fresh?: boolean; sent?: boolean;
  business: BizParty; creator: CreatorParty;
  title: string; deliverables: Deliverable[];
  offer: number; counter: number | null; stage: number;
  submission: { emoji: string; from: string; to: string; caption: string; link: string; likes: number; views: number; comments: number };
  review: { rating: number; text: string };
  log: LogEvent[];
}
export interface DealRuntime {
  stage: number; amount: number; log: LogEvent[];
  pendingCounter: boolean; declined: boolean; reviewed: boolean;
}
export interface MyBiz {
  name: string; short: string; handle: string;
  emoji: string; from: string; to: string;
  area: string; city: string; bio: string; category: string;
  cats?: string[]; cities?: string[];
  followers: number; avgLikes: number; avgViews: number; eng: number;
  hiring: "open" | "scouting" | "closed";
  credits: number; budget: string; creatorSize: string[];
  posts: string[];
  photoUrl?: string | null; coverUrl?: string | null;
}

// ── My business (Third Wave, Indiranagar) ──────────────────
export const MY_BIZ: MyBiz = {
  name: "Third Wave Coffee", short: "Third Wave", handle: "@thirdwave.ind",
  emoji: "☕", from: "#ffe4cc", to: "#ffb27a",
  area: "Indiranagar", city: "Bengaluru", cities: ["Bengaluru"],
  bio: "Specialty coffee roasters · 3 cafés across Bengaluru. Community-first, always brewing something new.",
  category: "food", cats: ["food", "lifestyle"],
  followers: 14200, avgLikes: 720, avgViews: 5200, eng: 5.4,
  hiring: "scouting", credits: 5, budget: "mid", creatorSize: ["nano", "micro"],
  posts: ["☕","🥐","🌿","🧋","🍰","✨"],
};

// ── Work builder ────────────────────────────────────────────
const W = (emoji: string, from: string, to: string, kind: Work["kind"], views: number, likes: number, caption: string): Work =>
  ({ emoji, from, to, kind, views, likes, caption });

// ── Creator deck ────────────────────────────────────────────
export const CREATORS: Creator[] = [
  {
    id: "c_aisha", name: "Aisha Khan", handle: "@aisha.eats", emoji: "🍜",
    from: "#ffd1c4", to: "#ff8f74", verified: true, available: true,
    category: "cafe", area: "Indiranagar", dist: 0.8,
    followers: 8200, avgViews: 21400, avgLikes: 1280, avgComments: 96, eng: 16.8,
    ageDom: "18–24", age: { "13–17": 4, "18–24": 47, "25–34": 33, "35–44": 11, "45+": 5 },
    gender: { f: 64, m: 35 }, rating: 4.9, reviews: 23, rateFrom: 6000,
    services: [
      { code: "reel", label: "Instagram Reel", price: 6000, negotiable: true },
      { code: "post", label: "Feed Post", price: 3000, negotiable: false },
      { code: "story", label: "Story (×3)", price: 1500, negotiable: false },
    ],
    pkg: { name: "Café Launch Combo", items: "1 reel · 1 post · 3 stories", price: 9000 },
    bio: "Hunting Bengaluru's best flat whites & hidden brunch spots. Honest reviews, warm light, zero filters on taste.",
    works: [
      W("☕","#d8c3a5","#a9805a","Reel",21400,3120,"the cold brew flight everyone's talking about ↓"),
      W("🥐","#f3dcb8","#d9a55f","Post",14200,1980,"buttery croissants in Indiranagar 🥐"),
      W("🧋","#e8d2b0","#c79a63","Reel",28800,4010,"brown sugar boba taste test"),
      W("🍳","#ffe0c0","#f0a868","Reel",17600,2240,"brunch that's worth the queue"),
      W("🌿","#dCeccb","#9cc079","Post",9800,1120,"matcha season is here"),
      W("🍰","#ffd9e2","#f2a0b8","Post",12100,1640,"tres leches, but make it filter coffee"),
    ],
  },
  {
    id: "c_karan", name: "Karan Shetty", handle: "@karaneats", emoji: "🌮",
    from: "#ffe0b3", to: "#ff9e54", verified: true, available: true,
    category: "street", area: "Koramangala", dist: 3.1,
    followers: 22100, avgViews: 64200, avgLikes: 3180, avgComments: 214, eng: 15.4,
    ageDom: "18–24", age: { "13–17": 6, "18–24": 44, "25–34": 34, "35–44": 12, "45+": 4 },
    gender: { f: 41, m: 58 }, rating: 4.8, reviews: 41, rateFrom: 9000,
    services: [
      { code: "reel", label: "Instagram Reel", price: 12000, negotiable: true },
      { code: "post", label: "Feed Post", price: 6000, negotiable: false },
      { code: "story", label: "Story (×3)", price: 3000, negotiable: false },
    ],
    pkg: { name: "Street Hype Combo", items: "1 reel · 1 post · 3 stories", price: 18000 },
    bio: "Chaat, kebabs, midnight dosa runs. If it's smoky, spicy and under ₹200 — I've probably filmed it.",
    works: [
      W("🌮","#ffcf9e","#e8843d","Reel",64200,5120,"₹50 tacos that hit different 🔥"),
      W("🍢","#ffd0a0","#d97b35","Reel",88400,7240,"the kebab cart with a 1-hour wait"),
      W("🥘","#ffd9b0","#e08a45","Post",31200,2980,"biryani belt of Bengaluru"),
      W("🌯","#ffe2b8","#eb9c52","Reel",52800,4410,"shawarma showdown, HSR edition"),
      W("🍛","#ffcf95","#df7e2f","Post",24600,2110,"thali under ₹150 — does it slap?"),
      W("🫓","#ffe4c2","#f0a860","Reel",47900,3980,"dosa at 2am is a personality"),
    ],
  },
  {
    id: "c_priya", name: "Priya Nair", handle: "@priya.plates", emoji: "🍰",
    from: "#ffe1d6", to: "#ffab8f", verified: true, available: false,
    category: "bakery", area: "Jayanagar", dist: 6.4,
    followers: 4300, avgViews: 11200, avgLikes: 740, avgComments: 86, eng: 19.2,
    ageDom: "25–34", age: { "13–17": 2, "18–24": 31, "25–34": 46, "35–44": 16, "45+": 5 },
    gender: { f: 78, m: 21 }, rating: 5.0, reviews: 17, rateFrom: 4000,
    services: [
      { code: "post", label: "Feed Post", price: 4000, negotiable: false },
      { code: "reel", label: "Instagram Reel", price: 7000, negotiable: true },
      { code: "story", label: "Story (×4)", price: 2000, negotiable: false },
    ],
    pkg: { name: "Festive Feature", items: "2 posts · 4 stories", price: 7500 },
    bio: "Pastry-obsessed, prop-styling nerd. Highest engagement in the south side — my people show up.",
    works: [
      W("🧁","#ffd9c2","#ff9e7a","Post",11200,940,"the prettiest festive hampers 🎁"),
      W("🎂","#ffd6e6","#f59ec0","Post",9400,820,"a slice of citrus heaven"),
      W("🍮","#ffe7c4","#f3b96a","Reel",16100,1320,"burnt basque, done right"),
      W("🍩","#ffdcc0","#f0a070","Post",7600,690,"doughnut drop saturdays"),
      W("🥧","#ffe2cc","#eda86e","Post",8200,720,"galette season opened"),
      W("🍪","#f6e0c2","#d9a35f","Reel",13800,1180,"cookie pull so good it's illegal"),
    ],
  },
  {
    id: "c_rohan", name: "Rohan Mehta", handle: "@rohan.bites", emoji: "🍵",
    from: "#e6f0d8", to: "#a7c47a", verified: true, available: true,
    category: "cafe", area: "HSR Layout", dist: 5.2,
    followers: 15400, avgViews: 38200, avgLikes: 1980, avgComments: 142, eng: 13.8,
    ageDom: "25–34", age: { "13–17": 3, "18–24": 38, "25–34": 41, "35–44": 13, "45+": 5 },
    gender: { f: 52, m: 47 }, rating: 4.7, reviews: 34, rateFrom: 7000,
    services: [
      { code: "reel", label: "Instagram Reel", price: 9000, negotiable: true },
      { code: "post", label: "Feed Post", price: 4500, negotiable: false },
      { code: "story", label: "Story (×3)", price: 2200, negotiable: false },
    ],
    pkg: { name: "Monsoon Combo", items: "1 reel · 1 post · 3 stories", price: 11000 },
    bio: "Moody reels, slow mornings, specialty chai. I shoot the rain better than anyone in HSR.",
    works: [
      W("🍵","#cfe0d0","#7fa890","Reel",38200,2410,"rainy day = chai weather 🌧️"),
      W("☔","#cfe0ea","#7fa8c0","Reel",44800,2980,"monsoon menu, moody edit"),
      W("🫖","#e0ead0","#9cba78","Post",19600,1240,"the cutting chai ritual"),
      W("🍂","#f0e2c8","#c9a45f","Post",16100,1010,"autumn-spiced everything"),
      W("🥮","#ffe6c2","#e8a85e","Reel",28800,1840,"behind the counter, 6am"),
      W("🌧️","#d6e2ea","#8aa6bc","Post",14200,920,"best window seats for the rain"),
    ],
  },
  {
    id: "c_sneha", name: "Sneha Rao", handle: "@snehaforks", emoji: "🥗",
    from: "#dCeccb", to: "#9cc079", verified: false, available: true,
    category: "healthy", area: "Indiranagar", dist: 1.4,
    followers: 6800, avgViews: 15600, avgLikes: 880, avgComments: 74, eng: 14.0,
    ageDom: "25–34", age: { "13–17": 2, "18–24": 34, "25–34": 44, "35–44": 15, "45+": 5 },
    gender: { f: 71, m: 28 }, rating: 4.8, reviews: 12, rateFrom: 5000,
    services: [
      { code: "reel", label: "Instagram Reel", price: 6500, negotiable: true },
      { code: "post", label: "Feed Post", price: 3500, negotiable: false },
      { code: "story", label: "Story (×3)", price: 1800, negotiable: false },
    ],
    pkg: { name: "Clean Eats Combo", items: "1 reel · 1 post · 3 stories", price: 8500 },
    bio: "Macro-friendly, protein-forward, never boring. High-intent audience that actually books tables.",
    works: [
      W("🥗","#d4e8bc","#94bf6a","Reel",15600,1240,"the salad bowl worth ₹400"),
      W("🥑","#d8ebc0","#9ac26e","Post",9200,720,"avocado toast tier list"),
      W("🍓","#ffd6de","#f29ab0","Reel",21200,1680,"smoothie bowls done right"),
      W("🫐","#dCd6ee","#a094d0","Post",7400,560,"açaí spot you've been missing"),
      W("🍲","#e6e2c8","#bcb070","Reel",18400,1410,"high-protein desk lunch"),
      W("🥥","#eee6d4","#cdb988","Post",6800,520,"cold-pressed everything"),
    ],
  },
  {
    id: "c_devika", name: "Devika Iyer", handle: "@devikadrinks", emoji: "🍸",
    from: "#e9d6ff", to: "#b48af0", verified: true, available: true,
    category: "bar", area: "MG Road", dist: 4.6,
    followers: 31800, avgViews: 92400, avgLikes: 4120, avgComments: 286, eng: 13.9,
    ageDom: "25–34", age: { "13–17": 0, "18–24": 36, "25–34": 47, "35–44": 13, "45+": 4 },
    gender: { f: 58, m: 41 }, rating: 4.9, reviews: 52, rateFrom: 14000,
    services: [
      { code: "reel", label: "Instagram Reel", price: 18000, negotiable: true },
      { code: "post", label: "Feed Post", price: 9000, negotiable: false },
      { code: "story", label: "Story (×3)", price: 4500, negotiable: false },
    ],
    pkg: { name: "Launch Night Combo", items: "1 reel · 1 post · 4 stories", price: 26000 },
    bio: "Cocktail menus, rooftop launches, after-dark Bengaluru. Macro reach with a crowd that shows up to openings.",
    works: [
      W("🍸","#d8c0f0","#9c70d8","Reel",92400,6240,"the negroni flight at the new rooftop"),
      W("🍹","#ffd0c0","#f08a6a","Reel",78600,5410,"sundowners, ranked"),
      W("🥂","#ffe6c0","#e8b860","Post",41200,3120,"launch night was unreal ✨"),
      W("🍷","#e6c0d0","#c070a0","Post",34800,2680,"natural wine bar crawl"),
      W("🍾","#f0e0c0","#d0a860","Reel",64200,4480,"bottle service energy"),
      W("🌃","#c0c8e0","#7080b0","Post",28400,2010,"best skyline bars in the city"),
    ],
  },
  {
    id: "c_meera", name: "Meera Pillai", handle: "@meera.fineplate", emoji: "🍷",
    from: "#f0d6c0", to: "#d0a070", verified: true, available: false,
    category: "fine", area: "Whitefield", dist: 12.8,
    followers: 54200, avgViews: 118000, avgLikes: 5240, avgComments: 312, eng: 10.2,
    ageDom: "35–44", age: { "13–17": 0, "18–24": 18, "25–34": 42, "35–44": 28, "45+": 12 },
    gender: { f: 61, m: 38 }, rating: 4.9, reviews: 67, rateFrom: 22000,
    services: [
      { code: "reel", label: "Instagram Reel", price: 28000, negotiable: true },
      { code: "post", label: "Feed Post", price: 14000, negotiable: false },
      { code: "story", label: "Story (×4)", price: 7000, negotiable: false },
    ],
    pkg: { name: "Tasting Menu Feature", items: "1 reel · 2 posts · 4 stories", price: 42000 },
    bio: "Chef's tables, tasting menus, the quiet luxury crowd. Older, higher-spend audience that books anniversaries.",
    works: [
      W("🍷","#e6c8b0","#c89868","Reel",118000,7240,"an 8-course tasting menu, unpacked"),
      W("🦞","#ffd0c8","#e88a78","Post",62400,4120,"the lobster course though"),
      W("🍽️","#f0e2d0","#cdb088","Post",48600,3280,"plating as art"),
      W("🥩","#e8c8c0","#c89080","Reel",94200,5840,"dry-aged, 45 days"),
      W("🧈","#f4e8c8","#d8c080","Post",38200,2640,"house butter service"),
      W("🕯️","#e0d4c0","#bca878","Reel",71400,4480,"candlelit anniversary table"),
    ],
  },
  {
    id: "c_arjun", name: "Arjun Das", handle: "@arjun.brews", emoji: "🍺",
    from: "#ffe0b0", to: "#e0a040", verified: false, available: true,
    category: "bar", area: "Koramangala", dist: 3.6,
    followers: 11900, avgViews: 27800, avgLikes: 1340, avgComments: 108, eng: 12.1,
    ageDom: "25–34", age: { "13–17": 0, "18–24": 40, "25–34": 43, "35–44": 12, "45+": 5 },
    gender: { f: 38, m: 61 }, rating: 4.6, reviews: 19, rateFrom: 6000,
    services: [
      { code: "reel", label: "Instagram Reel", price: 8000, negotiable: true },
      { code: "post", label: "Feed Post", price: 4000, negotiable: false },
      { code: "story", label: "Story (×3)", price: 2000, negotiable: false },
    ],
    pkg: { name: "Taproom Combo", items: "1 reel · 1 post · 3 stories", price: 10000 },
    bio: "Craft beer, brewpubs, game-night spots. The Koramangala after-work crowd trusts my pours.",
    works: [
      W("🍺","#ffe0a0","#d89830","Reel",27800,1640,"the freshest IPA in town 🍺"),
      W("🍕","#ffd8b0","#e89850","Post",16200,980,"beer + wood-fired pizza math"),
      W("🌭","#ffe2b8","#eb9c52","Reel",22400,1280,"game night, sorted"),
      W("🧀","#ffe8c0","#e0b860","Post",12800,740,"the loaded fries situation"),
      W("🍗","#ffd8a8","#e09040","Reel",19600,1120,"wings & a flight of stouts"),
      W("🎯","#e0d0b0","#b89860","Post",9400,580,"best darts-and-pints bars"),
    ],
  },
];

// ── Seed deals ──────────────────────────────────────────────
const D = (reel: number, post: number, story: number): Deliverable[] =>
  [
    reel  && { label: "Reel",      qty: reel,  emoji: "🎬" },
    post  && { label: "Feed post", qty: post,  emoji: "📷" },
    story && { label: "Story",     qty: story, emoji: "✨" },
  ].filter(Boolean) as Deliverable[];

export const DEALS: Deal[] = [
  {
    id: "d_a",
    business: { name: "Third Wave Coffee", short: "Third Wave", handle: "@thirdwave.ind", emoji: "☕", from: "#ffe4cc", to: "#ffb27a", area: "Indiranagar" },
    creator:  { name: "Aisha Khan", handle: "@aisha.eats", emoji: "🍜", from: "#ffd1c4", to: "#ff8f74", followers: 8200, eng: 7.0 },
    title: "Cold Brew menu launch",
    deliverables: D(1,1,3), offer: 9000, counter: null, stage: 0,
    submission: { emoji: "🧋", from: "#d8c3a5", to: "#a9805a", caption: "new cold brew flight at @thirdwave.ind ☕ my honest take ↓", link: "instagram.com/reel/Cx9d…", likes: 3120, views: 21400, comments: 188 },
    review: { rating: 5, text: "Aisha's reel drove a 40% footfall spike the week it dropped." },
    log: [
      { type: "date", label: "Today" },
      { type: "brief", by: "business", time: "2:02 PM" },
      { type: "text", by: "business", time: "2:03 PM", text: "Hi Aisha! Loved your Koramangala café reel. We're launching a 4-drink cold brew flight and think your audience is a perfect fit 🙌" },
    ],
  },
  {
    id: "d_b",
    business: { name: "Chai Nivas", short: "Chai Nivas", handle: "@chainivas.ind", emoji: "🍵", from: "#e6f0d8", to: "#a7c47a", area: "HSR Layout" },
    creator:  { name: "Rohan Mehta", handle: "@rohan.bites", emoji: "🌮", from: "#ffe0b3", to: "#ff9e54", followers: 15400, eng: 6.8 },
    title: "Monsoon menu collab",
    deliverables: D(1,1,3), offer: 11000, counter: null, stage: 2,
    submission: { emoji: "☔", from: "#cfe0ea", to: "#7fa8c0", caption: "rainy day = chai weather 🍵 swipe for the monsoon menu @chainivas.ind", link: "instagram.com/reel/Mn4k…", likes: 4210, views: 28800, comments: 241 },
    review: { rating: 5, text: "The reel pulled 2× our usual reach." },
    log: [
      { type: "date", label: "Mon, Jun 8" },
      { type: "brief", by: "business", time: "10:14 AM" },
      { type: "text", by: "creator", time: "11:02 AM", text: "Love this — monsoon menus are my favourite to shoot 🌧️ Can do a moody reel + 3 behind-the-counter stories. Count me in." },
      { type: "system", kind: "accepted", amount: 11000, time: "11:40 AM" },
      { type: "escrow", amount: 11000, time: "12:05 PM" },
      { type: "text", by: "business", time: "12:06 PM", text: "Funds are in escrow ✅ Drop by anytime this week, kitchen's all yours." },
    ],
  },
  {
    id: "d_c",
    business: { name: "Bloom Patisserie", short: "Bloom", handle: "@bloompatisserie", emoji: "🎂", from: "#ffd9e8", to: "#ff9ec2", area: "Jayanagar" },
    creator:  { name: "Priya Nair", handle: "@priya.plates", emoji: "🍰", from: "#ffe1d6", to: "#ffab8f", followers: 4300, eng: 10.7 },
    title: "Festive hamper feature",
    deliverables: D(0,2,4), offer: 7500, counter: null, stage: 4,
    submission: { emoji: "🧁", from: "#ffd9c2", to: "#ff9e7a", caption: "the prettiest festive hampers in Jayanagar 🎁 @bloompatisserie did THAT", link: "instagram.com/p/Bl2p…", likes: 2640, views: 16100, comments: 173 },
    review: { rating: 5, text: "Authentic storytelling. Our hamper pre-orders sold out in 3 days." },
    log: [
      { type: "date", label: "Fri, Jun 5" },
      { type: "brief", by: "business", time: "9:20 AM" },
      { type: "text", by: "creator", time: "9:51 AM", text: "Festive content is my happy place 🎄 happy to do 2 posts + 4 stories. Accepting now!" },
      { type: "system", kind: "accepted", amount: 7500, time: "10:03 AM" },
      { type: "escrow", amount: 7500, time: "10:20 AM" },
      { type: "submission", by: "creator", time: "Jun 7 · 6:40 PM" },
      { type: "text", by: "business", time: "Jun 7 · 7:15 PM", text: "This is stunning 😍 verifying & releasing now. Thank you Priya!" },
      { type: "release", amount: 7500, time: "Jun 7 · 7:16 PM" },
      { type: "review", by: "business", time: "Jun 7 · 7:18 PM" },
    ],
  },
];

export function makePitchDeal(creator: Creator, biz: MyBiz, payload: { title: string; deliverables: Deliverable[]; amount: number; message: string }): Deal {
  return {
    id: "pitch_" + creator.id + "_" + Date.now(),
    fresh: true,
    business: { name: biz.name, short: biz.short, handle: biz.handle, emoji: biz.emoji, from: biz.from, to: biz.to, area: biz.area },
    creator: { name: creator.name, handle: creator.handle, emoji: creator.emoji, from: creator.from, to: creator.to, followers: creator.followers, eng: creator.eng },
    title: payload.title,
    deliverables: payload.deliverables,
    offer: payload.amount, counter: null, stage: 0,
    submission: { emoji: creator.works[0].emoji, from: creator.works[0].from, to: creator.works[0].to, caption: "", link: "", likes: 0, views: 0, comments: 0 },
    review: { rating: 5, text: "" },
    log: [
      { type: "date", label: "Today" },
      { type: "brief", by: "business", time: "Now" },
      { type: "text", by: "business", time: "Now", text: payload.message },
    ],
  };
}

// ── Campaigns (business briefs) ──────────────────────────────
export interface CampaignDeliv { reel: number; post: number; story: number; }
export interface Campaign {
  id: string;
  title: string;
  catKey: string;
  status: "live" | "draft" | "closed";
  pitches: number;
  newPitches: number;
  lo: number;
  hi: number;
  deliv: CampaignDeliv;
  blurb: string;
  sizes: string[];
  deadline: string;
}

export const CAMP_STATUS: Record<Campaign["status"], { tone: "mint" | "neutral" | "amber"; label: string; dot: string }> = {
  live:   { tone: "mint",    label: "Live",   dot: "#138a5e" },
  draft:  { tone: "neutral", label: "Draft",  dot: "#9a8a86" },
  closed: { tone: "amber",   label: "Closed", dot: "#9a6a04" },
};

export const bizDelivStr = (d: CampaignDeliv): string =>
  [
    d.reel && `${d.reel} reel`,
    d.post && `${d.post} post${d.post > 1 ? "s" : ""}`,
    d.story && `${d.story} ${d.story > 1 ? "stories" : "story"}`,
  ].filter(Boolean).join(" · ");

// Mock fallback shown when Supabase is unconfigured / empty.
export const MY_CAMPAIGNS: Campaign[] = [
  { id: "cmp_cold", title: "Cold brew menu launch", catKey: "cafe", status: "live", pitches: 7, newPitches: 3, lo: 8000, hi: 12000, deliv: { reel: 1, post: 1, story: 3 }, blurb: "Launching a 4-drink cold brew flight. Want a creator who makes filter coffee look irresistible.", sizes: ["nano", "micro"], deadline: "2 weeks" },
  { id: "cmp_diwali", title: "Diwali hamper feature", catKey: "bakery", status: "live", pitches: 4, newPitches: 1, lo: 6000, hi: 9000, deliv: { reel: 1, post: 2, story: 4 }, blurb: "Festive gift hampers dropping soon — warm, beautifully styled content.", sizes: ["micro"], deadline: "1 month" },
  { id: "cmp_draft", title: "Weekend brunch pop-up", catKey: "cafe", status: "draft", pitches: 0, newPitches: 0, lo: 7000, hi: 10000, deliv: { reel: 1, post: 0, story: 3 }, blurb: "", sizes: ["nano", "micro"], deadline: "Flexible" },
];

export function makeCampaign(f: Omit<Campaign, "id" | "status" | "pitches" | "newPitches">): Campaign {
  return { id: "cmp_" + Date.now(), status: "live", pitches: 0, newPitches: 0, ...f };
}
