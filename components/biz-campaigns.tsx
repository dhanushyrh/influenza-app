"use client";
import React, { useState, useEffect } from "react";
import { T, inr } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Btn, WizardChrome, StepHead, SectionLabel, Footer, Pill, Avatar } from "@/components/ob-primitives";
import {
  CAT_MAP, catOf, SIZE, CAMP_STATUS, bizDelivStr, makeCampaign, dealsForCampaign,
  type Campaign, type CampaignDeliv, type Deal, type DealRuntime,
} from "@/lib/biz-data";

// ── Confetti burst on publish (reuses izBurst/izPop keyframes in globals.css) ──
export function BizCampBurst({ seed }: { seed: number }) {
  const [parts, setParts] = useState<
    { id: string; dx: number; dy: number; rot: string; c: string; d: number; sq: boolean; sz: number }[] | null
  >(null);
  useEffect(() => {
    if (!seed) return;
    const colors = ["#ff4d6d", "#138a5e", "#f6b53f", "#7a5af0", "#2a6fdb", "#ff6b35"];
    setParts(
      Array.from({ length: 24 }).map((_, i) => {
        const ang = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.5;
        const dist = 90 + Math.random() * 120;
        return {
          id: seed + "_" + i,
          dx: Math.cos(ang) * dist,
          dy: Math.sin(ang) * dist - 30,
          rot: Math.random() * 720 - 360 + "deg",
          c: colors[i % colors.length],
          d: 0.5 + Math.random() * 0.4,
          sq: Math.random() > 0.5,
          sz: 7 + Math.random() * 6,
        };
      })
    );
    const t = setTimeout(() => setParts(null), 1100);
    return () => clearTimeout(t);
  }, [seed]);
  if (!parts) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 96, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: "50%", top: "40%" }}>
        {parts.map((p) => (
          <span
            key={p.id}
            style={{
              position: "absolute", width: p.sz, height: p.sz, borderRadius: p.sq ? 2 : 999, background: p.c,
              ["--dx" as string]: p.dx + "px", ["--dy" as string]: p.dy + "px", ["--rot" as string]: p.rot,
              animation: `izBurst ${p.d}s cubic-bezier(.15,.7,.4,1) forwards`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

// ── Campaigns card on the business profile ──
export function CampaignsCard({ campaigns, onNew, onOpen }: { campaigns: Campaign[]; onNew: () => void; onOpen?: (c: Campaign) => void }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 20, padding: 16, marginBottom: 13, maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13, minWidth: 0 }}>
        <Icon name="doc" size={17} c={T.rose} style={{ flexShrink: 0 }} />
        <h3 style={{ margin: 0, fontFamily: T.display, fontSize: 15.5, fontWeight: 700, color: T.ink, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Campaigns</h3>
        <button onClick={onNew} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 999, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${T.rose}, ${T.roseDark})`, color: "#fff", fontFamily: T.body, fontSize: 12.5, fontWeight: 700, boxShadow: `0 4px 12px ${T.roseTint2}`, flexShrink: 0 }}>
          <Icon name="plus" size={14} c="#fff" w={2.4} />New
        </button>
      </div>
      {campaigns.length === 0 ? (
        <p style={{ margin: 0, fontFamily: T.body, fontSize: 12.5, color: T.ink3, lineHeight: 1.5 }}>No campaigns yet. Post a brief and creators can pitch you directly.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {campaigns.map((c) => {
            const s = CAMP_STATUS[c.status];
            return (
              <button key={c.id} type="button" onClick={() => onOpen?.(c)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 11, padding: "11px 12px", background: T.bg, border: `1px solid ${T.line}`, borderRadius: 14, cursor: onOpen ? "pointer" : "default" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <p style={{ margin: 0, fontFamily: T.body, fontSize: 13.5, fontWeight: 700, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</p>
                    <Pill tone={s.tone} style={{ fontSize: 9.5 }}><span style={{ width: 5, height: 5, borderRadius: 999, background: s.dot }} />{s.label}</Pill>
                  </div>
                  <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>{inr(c.lo)}–{inr(c.hi).replace("₹", "")} · {c.status === "draft" ? "Not published" : `${c.pitches} pitch${c.pitches !== 1 ? "es" : ""}`}</p>
                </div>
                {c.newPitches > 0 && <span style={{ minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999, background: T.rose, color: "#fff", fontFamily: T.body, fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{c.newPitches}</span>}
                <Icon name="chevR" size={16} c={T.ink3} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function QtyStepper({ value, onChange, max = 8 }: { value: number; onChange: (v: number) => void; max?: number }) {
  const b = (icon: "x" | "plus", fn: () => void, on: boolean) => (
    <button onClick={fn} style={{ width: 30, height: 30, borderRadius: 9, border: `1px solid ${T.line}`, background: on ? "#fff" : "#f6f1ee", cursor: on ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", opacity: on ? 1 : 0.5 }}>
      <Icon name={icon} size={15} c={T.ink2} w={2.2} />
    </button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {b("x", () => value > 0 && onChange(value - 1), value > 0)}
      <span style={{ width: 16, textAlign: "center", fontFamily: T.display, fontSize: 16, fontWeight: 700, color: value ? T.ink : T.ink3 }}>{value}</span>
      {b("plus", () => value < max && onChange(value + 1), value < max)}
    </div>
  );
}

// ── 3-step create-campaign flow ──
export function CreateCampaignFlow({ defaultCatKey = "cafe", onClose, onPublish }: {
  defaultCatKey?: string;
  onClose: () => void;
  onPublish: (c: Campaign) => void;
}) {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState(0);
  const [f, setF] = useState({
    title: "", catKey: CAT_MAP[defaultCatKey] ? defaultCatKey : "food_drink", blurb: "",
    deliv: { reel: 1, post: 1, story: 2 } as CampaignDeliv, lo: 8000, hi: 12000,
    sizes: ["nano", "micro"] as string[], deadline: "2 weeks",
  });
  const set = (patch: Partial<typeof f>) => setF((p) => ({ ...p, ...patch }));
  const setDeliv = (k: keyof CampaignDeliv, v: number) => setF((p) => ({ ...p, deliv: { ...p.deliv, [k]: v } }));
  const toggleSize = (k: string) => setF((p) => ({ ...p, sizes: p.sizes.includes(k) ? p.sizes.filter((x) => x !== k) : [...p.sizes, k] }));

  const totalDeliv = f.deliv.reel + f.deliv.post + f.deliv.story;
  const step1ok = f.title.trim().length > 2;
  const step2ok = totalDeliv > 0 && f.hi >= f.lo && f.lo > 0;
  const cat = catOf(f.catKey);

  function publish() {
    setDone(true);
    setBurst((n) => n + 1);
    onPublish(makeCampaign({ title: f.title.trim(), catKey: f.catKey, blurb: f.blurb.trim(), lo: f.lo, hi: f.hi, deliv: f.deliv, sizes: f.sizes, deadline: f.deadline }));
  }

  if (done) {
    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 88, background: T.bg, display: "flex", flexDirection: "column" }}>
        <BizCampBurst seed={burst} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", textAlign: "center" }}>
          <div style={{ width: 84, height: 84, borderRadius: 26, background: `linear-gradient(135deg, #17a06d, ${T.mintInk})`, display: "flex", alignItems: "center", justifyContent: "center", animation: "izPop .5s cubic-bezier(.2,.9,.3,1)", boxShadow: "0 14px 36px rgba(19,138,94,0.32)" }}>
            <Icon name="check" size={42} c="#fff" w={2.6} />
          </div>
          <h1 style={{ margin: "20px 0 0", fontFamily: T.display, fontSize: 26, fontWeight: 700, color: T.ink, letterSpacing: -0.4 }}>Campaign is live! 🎉</h1>
          <p style={{ margin: "10px 0 0", maxWidth: 300, fontFamily: T.body, fontSize: 14, color: T.ink2, lineHeight: 1.5 }}>
            <strong style={{ color: T.ink }}>{f.title.trim()}</strong> is now in the creator feed. Local creators can pitch you — pitches land in Collabs.
          </p>
          <div style={{ marginTop: 22, width: "100%", maxWidth: 320 }}>
            <Btn variant="primary" size="lg" icon="chevR" onClick={onClose}>Done</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 88, background: T.bg, display: "flex", flexDirection: "column" }}>
      <WizardChrome label="New campaign" step={step} total={3} onBack={() => (step === 1 ? onClose() : setStep(step - 1))} />
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 12px" }}>
        {step === 1 && (
          <React.Fragment>
            <StepHead emoji="✏️" title="What's the campaign?" sub="Give creators the gist — a clear title and a short brief." />
            <SectionLabel>Campaign title</SectionLabel>
            <input value={f.title} onChange={(e) => set({ title: e.target.value.slice(0, 60) })} placeholder="e.g. Cold brew menu launch" style={{ width: "100%", boxSizing: "border-box", height: 48, padding: "0 14px", border: `1.5px solid ${T.line}`, borderRadius: 14, fontFamily: T.body, fontSize: 15, color: T.ink, background: "#fff", outline: "none", marginBottom: 16 }} />

            <SectionLabel>Category</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
              {Object.keys(CAT_MAP).map((k) => {
                const c = CAT_MAP[k]; const on = f.catKey === k;
                return <button key={k} onClick={() => set({ catKey: k })} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 13px", borderRadius: 999, cursor: "pointer", border: `1.5px solid ${on ? T.rose : T.line}`, background: on ? T.roseTint : "#fff", fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: on ? T.roseDark : T.ink2 }}>{c.emoji} {c.label}</button>;
              })}
            </div>

            <SectionLabel>Brief · optional</SectionLabel>
            <div style={{ position: "relative" }}>
              <textarea value={f.blurb} onChange={(e) => set({ blurb: e.target.value.slice(0, 200) })} rows={4} placeholder="What's the vibe? What should creators capture?" style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${T.line}`, borderRadius: 14, padding: "12px 14px", fontFamily: T.body, fontSize: 14, color: T.ink, background: "#fff", outline: "none", resize: "none", lineHeight: 1.5 }} />
              <span style={{ position: "absolute", bottom: 10, right: 12, fontFamily: T.body, fontSize: 10.5, color: T.ink3 }}>{f.blurb.length}/200</span>
            </div>
          </React.Fragment>
        )}

        {step === 2 && (
          <React.Fragment>
            <StepHead emoji="🎬" title="Deliverables & budget" sub="What you want made, and the range you'll pay." />
            <SectionLabel>Deliverables</SectionLabel>
            <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 15, padding: "4px 14px", marginBottom: 18 }}>
              {([["reel", "🎬", "Reel"], ["post", "📷", "Feed post"], ["story", "✨", "Story"]] as const).map(([k, e, l], i) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 0", borderBottom: i < 2 ? `1px solid ${T.lineSoft}` : "none" }}>
                  <span style={{ fontSize: 20 }}>{e}</span>
                  <span style={{ flex: 1, fontFamily: T.body, fontSize: 14, fontWeight: 650, color: T.ink }}>{l}</span>
                  <QtyStepper value={f.deliv[k]} onChange={(v) => setDeliv(k, v)} />
                </div>
              ))}
            </div>

            <SectionLabel>Budget range</SectionLabel>
            <div style={{ display: "flex", gap: 11, marginBottom: 12 }}>
              {([["Min", "lo"], ["Max", "hi"]] as const).map(([lbl, key]) => (
                <div key={key} style={{ flex: 1, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 14, padding: "11px 13px" }}>
                  <p style={{ margin: "0 0 7px", fontFamily: T.body, fontSize: 10.5, fontWeight: 700, color: T.ink3, textTransform: "uppercase", letterSpacing: 0.3 }}>{lbl}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <button onClick={() => set({ [key]: Math.max(1000, f[key] - 1000) } as Partial<typeof f>)} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${T.line}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="x" size={13} c={T.ink2} /></button>
                    <span style={{ fontFamily: T.display, fontSize: 16, fontWeight: 700, color: T.ink }}>{inr(f[key])}</span>
                    <button onClick={() => set({ [key]: f[key] + 1000 } as Partial<typeof f>)} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${T.line}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="plus" size={13} c={T.ink2} /></button>
                  </div>
                </div>
              ))}
            </div>
            {f.hi < f.lo && <p style={{ margin: "0 0 8px", fontFamily: T.body, fontSize: 11.5, color: "#b42318" }}>Max should be at least the minimum.</p>}
            <p style={{ margin: 0, fontFamily: T.body, fontSize: 11.5, color: T.ink3, lineHeight: 1.5 }}>Creators pitch a quote within (or near) this range. You only pay when you accept a pitch.</p>
          </React.Fragment>
        )}

        {step === 3 && (
          <React.Fragment>
            <StepHead emoji="🎯" title="Audience & timing" sub="Who fits, and when you need it." />
            <SectionLabel>Preferred creator size</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
              {SIZE.map((s) => {
                const on = f.sizes.includes(s.key);
                return <button key={s.key} onClick={() => toggleSize(s.key)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 13px", borderRadius: 999, cursor: "pointer", border: `1.5px solid ${on ? T.rose : T.line}`, background: on ? T.roseTint : "#fff", fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: on ? T.roseDark : T.ink2 }}>{s.label} <span style={{ fontWeight: 500, color: on ? T.roseDark : T.ink3 }}>{s.range}</span>{on && <Icon name="check" size={13} c={T.roseDark} w={2.4} />}</button>;
              })}
            </div>

            <SectionLabel>Deadline</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {["1 week", "2 weeks", "1 month", "Flexible"].map((d) => {
                const on = f.deadline === d;
                return <button key={d} onClick={() => set({ deadline: d })} style={{ padding: "9px 14px", borderRadius: 999, cursor: "pointer", border: `1.5px solid ${on ? T.rose : T.line}`, background: on ? T.roseTint : "#fff", fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: on ? T.roseDark : T.ink2 }}>{d}</button>;
              })}
            </div>

            <SectionLabel>Review</SectionLabel>
            <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 18, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                <span style={{ fontFamily: T.body, fontSize: 11.5, fontWeight: 700, color: T.roseDark, textTransform: "uppercase", letterSpacing: 0.3 }}>{cat.label}</span>
              </div>
              <p style={{ margin: "0 0 10px", fontFamily: T.display, fontSize: 18, fontWeight: 700, color: T.ink }}>{f.title.trim() || "Untitled campaign"}</p>
              {f.blurb.trim() && <p style={{ margin: "0 0 12px", fontFamily: T.body, fontSize: 12.5, color: T.ink2, lineHeight: 1.45 }}>{f.blurb.trim()}</p>}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
                <span style={{ padding: "4px 10px", borderRadius: 999, background: T.bg, border: `1px solid ${T.line}`, fontFamily: T.body, fontSize: 11.5, fontWeight: 650, color: T.ink2 }}>{bizDelivStr(f.deliv) || "No deliverables"}</span>
                <span style={{ padding: "4px 10px", borderRadius: 999, background: T.bg, border: `1px solid ${T.line}`, fontFamily: T.body, fontSize: 11.5, fontWeight: 650, color: T.ink2 }}>⏱ {f.deadline}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingTop: 12, borderTop: `1px dashed ${T.line}` }}>
                <span style={{ fontFamily: T.body, fontSize: 12, fontWeight: 600, color: T.ink3 }}>Budget</span>
                <span style={{ fontFamily: T.display, fontSize: 19, fontWeight: 700, color: T.ink }}>{inr(f.lo)}–{inr(f.hi).replace("₹", "")}</span>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>

      <Footer
        onContinue={() => (step === 3 ? publish() : setStep(step + 1))}
        label={step === 3 ? "Publish campaign" : "Continue"}
        disabled={(step === 1 && !step1ok) || (step === 2 && !step2ok) || (step === 3 && f.sizes.length === 0)}
      />
    </div>
  );
}

// ── Campaign detail + pitches inbox ───────────────────────────
function PitchInboxCard({ deal, rt, onOpen, onAccept, onDecline }: {
  deal: Deal; rt: DealRuntime;
  onOpen: () => void; onAccept: () => void; onDecline: () => void;
}) {
  const c = deal.creator;
  const delivText = deal.deliverables
    .map((d) => `${d.qty} ${d.qty > 1 ? (d.label === "Story" ? "Stories" : d.label + "s") : d.label}`)
    .join(" · ");
  const needsReply = rt.stage === 0 && !rt.declined && (deal.fresh || rt.pendingCounter);
  return (
    <div style={{
      background: "#fff", border: `1px solid ${needsReply ? T.roseTint2 : T.line}`,
      borderRadius: 18, padding: 14, display: "flex", flexDirection: "column", gap: 11,
      boxShadow: needsReply ? "0 4px 14px rgba(255,77,109,0.06)" : "0 2px 8px rgba(31,17,16,0.03)",
    }}>
      <button type="button" onClick={onOpen} style={{ display: "flex", alignItems: "center", gap: 11, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", width: "100%" }}>
        <Avatar emoji={c.emoji} from={c.from} to={c.to} size={46} r={14} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 15, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</p>
            {deal.fresh && <Pill tone="rose" style={{ fontSize: 9.5 }}>New</Pill>}
            {rt.pendingCounter && <Pill tone="amber" style={{ fontSize: 9.5 }}>Counter</Pill>}
            {rt.declined && <Pill tone="neutral" style={{ fontSize: 9.5 }}>Declined</Pill>}
          </div>
          <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink3 }}>{c.handle} · {delivText}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink }}>{inr(rt.amount)}</p>
        </div>
      </button>
      {rt.stage === 0 && !rt.declined && (
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" size="sm" icon="chat" onClick={onOpen} style={{ flex: 1 }}>Chat</Btn>
          {rt.pendingCounter ? (
            <Btn variant="primary" size="sm" icon="check" onClick={onAccept} style={{ flex: 1.4 }}>Accept · {inr(rt.amount)}</Btn>
          ) : (
            <>
              <Btn variant="danger" size="sm" onClick={onDecline} style={{ flex: 0.9 }}>Pass</Btn>
              <Btn variant="primary" size="sm" icon="check" onClick={onAccept} style={{ flex: 1.2 }}>Accept</Btn>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function CampaignDetail({ campaign, deals, states, onBack, onStatusChange, onOpenDeal, onAcceptPitch, onDeclinePitch }: {
  campaign: Campaign;
  deals: Deal[];
  states: Record<string, DealRuntime>;
  onBack: () => void;
  onStatusChange: (status: Campaign["status"]) => void;
  onOpenDeal: (dealId: string) => void;
  onAcceptPitch: (dealId: string) => void;
  onDeclinePitch: (dealId: string) => void;
}) {
  const [view, setView] = useState<"pitches" | "brief">("pitches");
  const [filter, setFilter] = useState<"all" | "new" | "pending">("all");
  const cat = catOf(campaign.catKey);
  const status = CAMP_STATUS[campaign.status];
  const pitches = dealsForCampaign(campaign, deals);

  const rows = pitches.filter((d) => {
    const rt = states[d.id];
    if (!rt || rt.declined) return filter === "all";
    if (filter === "new") return !!d.fresh;
    if (filter === "pending") return rt.stage === 0 && !rt.declined;
    return true;
  });

  const pendingCount = pitches.filter((d) => {
    const rt = states[d.id];
    return rt && rt.stage === 0 && !rt.declined;
  }).length;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 85, background: T.bg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, paddingTop: 52, borderBottom: `1px solid ${T.line}`, background: T.bg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 14px 10px" }}>
          <button type="button" onClick={onBack} style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex" }}>
            <Icon name="back" size={24} c={T.ink} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontFamily: T.body, fontSize: 11, fontWeight: 700, color: T.ink3, textTransform: "uppercase", letterSpacing: 0.4 }}>{cat.emoji} {cat.label}</p>
            <h1 style={{ margin: "2px 0 0", fontFamily: T.display, fontSize: 20, fontWeight: 700, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{campaign.title}</h1>
          </div>
          <Pill tone={status.tone}><span style={{ width: 5, height: 5, borderRadius: 999, background: status.dot }} />{status.label}</Pill>
        </div>

        <div style={{ display: "flex", gap: 8, padding: "0 14px 12px", flexWrap: "wrap" }}>
          {campaign.status === "live" && (
            <Btn variant="ghost" size="sm" onClick={() => onStatusChange("closed")} style={{ width: "auto" }}>Close campaign</Btn>
          )}
          {campaign.status === "closed" && (
            <Btn variant="soft" size="sm" onClick={() => onStatusChange("live")} style={{ width: "auto" }}>Reopen</Btn>
          )}
          {campaign.status === "draft" && (
            <Btn variant="primary" size="sm" onClick={() => onStatusChange("live")} style={{ width: "auto" }}>Publish</Btn>
          )}
        </div>

        <div style={{ display: "flex", gap: 20, padding: "0 18px", borderTop: `1px solid ${T.lineSoft}` }}>
          {([["pitches", `Pitches${pendingCount ? ` (${pendingCount})` : ""}`], ["brief", "Brief"]] as const).map(([k, lab]) => (
            <button key={k} type="button" onClick={() => setView(k)} style={{ background: "none", border: "none", padding: "10px 0", cursor: "pointer", position: "relative", fontFamily: T.body, fontSize: 13.5, fontWeight: 700, color: view === k ? T.ink : T.ink3 }}>
              {lab}
              {view === k && <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 2.5, borderRadius: 999, background: T.rose }} />}
            </button>
          ))}
        </div>
      </div>

      {view === "brief" ? (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 24px" }}>
          <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 18, padding: 16, marginBottom: 14 }}>
            {campaign.blurb && <p style={{ margin: "0 0 14px", fontFamily: T.body, fontSize: 14, color: T.ink2, lineHeight: 1.55 }}>{campaign.blurb}</p>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
              <span style={{ padding: "4px 10px", borderRadius: 999, background: T.bg, border: `1px solid ${T.line}`, fontFamily: T.body, fontSize: 11.5, fontWeight: 650, color: T.ink2 }}>{bizDelivStr(campaign.deliv)}</span>
              <span style={{ padding: "4px 10px", borderRadius: 999, background: T.bg, border: `1px solid ${T.line}`, fontFamily: T.body, fontSize: 11.5, fontWeight: 650, color: T.ink2 }}>⏱ {campaign.deadline}</span>
              {campaign.sizes.map((s) => (
                <span key={s} style={{ padding: "4px 10px", borderRadius: 999, background: T.roseTint, border: `1px solid ${T.roseTint2}`, fontFamily: T.body, fontSize: 11.5, fontWeight: 650, color: T.roseDark }}>{SIZE.find((x) => x.key === s)?.label ?? s}</span>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingTop: 12, borderTop: `1px dashed ${T.line}` }}>
              <span style={{ fontFamily: T.body, fontSize: 12, fontWeight: 600, color: T.ink3 }}>Budget</span>
              <span style={{ fontFamily: T.display, fontSize: 20, fontWeight: 700, color: T.ink }}>{inr(campaign.lo)}–{inr(campaign.hi).replace("₹", "")}</span>
            </div>
          </div>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 12.5, color: T.ink3, lineHeight: 1.5 }}>Live in the creator Campaigns feed. {campaign.status === "live" ? "Creators can pitch with 1 credit." : "Not visible to creators while closed or draft."}</p>
        </div>
      ) : (
        <>
          <div style={{ flexShrink: 0, display: "flex", gap: 8, padding: "10px 16px", overflowX: "auto" }}>
            {([["all", "All"], ["new", `New${campaign.newPitches ? ` (${campaign.newPitches})` : ""}`], ["pending", "Awaiting reply"]] as const).map(([k, lab]) => {
              const on = filter === k;
              return (
                <button key={k} type="button" onClick={() => setFilter(k)} style={{ padding: "7px 12px", borderRadius: 999, cursor: "pointer", flexShrink: 0, border: `1.5px solid ${on ? T.rose : T.line}`, background: on ? T.roseTint : "#fff", fontFamily: T.body, fontSize: 12, fontWeight: 700, color: on ? T.roseDark : T.ink2 }}>{lab}</button>
              );
            })}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 24px", display: "flex", flexDirection: "column", gap: 11 }}>
            {rows.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 16px" }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, background: T.lineSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <Icon name="send" size={26} c={T.ink3} />
                </div>
                <p style={{ margin: 0, fontFamily: T.display, fontSize: 16, fontWeight: 700, color: T.ink }}>No pitches yet</p>
                <p style={{ margin: "6px 0 0", fontFamily: T.body, fontSize: 13, color: T.ink3, lineHeight: 1.45 }}>When creators pitch this campaign, they&apos;ll show up here.</p>
              </div>
            ) : rows.map((d) => {
              const rt = states[d.id] ?? { stage: d.stage, amount: d.offer, log: d.log, pendingCounter: false, declined: false, reviewed: false };
              return (
                <PitchInboxCard
                  key={d.id}
                  deal={d}
                  rt={rt}
                  onOpen={() => onOpenDeal(d.id)}
                  onAccept={() => onAcceptPitch(d.id)}
                  onDecline={() => onDeclinePitch(d.id)}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
