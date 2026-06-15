"use client";

import { useEffect, useState } from "react";
import { T, inr, kfmt } from "@/lib/ob-tokens";
import { CREATOR_CATEGORIES, SERVICE_CATALOG } from "@/lib/ob-data";
import { Icon } from "@/components/ob-icons";
import {
  Spinner, Avatar, Pill, Btn, Field, Chip,
  WizardChrome, StepHead, SectionLabel, Footer, OBSheet, PriceRow, PendingCard,
} from "@/components/ob-primitives";

// ── Types ──
interface Service {
  id: string; code: string; title: string; emoji?: string;
  price: number; negotiable: boolean; custom?: boolean; desc?: string;
}
interface Package {
  id: string; name: string; price: number; negotiable: boolean;
  items: { code: string; title: string; emoji?: string; qty: number }[];
}
interface WizardForm {
  name: string; handle: string; email: string; phone: string;
  cities: string[]; video: boolean;
  categories: string[];
  services: Service[]; packages: Package[];
  password: string; confirmPassword: string;
}

type Step = "ig" | "details" | "location" | "video" | "category" | "services" | "password" | "done";
const C_STEPS: Step[] = ["ig", "details", "location", "video", "category", "services", "password"];
const TOTAL = C_STEPS.length;

let _sid = 100;
const nid = () => "s" + ++_sid;

const FETCH_STEPS = [
  "Verifying your identity",
  "Pulling profile & bio",
  "Crunching 90 days of insights",
  "Caching your reach & engagement",
];

// ── IGConnect step ──
function IGConnectStep({ token, igConfigured, igConnected, persona, onBack }: {
  token: string; igConfigured: boolean; igConnected: boolean;
  persona: { name: string; handle: string }; onBack: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "connecting" | "done">(
    igConnected ? "done" : "idle"
  );
  const [doneCount, setDoneCount] = useState(igConnected ? FETCH_STEPS.length : 0);

  useEffect(() => {
    if (phase !== "connecting") return;
    let i = 0;
    const t = setInterval(() => {
      i += 1; setDoneCount(i);
      if (i >= FETCH_STEPS.length) { clearInterval(t); setTimeout(() => setPhase("done"), 350); }
    }, 480);
    return () => clearInterval(t);
  }, [phase]);

  const igHref = igConfigured
    ? `/api/auth/instagram?role=creator&token=${encodeURIComponent(token)}`
    : undefined; // mock handled inline

  return (
    <div style={{ height: "100svh", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <WizardChrome label="Creator sign-up" step={1} total={TOTAL} onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "22px 18px 8px" }}>
        {phase !== "done" ? (
          <>
            <StepHead emoji="🔗" title="Connect Instagram" sub="We verify it's really you and pull your reach & engagement automatically. We never post on your behalf." />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 999, background: T.mintTint, marginBottom: 16 }}>
              <Icon name="verified" size={15} c={T.mint} />
              <span style={{ fontFamily: T.body, fontSize: 12, fontWeight: 650, color: T.mintInk }}>Invite verified ✓</span>
            </div>

            <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, padding: 4, marginBottom: 16 }}>
              <ReqRow icon="verified" text="Professional account required" sub="Business or Creator — for the insights API" />
              <div style={{ height: 1, background: T.lineSoft, margin: "0 14px" }} />
              <ReqRow icon="shield" text="Read-only & private" sub="We can't post, DM, or see your password" />
            </div>

            {phase === "connecting" && (
              <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, padding: "14px 16px", marginBottom: 8 }}>
                {FETCH_STEPS.map((s, i) => {
                  const done = i < doneCount, active = i === doneCount;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", opacity: done || active ? 1 : 0.4 }}>
                      {done ? <Icon name="checkCircle" size={18} c={T.mint} /> : active ? <Spinner size={18} /> : <div style={{ width: 18, height: 18, borderRadius: 999, border: `2px solid ${T.line}` }} />}
                      <span style={{ fontFamily: T.body, fontSize: 13, color: done ? T.ink2 : T.ink, fontWeight: active ? 650 : 500 }}>{s}{done ? "" : active ? "…" : ""}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <ConnectedCard name={persona.name} handle={persona.handle} />
        )}
      </div>

      {phase === "done" ? null : (
        <div style={{ padding: "10px 16px 22px", background: T.bg, borderTop: `1px solid ${T.line}` }}>
          {igHref ? (
            <a href={igHref} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 11,
              width: "100%", height: 54, borderRadius: 16, border: `1px solid ${T.line}`,
              background: "#fff", fontFamily: T.body, fontSize: 16, fontWeight: 700, color: T.ink,
              textDecoration: "none",
            }}>
              <span style={{ width: 28, height: 28, borderRadius: 9, background: "linear-gradient(135deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="instagram" size={18} c="#fff" />
              </span>
              Continue with Instagram
            </a>
          ) : (
            <button
              onClick={() => phase === "idle" && setPhase("connecting")}
              disabled={phase === "connecting"}
              style={{
                width: "100%", height: 54, borderRadius: 16, border: `1px solid ${T.line}`,
                background: "#fff", cursor: phase === "connecting" ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 11,
                fontFamily: T.body, fontSize: 16, fontWeight: 700, color: T.ink,
              }}
            >
              {phase === "connecting" ? <Spinner size={20} /> : (
                <span style={{ width: 28, height: 28, borderRadius: 9, background: "linear-gradient(135deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="instagram" size={18} c="#fff" />
                </span>
              )}
              {phase === "connecting" ? "Connecting…" : "Continue with Instagram (mock)"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ReqRow({ icon, text, sub }: { icon: "verified" | "shield"; text: string; sub: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 14px" }}>
      <Icon name={icon} size={19} c={T.ink2} />
      <div>
        <p style={{ margin: 0, fontFamily: T.body, fontSize: 13.5, fontWeight: 650, color: T.ink }}>{text}</p>
        <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>{sub}</p>
      </div>
    </div>
  );
}

function ConnectedCard({ name, handle }: { name: string; handle: string }) {
  return (
    <>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 999, background: T.mintTint, marginBottom: 14, animation: "fadeIn .3s ease" }}>
        <Icon name="checkCircle" size={16} c={T.mint} />
        <span style={{ fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: T.mintInk }}>Instagram connected</span>
      </div>
      <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 6px 20px rgba(31,17,16,0.06)", animation: "fadeIn .3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16 }}>
          <Avatar emoji="🍜" from="#ffd1c4" to="#ff8f74" size={54} r={16} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 17, color: T.ink }}>{name || "Your name"}</p>
              <Icon name="verified" size={15} c="#3897f0" />
            </div>
            <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 12.5, color: T.ink3 }}>{handle || "@yourhandle"}</p>
            <span style={{ display: "inline-block", marginTop: 5, fontFamily: T.body, fontSize: 10.5, fontWeight: 700, color: T.ink2, background: T.bg, padding: "2px 8px", borderRadius: 999 }}>Creator account</span>
          </div>
        </div>
        <div style={{ padding: "10px 14px 14px", borderTop: `1px solid ${T.lineSoft}` }}>
          <p style={{ margin: "0 0 8px", fontFamily: T.body, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3, color: T.ink3, textTransform: "uppercase" }}>Recent posts pulled</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 5 }}>
            {[["#ffd6cc","#ffb3a7"],["#ffc5b0","#ff9e8a"],["#ffdfb3","#ffcc80"],["#ffd6e7","#ffb3cc"],["#ffe4cc","#ffcc99"],["#ffc8d4","#ffaab8"]].map(([f, t], i) => (
              <div key={i} style={{ aspectRatio: "1", borderRadius: 9, background: `linear-gradient(135deg,${f},${t})` }} />
            ))}
          </div>
        </div>
      </div>
      <p style={{ margin: "12px 4px 0", fontFamily: T.body, fontSize: 11.5, color: T.ink3, lineHeight: 1.5 }}>
        Looks good? We'll refresh these stats automatically every week so your profile always shows live numbers.
      </p>
    </>
  );
}

// ── Step: Details ──
function DetailsStep({ form, set }: { form: WizardForm; set: (p: Partial<WizardForm>) => void }) {
  return (
    <div>
      <StepHead title="Your details" sub="Prefilled from Instagram — tweak anything that's off." />
      <Field label="Display name" icon="user" value={form.name} onChange={(v) => set({ name: v })} placeholder="Your name" />
      <Field label="Instagram handle" icon="instagram" value={form.handle} locked verified />
      <Field label="Email" icon="mail" type="email" value={form.email} onChange={(v) => set({ email: v })} placeholder="you@email.com" />
      <Field label="Phone number" icon="phone" type="tel" prefix="+91" value={form.phone} onChange={(v) => set({ phone: v.replace(/[^0-9]/g, "").slice(0, 10) })} placeholder="98765 43210" hint="Used for booking alerts & payouts. Never shown publicly." />
    </div>
  );
}

// ── Step: Location ──
const MAX_CITIES = 3;

function LocationStep({ form, set }: { form: WizardForm; set: (p: Partial<WizardForm>) => void }) {
  const [allCities, setAllCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/cities")
      .then((r) => r.json())
      .then((d) => setAllCities(d.cities ?? []))
      .catch(() => setAllCities([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = allCities
    .filter((c) => !form.cities.includes(c) && c.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  function selectCity(c: string) {
    if (form.cities.length < MAX_CITIES) set({ cities: [...form.cities, c] });
    setQuery("");
    setOpen(false);
  }

  function removeCity(c: string) {
    set({ cities: form.cities.filter((x) => x !== c) });
  }

  const atMax = form.cities.length >= MAX_CITIES;

  return (
    <div>
      <StepHead emoji="📍" title="Where are you based?" sub="Pick up to 3 cities — we'll match you to nearby businesses in each." />

      {form.cities.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14, animation: "fadeIn .2s ease" }}>
          {form.cities.map((c, i) => (
            <div key={c} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px 5px 6px", borderRadius: 999, background: T.roseTint, border: `1px solid ${T.roseTint2}` }}>
              <span style={{ width: 18, height: 18, borderRadius: 999, background: T.rose, color: "#fff", fontFamily: T.display, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: T.roseDark }}>{c}</span>
              <button onClick={() => removeCity(c)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, marginLeft: 2 }}>
                <Icon name="x" size={13} c={T.roseDark} w={2.4} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!atMax && (
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 13px", height: 48, borderRadius: 14, background: "#fff", border: `1.5px solid ${open ? T.rose : T.line}`, transition: "border-color .15s" }}>
            <Icon name="search" size={17} c={T.ink3} />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder={loading ? "Loading cities…" : "Search cities…"}
              disabled={loading}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: T.body, fontSize: 15, color: T.ink, minWidth: 0 }}
            />
            {loading && <Spinner size={16} />}
          </div>

          {open && filtered.length > 0 && (
            <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 14, boxShadow: "0 8px 24px rgba(31,17,16,0.10)", overflow: "hidden", zIndex: 20 }}>
              {filtered.map((c, i) => (
                <button
                  key={c}
                  onMouseDown={(e) => { e.preventDefault(); selectCity(c); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderBottom: i < filtered.length - 1 ? `1px solid ${T.lineSoft}` : "none" }}
                >
                  <Icon name="pin" size={15} c={T.rose} />
                  <span style={{ fontFamily: T.body, fontSize: 14, fontWeight: 550, color: T.ink }}>{c}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
        <span style={{ fontFamily: T.body, fontSize: 12, color: T.ink3 }}>
          {atMax ? "Maximum cities reached — remove one to change" : `Select up to ${MAX_CITIES} cities`}
        </span>
        <span style={{ fontFamily: T.body, fontSize: 12, fontWeight: 700, color: atMax ? T.rose : T.ink3 }}>
          {form.cities.length}/{MAX_CITIES}
        </span>
      </div>
    </div>
  );
}

// ── Step: Video ──
function VideoStep({ form, set }: { form: WizardForm; set: (p: Partial<WizardForm>) => void }) {
  const [st, setSt] = useState<"empty" | "uploading" | "ready">(form.video ? "ready" : "empty");

  useEffect(() => {
    if (st !== "uploading") return;
    const t = setTimeout(() => { setSt("ready"); set({ video: true }); }, 1300);
    return () => clearTimeout(t);
  }, [st, set]);

  return (
    <div>
      <StepHead emoji="🎥" title="Add a 30–60s intro" sub="A short portrait video businesses see first on your Lookbook. Talk about your niche, your vibe, and why brands love working with you." />
      {st === "ready" ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ position: "relative", width: 168, aspectRatio: "9/16", borderRadius: 20, overflow: "hidden", background: "linear-gradient(160deg,#2a1a18,#5a3a34)", boxShadow: "0 12px 30px rgba(31,17,16,0.25)" }}>
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 10px, transparent 10px 20px)" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 999, background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
                <Icon name="play" size={24} c={T.roseDark} fill={T.roseDark} />
              </div>
            </div>
            <div style={{ position: "absolute", top: 10, left: 10 }}>
              <Pill style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}>● 0:48</Pill>
            </div>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 14, color: T.mintInk, fontFamily: T.body, fontSize: 12.5, fontWeight: 650 }}>
            <Icon name="checkCircle" size={16} c={T.mint} /> Looks great — duration in range
          </div>
          <button onClick={() => { setSt("empty"); set({ video: false }); }} style={{ marginTop: 10, background: "none", border: "none", cursor: "pointer", fontFamily: T.body, fontSize: 13, fontWeight: 650, color: T.ink3, textDecoration: "underline" }}>Replace video</button>
        </div>
      ) : (
        <>
          <button
            onClick={() => st === "empty" && setSt("uploading")}
            disabled={st === "uploading"}
            style={{
              width: "100%", border: `1.5px dashed ${st === "uploading" ? T.rose : "#d8ccc7"}`,
              background: st === "uploading" ? T.roseTint : "#fff",
              borderRadius: 20, padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, cursor: st === "uploading" ? "default" : "pointer",
            }}
          >
            {st === "uploading" ? <Spinner size={32} /> : (
              <div style={{ width: 58, height: 58, borderRadius: 17, background: T.roseTint, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="video" size={28} c={T.rose} />
              </div>
            )}
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink }}>{st === "uploading" ? "Uploading…" : "Record or upload"}</p>
              <p style={{ margin: "4px 0 0", fontFamily: T.body, fontSize: 12.5, color: T.ink3 }}>{st === "uploading" ? "Checking duration & format" : "Portrait · 30–60 seconds · MP4 or MOV"}</p>
            </div>
          </button>
          <div style={{ marginTop: 16, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 14, padding: "13px 15px" }}>
            <p style={{ margin: "0 0 8px", fontFamily: T.body, fontSize: 11, fontWeight: 700, color: T.ink3, letterSpacing: 0.3, textTransform: "uppercase" }}>Quick tips</p>
            {["Shoot vertically in good light", "Say your name, city & niche", "Show your personality — keep it real"].map((tip, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
                <Icon name="check" size={14} c={T.rose} w={2.4} />
                <span style={{ fontFamily: T.body, fontSize: 12.5, color: T.ink2 }}>{tip}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Step: Category ──
function CategoryStep({ form, set }: { form: WizardForm; set: (p: Partial<WizardForm>) => void }) {
  const [allCats, setAllCats] = useState<Array<{ slug: string; label: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setAllCats(d.categories?.length ? d.categories : CREATOR_CATEGORIES))
      .catch(() => setAllCats(CREATOR_CATEGORIES))
      .finally(() => setLoading(false));
  }, []);

  function toggleCat(slug: string) {
    const cur = form.categories;
    set({ categories: cur.includes(slug) ? cur.filter((x) => x !== slug) : [...cur, slug] });
  }

  return (
    <div>
      <StepHead emoji="🎯" title="What do you create?" sub="Pick the categories that best describe your content — select as many as apply." />
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 0" }}>
          <Spinner size={18} />
          <span style={{ fontFamily: T.body, fontSize: 13.5, color: T.ink3 }}>Loading categories…</span>
        </div>
      ) : (
        <>
          {form.categories.length > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, background: T.roseTint, border: `1px solid ${T.roseTint2}`, marginBottom: 14, animation: "fadeIn .2s ease" }}>
              <Icon name="checkCircle" size={14} c={T.rose} />
              <span style={{ fontFamily: T.body, fontSize: 12, fontWeight: 700, color: T.roseDark }}>
                {form.categories.length} selected
              </span>
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            {allCats.map((c) => (
              <Chip key={c.slug} active={form.categories.includes(c.slug)} onClick={() => toggleCat(c.slug)}>
                {c.label}
              </Chip>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Step: Services ──
function ServicesStep({ form, set }: { form: WizardForm; set: (p: Partial<WizardForm>) => void }) {
  const [sheet, setSheet] = useState<"custom" | "package" | null>(null);
  const services  = form.services  || [];
  const packages  = form.packages  || [];

  const stdOf = (code: string) => services.find((s) => s.code === code && !s.custom);

  function toggleStd(cat: typeof SERVICE_CATALOG[0]) {
    if (stdOf(cat.code)) set({ services: services.filter((s) => !(s.code === cat.code && !s.custom)) });
    else set({ services: [...services, { id: nid(), code: cat.code, title: cat.title, emoji: cat.emoji, price: cat.suggested, negotiable: false }] });
  }
  function patchSvc(id: string, patch: Partial<Service>) {
    set({ services: services.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  }
  function removeSvc(id: string) { set({ services: services.filter((s) => s.id !== id) }); }

  const customs = services.filter((s) => s.custom);
  const dashedBtn: React.CSSProperties = {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "14px", borderRadius: 14, border: `1.5px dashed #e0cfca`, background: T.roseTint,
    cursor: "pointer", fontFamily: T.body, fontSize: 14, fontWeight: 700, color: T.roseDark,
  };

  return (
    <div style={{ position: "relative" }}>
      <StepHead emoji="💸" title="Set your rates" sub="Add what brands can book. Toggle &ldquo;Negotiable&rdquo; if you&rsquo;re open to discussing price." />

      <SectionLabel>Standard services</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        {SERVICE_CATALOG.map((cat) => {
          const on = stdOf(cat.code);
          return (
            <div key={cat.code} style={{ background: "#fff", border: `1.5px solid ${on ? T.rose : T.line}`, borderRadius: 16, overflow: "hidden", transition: "border-color .15s" }}>
              <button onClick={() => toggleStd(cat)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 13, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: on ? T.roseTint : T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, flexShrink: 0 }}>{cat.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 15, color: T.ink }}>{cat.title}</p>
                  <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink3 }}>{cat.blurb}</p>
                </div>
                <div style={{ width: 24, height: 24, borderRadius: 999, border: on ? "none" : `2px solid ${T.line}`, background: on ? T.rose : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {on ? <Icon name="check" size={14} c="#fff" w={2.6} /> : <Icon name="plus" size={14} c={T.ink3} />}
                </div>
              </button>
              {on && (
                <div style={{ padding: "0 13px 13px", animation: "fadeIn .2s ease" }}>
                  <div style={{ height: 1, background: T.lineSoft, marginBottom: 12 }} />
                  <PriceRow price={on.price} negotiable={on.negotiable} onPrice={(v) => patchSvc(on.id, { price: v })} onNeg={(v) => patchSvc(on.id, { negotiable: v })} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {customs.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <SectionLabel>Custom services</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {customs.map((s) => (
              <div key={s.id} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 14, padding: "12px 13px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: T.roseTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name="spark" size={18} c={T.rose} fill={T.rose} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 14.5, color: T.ink }}>{s.title}</p>
                    {s.desc && <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink3, lineHeight: 1.4 }}>{s.desc}</p>}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 15, color: T.ink }}>{inr(s.price)}</span>
                      {s.negotiable && <Pill tone="amber">Negotiable</Pill>}
                    </div>
                  </div>
                  <button onClick={() => removeSvc(s.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Icon name="trash" size={17} c={T.ink3} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => setSheet("custom")} style={dashedBtn}><Icon name="plus" size={17} c={T.roseDark} /> Add custom service</button>

      <SectionLabel style={{ marginTop: 24 }}>Packages</SectionLabel>
      <p style={{ margin: "-4px 0 11px", fontFamily: T.body, fontSize: 12.5, color: T.ink3, lineHeight: 1.45 }}>Bundle 2+ services at a combo price — brands love the convenience.</p>

      {packages.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 12 }}>
          {packages.map((pkg) => (
            <div key={pkg.id} style={{ background: "linear-gradient(135deg,#fff3ef,#ffe8e4)", border: `1px solid ${T.roseTint2}`, borderRadius: 16, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Icon name="box" size={16} c={T.roseDark} />
                    <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 15, color: T.ink }}>{pkg.name}</p>
                  </div>
                  <p style={{ margin: "6px 0 0", fontFamily: T.body, fontSize: 12.5, color: T.ink2 }}>{pkg.items.map((it) => `${it.qty} ${it.title}`).join(" · ")}</p>
                </div>
                <button onClick={() => set({ packages: packages.filter((x) => x.id !== pkg.id) })} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                  <Icon name="trash" size={16} c={T.roseDark} />
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 9, paddingTop: 9, borderTop: `1px dashed ${T.roseTint2}` }}>
                <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 18, color: T.roseDark }}>{inr(pkg.price)}</span>
                {pkg.negotiable && <Pill tone="amber">Negotiable</Pill>}
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => setSheet("package")} style={dashedBtn}><Icon name="plus" size={17} c={T.roseDark} /> Create a package</button>

      {/* Bottom sheets */}
      <CustomSheet open={sheet === "custom"} onClose={() => setSheet(null)}
        onAdd={(svc) => { set({ services: [...services, { id: nid(), code: "custom", custom: true, ...svc }] }); setSheet(null); }}
      />
      <PackageSheet open={sheet === "package"} onClose={() => setSheet(null)} services={services}
        onAdd={(pkg) => { set({ packages: [...packages, { id: nid(), ...pkg }] }); setSheet(null); }}
      />
    </div>
  );
}

function CustomSheet({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (s: Omit<Service, "id" | "code" | "custom">) => void }) {
  const [title, setTitle] = useState("");
  const [desc,  setDesc]  = useState("");
  const [price, setPrice] = useState(2500);
  const [neg,   setNeg]   = useState(false);
  useEffect(() => { if (open) { setTitle(""); setDesc(""); setPrice(2500); setNeg(false); } }, [open]);
  return (
    <OBSheet open={open} onClose={onClose} title="Custom service">
      <Field label="Title" icon="tag" value={title} onChange={setTitle} placeholder="e.g. Restaurant launch shoot" />
      <Field label="Description (optional)" value={desc} onChange={setDesc} placeholder="What's included?" />
      <label style={{ display: "block", marginBottom: 14 }}>
        <span style={{ display: "block", marginBottom: 6, fontFamily: T.body, fontSize: 12, fontWeight: 650, color: T.ink2 }}>Price</span>
        <PriceRow price={price} negotiable={neg} onPrice={setPrice} onNeg={setNeg} />
      </label>
      <Btn variant="primary" size="lg" icon="plus" disabled={!title.trim() || !price} onClick={() => onAdd({ title: title.trim(), desc: desc.trim(), price, negotiable: neg })}>Add service</Btn>
    </OBSheet>
  );
}

function PackageSheet({ open, onClose, services, onAdd }: {
  open: boolean; onClose: () => void; services: Service[];
  onAdd: (p: Omit<Package, "id">) => void;
}) {
  const [name,  setName]  = useState("");
  const [price, setPrice] = useState(9000);
  const [neg,   setNeg]   = useState(true);
  const [qty,   setQty]   = useState<Record<string, number>>({});
  useEffect(() => { if (open) { setName(""); setPrice(9000); setNeg(true); setQty({}); } }, [open]);

  function bump(id: string, d: number) {
    setQty((q) => { const n = Math.max(0, (q[id] || 0) + d); const c = { ...q }; if (n === 0) delete c[id]; else c[id] = n; return c; });
  }
  const total = Object.values(qty).reduce((a, b) => a + b, 0);
  const items = services.map((s) => ({ ...s, qty: qty[s.id] || 0 })).filter((s) => s.qty > 0).map((s) => ({ code: s.code, title: s.title, emoji: s.emoji, qty: s.qty }));

  return (
    <OBSheet open={open} onClose={onClose} title="Create a package">
      {services.length === 0 ? (
        <p style={{ fontFamily: T.body, fontSize: 13.5, color: T.ink3, padding: "10px 0 6px" }}>Add at least one service first, then bundle them.</p>
      ) : (
        <>
          <Field label="Package name" icon="box" value={name} onChange={setName} placeholder="e.g. Launch Combo" />
          <SectionLabel>Include services (2 or more)</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {services.map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 13, padding: "9px 12px" }}>
                <span style={{ fontSize: 18 }}>{s.emoji || "✨"}</span>
                <span style={{ flex: 1, fontFamily: T.body, fontSize: 13.5, fontWeight: 600, color: T.ink }}>{s.title}</span>
                <Stepper v={qty[s.id] || 0} onMinus={() => bump(s.id, -1)} onPlus={() => bump(s.id, 1)} />
              </div>
            ))}
          </div>
          <label style={{ display: "block", marginBottom: 16 }}>
            <span style={{ display: "block", marginBottom: 6, fontFamily: T.body, fontSize: 12, fontWeight: 650, color: T.ink2 }}>Combo price</span>
            <PriceRow price={price} negotiable={neg} onPrice={setPrice} onNeg={setNeg} />
          </label>
          <Btn variant="primary" size="lg" icon="box" disabled={total < 2 || !name.trim()} onClick={() => onAdd({ name: name.trim(), items, price, negotiable: neg })}>
            {total < 2 ? "Pick 2+ services" : `Add package · ${total} items`}
          </Btn>
        </>
      )}
    </OBSheet>
  );
}

function Stepper({ v, onMinus, onPlus }: { v: number; onMinus: () => void; onPlus: () => void }) {
  const btn = (active: boolean): React.CSSProperties => ({
    width: 26, height: 26, borderRadius: 999, border: "none", background: active ? "#fff" : "transparent",
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, background: T.bg, borderRadius: 999, padding: 3 }}>
      <button onClick={onMinus} style={btn(v > 0)}>{v > 0 ? <span style={{ fontSize: 18, lineHeight: 1 }}>−</span> : <Icon name="x" size={13} c={T.ink3} w={2.4} />}</button>
      <span style={{ width: 22, textAlign: "center", fontFamily: T.display, fontWeight: 700, fontSize: 14, color: v > 0 ? T.ink : T.ink3 }}>{v}</span>
      <button onClick={onPlus} style={btn(true)}><Icon name="plus" size={14} c={T.roseDark} w={2.6} /></button>
    </div>
  );
}

// ── Done screen ──
function DoneScreen({ form, name, handle, onFinish, profileId }: {
  form: WizardForm; name: string; handle: string; onFinish: () => void; profileId: string;
}) {
  const svcCount = (form.services || []).length + (form.packages || []).length;
  const firstCat = form.categories[0]
    ? CREATOR_CATEGORIES.find((c) => c.slug === form.categories[0])
    : null;

  return (
    <div style={{ height: "100svh", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "64px 20px 12px" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 52, lineHeight: 1.1 }}>📬</div>
          <h1 style={{ margin: "12px 0 0", fontFamily: T.display, fontSize: 28, fontWeight: 700, color: T.ink, letterSpacing: -0.5, lineHeight: 1.1 }}>
            Application<br /><span style={{ color: T.rose, fontStyle: "italic" }}>submitted!</span>
          </h1>
          <p style={{ margin: "9px 0 0", fontFamily: T.body, fontSize: 13.5, color: T.ink3, lineHeight: 1.5 }}>
            We've received your creator profile. Our team will review it and notify you once you're approved to go live.
          </p>
        </div>

        <PendingCard eta="24–48 hours" />

        <p style={{ margin: "4px 0 10px", fontFamily: T.body, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: T.ink3, textTransform: "uppercase" }}>Your application</p>
        <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 22, overflow: "hidden", boxShadow: "0 4px 16px rgba(31,17,16,0.05)", marginBottom: 14 }}>
          <div style={{ height: 72, background: "linear-gradient(135deg,#ffd1c4,#ff8f74)", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.15, fontSize: 72 }}>🍜</div>
          </div>
          <div style={{ padding: "0 16px 16px", position: "relative" }}>
            <div style={{ marginTop: -22 }}>
              <Avatar emoji="🍜" from="#ffd1c4" to="#ff8f74" size={44} r={13} ring="#e8d8d4" />
            </div>
            <div style={{ marginTop: 5 }}>
              <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink }}>{form.name || name}</p>
              <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink3 }}>{handle}</p>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {firstCat && <Pill tone="rose">{firstCat.label}{form.categories.length > 1 ? ` +${form.categories.length - 1}` : ""}</Pill>}
                {form.cities.length > 0 && <Pill tone="neutral">📍 {form.cities.join(", ")}</Pill>}
                <Pill tone="neutral">{svcCount ? `${svcCount} service${svcCount > 1 ? "s" : ""}` : "Intro only"}</Pill>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, padding: "14px 16px" }}>
          <p style={{ margin: "0 0 10px", fontFamily: T.body, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, color: T.ink3, textTransform: "uppercase" }}>Once approved you can</p>
          {[
            { icon: "eye",   text: "Go live on the brand swipe deck in your city" },
            { icon: "chat",  text: "Receive & negotiate pitches inside the Deal Room" },
            { icon: "rupee", text: "Get payouts within 24 h of post verification" },
          ].map((n, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "5px 0" }}>
              <Icon name={n.icon as any} size={15} c={T.rose} style={{ marginTop: 1 }} />
              <span style={{ fontFamily: T.body, fontSize: 13, color: T.ink2, lineHeight: 1.4 }}>{n.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 18px 28px", background: T.bg, borderTop: `1px solid ${T.line}`, display: "flex", flexDirection: "column", gap: 9 }}>
        <Btn variant="primary" size="lg" onClick={onFinish}>Go to my dashboard</Btn>
      </div>
    </div>
  );
}

// ── Password step ──
function PasswordStep({ form, set }: { form: WizardForm; set: (p: Partial<WizardForm>) => void }) {
  const [show, setShow] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const mismatch = attempted && form.confirmPassword !== form.password;
  const tooShort = attempted && form.password.length > 0 && form.password.length < 8;

  return (
    <div>
      <StepHead emoji="🔐" title="Set your password" sub="You'll use this to sign in next time, no Instagram required." />

      <div style={{ marginBottom: 14 }}>
        <span style={{ display: "block", marginBottom: 6, fontFamily: T.body, fontSize: 12, fontWeight: 650, color: T.ink2 }}>Password</span>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 13px", height: 48, borderRadius: 14, background: "#fff", border: `1.5px solid ${tooShort ? "#f3d3cf" : T.line}` }}>
          <Icon name="lock" size={18} c={T.ink3} />
          <input
            value={form.password}
            onChange={(e) => { set({ password: e.target.value }); setAttempted(true); }}
            type={show ? "text" : "password"}
            placeholder="••••••••"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: T.body, fontSize: 15, color: T.ink, minWidth: 0 }}
          />
          <button onClick={() => setShow((s) => !s)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }} type="button">
            <Icon name="eye" size={17} c={T.ink3} />
          </button>
        </div>
        {tooShort && <span style={{ display: "block", marginTop: 5, fontFamily: T.body, fontSize: 11, color: "#b42318" }}>At least 8 characters required</span>}
      </div>

      <div style={{ marginBottom: 14 }}>
        <span style={{ display: "block", marginBottom: 6, fontFamily: T.body, fontSize: 12, fontWeight: 650, color: T.ink2 }}>Confirm password</span>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 13px", height: 48, borderRadius: 14, background: "#fff", border: `1.5px solid ${mismatch ? "#f3d3cf" : T.line}` }}>
          <Icon name="lock" size={18} c={T.ink3} />
          <input
            value={form.confirmPassword}
            onChange={(e) => { set({ confirmPassword: e.target.value }); setAttempted(true); }}
            type={show ? "text" : "password"}
            placeholder="••••••••"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: T.body, fontSize: 15, color: T.ink, minWidth: 0 }}
          />
        </div>
        {mismatch && <span style={{ display: "block", marginTop: 5, fontFamily: T.body, fontSize: 11, color: "#b42318" }}>Passwords don't match</span>}
      </div>
    </div>
  );
}

// ── Root wizard ──
export function OnboardingWizard({
  token, email, igConfigured = false,
}: {
  token: string; email?: string; igConfigured?: boolean;
}) {
  const [step, setStep] = useState<Step>("ig");
  const [profileId, setProfileId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<WizardForm>({
    name: "", handle: "", email: email ?? "", phone: "",
    cities: [], video: false, categories: [],
    services: [], packages: [],
    password: "", confirmPassword: "",
  });

  const set = (patch: Partial<WizardForm>) => setForm((f) => ({ ...f, ...patch }));

  // Resume after OAuth redirect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    if (p.get("ig") === "connected") {
      const name   = p.get("name")   ?? "";
      const handle = p.get("handle") ?? "";
      const pid    = p.get("pid")    ?? "";
      setForm((f) => ({ ...f, name, handle }));
      setProfileId(pid);
      setStep("details");
    }
  }, []);

  const igConnected = step !== "ig";
  const persona     = { name: form.name, handle: form.handle };

  // Step order & numbering (ig = 1, details = 2, …, password = 7)
  const C_STEPS_W: Step[] = ["ig", "details", "location", "video", "category", "services", "password"];
  const idx  = C_STEPS_W.indexOf(step);
  const stepNum = idx + 1;

  function back() {
    if (step === "ig")       { window.location.href = "/"; return; }
    if (step === "details")  { setStep("ig");       return; }
    if (step === "password") { setStep("services"); return; }
    setStep(C_STEPS_W[idx - 1] as Step);
  }
  async function next() {
    if (step === "password") {
      setSubmitting(true);
      try {
        await fetch("/api/onboarding/creator/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId,
            name: form.name, email: form.email, phone: form.phone,
            cities: form.cities,
            video: form.video,
            categories: form.categories,
            services: form.services.map((s) => ({
              typeId: Number(s.id), price: s.price, negotiable: s.negotiable,
            })),
            packages: form.packages.map((p) => ({
              name: p.name, price: p.price, negotiable: p.negotiable,
            })),
            password: form.password,
          }),
        });
      } catch (_) { /* non-blocking — move to done regardless */ }
      setSubmitting(false);
      setStep("done");
      return;
    }
    setStep(C_STEPS_W[idx + 1] as Step);
  }

  const canContinue: Record<Step, boolean> = {
    ig:       false,
    details:  !!(form.name && form.email),
    location: form.cities.length > 0,
    video:    true,
    category: form.categories.length > 0,
    services: true,
    password: form.password.length >= 8 && form.password === form.confirmPassword,
    done:     true,
  };

  const continueLabel: Partial<Record<Step, string>> = {
    video:    form.video ? "Continue" : "Skip for now",
    services: (form.services || []).length > 0 ? "Finish & go live" : "Skip for now",
    password: "Create account",
  };

  if (step === "ig") {
    return (
      <IGConnectStep
        token={token}
        igConfigured={igConfigured}
        igConnected={igConnected}
        persona={persona}
        onBack={back}
      />
    );
  }

  if (step === "done") {
    return (
      <DoneScreen
        form={form}
        name={form.name}
        handle={form.handle}
        profileId={profileId}
        onFinish={() => { window.location.href = "/inf"; }}
      />
    );
  }

  return (
    <div style={{ height: "100svh", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <WizardChrome label="Creator sign-up" step={stepNum} total={TOTAL} onBack={back} />
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px 8px" }}>
        {step === "details"  && <DetailsStep  form={form} set={set} />}
        {step === "location" && <LocationStep form={form} set={set} />}
        {step === "video"    && <VideoStep    form={form} set={set} />}
        {step === "category" && <CategoryStep form={form} set={set} />}
        {step === "services" && <ServicesStep form={form} set={set} />}
        {step === "password" && <PasswordStep form={form} set={set} />}
      </div>
      <Footer
        onContinue={next}
        label={submitting ? "Saving…" : (continueLabel[step] || "Continue")}
        disabled={!canContinue[step] || submitting}
      />
    </div>
  );
}
