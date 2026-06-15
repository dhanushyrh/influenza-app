"use client";
import React, { useState, useMemo } from "react";
import { T, inr, kfmt } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Avatar, Pill, Btn, OBSheet, SectionLabel } from "@/components/ob-primitives";
import { HiringPill, PageHead } from "@/components/biz-nav";
import { CreditCoin, CreditPill } from "@/components/inf-credits";
import { type MyCreator, type Opp } from "@/lib/inf-data";
import { CAT, catOf, type Deliverable } from "@/lib/biz-data";

const plr = (label: string, qty: number) => qty > 1 ? (label === "Story" ? "Stories" : label + "s") : label;
const budgetStr = (lo: number, hi: number) => `${inr(lo)}–${inr(hi).replace("₹", "")}`;

function DelivChips({ deliv, tone = "bg" }: { deliv: Deliverable[]; tone?: "bg" | "white" }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
      {deliv.map((x, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 999, background: tone === "white" ? "#fff" : T.bg, border: `1px solid ${T.line}`, fontFamily: T.body, fontSize: 11.5, fontWeight: 650, color: T.ink2 }}>{x.emoji} {x.qty} {plr(x.label, x.qty)}</span>
      ))}
    </div>
  );
}

function OppCard({ o, onView, onPitch, sent, hasCredits }: { o: Opp; onView: () => void; onPitch: () => void; sent: boolean; hasCredits: boolean }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 20, padding: 15, boxShadow: "0 2px 10px rgba(31,17,16,0.04)" }}>
      <button onClick={onView} style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Avatar emoji={o.biz.emoji} from={o.biz.from} to={o.biz.to} size={46} r={14} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 15.5, color: T.ink, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{o.biz.short}</p>
            <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink3 }}>{catOf(o.category).emoji} {catOf(o.category).label} · {o.biz.area} · {o.dist} km</p>
          </div>
          <HiringPill status={o.hiring} size="sm" />
        </div>
        <div style={{ marginTop: 13, padding: 13, borderRadius: 14, background: T.roseTint }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
            <Icon name="doc" size={15} c={T.roseDark} />
            <span style={{ fontFamily: T.body, fontWeight: 750, fontSize: 11, color: T.roseDark, letterSpacing: 0.3, textTransform: "uppercase" as const }}>Brief</span>
          </div>
          <p style={{ margin: 0, fontFamily: T.display, fontWeight: 600, fontSize: 16, fontStyle: "italic", color: T.ink }}>{o.brief.title}</p>
          <p style={{ margin: "6px 0 11px", fontFamily: T.body, fontSize: 12.5, lineHeight: 1.45, color: T.ink2 }}>{o.brief.blurb}</p>
          <DelivChips deliv={o.brief.deliv} tone="white" />
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 11, paddingTop: 11, borderTop: `1px dashed ${T.roseTint2}` }}>
            <span style={{ fontFamily: T.body, fontSize: 11.5, color: T.ink3, fontWeight: 600 }}>Budget</span>
            <span style={{ fontFamily: T.display, fontSize: 19, fontWeight: 700, color: T.ink }}>{budgetStr(o.brief.budgetLo, o.brief.budgetHi)}</span>
          </div>
        </div>
      </button>
      <div style={{ marginTop: 12 }}>
        {sent ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 13, background: T.mintTint, fontFamily: T.body, fontSize: 13.5, fontWeight: 700, color: T.mintInk }}>
            <Icon name="check" size={16} c={T.mintInk} w={2.4} /> Proposal sent
          </div>
        ) : (
          <Btn variant="primary" icon="send" onClick={onPitch}>Send proposal · 1 credit</Btn>
        )}
      </div>
    </div>
  );
}

const GRAD_PRESETS = [["#ffe4cc","#ffb27a"],["#f3dcb8","#d9a55f"],["#dCeccb","#9cc079"],["#e8d2b0","#c79a63"],["#ffd9e2","#f2a0b8"],["#cfe0d0","#7fa890"]];

function BusinessSheet({ o, onClose, onPitch, sent }: { o: Opp; onClose: () => void; onPitch: () => void; sent: boolean }) {
  return (
    <OBSheet open onClose={onClose} accent="rose">
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
        <Avatar emoji={o.biz.emoji} from={o.biz.from} to={o.biz.to} size={54} r={16} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <h3 style={{ margin: 0, fontFamily: T.display, fontSize: 19, fontWeight: 700, color: T.ink }}>{o.biz.short}</h3>
            <Icon name="verified" size={16} c={T.mint} />
          </div>
          <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 12.5, color: T.ink3 }}>{o.biz.handle} · {kfmt(o.followers)} followers</p>
        </div>
        <HiringPill status={o.hiring} size="sm" />
      </div>
      <p style={{ margin: "0 0 14px", fontFamily: T.body, fontSize: 13, color: T.ink2, lineHeight: 1.5 }}>{catOf(o.category).emoji} {catOf(o.category).label} in {o.biz.area} · {o.dist} km from you</p>
      <SectionLabel>Their vibe</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, marginBottom: 16 }}>
        {o.posts.map((em, i) => (
          <div key={i} style={{ aspectRatio: "1", borderRadius: 12, background: `linear-gradient(150deg, ${GRAD_PRESETS[i % 6][0]}, ${GRAD_PRESETS[i % 6][1]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>{em}</div>
        ))}
      </div>
      <SectionLabel>The brief</SectionLabel>
      <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, padding: 14, marginBottom: 16 }}>
        <p style={{ margin: 0, fontFamily: T.display, fontWeight: 600, fontSize: 16, fontStyle: "italic", color: T.ink }}>{o.brief.title}</p>
        <p style={{ margin: "6px 0 11px", fontFamily: T.body, fontSize: 12.5, lineHeight: 1.45, color: T.ink2 }}>{o.brief.blurb}</p>
        <DelivChips deliv={o.brief.deliv} />
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 12, paddingTop: 11, borderTop: `1px dashed ${T.line}` }}>
          <span style={{ fontFamily: T.body, fontSize: 12, color: T.ink3, fontWeight: 600 }}>Budget</span>
          <span style={{ fontFamily: T.display, fontSize: 20, fontWeight: 700, color: T.ink }}>{budgetStr(o.brief.budgetLo, o.brief.budgetHi)}</span>
        </div>
      </div>
      {sent ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", borderRadius: 14, background: T.mintTint, fontFamily: T.body, fontSize: 14, fontWeight: 700, color: T.mintInk }}>
          <Icon name="check" size={17} c={T.mintInk} w={2.4} /> Proposal already sent
        </div>
      ) : (
        <Btn variant="primary" size="lg" icon="send" onClick={onPitch}>Send a proposal · 1 credit</Btn>
      )}
    </OBSheet>
  );
}

function Stepper({ value, onChange, max = 6 }: { value: number; onChange: (v: number) => void; max?: number }) {
  const btn = (icon: "x" | "plus", fn: () => void, enabled: boolean) => (
    <button onClick={fn} style={{ width: 30, height: 30, borderRadius: 9, border: `1px solid ${T.line}`, background: enabled ? "#fff" : "#f6f1ee", cursor: enabled ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", opacity: enabled ? 1 : 0.5 }}>
      <Icon name={icon} size={15} c={T.ink2} w={2.2} />
    </button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {btn("x", () => value > 0 && onChange(value - 1), value > 0)}
      <span style={{ width: 16, textAlign: "center", fontFamily: T.display, fontSize: 16, fontWeight: 700, color: value ? T.ink : T.ink3 }}>{value}</span>
      {btn("plus", () => value < max && onChange(value + 1), value < max)}
    </div>
  );
}

function ProposalSheet({ o, me, credits = 0, onClose, onSend }: { o: Opp; me: MyCreator; credits?: number; onClose: () => void; onSend: (payload: { title: string; deliverables: Deliverable[]; amount: number; message: string }) => void }) {
  const priceOf = (code: string) => { const s = me.services.find((x) => x.code === code); if (!s) return 0; return code === "story" ? Math.round(s.price / 3) : s.price; };
  const fromBrief = (code: string) => { const d = o.brief.deliv.find((x) => x.label.toLowerCase().startsWith(code === "reel" ? "reel" : code === "post" ? "feed" : "story")); return d ? d.qty : 0; };
  const [qty, setQty] = useState({ reel: fromBrief("reel"), post: fromBrief("post"), story: fromBrief("story") });
  const suggested = useMemo(() => qty.reel * priceOf("reel") + qty.post * priceOf("post") + qty.story * priceOf("story"), [qty]);
  const [amount, setAmount] = useState(suggested);
  const [touched, setTouched] = useState(false);
  const liveAmount = touched ? amount : suggested;
  const [msg, setMsg] = useState(`Hi ${o.biz.short}! Loved your ${catOf(o.category).label.toLowerCase()} feed. I'd love to take on "${o.brief.title}" — here's what I'd deliver and my rate 👇`);

  const rows = [{ code: "reel", emoji: "🎬", label: "Reel" }, { code: "post", emoji: "📷", label: "Feed post" }, { code: "story", emoji: "✨", label: "Story" }];
  const total = qty.reel + qty.post + qty.story;
  const overBudget = liveAmount > o.brief.budgetHi;

  function send() {
    if (!total) return;
    const deliverables: Deliverable[] = rows.filter((r) => qty[r.code as keyof typeof qty] > 0).map((r) => ({ label: r.label, qty: qty[r.code as keyof typeof qty], emoji: r.emoji }));
    onSend({ title: o.brief.title, deliverables, amount: liveAmount, message: msg.trim() });
  }

  return (
    <OBSheet open onClose={onClose} title="Send proposal" accent="rose">
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 15, padding: "11px 13px", background: "#fff", border: `1px solid ${T.line}`, borderRadius: 15 }}>
        <Avatar emoji={o.biz.emoji} from={o.biz.from} to={o.biz.to} size={42} r={13} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 15, color: T.ink }}>{o.brief.title}</p>
          <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink3 }}>{o.biz.short} · budget {budgetStr(o.brief.budgetLo, o.brief.budgetHi)}</p>
        </div>
      </div>

      <SectionLabel>What you&apos;ll deliver</SectionLabel>
      <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 15, padding: "4px 14px", marginBottom: 16 }}>
        {rows.map((r, i) => (
          <div key={r.code} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 0", borderBottom: i < rows.length - 1 ? `1px solid ${T.lineSoft}` : "none" }}>
            <span style={{ fontSize: 20 }}>{r.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontFamily: T.body, fontSize: 14, fontWeight: 650, color: T.ink }}>{r.label}</p>
              <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>your rate {inr(priceOf(r.code))}</p>
            </div>
            <Stepper value={qty[r.code as keyof typeof qty]} onChange={(v) => setQty({ ...qty, [r.code]: v })} />
          </div>
        ))}
      </div>

      <SectionLabel>Your quote</SectionLabel>
      <div style={{ textAlign: "center", padding: "6px 0 2px" }}>
        <span style={{ fontFamily: T.display, fontSize: 40, fontWeight: 700, color: T.ink }}>{inr(liveAmount)}</span>
        <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 11.5, color: overBudget ? T.amber : T.ink3 }}>{overBudget ? "Above their stated budget — they can still accept" : `Within budget · ~${inr(liveAmount - Math.round(liveAmount * 0.1))} to you after fee`}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "12px 0 16px" }}>
        <button onClick={() => { setTouched(true); setAmount(Math.max(500, liveAmount - 500)); }} style={{ width: 38, height: 38, borderRadius: 11, border: `1px solid ${T.line}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="x" size={16} c={T.ink2} /></button>
        <span style={{ fontFamily: T.body, fontSize: 12, color: T.ink3, width: 70, textAlign: "center" }}>± ₹500</span>
        <button onClick={() => { setTouched(true); setAmount(liveAmount + 500); }} style={{ width: 38, height: 38, borderRadius: 11, border: `1px solid ${T.line}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="plus" size={16} c={T.ink2} /></button>
      </div>

      <SectionLabel>Message</SectionLabel>
      <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${T.line}`, borderRadius: 14, padding: "12px 14px", fontFamily: T.body, fontSize: 13.5, color: T.ink, background: "#fff", outline: "none", resize: "none", lineHeight: 1.5, marginBottom: 16 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 13px", background: "#fff", border: `1px solid ${T.line}`, borderRadius: 13, marginBottom: 12 }}>
        <CreditCoin size={20} />
        <span style={{ flex: 1, fontFamily: T.body, fontSize: 12.5, fontWeight: 650, color: T.ink2 }}>Sending a pitch costs <strong style={{ color: T.ink }}>1 credit</strong></span>
        <span style={{ fontFamily: T.body, fontSize: 12, color: T.ink3 }}>You have {credits}</span>
      </div>
      <Btn variant="primary" size="lg" icon="send" disabled={!total} onClick={send}>Send proposal · 1 credit</Btn>
    </OBSheet>
  );
}

export function Briefs({ me, briefs, sentKeys, credits = 0, onSendProposal, onNeedCredits, onOpenCredits }: {
  me: MyCreator;
  briefs: Opp[];
  sentKeys: string[];
  credits?: number;
  onSendProposal: (opp: Opp, payload: { title: string; deliverables: Deliverable[]; amount: number; message: string }) => void;
  onNeedCredits?: () => void;
  onOpenCredits?: () => void;
}) {
  const [cat, setCat] = useState("all");
  const [view, setView] = useState<Opp | null>(null);
  const [pitch, setPitch] = useState<Opp | null>(null);

  const startPitch = (o: Opp) => credits > 0 ? setPitch(o) : onNeedCredits?.();

  const filtered = useMemo(() => (cat === "all" ? briefs : briefs.filter((o) => (o.cats ?? [o.category]).includes(cat))), [cat, briefs]);
  const cats = [{ key: "all", emoji: "✨", label: "All" }, ...CAT];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <PageHead kicker="Brands hiring" title="Campaigns" sub="Live campaigns from local businesses. Pitch the ones you love."
        right={<CreditPill credits={credits} onClick={onOpenCredits} />} />

      <div style={{ flexShrink: 0, display: "flex", gap: 8, padding: "2px 16px 12px", overflowX: "auto" }}>
        {cats.map((c) => {
          const on = cat === c.key;
          return (
            <button key={c.key} onClick={() => setCat(c.key)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 13px", borderRadius: 999, cursor: "pointer", flexShrink: 0, border: `1.5px solid ${on ? T.rose : T.line}`, background: on ? T.roseTint : "#fff", fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: on ? T.roseDark : T.ink2, whiteSpace: "nowrap" as const }}>{c.emoji} {c.label}</button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "2px 16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "44px 20px" }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: T.lineSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><Icon name="search" size={28} c={T.ink3} /></div>
            <p style={{ margin: 0, fontFamily: T.display, fontSize: 17, fontWeight: 700, color: T.ink }}>No campaigns here yet</p>
            <p style={{ margin: "6px 0 0", fontFamily: T.body, fontSize: 13, color: T.ink3 }}>Try another category.</p>
          </div>
        ) : filtered.map((o) => (
          <OppCard key={o.key} o={o} sent={sentKeys.includes(o.key)} hasCredits={credits > 0} onView={() => setView(o)} onPitch={() => startPitch(o)} />
        ))}
      </div>

      {view && <BusinessSheet o={view} sent={sentKeys.includes(view.key)} onClose={() => setView(null)} onPitch={() => { setView(null); startPitch(view); }} />}
      {pitch && <ProposalSheet o={pitch} me={me} credits={credits} onClose={() => setPitch(null)} onSend={(payload) => { onSendProposal(pitch, payload); setPitch(null); }} />}
    </div>
  );
}
