"use client";
import React, { useState, useRef } from "react";
import { T, inr, kfmt } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Avatar, Pill, Btn, OBSheet, SectionLabel, Toggle, Field } from "@/components/ob-primitives";
import { Lookbook } from "@/components/biz-lookbook";
import { type MyCreator } from "@/lib/inf-data";
import { CAT, catOf, type CreatorService } from "@/lib/biz-data";

const ALL_CITIES = ["Bengaluru", "Mangaluru", "Mysuru", "Hubballi", "Belagavi", "Shivamogga", "Tumakuru"];
const COVERS: [string, string][] = [["#ffd1c4","#ff8f74"],["#ffe4cc","#ffb27a"],["#e6f0d8","#a7c47a"],["#e9d6ff","#b48af0"],["#cfe0ea","#7fa8c0"],["#ffd9e2","#f2a0b8"]];
const MAX_CATS = 3;

const IG_POOL: { emoji: string; from: string; to: string; kind: "Reel" | "Post"; views: number; likes: number; caption: string }[] = [
  { emoji: "🍜", from: "#ffe4cc", to: "#ffb27a", kind: "Reel", views: 18400, likes: 1240, caption: "ramen run at midnight" },
  { emoji: "🌸", from: "#ffd6e8", to: "#f09ec0", kind: "Post", views: 4200,  likes: 380,  caption: "spring café vibes" },
  { emoji: "🎋", from: "#e6f0d8", to: "#a7c47a", kind: "Post", views: 6100,  likes: 520,  caption: "matcha everything" },
  { emoji: "🍦", from: "#e9d6ff", to: "#b48af0", kind: "Reel", views: 22800, likes: 1860, caption: "soft serve season" },
  { emoji: "🫐", from: "#d6e4ff", to: "#8ab0f0", kind: "Post", views: 7400,  likes: 640,  caption: "blueberry acai bowl" },
  { emoji: "🌮", from: "#ffcf9e", to: "#e8843d", kind: "Reel", views: 31200, likes: 2180, caption: "taco tuesday done right" },
  { emoji: "🍰", from: "#ffd9e2", to: "#f2a0b8", kind: "Post", views: 9600,  likes: 820,  caption: "slice of happiness" },
  { emoji: "🥞", from: "#f3dcb8", to: "#d9a55f", kind: "Post", views: 8100,  likes: 700,  caption: "pancake stack perfection" },
  { emoji: "🍣", from: "#cfe0ea", to: "#7fa8c0", kind: "Reel", views: 14200, likes: 980,  caption: "omakase but make it affordable" },
  { emoji: "🍓", from: "#ffd9e2", to: "#f2a0b8", kind: "Reel", views: 19600, likes: 1420, caption: "strawberry szn 🍓" },
  { emoji: "🥑", from: "#d8ebc0", to: "#9ac26e", kind: "Post", views: 9200,  likes: 720,  caption: "avocado toast tier list" },
  { emoji: "🥂", from: "#e6f0d8", to: "#a7c47a", kind: "Post", views: 5800,  likes: 480,  caption: "celebrating the small wins" },
];

function UploadZone({ current, onFile, label, height = 116, radius = 14 }: { current: string | null; onFile: (url: string) => void; label: string; height?: number; radius?: number }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        onFile(URL.createObjectURL(f));
        e.target.value = "";
      }} />
      <button onClick={() => ref.current?.click()} style={{ width: "100%", height, borderRadius: radius, overflow: "hidden", cursor: "pointer", border: `2px dashed ${current ? "transparent" : T.line}`, position: "relative", background: current ? "transparent" : "#faf8f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {current && <img src={current} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "8px 22px", borderRadius: 10, background: current ? "rgba(0,0,0,0.42)" : "transparent" }}>
          <Icon name="camera" size={22} c={current ? "#fff" : T.ink3} />
          <span style={{ fontFamily: T.body, fontSize: 12, fontWeight: 700, color: current ? "#fff" : T.ink3 }}>{label}</span>
        </div>
      </button>
    </>
  );
}

function EditPhotosSheet({ me, onClose, onSave }: { me: MyCreator; onClose: () => void; onSave: (p: { photoUrl: string | null; coverUrl: string | null; from: string; to: string }) => void }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(me.photoUrl ?? null);
  const [coverUrl, setCoverUrl] = useState<string | null>(me.coverUrl ?? null);
  const [cover, setCover] = useState<[string, string]>([me.from, me.to]);
  return (
    <OBSheet open onClose={onClose} title="Cover & photo" accent="rose">
      <SectionLabel>Cover</SectionLabel>
      <UploadZone current={coverUrl} onFile={setCoverUrl} label="Upload cover photo" />
      {coverUrl ? (
        <button onClick={() => setCoverUrl(null)} style={{ width: "100%", padding: "9px", background: "none", border: `1px solid ${T.line}`, borderRadius: 11, cursor: "pointer", fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: T.ink3, marginBottom: 14 }}>Remove · use gradient instead</button>
      ) : (
        <>
          <p style={{ margin: "0 0 9px", fontFamily: T.body, fontSize: 11.5, color: T.ink3, textAlign: "center" }}>or pick a gradient</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginBottom: 16 }}>
            {COVERS.map((c, i) => {
              const on = cover[0] === c[0] && cover[1] === c[1];
              return <button key={i} onClick={() => setCover(c)} style={{ height: 44, borderRadius: 12, border: on ? `2.5px solid ${T.rose}` : `1px solid ${T.line}`, background: `linear-gradient(135deg, ${c[0]}, ${c[1]})`, cursor: "pointer" }} />;
            })}
          </div>
        </>
      )}
      <SectionLabel>Profile photo</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, overflow: "hidden", flexShrink: 0, background: `linear-gradient(135deg, ${cover[0]}, ${cover[1]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          {photoUrl ? <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : me.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <UploadZone current={null} onFile={setPhotoUrl} label="Upload photo" height={56} radius={11} />
          {photoUrl && <button onClick={() => setPhotoUrl(null)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.body, fontSize: 12, color: T.ink3, padding: "2px 0" }}>Remove photo</button>}
        </div>
      </div>
      <Btn variant="primary" size="lg" icon="check" onClick={() => onSave({ photoUrl, coverUrl, from: cover[0], to: cover[1] })}>Save</Btn>
    </OBSheet>
  );
}

function EditIdentitySheet({ me, onClose, onSave }: { me: MyCreator; onClose: () => void; onSave: (f: { name: string; bio: string }) => void }) {
  const [f, setF] = useState({ name: me.name, bio: me.bio });
  return (
    <OBSheet open onClose={onClose} title="Edit profile" accent="rose">
      <Field label="Display name" icon="user" value={f.name} onChange={(v) => setF({ ...f, name: v })} />
      <Field label="Instagram handle" icon="instagram" value={me.handle} locked verified />
      <SectionLabel>Bio</SectionLabel>
      <div style={{ position: "relative", marginBottom: 14 }}>
        <textarea value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value.slice(0, 160) })} rows={3} style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${T.line}`, borderRadius: 14, padding: "12px 14px", fontFamily: T.body, fontSize: 14, color: T.ink, background: "#fff", outline: "none", resize: "none", lineHeight: 1.5 }} />
        <span style={{ position: "absolute", bottom: 10, right: 12, fontFamily: T.body, fontSize: 10.5, color: T.ink3 }}>{f.bio.length}/160</span>
      </div>
      <Btn variant="primary" size="lg" icon="check" onClick={() => onSave(f)}>Save changes</Btn>
    </OBSheet>
  );
}

function PriceStepper({ value, onChange, step = 500 }: { value: number; onChange: (v: number) => void; step?: number }) {
  const b = (icon: "x" | "plus", fn: () => void) => (
    <button onClick={fn} style={{ width: 32, height: 32, borderRadius: 9, border: `1px solid ${T.line}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon name={icon} size={15} c={T.ink2} w={2.2} />
    </button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      {b("x", () => onChange(Math.max(0, value - step)))}
      <span style={{ width: 64, textAlign: "center", fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.ink }}>{inr(value)}</span>
      {b("plus", () => onChange(value + step))}
    </div>
  );
}

function EditRatesSheet({ me, onClose, onSave }: { me: MyCreator; onClose: () => void; onSave: (p: { services: CreatorService[]; pkgPrice: number }) => void }) {
  const [services, setServices] = useState(me.services.map((s) => ({ ...s })));
  const [pkgPrice, setPkgPrice] = useState(me.pkg.price);
  const upd = (i: number, patch: Partial<CreatorService>) => setServices((arr) => arr.map((s, j) => j === i ? { ...s, ...patch } : s));
  return (
    <OBSheet open onClose={onClose} title="Services & rates" accent="rose">
      <p style={{ margin: "0 0 14px", fontFamily: T.body, fontSize: 13, color: T.ink2, lineHeight: 1.5 }}>Set your starting prices. Brands can still negotiate on items you mark flexible.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 16 }}>
        {services.map((s, i) => (
          <div key={s.code} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 15, padding: 13 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
              <Icon name={s.code === "reel" ? "play" : s.code === "post" ? "image" : "spark"} size={17} c={T.rose} fill={s.code === "reel" ? T.rose : "none"} />
              <span style={{ flex: 1, fontFamily: T.body, fontSize: 14, fontWeight: 700, color: T.ink }}>{s.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <PriceStepper value={s.price} onChange={(v) => upd(i, { price: v })} />
              <button onClick={() => upd(i, { negotiable: !s.negotiable })} style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "none", cursor: "pointer" }}>
                <Toggle on={s.negotiable} onChange={() => upd(i, { negotiable: !s.negotiable })} />
                <span style={{ fontFamily: T.body, fontSize: 12, fontWeight: 650, color: s.negotiable ? T.amber : T.ink3 }}>Flexible</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      <SectionLabel>{me.pkg.name}</SectionLabel>
      <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 15, padding: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 11 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: T.roseTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="spark" size={20} c={T.roseDark} fill={T.roseDark} /></div>
        <div style={{ flex: 1, minWidth: 0 }}><p style={{ margin: 0, fontFamily: T.body, fontSize: 12.5, fontWeight: 650, color: T.ink }}>{me.pkg.items}</p></div>
        <PriceStepper value={pkgPrice} onChange={setPkgPrice} step={1000} />
      </div>
      <Btn variant="primary" size="lg" icon="check" onClick={() => onSave({ services, pkgPrice })}>Save rates</Btn>
    </OBSheet>
  );
}

function AddWorkSheet({ works, onClose, onAdd }: { works: MyCreator["works"]; onClose: () => void; onAdd: (w: typeof IG_POOL[0]) => void }) {
  const [tab, setTab] = useState<"pick" | "link">("pick");
  const [link, setLink] = useState("");
  const [linkKind, setLinkKind] = useState<"Reel" | "Post" | "Story">("Reel");
  const usedEmojis = works.map((w) => w.emoji);
  const pool = IG_POOL.filter((p) => !usedEmojis.includes(p.emoji));

  function addFromLink() {
    if (!link.trim()) return;
    const isReel = link.includes("reel") || linkKind === "Reel";
    onAdd({ emoji: "🔗", from: "#e9d6ff", to: "#b48af0", kind: isReel ? "Reel" : "Post", views: 0, likes: 0, caption: link.trim() });
  }

  const tabBtn = (key: "pick" | "link", label: string) => (
    <button onClick={() => setTab(key)} style={{ flex: 1, padding: "9px 0", fontFamily: T.body, fontSize: 13, fontWeight: 700, color: tab === key ? T.roseDark : T.ink3, background: "none", border: "none", borderBottom: `2px solid ${tab === key ? T.rose : "transparent"}`, cursor: "pointer" }}>{label}</button>
  );

  return (
    <OBSheet open onClose={onClose} title="Add to your work" accent="rose">
      <div style={{ display: "flex", borderBottom: `1px solid ${T.line}`, marginBottom: 16, marginTop: -4 }}>
        {tabBtn("pick", "From Instagram")}
        {tabBtn("link", "Paste link")}
      </div>
      {tab === "pick" && (
        pool.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
            {pool.map((p, i) => (
              <button key={i} onClick={() => onAdd(p)} style={{ position: "relative", aspectRatio: "1", borderRadius: 12, border: "none", overflow: "hidden", cursor: "pointer", background: `linear-gradient(150deg, ${p.from}, ${p.to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
                {p.emoji}
                <span style={{ position: "absolute", top: 6, right: 6 }}><Icon name={p.kind === "Reel" ? "play" : "image"} size={12} c="#fff" fill={p.kind === "Reel" ? "#fff" : "none"} /></span>
              </button>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: "center", fontFamily: T.body, fontSize: 13, color: T.ink3, padding: "24px 0" }}>No more posts to add</p>
        )
      )}
      {tab === "link" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Instagram post or reel URL" icon="send" value={link} onChange={setLink} placeholder="instagram.com/reel/…" />
          <div style={{ display: "flex", gap: 8 }}>
            {(["Reel","Post","Story"] as const).map((k) => (
              <button key={k} onClick={() => setLinkKind(k)} style={{ flex: 1, padding: "9px 0", borderRadius: 11, border: `1.5px solid ${linkKind === k ? T.rose : T.line}`, background: linkKind === k ? T.roseTint : "#fff", fontFamily: T.body, fontSize: 13, fontWeight: 700, color: linkKind === k ? T.roseDark : T.ink2, cursor: "pointer" }}>{k}</button>
            ))}
          </div>
          <Btn variant="primary" size="lg" icon="plus" onClick={addFromLink} disabled={!link.trim()}>Add</Btn>
        </div>
      )}
    </OBSheet>
  );
}

function CategoriesSection({ cats, onChange }: { cats: string[]; onChange: (cats: string[]) => void }) {
  const [adding, setAdding] = useState(false);
  const available = CAT.filter((c) => !cats.includes(c.key));
  const full = cats.length >= MAX_CATS;
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: adding ? 10 : 0 }}>
        {cats.map((k) => {
          const c = CAT.find((x) => x.key === k);
          if (!c) return null;
          return (
            <div key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px 6px 10px", borderRadius: 999, background: T.roseTint, border: `1px solid ${T.roseTint2}`, fontFamily: T.body, fontSize: 12.5, fontWeight: 650, color: T.roseDark }}>
              {c.label}
              <button onClick={() => onChange(cats.filter((x) => x !== k))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", marginLeft: 2 }}><Icon name="x" size={13} c={T.roseDark} /></button>
            </div>
          );
        })}
        {!full && available.length > 0 && (
          <button onClick={() => setAdding(!adding)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 999, background: "#fff", border: `1px dashed ${T.line}`, cursor: "pointer", fontFamily: T.body, fontSize: 12.5, fontWeight: 650, color: T.ink3 }}>
            <Icon name="plus" size={13} c={T.ink3} /> Add category
          </button>
        )}
      </div>
      {adding && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 13, background: "#faf8f6", borderRadius: 13, border: `1px solid ${T.line}` }}>
          {available.map((c) => (
            <button key={c.key} onClick={() => { onChange([...cats, c.key]); if (cats.length + 1 >= MAX_CATS) setAdding(false); }} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 999, background: "#fff", border: `1px solid ${T.line}`, cursor: "pointer", fontFamily: T.body, fontSize: 12.5, fontWeight: 650, color: T.ink }}>{c.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function CitiesSection({ cities, onChange }: { cities: string[]; onChange: (cities: string[]) => void }) {
  const [adding, setAdding] = useState(false);
  const available = ALL_CITIES.filter((c) => !cities.includes(c));
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: adding ? 10 : 0 }}>
        {cities.map((c) => (
          <div key={c} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px 6px 10px", borderRadius: 999, background: T.roseTint, border: `1px solid ${T.roseTint2}`, fontFamily: T.body, fontSize: 12.5, fontWeight: 650, color: T.roseDark }}>
            📍 {c}
            <button onClick={() => onChange(cities.filter((x) => x !== c))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", marginLeft: 2 }}><Icon name="x" size={13} c={T.roseDark} /></button>
          </div>
        ))}
        {available.length > 0 && (
          <button onClick={() => setAdding(!adding)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 999, background: "#fff", border: `1px dashed ${T.line}`, cursor: "pointer", fontFamily: T.body, fontSize: 12.5, fontWeight: 650, color: T.ink3 }}>
            <Icon name="plus" size={13} c={T.ink3} /> Add city
          </button>
        )}
      </div>
      {adding && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 13, background: "#faf8f6", borderRadius: 13, border: `1px solid ${T.line}` }}>
          {available.map((c) => (
            <button key={c} onClick={() => { onChange([...cities, c]); setAdding(false); }} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 999, background: "#fff", border: `1px solid ${T.line}`, cursor: "pointer", fontFamily: T.body, fontSize: 12.5, fontWeight: 650, color: T.ink }}>📍 {c}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function PCard({ title, icon, action, children, pad = 16 }: { title?: string; icon?: string; action?: React.ReactNode; children: React.ReactNode; pad?: number }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 20, padding: pad, marginBottom: 13 }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}>
          {icon && <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={17} c={T.rose} />}
          <h3 style={{ margin: 0, fontFamily: T.display, fontSize: 15.5, fontWeight: 700, color: T.ink, flex: 1 }}>{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

const MAX_WORKS = 6;

export function InfProfile({ me, setMe, onToast }: {
  me: MyCreator;
  setMe: (m: MyCreator) => void;
  onToast: (msg: string) => void;
}) {
  const [sheet, setSheet] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const myCats = me.cats ?? [me.category];
  const coverUrl = me.coverUrl ?? null;
  const photoUrl = me.photoUrl ?? null;
  const coverBg = coverUrl ? `url("${coverUrl}") center/cover` : `linear-gradient(160deg, ${me.from}, ${me.to})`;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* hero */}
        <div style={{ position: "relative", padding: "56px 18px 18px", background: coverBg }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.12, background: "radial-gradient(circle at 80% 20%, #fff 0 1.5px, transparent 2px)", backgroundSize: "30px 30px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.22) 0%, transparent 40%, rgba(20,8,10,0.38) 100%)", pointerEvents: "none" }} />
          <button onClick={() => setSheet("photos")} style={{ position: "absolute", top: 52, right: 16, zIndex: 5, display: "flex", alignItems: "center", gap: 6, padding: "7px 11px", borderRadius: 999, border: "none", background: "rgba(20,8,10,0.45)", backdropFilter: "blur(8px)", cursor: "pointer", fontFamily: T.body, fontSize: 11.5, fontWeight: 700, color: "#fff" }}>
            <Icon name="camera" size={14} c="#fff" /> Edit cover
          </button>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 68, height: 68, borderRadius: 22, overflow: "hidden", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: "0 6px 18px rgba(0,0,0,0.14)" }}>
                {photoUrl ? <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : me.emoji}
              </div>
              <button onClick={() => setSheet("photos")} style={{ position: "absolute", right: -4, bottom: -4, width: 26, height: 26, borderRadius: 999, border: "2px solid #fff", background: T.rose, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>
                <Icon name="camera" size={13} c="#fff" />
              </button>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <h1 style={{ margin: 0, fontFamily: T.display, fontSize: 21, fontWeight: 700, color: "#fff", letterSpacing: -0.4, lineHeight: 1.15, textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>{me.name}</h1>
                {me.verified && <Icon name="verified" size={19} c="#fff" />}
              </div>
              <p style={{ margin: "3px 0 0", fontFamily: T.body, fontSize: 12.5, color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>{me.handle} · {myCats.map((k) => catOf(k).emoji).join(" ")} {myCats.map((k) => catOf(k).label).join(" · ")}</p>
            </div>
          </div>
        </div>

        {/* stats bar */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${T.line}`, background: "#fff" }}>
          {[["Followers", kfmt(me.followers)], ["Avg views", kfmt(me.avgViews)], ["Engagement", me.eng + "%"], ["Rating", String(me.rating)]].map(([l, v], i, arr) => (
            <div key={i} style={{ flex: 1, textAlign: "center", padding: "12px 4px", borderRight: i < arr.length - 1 ? `1px solid ${T.line}` : "none" }}>
              <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 15, color: T.ink }}>{v}</p>
              <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 9, fontWeight: 700, color: T.ink3, textTransform: "uppercase" as const, letterSpacing: 0.3 }}>{l}</p>
            </div>
          ))}
        </div>

        <div style={{ padding: "16px 16px 24px" }}>
          {/* availability + edit */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <button onClick={() => setMe({ ...me, available: !me.available })} style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, padding: "11px 13px", background: me.available ? T.mintTint : "#fff", border: `1px solid ${me.available ? T.mintTint2 : T.line}`, borderRadius: 14, cursor: "pointer" }}>
              <span style={{ position: "relative", width: 34, height: 20, borderRadius: 999, background: me.available ? T.mint : "#dcd3cf", flexShrink: 0 }}>
                <span style={{ position: "absolute", top: 2, left: me.available ? 16 : 2, width: 16, height: 16, borderRadius: 999, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.2)", transition: "left .2s" }} />
              </span>
              <span style={{ fontFamily: T.body, fontSize: 13, fontWeight: 700, color: me.available ? T.mintInk : T.ink3 }}>{me.available ? "Available for work" : "Paused"}</span>
            </button>
            <button onClick={() => setSheet("identity")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 16px", background: "#fff", border: `1px solid ${T.line}`, borderRadius: 14, cursor: "pointer", fontFamily: T.body, fontSize: 13, fontWeight: 700, color: T.ink2 }}>
              <Icon name="pencil" size={16} c={T.ink2} /> Edit
            </button>
          </div>

          <Btn variant="ghost" icon="eye" onClick={() => setPreview(true)} style={{ marginBottom: 14 }}>Preview how brands see you</Btn>
          <p style={{ margin: "0 0 16px", padding: "0 2px", fontFamily: T.body, fontSize: 13.5, lineHeight: 1.55, color: T.ink2 }}>{me.bio}</p>

          {/* track record */}
          {me.completed >= 3 ? (
            <PCard title="Track record" icon="star">
              <div style={{ display: "flex", gap: 8 }}>
                {[["Collabs", String(me.completed)], ["Rebook rate", me.repeatRate + "%"], ["Replies in", "~" + me.responseHrs + "h"]].map(([l, v], i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center", padding: "4px 2px" }}>
                    <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 19, color: T.ink }}>{v}</p>
                    <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 10, fontWeight: 600, color: T.ink3, textTransform: "uppercase" as const, letterSpacing: 0.3 }}>{l}</p>
                  </div>
                ))}
              </div>
            </PCard>
          ) : (
            <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 20, padding: 16, marginBottom: 13, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: T.lineSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="lock" size={18} c={T.ink3} /></div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 14, color: T.ink }}>Track record unlocks soon</p>
                <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink3, lineHeight: 1.4 }}>Finish 3 collabs to show your rebook rate &amp; response time · {me.completed}/3</p>
              </div>
            </div>
          )}

          {/* services & rates */}
          <PCard title="Services & rates" icon="rupee" action={
            <button onClick={() => setSheet("rates")} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: T.rose }}>
              <Icon name="pencil" size={14} c={T.rose} /> Edit
            </button>
          }>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {me.services.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < me.services.length - 1 ? `1px solid ${T.lineSoft}` : "none" }}>
                  <Icon name={s.code === "reel" ? "play" : s.code === "post" ? "image" : "spark"} size={17} c={T.rose} fill={s.code === "reel" ? T.rose : "none"} />
                  <span style={{ flex: 1, fontFamily: T.body, fontSize: 13.5, color: T.ink2, fontWeight: 600 }}>{s.label}</span>
                  {s.negotiable && <Pill tone="amber" style={{ fontSize: 10 }}>Flexible</Pill>}
                  <span style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.ink }}>{inr(s.price)}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: 13, borderRadius: 14, background: T.roseTint, display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="spark" size={20} c={T.roseDark} fill={T.roseDark} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 14, color: T.ink }}>{me.pkg.name}</p>
                <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink2 }}>{me.pkg.items}</p>
              </div>
              <span style={{ fontFamily: T.display, fontSize: 17, fontWeight: 700, color: T.roseDark, flexShrink: 0 }}>{inr(me.pkg.price)}</span>
            </div>
          </PCard>

          {/* category + cities */}
          <PCard title="Category" icon="tag">
            <CategoriesSection cats={myCats} onChange={(cats) => setMe({ ...me, cats, category: cats[0] ?? me.category })} />
            <div style={{ marginTop: 14 }}>
              <SectionLabel>City</SectionLabel>
              <CitiesSection cities={me.cities ?? [me.city ?? "Bengaluru"]} onChange={(cities) => setMe({ ...me, cities })} />
            </div>
          </PCard>

          {/* work grid */}
          <PCard title="Your work" icon="grid" action={<span style={{ fontFamily: T.body, fontSize: 12, color: T.ink3 }}>{me.works.length}/{MAX_WORKS}</span>}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
              {me.works.map((w, i) => (
                <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 12, overflow: "hidden", background: `linear-gradient(150deg, ${w.from}, ${w.to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                  {w.image
                    ? <img src={w.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    : w.emoji}
                  <span style={{ position: "absolute", top: 6, right: 6 }}><Icon name={w.kind === "Reel" ? "play" : "image"} size={12} c="#fff" fill={w.kind === "Reel" ? "#fff" : "none"} /></span>
                  <button onClick={() => setMe({ ...me, works: me.works.filter((_, j) => j !== i) })} style={{ position: "absolute", top: 5, left: 5, width: 22, height: 22, borderRadius: 999, background: "rgba(0,0,0,0.52)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="x" size={11} c="#fff" />
                  </button>
                </div>
              ))}
              {me.works.length < MAX_WORKS && (
                <button onClick={() => setSheet("addWork")} style={{ aspectRatio: "1", borderRadius: 12, border: `2px dashed ${T.line}`, background: "#faf8f6", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
                  <Icon name="plus" size={20} c={T.ink3} />
                  <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: T.ink3 }}>Add</span>
                </button>
              )}
            </div>
          </PCard>

          {/* payout */}
          <PCard pad={4}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 13px" }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: T.mintTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="shield" size={19} c={T.mintInk} /></div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontFamily: T.body, fontSize: 14, fontWeight: 700, color: T.ink }}>Payout · {me.payout.method}</p>
                <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink3 }}>{me.payout.handle} · {inr(me.totalEarned - Math.round(me.totalEarned * 0.1))} lifetime</p>
              </div>
              <Icon name="chevR" size={17} c={T.ink3} />
            </div>
          </PCard>

          {/* settings */}
          <PCard pad={4}>
            {[["shield","Privacy & data"],["info","Help & support"],["user","Account settings"]].map(([ic, lab], i, arr) => (
              <button key={lab} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 13px", background: "none", border: "none", borderBottom: i < arr.length - 1 ? `1px solid ${T.lineSoft}` : "none", cursor: "pointer" }}>
                <Icon name={ic as Parameters<typeof Icon>[0]["name"]} size={19} c={T.ink3} />
                <span style={{ flex: 1, textAlign: "left", fontFamily: T.body, fontSize: 14, fontWeight: 600, color: T.ink }}>{lab}</span>
                <Icon name="chevR" size={17} c={T.ink3} />
              </button>
            ))}
          </PCard>
          <button
            onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/login"; }}
            style={{ width: "100%", padding: "13px", background: "none", border: "none", cursor: "pointer", fontFamily: T.body, fontSize: 13.5, fontWeight: 700, color: "#b42318" }}
          >Sign out</button>
        </div>
      </div>

      {sheet === "addWork" && <AddWorkSheet works={me.works} onClose={() => setSheet(null)} onAdd={(w) => { setMe({ ...me, works: [...me.works, w] }); setSheet(null); onToast("Post added"); }} />}
      {sheet === "identity" && <EditIdentitySheet me={me} onClose={() => setSheet(null)} onSave={(f) => { setMe({ ...me, ...f }); setSheet(null); onToast("Profile updated"); }} />}
      {sheet === "photos" && <EditPhotosSheet me={me} onClose={() => setSheet(null)} onSave={({ photoUrl, coverUrl, from, to }) => { setMe({ ...me, photoUrl, coverUrl, from, to }); setSheet(null); onToast("Photos updated"); }} />}
      {sheet === "rates" && <EditRatesSheet me={me} onClose={() => setSheet(null)} onSave={({ services, pkgPrice }) => { setMe({ ...me, services, rateFrom: Math.min(...services.map((s) => s.price)), pkg: { ...me.pkg, price: pkgPrice } }); setSheet(null); onToast("Rates updated"); }} />}
      {preview && <Lookbook creator={me} onBack={() => setPreview(false)} onReachOut={() => {}} />}
    </div>
  );
}
