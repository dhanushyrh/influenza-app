/**
 * seed-images.mjs
 * Downloads stock photos from Picsum Photos (free, no API key),
 * uploads them to Supabase Storage, and seeds the database with URLs.
 *
 * Run: node scripts/seed-images.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));

// ── Load .env ────────────────────────────────────────────────────────────────
const env = Object.fromEntries(
  readFileSync(resolve(__dir, "../.env"), "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
    .filter(([k]) => k)
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Helpers ──────────────────────────────────────────────────────────────────
async function download(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function upload(bucket, path, bytes) {
  const { error } = await admin.storage
    .from(bucket)
    .upload(path, bytes, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(`Upload error (${bucket}/${path}): ${error.message}`);
  return admin.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

function ok(msg) { console.log(`  ✓ ${msg}`); }
function info(msg) { console.log(`\n── ${msg}`); }

// ── Data definitions ─────────────────────────────────────────────────────────
// Picsum Photos: https://picsum.photos/seed/<seed>/WxH
// Seeds are arbitrary strings — same seed → same image every time.

const INFLUENCERS = [
  {
    handle: "@aisha.eats",
    avatarSeed: "portrait-woman-cafe",
    captions: [
      "Hidden café find in Indiranagar 🍜",
      "That first sip feeling ☕",
      "Bowl goals at @thirdwave ✨",
      "Sunday brunch done right 🥗",
      "Street food series: ep 4 🌮",
      "Rating every ramen in Bengaluru 🍜",
    ],
  },
  {
    handle: "@rohan.bites",
    avatarSeed: "portrait-man-street",
    captions: [
      "Cart to table: Malleswaram edition 🌶️",
      "Dosa at 7am hits different 🫓",
      "Found the best chaat in BLR 🔥",
      "Eid special: biryani crawl 🍛",
      "Street food Friday 🍢",
      "This chutney deserves its own page 🟢",
    ],
  },
  {
    handle: "@priya.plates",
    avatarSeed: "portrait-woman-dining",
    captions: [
      "Fine dining, real talk 🍷",
      "When plating is art 🎨",
      "10-course review: worth it? 🤔",
      "Soufflé season 🍮",
      "The truffle pasta that broke my wallet 🍝",
      "Dessert menu deep-dive 🍰",
    ],
  },
  {
    handle: "@karaneats",
    avatarSeed: "portrait-man-food",
    captions: [
      "Udupi to Ulsoor: my best bets 🍛",
      "Idli crisp enough to shatter 💥",
      "Filter coffee > everything ☕",
      "Gunpowder dosa challenge 🔥",
      "The MTR breakfast experience 🏆",
      "Rating Bengaluru's coconut chutney 🥥",
    ],
  },
  {
    handle: "@snehaforks",
    avatarSeed: "portrait-woman-coffee",
    captions: [
      "Café crawl: HSR edition ☕",
      "Croissant tier list: Bengaluru 🥐",
      "Matcha or oat latte? I tried both 🍵",
      "Cozy corner found 🪴",
      "Best work-from-café spots in BLR 💻",
      "Saturday morning ritual ✨",
    ],
  },
];

// Picsum seeds for 6 posts per influencer (indexed by position)
const POST_SEEDS = [
  ["food-cafe-1", "food-cafe-2", "food-cafe-3", "food-street-1", "food-bowl-1", "food-coffee-1"],
  ["street-food-1", "street-food-2", "dosa-1", "biryani-1", "chaat-1", "street-food-3"],
  ["fine-dining-1", "restaurant-1", "plating-1", "dessert-1", "pasta-1", "dessert-2"],
  ["south-food-1", "idli-1", "filter-coffee-1", "dosa-2", "breakfast-1", "chutney-1"],
  ["cafe-crawl-1", "croissant-1", "matcha-1", "cafe-corner-1", "latte-1", "cafe-table-1"],
];

const BUSINESSES = [
  {
    handle: "@thirdwave.ind",
    posts: [
      { caption: "Our single-origin Ethiopia Yirgacheffe is here ☕", likes: 1240, position: 0 },
      { caption: "Cold brew season officially open 🧊", likes: 890, position: 1 },
      { caption: "Coworking mornings ☁️", likes: 634, position: 2 },
      { caption: "New: oat milk cortado on the menu 🌿", likes: 1102, position: 3 },
      { caption: "Weekend masterclass: pour-over 101", likes: 720, position: 4 },
      { caption: "Our barista @jay.brews won regional 🏆", likes: 2100, position: 5 },
    ],
  },
  {
    handle: "@chainivas.ind",
    posts: [
      { caption: "Masala chai + millet biscuits = perfection 🍵", likes: 680, position: 0 },
      { caption: "Monsoon menu: kadak adrak chai 🌧️", likes: 940, position: 1 },
      { caption: "Our clay cups arrived ☺️", likes: 543, position: 2 },
      { caption: "Brewing process reel — link in bio 🎬", likes: 810, position: 3 },
      { caption: "Koramangala 5th block, every morning 📍", likes: 430, position: 4 },
      { caption: "Tea sommelier session this Sunday 🫖", likes: 1230, position: 5 },
    ],
  },
];

const BIZ_SEEDS = [
  ["coffee-shop-1", "cold-brew-1", "cafe-morning-1", "latte-art-1", "barista-1", "coffee-award-1"],
  ["chai-cup-1", "masala-chai-1", "clay-cup-1", "tea-brew-1", "morning-tea-1", "tea-pot-1"],
];

// ── Main ─────────────────────────────────────────────────────────────────────
console.log("🌱  Influenza image seeder");
console.log(`    Supabase: ${SUPABASE_URL}`);

// 1. Influencer avatars + posts
info("Influencer avatars");
for (const inf of INFLUENCERS) {
  const avatarBytes = await download(
    `https://picsum.photos/seed/${inf.avatarSeed}/400/400`
  );
  const storagePath = `${inf.handle.replace("@", "")}/avatar.jpg`;
  const avatarUrl = await upload("avatars", storagePath, avatarBytes);

  const { error } = await admin
    .from("influencer_profiles")
    .update({ avatar_url: avatarUrl })
    .eq("handle", inf.handle);

  if (error) console.warn(`  ⚠ avatar DB update failed for ${inf.handle}: ${error.message}`);
  else ok(`${inf.handle} avatar → ${avatarUrl.split("/").pop()}`);
}

info("Influencer recent posts");
for (let i = 0; i < INFLUENCERS.length; i++) {
  const inf = INFLUENCERS[i];
  const seeds = POST_SEEDS[i];

  // Fetch profile ID
  const { data: profile } = await admin
    .from("influencer_profiles")
    .select("id")
    .eq("handle", inf.handle)
    .single();

  if (!profile) { console.warn(`  ⚠ profile not found: ${inf.handle}`); continue; }

  // Delete existing posts so re-runs are idempotent
  await admin.from("influencer_posts").delete().eq("influencer_id", profile.id);

  for (let pos = 0; pos < 6; pos++) {
    const thumbBytes = await download(
      `https://picsum.photos/seed/${seeds[pos]}/600/600`
    );
    const storagePath = `${inf.handle.replace("@", "")}/post-${pos}.jpg`;
    const thumbUrl = await upload("post-thumbs", storagePath, thumbBytes);

    await admin.from("influencer_posts").insert({
      influencer_id: profile.id,
      thumbnail_url: thumbUrl,
      caption: inf.captions[pos],
      likes: Math.floor(Math.random() * 3000) + 400,
      comments: Math.floor(Math.random() * 200) + 20,
      posted_at: new Date(Date.now() - pos * 4 * 24 * 60 * 60 * 1000).toISOString(),
      position: pos,
    });
  }
  ok(`${inf.handle}: 6 posts seeded`);
}

// 2. Business post thumbnails
info("Business posts");
for (let i = 0; i < BUSINESSES.length; i++) {
  const biz = BUSINESSES[i];
  const seeds = BIZ_SEEDS[i];

  const { data: profile } = await admin
    .from("business_profiles")
    .select("id")
    .eq("handle", biz.handle)
    .single();

  if (!profile) { console.warn(`  ⚠ business not found: ${biz.handle}`); continue; }

  await admin.from("business_posts").delete().eq("business_id", profile.id);

  for (const post of biz.posts) {
    const thumbBytes = await download(
      `https://picsum.photos/seed/${seeds[post.position]}/600/600`
    );
    const storagePath = `${biz.handle.replace("@", "")}/post-${post.position}.jpg`;
    const thumbUrl = await upload("post-thumbs", storagePath, thumbBytes);

    await admin.from("business_posts").insert({
      business_id: profile.id,
      thumbnail_url: thumbUrl,
      caption: post.caption,
      position: post.position,
    });
  }
  ok(`${biz.handle}: 6 posts seeded`);
}

console.log("\n✅  Done. All images uploaded to Supabase Storage and DB updated.");
