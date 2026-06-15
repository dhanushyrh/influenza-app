"use client";
import React, { useState, useMemo } from "react";
import { T, inr } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Btn, Avatar, Pill, OBSheet, SectionLabel } from "@/components/ob-primitives";
import { catOf, type Creator, type MyBiz, type Deliverable } from "@/lib/biz-data";

function Stepper({ value, onChange, max = 6 }: { value: number; onChange: (v: number) => void; max?: number }) {
  const btn = (icon: "x" | "plus", fn: () => void, on: boolean) => (
    <button onClick={fn} style={{
      width: 30, height: 30, borderRadius: 9, border: `1px solid ${T.line}`,
      background: on ? "#fff" : "#f6f1ee", cursor: on ? "pointer" : "default",
      display: "flex", alignItems: "center", justifyContent: "center", opacity: on ? 1 : 0.5,
    }}>
      <Icon name={icon} size={15} c={T.ink2} w={2.2} />
    </button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {btn("x",    () => value > 0 && onChange(value - 1), value > 0)}
      <span style={{ width: 16, textAlign: "center", fontFamily: T.display, fontSize: 16, fontWeight: 700, color: value ? T.ink : T.ink3 }}>{value}</span>
      {btn("plus", () => value < max && onChange(value + 1), value < max)}
    </div>
  );
}

export function ReachOutSheet({ creator, biz, onClose, onSend }: {
  creator: Creator; biz: MyBiz; onClose: () => void;
  onSend: (payload: { title: string; deliverables: Deliverable[]; amount: number; message: string }) => void;
}) {
  const cat = catOf(creator.category);
  const priceOf = (code: string) => {
    const s = creator.services.find((x) => x.code === code);
    if (!s) return 0;
    return code === "story" ? Math.round(s.price / 3) : s.price;
  };
  const [qty, setQty] = useState({ reel: 1, post: 1, story: 3 });
  const [title, setTitle] = useState("New menu feature");
  const [msg, setMsg] = useState(`Hi ${creator.name.split(" ")[0]}! We're ${biz.name} in ${biz.area} and loved your ${cat.label.toLowerCase()} reels. We'd love to feature you — quick brief below 👇`);
  const [touched, setTouched] = useState(false);
  const [amount, setAmount] = useState(0);

  const suggested = useMemo(() => qty.reel * priceOf("reel") + qty.post * priceOf("post") + qty.story * priceOf("story"), [qty]);
  const liveAmount = touched ? amount : suggested;

  const rows = [
    { code: "reel", emoji: "🎬", label: "Reel" },
    { code: "post", emoji: "📷", label: "Feed post" },
    { code: "story", emoji: "✨", label: "Story" },
  ];
  const totalItems = qty.reel + qty.post + qty.story;
  const presets = [
    { label: "Match rates",  value: suggested },
    { label: "Package",      value: creator.pkg.price },
    { label: "+10%",         value: Math.round(suggested * 1.1 / 100) * 100 },
  ];

  function send() {
    if (!totalItems) return;
    const deliverables = rows
      .filter((r) => qty[r.code as keyof typeof qty] > 0)
      .map((r) => ({ label: r.label, qty: qty[r.code as keyof typeof qty], emoji: r.emoji }));
    onSend({ title: title.trim() || "Collaboration", deliverables, amount: liveAmount, message: msg.trim() });
  }

  return (
    <OBSheet open onClose={onClose} title="Reach out" accent="rose">
      {/* creator strip */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 15, padding: "11px 13px", background: "#fff", border: `1px solid ${T.line}`, borderRadius: 15 }}>
        <Avatar emoji={creator.emoji} from={creator.from} to={creator.to} size={44} r={13} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 15.5, color: T.ink }}>{creator.name}</p>
            {creator.verified && <Icon name="verified" size={15} c={T.mint} />}
          </div>
          <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink3 }}>{creator.handle} · {cat.label}</p>
        </div>
        <Pill tone="rose">Pitch · 1 credit</Pill>
      </div>

      {/* campaign title */}
      <SectionLabel>Campaign</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 13px", height: 46, borderRadius: 13, background: "#fff", border: `1.5px solid ${T.line}`, marginBottom: 16 }}>
        <Icon name="spark" size={17} c={T.rose} fill={T.rose} />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Cold brew menu launch" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: T.body, fontSize: 14.5, color: T.ink }} />
      </div>

      {/* deliverables */}
      <SectionLabel>Deliverables</SectionLabel>
      <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 15, padding: "4px 14px", marginBottom: 16 }}>
        {rows.map((r, i) => (
          <div key={r.code} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 0", borderBottom: i < rows.length - 1 ? `1px solid ${T.lineSoft}` : "none" }}>
            <span style={{ fontSize: 20 }}>{r.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontFamily: T.body, fontSize: 14, fontWeight: 650, color: T.ink }}>{r.label}</p>
              <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>{inr(priceOf(r.code))} each</p>
            </div>
            <Stepper value={qty[r.code as keyof typeof qty]} onChange={(v) => setQty({ ...qty, [r.code]: v })} />
          </div>
        ))}
      </div>

      {/* budget */}
      <SectionLabel>Your offer</SectionLabel>
      <div style={{ textAlign: "center", padding: "6px 0 4px" }}>
        <span style={{ fontFamily: T.display, fontSize: 40, fontWeight: 700, color: T.ink }}>{inr(liveAmount)}</span>
        <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>Suggested {inr(suggested)} based on {creator.name.split(" ")[0]}&apos;s rates</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "12px 0 10px" }}>
        <button onClick={() => { setTouched(true); setAmount(Math.max(500, liveAmount - 500)); }} style={{ width: 38, height: 38, borderRadius: 11, border: `1px solid ${T.line}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="x" size={16} c={T.ink2} />
        </button>
        <span style={{ fontFamily: T.body, fontSize: 12, color: T.ink3, width: 70, textAlign: "center" }}>± ₹500</span>
        <button onClick={() => { setTouched(true); setAmount(liveAmount + 500); }} style={{ width: 38, height: 38, borderRadius: 11, border: `1px solid ${T.line}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="plus" size={16} c={T.ink2} />
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {presets.map((preset, i) => {
          const on = liveAmount === preset.value;
          return (
            <button key={i} onClick={() => { setTouched(true); setAmount(preset.value); }} style={{ flex: 1, padding: "9px 4px", borderRadius: 12, cursor: "pointer", border: on ? `1.5px solid ${T.rose}` : `1px solid ${T.line}`, background: on ? T.roseTint : "#fff" }}>
              <p style={{ margin: 0, fontFamily: T.body, fontSize: 11, fontWeight: 700, color: on ? T.roseDark : T.ink3 }}>{preset.label}</p>
              <p style={{ margin: "2px 0 0", fontFamily: T.display, fontSize: 13.5, fontWeight: 700, color: on ? T.roseDark : T.ink }}>{inr(preset.value)}</p>
            </button>
          );
        })}
      </div>

      {/* message */}
      <SectionLabel>Message</SectionLabel>
      <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${T.line}`, borderRadius: 14, padding: "12px 14px", fontFamily: T.body, fontSize: 13.5, color: T.ink, background: "#fff", outline: "none", resize: "none", lineHeight: 1.5, marginBottom: 14 }} />

      {/* escrow note */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 13px", background: T.mintTint, borderRadius: 13, marginBottom: 16 }}>
        <Icon name="shield" size={18} c={T.mintInk} />
        <span style={{ fontFamily: T.body, fontSize: 11.5, color: T.mintInk, fontWeight: 600, lineHeight: 1.4 }}>
          No payment now. If {creator.name.split(" ")[0]} accepts, you fund escrow — released only when the post goes live.
        </span>
      </div>

      <Btn variant="primary" size="lg" icon="send" disabled={!totalItems} onClick={send}>Send pitch · {inr(liveAmount)}</Btn>
    </OBSheet>
  );
}
