"use client";
import React, { useState } from "react";
import { T, kfmt } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Btn, Pill, OBSheet, SectionLabel, Chip, OptionCard } from "@/components/ob-primitives";
import { AREAS, CAT_MAP, type MyBiz, type Campaign } from "@/lib/biz-data";
import { CREATOR_CATEGORIES } from "@/lib/ob-data";
import { CampaignsCard } from "@/components/biz-campaigns";

// Resolve a display label/emoji for the business category regardless of which
// taxonomy it was stored in (CAT_MAP key/label or CREATOR_CATEGORIES slug).
function bizCatOf(category: string): { emoji: string; label: string } {
  if (CAT_MAP[category]) return CAT_MAP[category];
  const cc = CREATOR_CATEGORIES.find((c) => c.slug === category);
  if (cc) return { emoji: "🏷️", label: cc.label };
  const byLabel = Object.values(CAT_MAP).find((v) => v.label === category);
  return byLabel ?? { emoji: "🏷️", label: category || "Business" };
}

const HIRING_OPTS = [
  { key: "open" as const, emoji: "🟢", title: "Open to pitches", desc: "Creators can pitch you directly.", accent: "mint" as const },
  { key: "scouting" as const, emoji: "🔍", title: "Actively scouting", desc: "Shows a 'Scouting' badge — you're browsing.", accent: "rose" as const },
  { key: "closed" as const, emoji: "⏸", title: "Not hiring", desc: "Hidden from creators to avoid spam.", accent: "neutral" as const },
];
const hiringOpt = (k: MyBiz["hiring"]) => HIRING_OPTS.find((h) => h.key === k) ?? HIRING_OPTS[0];

function HiringSheet({ hiring, onClose, onSave }: { hiring: MyBiz["hiring"]; onClose: () => void; onSave: (v: MyBiz["hiring"]) => void }) {
  const [val, setVal] = useState<MyBiz["hiring"]>(hiring);
  return (
    <OBSheet open onClose={onClose} title="Hiring status" accent="rose">
      <p style={{ margin: "0 0 14px", fontFamily: T.body, fontSize: 13, color: T.ink2, lineHeight: 1.5 }}>Controls whether creators can reach you — and how you appear in their deck.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 16 }}>
        {HIRING_OPTS.map((h) => (
          <OptionCard key={h.key} emoji={h.emoji} title={h.title} desc={h.desc} active={val === h.key} accent={h.accent} onClick={() => setVal(h.key)} />
        ))}
      </div>
      <Btn variant="primary" size="lg" icon="check" onClick={() => onSave(val)}>Save</Btn>
    </OBSheet>
  );
}

function EditSheet({ biz, onClose, onSave }: { biz: MyBiz; onClose: () => void; onSave: (b: Partial<MyBiz>) => void }) {
  const [name, setName] = useState(biz.name);
  const [bio, setBio] = useState(biz.bio);
  const [category, setCategory] = useState(biz.category);
  const [area, setArea] = useState(biz.area);
  return (
    <OBSheet open onClose={onClose} title="Edit details" accent="rose">
      <SectionLabel>Business name</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 13px", height: 46, borderRadius: 13, background: "#fff", border: `1.5px solid ${T.line}`, marginBottom: 16 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: T.body, fontSize: 14.5, color: T.ink }} />
      </div>
      <SectionLabel>Bio</SectionLabel>
      <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 140))} rows={3} style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${T.line}`, borderRadius: 14, padding: "12px 14px", fontFamily: T.body, fontSize: 13.5, color: T.ink, background: "#fff", outline: "none", resize: "none", lineHeight: 1.5, marginBottom: 16 }} />
      <SectionLabel>Category</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {CREATOR_CATEGORIES.map((c) => (
          <Chip key={c.slug} active={category === c.slug} onClick={() => setCategory(c.slug)}>{c.label}</Chip>
        ))}
      </div>
      <SectionLabel>Neighbourhood</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {AREAS.map((a) => <Chip key={a} active={area === a} onClick={() => setArea(a)} icon="📍">{a}</Chip>)}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</Btn>
        <Btn variant="primary" onClick={() => onSave({ name, bio, category, area })} style={{ flex: 1.6 }}>Save changes</Btn>
      </div>
    </OBSheet>
  );
}

function ProfileCard({ children, pad = 16 }: { children: React.ReactNode; pad?: number }) {
  return <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 20, padding: pad, marginBottom: 13, maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>{children}</div>;
}

export function Profile({ biz, onUpdate, campaigns = [], onNewCampaign, onPreview, onSignOut }: {
  biz: MyBiz;
  onUpdate: (b: Partial<MyBiz>) => void;
  campaigns?: Campaign[];
  onNewCampaign?: () => void;
  onPreview?: () => void;
  onSignOut?: () => void;
}) {
  const [sheet, setSheet] = useState<null | "details" | "hiring">(null);
  const hire = hiringOpt(biz.hiring);
  const hireBg = hire.accent === "mint" ? T.mintTint : hire.accent === "rose" ? T.roseTint : T.lineSoft;
  const hireInk = hire.accent === "mint" ? T.mintInk : hire.accent === "rose" ? T.roseDark : T.ink2;
  const hireBd = hire.accent === "mint" ? T.mintTint2 : hire.accent === "rose" ? T.roseTint2 : T.line;
  const cat = bizCatOf(biz.category);

  return (
    <div style={{ flex: 1, minHeight: 0, minWidth: 0, width: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden", boxSizing: "border-box" }}>
      <div style={{ flex: 1, minHeight: 0, minWidth: 0, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch" }}>
        {/* hero — full-bleed header (matches design prototype; no separate PageHead) */}
        <div style={{ position: "relative", padding: "max(16px, env(safe-area-inset-top)) 18px 18px", background: `linear-gradient(160deg, ${biz.from}, ${biz.to})` }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.14, background: "radial-gradient(circle at 80% 20%, #fff 0 1.5px, transparent 2px)", backgroundSize: "30px 30px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.20) 0%, transparent 42%, rgba(20,8,10,0.36) 100%)", pointerEvents: "none" }} />
          <p style={{ margin: "0 0 8px", position: "relative", fontFamily: T.body, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: "rgba(255,255,255,0.88)", textTransform: "uppercase" }}>Your business</p>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            <div style={{ width: 68, height: 68, borderRadius: 20, overflow: "hidden", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: "0 6px 18px rgba(0,0,0,0.16)", flexShrink: 0 }}>{biz.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6, minWidth: 0 }}>
                <h1 style={{ margin: 0, fontFamily: T.display, fontSize: 20.5, fontWeight: 700, color: "#fff", letterSpacing: -0.4, lineHeight: 1.18, textShadow: "0 2px 8px rgba(0,0,0,0.22)", overflow: "hidden", textOverflow: "ellipsis" }}>{biz.name}</h1>
                <Icon name="verified" size={18} c="#fff" style={{ flexShrink: 0, marginTop: 3 }} />
              </div>
              <p style={{ margin: "3px 0 0", fontFamily: T.body, fontSize: 12.5, color: "rgba(255,255,255,0.92)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>@{biz.handle.replace(/^@/, "")} · {cat.emoji} {cat.label}</p>
            </div>
          </div>
        </div>

        {/* stat bar — edge-to-edge */}
        <div style={{ display: "flex", width: "100%", background: "#fff", borderBottom: `1px solid ${T.line}`, boxSizing: "border-box" }}>
          {([["Followers", kfmt(biz.followers)], ["Avg views", kfmt(biz.avgViews)], ["Eng.", biz.eng + "%"], ["Posts", String(biz.posts?.length ? biz.posts.length * 41 : 248)]] as const).map(([l, v], i, arr) => (
            <div key={l} style={{ flex: 1, minWidth: 0, textAlign: "center", padding: "12px 2px", borderRight: i < arr.length - 1 ? `1px solid ${T.line}` : "none" }}>
              <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 14, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v}</p>
              <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 8.5, fontWeight: 700, color: T.ink3, textTransform: "uppercase", letterSpacing: 0.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l}</p>
            </div>
          ))}
        </div>

        <div style={{ padding: "16px 16px calc(24px + env(safe-area-inset-bottom))", boxSizing: "border-box", maxWidth: "100%" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <button onClick={() => setSheet("hiring")} style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", background: hireBg, border: `1px solid ${hireBd}`, borderRadius: 14, cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontSize: 17, flexShrink: 0 }}>{hire.emoji}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontFamily: T.body, fontSize: 9.5, fontWeight: 700, color: hireInk, textTransform: "uppercase", letterSpacing: 0.4, opacity: 0.85 }}>Hiring status</span>
              <span style={{ display: "block", fontFamily: T.body, fontSize: 13.5, fontWeight: 700, color: hireInk, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hire.title}</span>
            </span>
            <Icon name="chevR" size={16} c={hireInk} />
          </button>
          <button onClick={() => setSheet("details")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 16px", background: "#fff", border: `1px solid ${T.line}`, borderRadius: 14, cursor: "pointer", fontFamily: T.body, fontSize: 13, fontWeight: 700, color: T.ink2, flexShrink: 0 }}>
            <Icon name="pencil" size={16} c={T.ink2} />Edit
          </button>
        </div>

        {/* preview */}
        {onPreview && <Btn variant="ghost" icon="eye" onClick={onPreview} style={{ marginBottom: 14 }}>Preview how creators see you</Btn>}

        <p style={{ margin: "0 0 16px", padding: "0 2px", fontFamily: T.body, fontSize: 13.5, lineHeight: 1.55, color: T.ink2 }}>{biz.bio}</p>

        {/* campaigns */}
        <CampaignsCard campaigns={campaigns} onNew={() => onNewCampaign?.()} />

        {/* pitch credits */}
        <ProfileCard>
          <div style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: T.roseTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="spark" size={24} c={T.roseDark} fill={T.roseDark} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink }}>{biz.credits} pitch credits</p>
              <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Free plan · ₹1,000 buys 10 more</p>
            </div>
            <Btn variant="soft" size="sm" onClick={() => {}} style={{ width: "auto", flexShrink: 0 }}>Buy</Btn>
          </div>
        </ProfileCard>

        {/* recent posts */}
        {biz.posts && biz.posts.length > 0 && (
          <ProfileCard>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Icon name="grid" size={17} c={T.rose} />
              <span style={{ fontFamily: T.display, fontSize: 15.5, fontWeight: 700, color: T.ink }}>Recent posts</span>
            </div>
            <div style={{ display: "flex", gap: 9, overflowX: "auto" }}>
              {biz.posts.slice(0, 6).map((p, i) => (
                <div key={i} style={{ width: 76, height: 76, borderRadius: 14, background: `linear-gradient(135deg, ${biz.from}, ${biz.to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>{p}</div>
              ))}
            </div>
          </ProfileCard>
        )}

        {/* settings */}
        <ProfileCard pad={4}>
          {([["shield", "Privacy & data"], ["info", "Help & support"], ["user", "Account settings"]] as const).map(([ic, lab], i, arr) => (
            <button key={lab} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 13px", background: "none", border: "none", borderBottom: i < arr.length - 1 ? `1px solid ${T.lineSoft}` : "none", cursor: "pointer" }}>
              <Icon name={ic} size={19} c={T.ink3} />
              <span style={{ flex: 1, textAlign: "left", fontFamily: T.body, fontSize: 14, fontWeight: 600, color: T.ink }}>{lab}</span>
              <Icon name="chevR" size={17} c={T.ink3} />
            </button>
          ))}
        </ProfileCard>

        {onSignOut && (
          <button onClick={onSignOut} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", background: "none", border: "none", cursor: "pointer", fontFamily: T.body, fontSize: 13.5, fontWeight: 700, color: "#b42318" }}>
            <Icon name="logout" size={17} c="#b42318" /> Sign out
          </button>
        )}
        </div>
      </div>

      {sheet === "details" && <EditSheet biz={biz} onClose={() => setSheet(null)} onSave={(delta) => { onUpdate(delta); setSheet(null); }} />}
      {sheet === "hiring" && <HiringSheet hiring={biz.hiring} onClose={() => setSheet(null)} onSave={(v) => { onUpdate({ hiring: v }); setSheet(null); }} />}
    </div>
  );
}
