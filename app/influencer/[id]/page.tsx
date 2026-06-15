import Link from "next/link";
import { notFound } from "next/navigation";
import { Space_Grotesk } from "next/font/google";
import { getInfluencerById } from "@/lib/queries";
import { formatCount } from "@/lib/metrics";
import { InfluencerProfile } from "@/lib/types";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Gradient fallback — shown when no posts are seeded in the DB yet.
const FALLBACK_POSTS = [
  { id: 1, from: "#ffd6cc", to: "#ffb3a7", emoji: "🍜", likes: 2841 },
  { id: 2, from: "#ffc5b0", to: "#ff9e8a", emoji: "☕", likes: 1934 },
  { id: 3, from: "#ffdfb3", to: "#ffcc80", emoji: "🍛", likes: 3102 },
  { id: 4, from: "#ffd6e7", to: "#ffb3cc", emoji: "🥗", likes: 890 },
  { id: 5, from: "#ffe4cc", to: "#ffcc99", emoji: "🍰", likes: 2200 },
  { id: 6, from: "#ffc8d4", to: "#ffaab8", emoji: "🥘", likes: 1567 },
];

// Phase 3: replace with reviews table
const MOCK_REVIEWS = [
  {
    id: 1,
    business: "Third Wave Coffee",
    handle: "@thirdwave.ind",
    avatar: "☕",
    rating: 5,
    text: "Aisha's content drove a 40% spike in our footfall the week after posting. Professional, creative, zero hand-holding needed.",
    date: "May 2026",
    collab: "Reel + 3 Stories",
  },
  {
    id: 2,
    business: "Chai Nivas",
    handle: "@chainivas.ind",
    avatar: "🍵",
    rating: 5,
    text: "The reel she created for our monsoon menu got 2× our usual reach. Will absolutely work with her again.",
    date: "Apr 2026",
    collab: "Launch Combo",
  },
  {
    id: 3,
    business: "Bloom Patisserie",
    handle: "@bloompatisserie",
    avatar: "🎂",
    rating: 4,
    text: "Great storytelling, very authentic feel. Our bakery audience engagement was noticeably higher than with previous creators.",
    date: "Mar 2026",
    collab: "2 Posts + Stories",
  },
];

export default async function LookbookPage({
  params,
}: {
  params: { id: string };
}) {
  const inf = await getInfluencerById(params.id);
  if (!inf) notFound();

  return (
    <div
      className={`${spaceGrotesk.variable}`}
      style={{ fontFamily: "var(--font-grotesk), sans-serif" }}
    >
      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        .post-tile:hover .post-overlay { opacity: 1; }
        .post-tile:hover .post-emoji { transform: scale(0.85) translateY(-4px); opacity: 0.4; }
        .post-overlay { opacity: 0; transition: opacity 0.2s ease; }
        .post-emoji { transition: transform 0.2s ease, opacity 0.2s ease; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.12s; }
        .fade-up-3 { animation-delay: 0.19s; }
        .fade-up-4 { animation-delay: 0.26s; }
      `}</style>

      <main className="flex flex-1 flex-col pb-28" style={{ background: "#faf8f6" }}>

        {/* ── Top nav ──────────────────────────────────────── */}
        <header className="flex items-center gap-3 px-5 pt-5 pb-3">
          <Link
            href="/swipe"
            className="flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            ← Deck
          </Link>
          <span className="ml-auto text-xs font-semibold tracking-widest uppercase text-neutral-300">
            Lookbook
          </span>
        </header>

        {/* ── Hero ─────────────────────────────────────────── */}
        <section
          className="relative mx-4 rounded-3xl overflow-hidden fade-up fade-up-1"
          style={{
            background:
              "linear-gradient(145deg, #fff3ef 0%, #ffe8e4 40%, #ffd4cd 100%)",
          }}
        >
          {/* decorative rings */}
          <div
            className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-20"
            style={{ background: "#ff4d6d" }}
          />
          <div
            className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-10"
            style={{ background: "#ff4d6d" }}
          />

          <div className="relative p-6 pt-7">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div
                className="flex-shrink-0 h-20 w-20 rounded-2xl flex items-center justify-center text-3xl shadow-md"
                style={{ background: "linear-gradient(135deg, #ffb3a7, #ff6b8a)" }}
              >
                {inf.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={inf.avatarUrl} alt={inf.displayName} className="h-full w-full object-cover rounded-2xl" />
                ) : (
                  <span>🍜</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h1
                  className="text-2xl font-bold leading-tight text-[#1a0a08]"
                  style={{ fontFamily: "var(--font-grotesk), sans-serif", fontStyle: "italic" }}
                >
                  {inf.displayName}
                </h1>
                <p className="text-xs text-[#7a4040] mt-0.5 font-medium">
                  {inf.handle}
                </p>
                <p className="text-xs text-[#a05050] mt-0.5">
                  📍 {inf.location.city}
                </p>

                {/* Niches */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {inf.niches.map((n) => (
                    <span
                      key={n.id}
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: "rgba(255,77,109,0.12)", color: "#c9184a" }}
                    >
                      {n.subtopic ?? n.category}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bio quote */}
            {inf.bio && (
              <p
                className="mt-4 text-sm text-[#5a2a2a] leading-relaxed border-l-2 pl-3"
                style={{
                  fontFamily: "var(--font-grotesk), sans-serif",
                  fontStyle: "italic",
                  borderColor: "rgba(255,77,109,0.35)",
                }}
              >
                {inf.bio}
              </p>
            )}

            {/* Hero stats strip */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              <HeroStat value={formatCount(inf.stats.followers)} label="Followers" />
              <HeroStat value={`${inf.stats.engagementRate}%`} label="Engagement" accent />
              <HeroStat value={formatCount(inf.stats.avgViews)} label="Avg Views" />
            </div>
          </div>
        </section>

        {/* ── Recent Work ──────────────────────────────────── */}
        <section className="px-4 pt-7 fade-up fade-up-2">
          <SectionLabel
            title="Recent Work"
            sub={`${inf.posts.length || 6} posts · updated weekly`}
          />

          <div className="mt-3 grid grid-cols-3 gap-1 rounded-2xl overflow-hidden">
            {inf.posts.length > 0
              ? inf.posts.map((post) => (
                  <div
                    key={post.id}
                    className="post-tile relative aspect-square overflow-hidden cursor-pointer bg-neutral-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.thumbnailUrl}
                      alt={post.caption ?? ""}
                      className="post-img absolute inset-0 h-full w-full object-cover"
                    />
                    {/* hover overlay with engagement */}
                    <div
                      className="post-overlay absolute inset-0 flex flex-col items-center justify-center gap-1 text-white"
                      style={{ background: "rgba(10,0,0,0.58)" }}
                    >
                      <span className="text-[11px] font-semibold">❤️ {formatCount(post.likes)}</span>
                      <span className="text-[10px] opacity-85">💬 {post.comments}</span>
                      {post.caption && (
                        <span className="mt-1 line-clamp-2 px-2 text-center text-[9px] opacity-70 leading-tight">
                          {post.caption}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              : /* gradient fallback when no posts seeded */
                FALLBACK_POSTS.map((post) => (
                  <div
                    key={post.id}
                    className="post-tile relative aspect-square overflow-hidden cursor-pointer"
                  >
                    <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${post.from}, ${post.to})` }} />
                    <div className="post-emoji absolute inset-0 flex items-center justify-center text-3xl">{post.emoji}</div>
                    <div className="post-overlay absolute inset-0 flex flex-col items-center justify-center gap-1 text-white" style={{ background: "rgba(20,5,5,0.55)" }}>
                      <span className="text-[11px] font-semibold">❤️ {formatCount(post.likes)}</span>
                    </div>
                  </div>
                ))}
          </div>

          <style>{`
            .post-tile:hover .post-overlay { opacity: 1 !important; }
            .post-tile:hover .post-img { transform: scale(1.04); }
            .post-img { transition: transform 0.3s ease; }
          `}</style>

          <p className="mt-2 text-center text-[10px] text-neutral-400 tracking-wide">
            Hover / tap to see engagement
          </p>
        </section>

        {/* ── Brand Reviews ─────────────────────────────────── */}
        <section className="pt-7 fade-up fade-up-3">
          <div className="px-4">
            <SectionLabel
              title="What Brands Say"
              sub={`${MOCK_REVIEWS.length} verified collabs`}
            />
          </div>

          <div className="mt-3 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none">
            {MOCK_REVIEWS.map((r) => (
              <div
                key={r.id}
                className="flex-shrink-0 w-64 rounded-2xl p-4 flex flex-col gap-3"
                style={{ background: "#ffffff", border: "1px solid #f0ebe8", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
              >
                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-sm" style={{ color: i < r.rating ? "#f59e0b" : "#e5e7eb" }}>
                      ★
                    </span>
                  ))}
                  <span className="ml-auto text-[10px] text-neutral-400">{r.date}</span>
                </div>

                {/* Quote */}
                <p
                  className="text-sm text-[#3a2a2a] leading-snug flex-1"
                  style={{ fontFamily: "var(--font-grotesk), sans-serif", fontStyle: "italic" }}
                >
                  &ldquo;{r.text}&rdquo;
                </p>

                {/* Business */}
                <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: "#f5eeeb" }}>
                  <div
                    className="h-8 w-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #ffe4d4, #ffc5b0)" }}
                  >
                    {r.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-neutral-800 truncate">{r.business}</p>
                    <p className="text-[10px] text-neutral-400">{r.collab}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Add-review placeholder */}
            <div
              className="flex-shrink-0 w-36 rounded-2xl flex flex-col items-center justify-center gap-2 text-center"
              style={{ background: "#f5f0ed", border: "1.5px dashed #e0d5d0" }}
            >
              <span className="text-2xl">✍️</span>
              <p className="text-[11px] font-medium text-neutral-400 leading-tight px-3">
                Your review here after collab
              </p>
            </div>
          </div>
        </section>

        {/* ── By the Numbers ────────────────────────────────── */}
        <section className="px-4 pt-7 fade-up fade-up-4">
          <SectionLabel
            title="By the Numbers"
            sub={`Cached ${new Date(inf.stats.computedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} · ${inf.stats.postsSampled} posts sampled`}
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <BigStat label="Avg Likes" value={formatCount(inf.stats.avgLikes)} />
            <BigStat label="Avg Comments" value={formatCount(inf.stats.avgComments)} />
            <BigStat label="Reach 24h" value={formatCount(inf.stats.reach24h)} />
            <BigStat label="Profile Views" value={formatCount(inf.stats.profileViews24h)} />
          </div>
        </section>

        {/* ── Audience ─────────────────────────────────────── */}
        <AudienceSection inf={inf} />

        {/* ── Services ─────────────────────────────────────── */}
        <section className="px-4 pt-7">
          <SectionLabel title="Services & Packages" />

          <div
            className="mt-3 rounded-2xl overflow-hidden divide-y"
            style={{ background: "#ffffff", border: "1px solid #f0ebe8" }}
          >
            {inf.services.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium text-neutral-800">{s.title}</p>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{s.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.negotiable && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: "#fff3cd", color: "#856404" }}
                    >
                      negotiable
                    </span>
                  )}
                  <span className="text-sm font-semibold text-neutral-900">
                    ₹{s.price?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {inf.packages.length > 0 && (
            <div className="mt-2 flex flex-col gap-2">
              {inf.packages.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl p-4"
                  style={{
                    background: "linear-gradient(135deg, #fff3ef, #ffe8e4)",
                    border: "1px solid rgba(255,77,109,0.15)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-[#1a0a08]">{p.name}</p>
                      <p className="text-xs text-[#7a4040] mt-0.5">{p.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold" style={{ color: "#c9184a" }}>
                        ₹{p.price?.toLocaleString("en-IN")}
                      </p>
                      {p.negotiable && (
                        <span className="text-[10px]" style={{ color: "#c9184a" }}>negotiable</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* ── Fixed CTA ─────────────────────────────────────── */}
      <div
        className="fixed inset-x-0 bottom-0 mx-auto max-w-md px-4 py-3"
        style={{
          background: "rgba(250,248,246,0.85)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <button
          className="w-full rounded-2xl py-4 font-semibold text-white text-base active:scale-[0.98] transition-transform"
          style={{
            background: "linear-gradient(135deg, #ff4d6d, #c9184a)",
            boxShadow: "0 8px 24px rgba(255,77,109,0.35)",
          }}
        >
          Send Pitch →
        </button>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────── */

function HeroStat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-xl py-2.5 px-1 text-center"
      style={{
        background: accent ? "rgba(255,77,109,0.1)" : "rgba(255,255,255,0.55)",
      }}
    >
      <p
        className="text-lg font-bold leading-none"
        style={{
          color: accent ? "#c9184a" : "#1a0a08",
          fontFamily: "var(--font-grotesk), sans-serif",
        }}
      >
        {value}
      </p>
      <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-[#a05050]">
        {label}
      </p>
    </div>
  );
}

function SectionLabel({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2
        className="text-lg font-bold text-[#1a0a08]"
        style={{ fontFamily: "var(--font-grotesk), sans-serif" }}
      >
        {title}
      </h2>
      {sub && <p className="text-[10px] text-neutral-400">{sub}</p>}
    </div>
  );
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "#ffffff", border: "1px solid #f0ebe8" }}
    >
      <p
        className="text-2xl font-bold text-[#1a0a08] leading-none"
        style={{ fontFamily: "var(--font-grotesk), sans-serif" }}
      >
        {value}
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
        {label}
      </p>
    </div>
  );
}

function AudienceSection({ inf }: { inf: InfluencerProfile }) {
  const d = inf.demographics;
  const hasData =
    Object.keys(d.ageBuckets).length > 0 ||
    Object.keys(d.genderSplit).length > 0 ||
    d.topLocations.length > 0;

  if (!hasData) return null;

  return (
    <section className="px-4 pt-7">
      <SectionLabel title="Audience" />
      <div
        className="mt-3 rounded-2xl p-4 space-y-5"
        style={{ background: "#ffffff", border: "1px solid #f0ebe8" }}
      >
        {Object.keys(d.ageBuckets).length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">Age</p>
            <div className="space-y-1.5">
              {Object.entries(d.ageBuckets).map(([k, v]) => (
                <AudienceBar key={k} label={k} pct={v} />
              ))}
            </div>
          </div>
        )}
        {Object.keys(d.genderSplit).length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">Gender</p>
            <div className="space-y-1.5">
              {Object.entries(d.genderSplit).map(([k, v]) => (
                <AudienceBar key={k} label={k} pct={v} />
              ))}
            </div>
          </div>
        )}
        {d.topLocations.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">Top locations</p>
            <div className="space-y-1.5">
              {d.topLocations.map((l) => (
                <AudienceBar key={l.city} label={l.city} pct={l.pct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function AudienceBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 text-right text-[11px] text-neutral-500 flex-shrink-0 capitalize">{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#f0ebe8" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #ff4d6d, #ff8fa3)",
          }}
        />
      </div>
      <span className="w-9 text-[11px] font-medium text-neutral-500 flex-shrink-0">{pct}%</span>
    </div>
  );
}
