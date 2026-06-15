"use client";
import React, { useState, useEffect, useRef } from "react";
import { T, inr } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Avatar, Pill, Btn, OBSheet, SectionLabel, OptionCard } from "@/components/ob-primitives";
import {
  CREDIT_PACKS, REFERRAL_REWARD, PROMO_PER, PROMO_CAP, LEDGER_TOTAL,
  type CreditLedgerEntry, type Referral, type Promo,
} from "@/lib/inf-data";

const REF_LINK = "influenza.app/join/aisha";

// ── Gold coin token ──
export function CreditCoin({ size = 22, glow = false }: { size?: number; glow?: boolean }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: 999, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(circle at 32% 28%, #ffe08a, #f6b53f 55%, #d98a16)",
      boxShadow: glow
        ? "0 2px 10px rgba(217,138,22,0.5), inset 0 1px 0 rgba(255,255,255,0.6)"
        : "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -2px 4px rgba(160,90,10,0.35)",
    }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" style={{ display: "block" }}>
        <path d="M12 3.5l1.9 5.4 5.6 1.1-4 4 .9 5.6L12 22l-5.3 2.6 .9-5.6-4-4 5.6-1.1L12 3.5z" fill="#fff7e0" stroke="#c9810f" strokeWidth="1.1" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// ── Confetti burst — fire by bumping `seed` ──
export function CreditBurst({ seed, amount }: { seed: number; amount: number }) {
  const [parts, setParts] = useState<Array<{ id: string; dx: number; dy: number; rot: string; c: string; d: number; sq: boolean; sz: number }> | null>(null);

  useEffect(() => {
    if (!seed) return;
    const colors = ["#ff4d6d", "#138a5e", "#f6b53f", "#7a5af0", "#2a6fdb", "#ff6b35"];
    const arr = Array.from({ length: 26 }).map((_, i) => {
      const ang = (Math.PI * 2 * i) / 26 + (Math.random() - 0.5) * 0.5;
      const dist = 90 + Math.random() * 120;
      return {
        id: seed + "_" + i,
        dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist - 30,
        rot: (Math.random() * 720 - 360) + "deg",
        c: colors[i % colors.length],
        d: 0.5 + Math.random() * 0.4,
        sq: Math.random() > 0.5,
        sz: 7 + Math.random() * 6,
      };
    });
    setParts(arr);
    const t = setTimeout(() => setParts(null), 1100);
    return () => clearTimeout(t);
  }, [seed]);

  if (!parts) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 96, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: "50%", top: "44%" }}>
        {parts.map((p) => (
          <span key={p.id} style={{
            position: "absolute", width: p.sz, height: p.sz,
            borderRadius: p.sq ? 2 : 999, background: p.c,
            "--dx": p.dx + "px", "--dy": p.dy + "px", "--rot": p.rot,
            animation: `izBurst ${p.d}s cubic-bezier(.15,.7,.4,1) forwards`,
          } as React.CSSProperties} />
        ))}
      </div>
      {amount > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "38%", display: "flex", justifyContent: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "12px 20px", borderRadius: 999, background: "rgba(31,17,16,0.92)", boxShadow: "0 14px 36px rgba(0,0,0,0.32)", animation: "izPop .5s cubic-bezier(.2,.9,.3,1) forwards" }}>
            <CreditCoin size={26} glow />
            <span style={{ fontFamily: T.display, fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>+{amount}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Compact credit balance pill ──
export function CreditPill({ credits, onClick, light }: { credits: number; onClick?: () => void; light?: boolean }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 11px 6px 7px", borderRadius: 999, cursor: "pointer",
      border: `1px solid ${light ? "rgba(255,255,255,0.4)" : T.line}`, background: light ? "rgba(255,255,255,0.16)" : "#fff",
      fontFamily: T.display, fontSize: 14, fontWeight: 700, color: light ? "#fff" : T.ink, WebkitTapHighlightColor: "transparent",
    }}>
      <CreditCoin size={20} />
      {credits}
      <span style={{ fontFamily: T.body, fontSize: 11, fontWeight: 600, color: light ? "rgba(255,255,255,0.8)" : T.ink3 }}>credits</span>
    </button>
  );
}

// ── Credit ledger row ──
function CreditTxnRow({ tx, last }: { tx: CreditLedgerEntry; last?: boolean }) {
  const pos = tx.amount > 0;
  const map: Record<CreditLedgerEntry["kind"], { ic: React.ComponentProps<typeof Icon>["name"]; bg: string; c: string }> = {
    spend:    { ic: "send",      bg: T.roseTint,  c: T.roseDark },
    promote:  { ic: "instagram", bg: "#f3ecff",   c: "#6a3fd0" },
    referral: { ic: "user",      bg: T.mintTint,  c: T.mintInk },
    buy:      { ic: "spark",     bg: "#fff3d6",   c: "#b9810f" },
    welcome:  { ic: "heart",     bg: T.roseTint,  c: T.roseDark },
  };
  const m = map[tx.kind] || { ic: "spark" as const, bg: T.lineSoft, c: T.ink3 };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: last ? "none" : `1px solid ${T.lineSoft}` }}>
      <div style={{ width: 36, height: 36, borderRadius: 11, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={m.ic} size={16} c={m.c} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontFamily: T.body, fontSize: 13.5, fontWeight: 650, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.label}</p>
        <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>{tx.when}{tx.note ? " · " + tx.note : ""}</p>
      </div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
        <CreditCoin size={15} />
        <span style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: pos ? T.mintInk : T.ink }}>{pos ? "+" : ""}{tx.amount}</span>
      </div>
    </div>
  );
}

function HubNav({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "52px 16px 12px", background: "#fff", borderBottom: `1px solid ${T.line}`, flexShrink: 0 }}>
      <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: 10, background: T.lineSoft, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name="back" size={18} c={T.ink} />
      </button>
      <h2 style={{ margin: 0, fontFamily: T.display, fontSize: 18, fontWeight: 700, color: T.ink, flex: 1 }}>{title}</h2>
      {right}
    </div>
  );
}

function MethodCard({ glyph, icon, title, desc, badge, onClick, accent = "rose" }: {
  glyph?: string; icon?: React.ComponentProps<typeof Icon>["name"]; title: string; desc: string; badge: string; onClick: () => void; accent?: "rose" | "mint" | "violet";
}) {
  const ac = accent === "mint" ? T.mintInk : accent === "violet" ? "#6a3fd0" : T.roseDark;
  const tint = accent === "mint" ? T.mintTint : accent === "violet" ? "#f3ecff" : T.roseTint;
  return (
    <button onClick={onClick} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 13, padding: 15, borderRadius: 18, border: `1px solid ${T.line}`, background: "#fff", cursor: "pointer", boxShadow: "0 2px 10px rgba(31,17,16,0.04)", WebkitTapHighlightColor: "transparent" }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, background: tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>
        {glyph || (icon && <Icon name={icon} size={22} c={ac} />)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 15.5, color: T.ink }}>{title}</p>
        <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 12.5, color: T.ink3, lineHeight: 1.4 }}>{desc}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 999, background: tint, fontFamily: T.display, fontSize: 12.5, fontWeight: 700, color: ac }}>{badge}</span>
        <Icon name="chevR" size={16} c={T.ink3} />
      </div>
    </button>
  );
}

function CapBar({ value, max, light }: { value: number; max: number; light?: boolean }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ height: 8, borderRadius: 999, background: light ? "rgba(255,255,255,0.28)" : T.lineSoft, overflow: "hidden" }}>
      <div style={{ width: pct + "%", height: "100%", borderRadius: 999, background: light ? "#fff" : `linear-gradient(90deg, ${T.rose}, ${T.roseDark})`, transition: "width .5s cubic-bezier(.2,.9,.3,1)" }} />
    </div>
  );
}

// ════════════ REFER & EARN ════════════
function ReferralPage({ referrals, onBack, onInvite, onVerifyReferral }: {
  referrals: Referral[];
  onBack: () => void;
  onInvite: () => void;
  onVerifyReferral: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    const v = referrals.find((r) => r.status === "verifying");
    if (!v) return;
    firedRef.current = true;
    const t = setTimeout(() => onVerifyReferral(v.id), 2600);
    return () => clearTimeout(t);
  }, [referrals, onVerifyReferral]);

  const invited = referrals.length;
  const joinedN = referrals.filter((r) => r.status === "joined" || r.status === "verifying" || r.status === "verified").length;
  const earned = referrals.reduce((a, r) => a + (r.earned || 0), 0);

  const statusMap: Record<Referral["status"], { tone: React.ComponentProps<typeof Pill>["tone"]; label: string }> = {
    invited:   { tone: "neutral", label: "Invited" },
    joined:    { tone: "amber",   label: "Setting up" },
    verifying: { tone: "rose",    label: "Verifying…" },
    verified:  { tone: "mint",    label: `+${REFERRAL_REWARD} earned` },
  };

  function doInvite() { onInvite(); setCopied(true); setTimeout(() => setCopied(false), 1800); }

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 75, background: T.bg, display: "flex", flexDirection: "column" }}>
      <HubNav title="Refer & earn" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 26 }}>
        <div style={{ position: "relative", overflow: "hidden", padding: "22px 18px 20px", background: "linear-gradient(150deg, #0c6e4a, #138a5e 60%, #17a06d)", textAlign: "center" }}>
          <div style={{ fontSize: 44, animation: "izPulse 2.4s ease-in-out infinite" }}>🎁</div>
          <h1 style={{ margin: "8px 0 0", fontFamily: T.display, fontSize: 25, fontWeight: 700, color: "#fff", letterSpacing: -0.4 }}>Give 5, get 5</h1>
          <p style={{ margin: "7px 0 0", fontFamily: T.body, fontSize: 13.5, color: "rgba(255,255,255,0.88)", lineHeight: 1.5, maxWidth: 280, marginInline: "auto" }}>
            Your friend starts with {REFERRAL_REWARD} free credits. You get <strong>{REFERRAL_REWARD} more</strong> the moment they verify their Instagram.
          </p>
        </div>

        <div style={{ padding: "16px 16px 0" }}>
          <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 18, padding: 15, marginBottom: 16 }}>
            <SectionLabel>Your invite link</SectionLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 13px", background: T.bg, border: `1px dashed ${T.line}`, borderRadius: 13, marginBottom: 11 }}>
              <Icon name="link" size={16} c={T.ink3} />
              <span style={{ flex: 1, fontFamily: T.body, fontSize: 13.5, fontWeight: 600, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{REF_LINK}</span>
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              <Btn variant={copied ? "mint" : "ghost"} icon={copied ? "check" : "doc"} onClick={doInvite}>{copied ? "Copied!" : "Copy link"}</Btn>
              <Btn variant="primary" icon="send" onClick={doInvite}>Share invite</Btn>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
            {([["Invited", invited], ["Joined", joinedN], ["Earned", earned]] as [string, number][]).map(([l, v], i) => (
              <div key={i} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, padding: "13px 8px", textAlign: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  {l === "Earned" && <CreditCoin size={17} />}
                  <span style={{ fontFamily: T.display, fontSize: 21, fontWeight: 700, color: l === "Earned" ? T.mintInk : T.ink }}>{v}</span>
                </div>
                <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 10.5, fontWeight: 600, color: T.ink3, textTransform: "uppercase", letterSpacing: 0.3 }}>{l}</p>
              </div>
            ))}
          </div>

          <SectionLabel>How it works</SectionLabel>
          <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 18, padding: "6px 15px", marginBottom: 18 }}>
            {(["📨 Share your link · Send it to creator friends in your niche.", "📲 They join & onboard · They sign up and connect Instagram.", `✅ They get verified · ${REFERRAL_REWARD} credits land in your wallet automatically.`]).map((row, i, arr) => {
              const [e, ...rest] = row.split(" · ");
              const [title, ...descParts] = rest.join(" · ").split(" · ");
              return (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < arr.length - 1 ? `1px solid ${T.lineSoft}` : "none" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 11, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{e.trim()}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontFamily: T.body, fontSize: 13.5, fontWeight: 700, color: T.ink }}>{title}</p>
                    <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink3, lineHeight: 1.4 }}>{descParts.join(" · ")}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <SectionLabel>Your referrals</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {referrals.map((r) => {
              const s = statusMap[r.status];
              return (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", background: "#fff", border: `1px solid ${r.status === "verified" ? T.mintTint2 : T.line}`, borderRadius: 15 }}>
                  <Avatar emoji={r.emoji} from={r.from} to={r.to} size={40} r={12} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontFamily: T.body, fontSize: 14, fontWeight: 700, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</p>
                    <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>{r.handle} · {r.when}</p>
                  </div>
                  <Pill tone={s.tone} style={{ fontSize: 10.5, display: "inline-flex", alignItems: "center", gap: 3 }}>
                    {r.status === "verified" && <CreditCoin size={13} />}
                    {s.label}
                  </Pill>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════ PROMOTE & EARN ════════════
function ShareSheet({ onClose, onShare }: { onClose: () => void; onShare: (type: string) => void }) {
  const [type, setType] = useState("Story");
  return (
    <OBSheet open onClose={onClose} title="Share Influenza" accent="rose">
      <SectionLabel>Format</SectionLabel>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["Story", "Feed post"].map((k) => (
          <button key={k} onClick={() => setType(k)} style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: `1.5px solid ${type === k ? T.rose : T.line}`, background: type === k ? T.roseTint : "#fff", fontFamily: T.body, fontSize: 13.5, fontWeight: 700, color: type === k ? T.roseDark : T.ink2, cursor: "pointer" }}>{k}</button>
        ))}
      </div>
      <SectionLabel>Preview</SectionLabel>
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 18, padding: "26px 20px", marginBottom: 16, background: "linear-gradient(155deg, #2a1418, #c9184a 70%, #ff4d6d)", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.5, background: "radial-gradient(60% 50% at 80% 15%, rgba(255,178,122,0.5), transparent 60%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 13px", borderRadius: 999, background: "rgba(255,255,255,0.16)", marginBottom: 16 }}>
            <CreditCoin size={16} /><span style={{ fontFamily: T.display, fontSize: 13, fontWeight: 700, color: "#fff" }}>Influenza</span>
          </div>
          <p style={{ margin: 0, fontFamily: T.display, fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.2, letterSpacing: -0.3 }}>I get paid to collab with local brands ✨</p>
          <p style={{ margin: "10px 0 0", fontFamily: T.body, fontSize: 13, color: "rgba(255,255,255,0.9)" }}>Join me on Influenza — start with 5 free credits</p>
          <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 12, background: "#fff" }}>
            <span style={{ fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: T.ink }}>{REF_LINK}</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 13px", background: T.mintTint, borderRadius: 13, marginBottom: 16 }}>
        <Icon name="info" size={16} c={T.mintInk} />
        <span style={{ fontFamily: T.body, fontSize: 12, color: T.mintInk, lineHeight: 1.4 }}>Credits land 24h after posting, based on verified reach.</span>
      </div>
      <Btn variant="primary" size="lg" icon="instagram" onClick={() => onShare(type)} style={{ background: "linear-gradient(135deg, #7a5af0, #4c2fae)" }}>Share {type === "Story" ? "to story" : "as post"}</Btn>
    </OBSheet>
  );
}

function PromotePage({ promos, promoMonth, onBack, onShare, onClaim, share, setShare, onSharePromo }: {
  promos: Promo[];
  promoMonth: number;
  onBack: () => void;
  onShare: () => void;
  onClaim: (id: string) => void;
  share: boolean;
  setShare: (v: boolean) => void;
  onSharePromo: (type: string) => void;
}) {
  const statusMap: Record<Promo["status"], { tone: React.ComponentProps<typeof Pill>["tone"]; label: string }> = {
    pending: { tone: "amber", label: "Tracking reach" },
    ready:   { tone: "mint",  label: "Ready to claim" },
    claimed: { tone: "neutral", label: "Claimed" },
  };
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 75, background: T.bg, display: "flex", flexDirection: "column" }}>
      <HubNav title="Promote & earn" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 26 }}>
        <div style={{ position: "relative", overflow: "hidden", padding: "22px 18px 20px", background: "linear-gradient(150deg, #4c2fae, #6a3fd0 55%, #7a5af0)" }}>
          <div style={{ position: "absolute", top: -20, right: -16, fontSize: 120, opacity: 0.14 }}>📣</div>
          <div style={{ position: "relative" }}>
            <h1 style={{ margin: 0, fontFamily: T.display, fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: -0.4 }}>Share & earn credits</h1>
            <p style={{ margin: "7px 0 0", fontFamily: T.body, fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.5, maxWidth: 290 }}>
              Post Influenza to your story. We track its reach for 24h, then drop credits in your wallet — bigger reach can pay even more 👀
            </p>
            <div style={{ marginTop: 16, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: T.body, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>This month</span>
                <span style={{ fontFamily: T.display, fontSize: 13, fontWeight: 700, color: "#fff" }}>{promoMonth}/{PROMO_CAP} credits</span>
              </div>
              <CapBar value={promoMonth} max={PROMO_CAP} light />
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 16px 0" }}>
          <Btn variant="primary" size="lg" icon="instagram" onClick={onShare} style={{ background: "linear-gradient(135deg, #7a5af0, #4c2fae)", boxShadow: "0 8px 20px rgba(122,90,240,0.32)", marginBottom: 18 }}>Share to Instagram</Btn>

          <SectionLabel>How it pays</SectionLabel>
          <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 18, padding: "6px 15px", marginBottom: 18 }}>
            {[
              ["📲", "Share to your story", "Tap share — we generate a branded card with your handle."],
              ["📊", "We track reach for 24h", "Reach is pulled straight from Instagram insights."],
              ["🪙", `Earn ${PROMO_PER} credits`, `Credited after 24h. Capped at ${PROMO_CAP}/month — but a viral post can surprise you.`],
            ].map(([e, t, d], i, arr) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < arr.length - 1 ? `1px solid ${T.lineSoft}` : "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: 11, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{e}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontFamily: T.body, fontSize: 13.5, fontWeight: 700, color: T.ink }}>{t}</p>
                  <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink3, lineHeight: 1.4 }}>{d}</p>
                </div>
              </div>
            ))}
          </div>

          <SectionLabel>Your promotions</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {promos.map((p) => {
              const s = statusMap[p.status];
              return (
                <div key={p.id} style={{ background: "#fff", border: `1px solid ${p.status === "ready" ? T.mintTint2 : T.line}`, borderRadius: 16, padding: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, #e9d6ff, #b48af0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, flexShrink: 0 }}>{p.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <p style={{ margin: 0, fontFamily: T.body, fontSize: 13.5, fontWeight: 700, color: T.ink }}>{p.type} · {p.when}</p>
                        {p.overperform && <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: "#b9810f", background: "#fff3d6", padding: "2px 7px", borderRadius: 999 }}>Overperformed 🎉</span>}
                      </div>
                      <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink3 }}>
                        {p.reach >= 1e6 ? (p.reach / 1e6).toFixed(1) + "M" : p.reach >= 1000 ? (p.reach / 1000).toFixed(1) + "k" : p.reach} reached
                        {p.status === "pending" ? ` · credits in ${p.hrsLeft}h` : ""}
                      </p>
                    </div>
                    {p.status === "claimed" ? (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                        <CreditCoin size={16} /><span style={{ fontFamily: T.display, fontSize: 16, fontWeight: 700, color: T.mintInk }}>+{p.credits}</span>
                      </div>
                    ) : (
                      <Pill tone={s.tone} style={{ fontSize: 10.5 }}>{s.label}</Pill>
                    )}
                  </div>
                  {p.status === "ready" && (
                    <div style={{ marginTop: 11 }}>
                      <Btn variant="mint" size="sm" icon="spark" onClick={() => onClaim(p.id)}>Claim {PROMO_PER} credits</Btn>
                    </div>
                  )}
                  {p.status === "pending" && (
                    <div style={{ marginTop: 10 }}>
                      <CapBar value={24 - p.hrsLeft} max={24} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {share && <ShareSheet onClose={() => setShare(false)} onShare={(type) => { onSharePromo(type); setShare(false); }} />}
    </div>
  );
}

// ════════════ CREDITS HUB (full-screen overlay) ════════════
export function CreditsHub({ credits, ledger, referrals, promos, promoMonth, initialView = "hub", onClose, onOpenBuy, onClaimPromo, onSharePromo, onInvite, onVerifyReferral }: {
  credits: number;
  ledger: CreditLedgerEntry[];
  referrals: Referral[];
  promos: Promo[];
  promoMonth: number;
  initialView?: string;
  onClose: () => void;
  onOpenBuy: () => void;
  onClaimPromo: (id: string) => void;
  onSharePromo: (type: string) => void;
  onInvite: () => void;
  onVerifyReferral: (id: string) => void;
}) {
  const [view, setView] = useState(initialView);
  const [share, setShare] = useState(false);

  if (view === "referral") return <ReferralPage referrals={referrals} onBack={() => setView("hub")} onInvite={onInvite} onVerifyReferral={onVerifyReferral} />;
  if (view === "promote") return <PromotePage promos={promos} promoMonth={promoMonth} onBack={() => setView("hub")} onShare={() => setShare(true)} onClaim={onClaimPromo} share={share} setShare={setShare} onSharePromo={onSharePromo} />;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 75, background: T.bg, display: "flex", flexDirection: "column" }}>
      <HubNav title="Credits" onBack={onClose} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ position: "relative", overflow: "hidden", padding: "20px 18px 18px", background: "linear-gradient(150deg, #2a1418 0%, #3a1e22 55%, #200d10 100%)" }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 90% at 85% 10%, ${T.roseTint2}, transparent 60%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: -24, right: -10, opacity: 0.9 }}><CreditCoin size={120} glow /></div>
          <div style={{ position: "relative" }}>
            <p style={{ margin: 0, fontFamily: T.body, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>Pitch credits</p>
            <div style={{ display: "flex", alignItems: "center", gap: 11, margin: "4px 0 2px" }}>
              <CreditCoin size={38} glow />
              <span style={{ fontFamily: T.display, fontSize: 46, fontWeight: 700, color: "#fff", letterSpacing: -1.5, lineHeight: 1 }}>{credits}</span>
            </div>
            <p style={{ margin: "6px 0 0", fontFamily: T.body, fontSize: 12.5, color: "rgba(255,255,255,0.72)" }}>1 credit = 1 campaign pitch · earn free credits below</p>
            <div style={{ marginTop: 15 }}>
              <Btn variant="primary" size="md" icon="spark" onClick={onOpenBuy}>Buy credits</Btn>
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 16px 26px" }}>
          <SectionLabel>Earn free credits</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 20 }}>
            <MethodCard glyph="🎁" accent="mint" title="Refer creators" desc={`Invite a creator — get ${REFERRAL_REWARD} credits when they verify.`} badge={`+${REFERRAL_REWARD}`} onClick={() => setView("referral")} />
            <MethodCard glyph="📣" accent="violet" title="Promote Influenza" desc="Share to your story — earn credits on reach after 24h." badge={`+${PROMO_PER}`} onClick={() => setView("promote")} />
            <MethodCard icon="spark" accent="rose" title="Buy credits" desc="Top up instantly — from ₹500 for 10 credits." badge="₹500" onClick={onOpenBuy} />
          </div>

          <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, padding: "13px 15px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
              <span style={{ fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: T.ink2 }}>Promo credits this month</span>
              <span style={{ fontFamily: T.display, fontSize: 13, fontWeight: 700, color: promoMonth >= PROMO_CAP ? T.mintInk : T.ink3 }}>{promoMonth}/{PROMO_CAP}</span>
            </div>
            <CapBar value={promoMonth} max={PROMO_CAP} />
            <p style={{ margin: "9px 0 0", fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>
              {promoMonth >= PROMO_CAP ? "Cap reached 🎉 resets on the 1st." : `${PROMO_CAP - promoMonth} more credits available from promoting this month.`}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 2px 4px" }}>
            <h3 style={{ margin: 0, fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.ink, flex: 1 }}>Recent activity</h3>
            <span style={{ fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>{LEDGER_TOTAL} total</span>
          </div>
          <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 18, padding: "0 14px" }}>
            {ledger.map((tx, i) => <CreditTxnRow key={tx.id} tx={tx} last={i === ledger.length - 1} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════ BUY CREDITS SHEET ════════════
export function BuyCreditsSheet({ open, onClose, onBuy }: {
  open: boolean;
  onClose: () => void;
  onBuy: (pack: typeof CREDIT_PACKS[number]) => void;
}) {
  const [sel, setSel] = useState("p25");
  const pack = CREDIT_PACKS.find((p) => p.id === sel)!;
  return (
    <OBSheet open={open} onClose={onClose} title="Buy credits" accent="rose">
      <p style={{ margin: "0 0 15px", fontFamily: T.body, fontSize: 13, color: T.ink2, lineHeight: 1.5 }}>Each credit lets you pitch one campaign. Top up and pitch the brands you love.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {CREDIT_PACKS.map((p) => {
          const on = sel === p.id;
          return (
            <button key={p.id} onClick={() => setSel(p.id)} style={{ display: "flex", alignItems: "center", gap: 13, padding: 14, borderRadius: 16, cursor: "pointer", textAlign: "left", border: `1.5px solid ${on ? T.rose : T.line}`, background: on ? T.roseTint : "#fff" }}>
              <CreditCoin size={38} glow={on} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 17, color: T.ink }}>{p.credits} credits</p>
                  {p.bonus > 0 && <span style={{ fontFamily: T.body, fontSize: 10.5, fontWeight: 700, color: T.mintInk, background: T.mintTint, padding: "2px 7px", borderRadius: 999 }}>+{p.bonus} bonus</span>}
                </div>
                {p.tag && <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 11.5, color: T.roseDark, fontWeight: 600 }}>{p.tag}</p>}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 17, color: T.ink }}>{inr(p.price)}</p>
                <div style={{ width: 20, height: 20, marginLeft: "auto", marginTop: 4, borderRadius: 999, border: on ? "none" : `2px solid ${T.line}`, background: on ? T.rose : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {on && <Icon name="check" size={12} c="#fff" w={2.6} />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <Btn variant="primary" size="lg" icon="lock" onClick={() => onBuy(pack)}>Pay {inr(pack.price)} · get {pack.credits} credits</Btn>
      <p style={{ textAlign: "center", fontFamily: T.body, fontSize: 11, color: T.ink3, margin: "10px 0 0" }}>🔒 Mock checkout · secured by Stripe</p>
    </OBSheet>
  );
}

// ════════════ OUT-OF-CREDITS GATE ════════════
export function CreditGateSheet({ open, onClose, onEarn, onBuy }: {
  open: boolean;
  onClose: () => void;
  onEarn: () => void;
  onBuy: () => void;
}) {
  return (
    <OBSheet open={open} onClose={onClose} title="Out of credits" accent="rose">
      <div style={{ textAlign: "center", padding: "4px 0 14px" }}>
        <div style={{ fontSize: 46 }}>🫙</div>
        <p style={{ margin: "10px 0 0", fontFamily: T.display, fontSize: 19, fontWeight: 700, color: T.ink }}>You&apos;re out of pitch credits</p>
        <p style={{ margin: "6px auto 0", maxWidth: 280, fontFamily: T.body, fontSize: 13, color: T.ink3, lineHeight: 1.5 }}>You need 1 credit to pitch a campaign. Earn them free or top up — takes a second.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        <OptionCard emoji="🎁" accent="mint" title="Earn free credits" desc="Refer creators or promote Influenza" onClick={onEarn} trailing={<Icon name="chevR" size={18} c={T.mintInk} />} />
        <OptionCard icon="spark" accent="rose" title="Buy credits" desc="From ₹500 for 10 credits" onClick={onBuy} trailing={<Icon name="chevR" size={18} c={T.roseDark} />} />
      </div>
    </OBSheet>
  );
}
