// Idempotent demo enrichment: creates/links Supabase Auth users (so username
// login works), sets stock images, and seeds 3 published creators + posts.
//
// Run with the service-role key:
//   NEXT_PUBLIC_SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/seed-demo.mjs
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
const sb = createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const IMG = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

const CREATORS = [
  {
    ig: "ig_1001", handle: "@aisha.eats", username: "aisha.eats", name: "Aisha Khan",
    email: "aisha@example.com", password: "taste123",
    bio: "Hunting Bengaluru's best flat whites & hidden brunch spots ☕ honest reviews, warm light.",
    cats: ["cafe"], avatar: IMG("1438761681033-6461ffad8d80"), cover: IMG("1495474472287-4d71bcdd2085"),
    stats: { followers: 8200, avg_views: 21400, avg_likes: 1280, avg_comments: 96 },
    demo: { age: '{"13-17":4,"18-24":47,"25-34":33,"35-44":11,"45+":5}', gender: '{"male":35,"female":64,"other":1}' },
    services: [["reel", 6000, true], ["post", 3000, false], ["story", 1500, false]],
    pkg: ["Café Launch Combo", "1 reel · 1 post · 3 stories", 9000],
    posts: [
      [IMG("1509042239860-f550ce710b93"), "the cold brew flight everyone's talking about", 3120],
      [IMG("1461023058943-07fcbe16d735"), "latte art that hits different", 1980],
      [IMG("1447933601403-0c6688de566e"), "slow mornings, specialty beans", 2240],
      [IMG("1555507036-ab1f4038808a"), "buttery croissants in Indiranagar", 1640],
      [IMG("1509440159596-0249088772ff"), "the bakery case at 8am", 1120],
      [IMG("1486427944299-d1955d23e34d"), "tres leches but make it filter coffee", 1410],
    ],
  },
  {
    ig: "ig_seed_karan", handle: "@karaneats", username: "karaneats", name: "Karan Shetty",
    email: "karan@example.com", password: "street123",
    bio: "Chaat, kebabs, midnight dosa runs. Smoky, spicy and under ₹200 — I've probably filmed it.",
    cats: ["street"], avatar: IMG("1500648767791-00dcc994a43e"), cover: IMG("1504674900247-0877df9cc836"),
    stats: { followers: 22100, avg_views: 64200, avg_likes: 3180, avg_comments: 214 },
    demo: { age: '{"13-17":6,"18-24":44,"25-34":34,"35-44":12,"45+":4}', gender: '{"male":58,"female":41,"other":1}' },
    services: [["reel", 12000, true], ["post", 6000, false], ["story", 3000, false]],
    pkg: ["Street Hype Combo", "1 reel · 1 post · 3 stories", 18000],
    posts: [
      [IMG("1565299624946-b28f40a0ae38"), "₹50 slices that hit different 🔥", 5120],
      [IMG("1567620905732-2d1ec7ab7445"), "the cart with a 1-hour wait", 7240],
      [IMG("1504674900247-0877df9cc836"), "thali belt of Bengaluru", 2980],
      [IMG("1490645935967-10de6ba17061"), "late-night comfort plates", 4410],
      [IMG("1546069901-ba9599a7e63c"), "does it slap? a taste test", 2110],
      [IMG("1512621776951-a57141f2eefd"), "midnight food run, sorted", 3980],
    ],
  },
  {
    ig: "ig_seed_devika", handle: "@devikadrinks", username: "devikadrinks", name: "Devika Iyer",
    email: "devika@example.com", password: "drinks123",
    bio: "Cocktail menus, rooftop launches, after-dark Bengaluru. Macro reach with a crowd that shows up.",
    cats: ["bar"], avatar: IMG("1438761681033-6461ffad8d80"), cover: IMG("1551024709-8f23befc6f87"),
    stats: { followers: 31800, avg_views: 92400, avg_likes: 4120, avg_comments: 286 },
    demo: { age: '{"13-17":0,"18-24":36,"25-34":47,"35-44":13,"45+":4}', gender: '{"male":41,"female":58,"other":1}' },
    services: [["reel", 18000, true], ["post", 9000, false], ["story", 4500, false]],
    pkg: ["Launch Night Combo", "1 reel · 1 post · 4 stories", 26000],
    posts: [
      [IMG("1514362545857-3bc16c4c7d1b"), "the negroni flight at the new rooftop", 6240],
      [IMG("1470337458703-46ad1756a187"), "sundowners, ranked", 5410],
      [IMG("1551024709-8f23befc6f87"), "launch night was unreal ✨", 3120],
      [IMG("1515823662972-da6a2e4d3002"), "natural wine bar crawl", 2680],
      [IMG("1461023058943-07fcbe16d735"), "after-dark, cinematic edits", 4480],
      [IMG("1509042239860-f550ce710b93"), "best skyline bars in the city", 2010],
    ],
  },
];

async function ensureAuthUser(email, password) {
  // create; if already registered, find and reset password to the known value
  const created = await sb.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.data?.user?.id) return created.data.user.id;
  // find existing by paging listUsers
  for (let page = 1; page <= 10; page++) {
    const { data } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    const u = data?.users?.find((x) => (x.email || "").toLowerCase() === email.toLowerCase());
    if (u) { await sb.auth.admin.updateUserById(u.id, { password, email_confirm: true }); return u.id; }
    if (!data?.users?.length || data.users.length < 200) break;
  }
  throw new Error("could not create or find auth user for " + email);
}

async function svcId(code) {
  const { data } = await sb.from("service_types").select("id").eq("code", code).maybeSingle();
  return data?.id;
}
async function locId() {
  const { data } = await sb.from("locations").select("id").eq("city", "Bengaluru").maybeSingle();
  return data?.id;
}

async function upsertCreator(c) {
  const authId = await ensureAuthUser(c.email, c.password);

  // app_users — match an existing row by username or ig_user_id, else insert.
  let userId;
  const byName = await sb.from("app_users").select("id").eq("username", c.username).maybeSingle();
  const byIg = byName.data ? { data: null } : await sb.from("app_users").select("id").eq("ig_user_id", c.ig).maybeSingle();
  userId = byName.data?.id ?? byIg.data?.id;
  if (userId) {
    const upd = await sb.from("app_users").update({ role: "influencer", email: c.email, username: c.username, ig_account_type: "creator", auth_user_id: authId }).eq("id", userId);
    if (upd.error) throw new Error("app_users update " + c.handle + ": " + upd.error.message);
  } else {
    const ins = await sb.from("app_users").insert({ role: "influencer", email: c.email, username: c.username, ig_user_id: c.ig, ig_account_type: "creator", auth_user_id: authId }).select("id").single();
    if (ins.error) throw new Error("app_users insert " + c.handle + ": " + ins.error.message);
    userId = ins.data.id;
  }

  // profile (match by user_id)
  const location_id = await locId();
  const profRes = await sb.from("influencer_profiles")
    .upsert({
      user_id: userId, display_name: c.name, handle: c.handle, bio: c.bio, location_id,
      avatar_url: c.avatar, cover_url: c.cover, coverage_cities: ["Bengaluru"],
      creator_categories: c.cats, available: true, published: true,
    }, { onConflict: "user_id" })
    .select("id").single();
  if (profRes.error) throw new Error("influencer_profiles " + c.handle + ": " + profRes.error.message);
  const infId = profRes.data.id;

  await sb.from("influencer_stats").upsert({ influencer_id: infId, ...c.stats, posts_sampled: 12 }, { onConflict: "influencer_id" });
  await sb.from("audience_demographics").upsert({ influencer_id: infId, age_buckets: JSON.parse(c.demo.age), gender_split: JSON.parse(c.demo.gender) }, { onConflict: "influencer_id" });

  // services
  for (const [code, price, negotiable] of c.services) {
    const sid = await svcId(code);
    if (sid) await sb.from("influencer_services").upsert({ influencer_id: infId, service_type_id: sid, price, negotiable, active: true }, { onConflict: "influencer_id,service_type_id" });
  }
  // package (replace)
  await sb.from("service_packages").delete().eq("influencer_id", infId);
  await sb.from("service_packages").insert({ influencer_id: infId, name: c.pkg[0], description: c.pkg[1], price: c.pkg[2], negotiable: true, active: true });

  // posts (replace)
  await sb.from("influencer_posts").delete().eq("influencer_id", infId);
  await sb.from("influencer_posts").insert(c.posts.map(([thumbnail_url, caption, likes], i) => ({
    influencer_id: infId, thumbnail_url, caption, likes, comments: Math.round(likes * 0.06), position: i,
  })));

  console.log(`✓ ${c.name}  (login: ${c.username} / ${c.password})`);
}

async function fixBusinessLogin() {
  // ensure the demo business can log in with a known password
  const { data: u } = await sb.from("app_users").select("id, email").eq("username", "thirdwave.ind").maybeSingle();
  if (u?.email) {
    const authId = await ensureAuthUser(u.email, "brew1234");
    await sb.from("app_users").update({ auth_user_id: authId }).eq("id", u.id);
    await sb.from("business_profiles").update({ approved: true }).eq("user_id", u.id);
    console.log(`✓ Business  (login: thirdwave.ind / brew1234)`);
  }
}

for (const c of CREATORS) await upsertCreator(c);
await fixBusinessLogin();
console.log("Done.");
