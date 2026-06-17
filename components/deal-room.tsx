"use client";
import React, { useState, useRef, useEffect } from "react";
import { T, inr, kfmt } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Avatar, Pill, Btn, OBSheet } from "@/components/ob-primitives";
import { STAGES, STEP_LABELS, feeOf, payoutOf, type Deal, type DealRuntime, type Attachment } from "@/lib/biz-data";

// ── Stage tracker ────────────────────────────────────────────
function StageTracker({ stage, onTap }: { stage: number; onTap: () => void }) {
  return (
    <div onClick={onTap} style={{ display: "flex", alignItems: "flex-start", padding: "10px 16px 11px", cursor: "pointer", background: T.bg, borderBottom: `1px solid ${T.line}` }}>
      {STEP_LABELS.map((lab, i) => {
        const done = i <= stage;
        const active = i === stage + 1;
        const cur = i === stage;
        return (
          <React.Fragment key={i}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, width: 44, flexShrink: 0 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? `linear-gradient(135deg,${T.rose},${T.roseDark})` : "#fff",
                border: done ? "none" : active ? `2px solid ${T.rose}` : `2px solid ${T.line}`,
                boxShadow: cur ? `0 0 0 4px ${T.roseTint}` : "none",
              }}>
                {done ? <Icon name="check" size={13} c="#fff" w={2.6} /> :
                  <span style={{ width: 6, height: 6, borderRadius: 999, display: "block", background: active ? T.rose : T.line }} />}
              </div>
              <span style={{ fontFamily: T.body, fontSize: 9.5, fontWeight: done || active ? 700 : 600, color: done ? T.roseDark : active ? T.ink : T.ink3, textAlign: "center" }}>{lab}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{ flex: 1, height: 2, borderRadius: 999, marginTop: 10, background: i < stage ? T.rose : T.line }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Timeline helpers ─────────────────────────────────────────
function sideOf(by: string, role: string) { return by === role ? "me" : "them"; }

interface Peer { name: string; handle: string; emoji: string; from: string; to: string; }
interface Peers { business: Peer; creator: Peer; }

function Row({ side, avatar, children, tight }: {
  side: "me" | "them"; avatar?: { emoji: string; from: string; to: string } | null;
  children: React.ReactNode; tight?: boolean;
}) {
  const me = side === "me";
  return (
    <div style={{ display: "flex", flexDirection: me ? "row-reverse" : "row", alignItems: "flex-end", gap: 8, marginTop: tight ? 3 : 9 }}>
      {avatar !== undefined
        ? (avatar ? <Avatar emoji={avatar.emoji} from={avatar.from} to={avatar.to} size={26} r={9} /> : <div style={{ width: 26, flexShrink: 0 }} />)
        : <div style={{ width: 26, flexShrink: 0 }} />}
      <div style={{ maxWidth: "82%", display: "flex", flexDirection: "column", alignItems: me ? "flex-end" : "flex-start" }}>{children}</div>
    </div>
  );
}

// ── Timeline event renderers ──────────────────────────────────

function DateDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 4px 2px" }}>
      <div style={{ flex: 1, height: 1, background: T.line }} />
      <span style={{ fontFamily: T.body, fontSize: 11, fontWeight: 650, color: T.ink3, letterSpacing: 0.3 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: T.line }} />
    </div>
  );
}

function TextBubble({ ev, role, peers }: { ev: Extract<import("@/lib/biz-data").LogEvent, { type: "text" }>; role: string; peers: Peers }) {
  const side = sideOf(ev.by, role);
  const me = side === "me";
  const pMap = peers as unknown as Record<string, Peer>;
  const av = me ? null : { emoji: pMap[ev.by]?.emoji ?? "🙂", from: pMap[ev.by]?.from ?? "#fff", to: pMap[ev.by]?.to ?? "#eee" };
  const att = ev.attachment;
  return (
    <Row side={side} avatar={av}>
      {ev.text ? (
        <div style={{
          fontFamily: T.body, fontSize: 14.5, lineHeight: 1.42,
          padding: "9px 13px", borderRadius: 17,
          borderBottomRightRadius: me ? 5 : 17, borderBottomLeftRadius: me ? 17 : 5,
          background: me ? `linear-gradient(135deg, ${T.rose}, ${T.roseDark})` : "#fff",
          color: me ? "#fff" : T.ink,
          border: !me ? `1px solid ${T.line}` : "none",
          boxShadow: me ? "0 4px 14px rgba(255,77,109,0.22)" : "0 1px 3px rgba(0,0,0,0.03)",
        }}>{ev.text}</div>
      ) : null}
      {att && att.type === "url" && (
        <a href={att.value} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", background: me ? "rgba(255,255,255,0.18)" : "#fff", border: `1px solid ${me ? "rgba(255,255,255,0.3)" : T.line}`, borderRadius: 13, marginTop: ev.text ? 6 : 0, textDecoration: "none", maxWidth: 240 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: me ? "rgba(255,255,255,0.25)" : T.roseTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="arrowR" size={16} c={me ? "#fff" : T.roseDark} /></div>
          <span style={{ flex: 1, fontFamily: T.body, fontSize: 12, fontWeight: 650, color: me ? "#fff" : T.ink2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name || att.value}</span>
          <Icon name="arrowR" size={14} c={me ? "rgba(255,255,255,0.7)" : T.ink3} />
        </a>
      )}
      {att && att.type === "image" && (
        <img src={att.value} alt="" style={{ display: "block", maxWidth: 220, borderRadius: 13, marginTop: ev.text ? 6 : 0, border: `1px solid ${T.line}` }} />
      )}
      <span style={{ fontFamily: T.body, fontSize: 10, color: T.ink3, margin: "3px 6px 0" }}>{ev.time}</span>
    </Row>
  );
}

function BriefCard({ ev, deal, role, peers }: { ev: Extract<import("@/lib/biz-data").LogEvent, { type: "brief" }>; deal: Deal; role: string; peers: Peers }) {
  const side = sideOf(ev.by, role);
  const peerData = (peers as unknown as Record<string, Peer>)[ev.by];
  const av = side === "me" ? null : { emoji: peerData?.emoji ?? "🙂", from: peerData?.from ?? "#fff", to: peerData?.to ?? "#eee" };
  return (
    <Row side={side} avatar={av}>
      <div style={{ width: 272, background: "#fff", borderRadius: 18, overflow: "hidden", border: `1px solid ${T.line}`, boxShadow: "0 6px 20px rgba(31,17,16,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", background: T.roseTint }}>
          <Icon name="doc" size={16} c={T.roseDark} />
          <span style={{ fontFamily: T.body, fontWeight: 750, fontSize: 12.5, color: T.roseDark, letterSpacing: 0.2 }}>CAMPAIGN BRIEF</span>
          <span style={{ marginLeft: "auto", fontFamily: T.body, fontSize: 11, color: T.ink3 }}>{ev.time}</span>
        </div>
        <div style={{ padding: 14 }}>
          <p style={{ margin: 0, fontFamily: T.display, fontSize: 16, fontWeight: 600, fontStyle: "italic", color: T.ink }}>{deal.title}</p>
          <div style={{ marginTop: 11, display: "flex", flexDirection: "column", gap: 7 }}>
            {deal.deliverables.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{d.emoji}</span>
                <span style={{ fontFamily: T.body, fontSize: 13.5, color: T.ink2, flex: 1 }}>{d.label}</span>
                <span style={{ fontFamily: T.body, fontSize: 13.5, fontWeight: 700, color: T.ink }}>×{d.qty}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${T.line}`, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontFamily: T.body, fontSize: 12, color: T.ink3, fontWeight: 600 }}>Proposed budget</span>
            <span style={{ fontFamily: T.display, fontSize: 22, fontWeight: 700, color: T.ink }}>{inr(deal.offer)}</span>
          </div>
        </div>
      </div>
    </Row>
  );
}

function OfferCard({ ev }: { ev: Extract<import("@/lib/biz-data").LogEvent, { type: "offer" }> }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 4px" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 999, background: T.amberTint, border: "1px solid #f0e0b0" }}>
        <Icon name="swap" size={15} c={T.amber} />
        <span style={{ fontFamily: T.body, fontSize: 12.5, color: T.amber, fontWeight: 600 }}>{ev.byName} countered ·</span>
        {ev.prev > 0 && <span style={{ fontFamily: T.body, fontSize: 12.5, color: T.ink3, textDecoration: "line-through" }}>{inr(ev.prev)}</span>}
        <span style={{ fontFamily: T.display, fontSize: 14, fontWeight: 700, color: T.ink }}>{inr(ev.amount)}</span>
      </div>
    </div>
  );
}

function AcceptedEvent({ ev }: { ev: Extract<import("@/lib/biz-data").LogEvent, { type: "system" }> }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 4px" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 999, background: T.roseTint }}>
        <Icon name="check" size={15} c={T.roseDark} w={2.4} />
        <span style={{ fontFamily: T.body, fontSize: 12.5, color: T.roseDark, fontWeight: 650 }}>Deal accepted · {inr(ev.amount)}</span>
      </div>
    </div>
  );
}

function EscrowCard({ ev }: { ev: Extract<import("@/lib/biz-data").LogEvent, { type: "escrow" }> }) {
  const fee = feeOf(ev.amount);
  return (
    <div style={{ margin: "14px 0 6px" }}>
      <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", background: "linear-gradient(150deg, #f2fbf6 0%, #e6f6ee 100%)", border: `1px solid ${T.mintTint2}`, boxShadow: "0 8px 24px rgba(19,138,94,0.12)" }}>
        <div style={{ position: "absolute", top: -24, right: -18, width: 110, height: 110, borderRadius: 999, background: T.mintTint }} />
        <div style={{ position: "relative", padding: "15px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(19,138,94,0.18)" }}>
              <Icon name="shield" size={21} c={T.mint} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontFamily: T.body, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.4, color: T.mintInk, textTransform: "uppercase" }}>Funds secured in escrow</p>
              <p style={{ margin: "2px 0 0", fontFamily: T.display, fontSize: 24, fontWeight: 700, color: T.ink }}>{inr(ev.amount)}</p>
            </div>
          </div>
          <p style={{ margin: "11px 0 0", fontFamily: T.body, fontSize: 12.5, lineHeight: 1.5, color: T.ink2 }}>Held safely by Influenza. Auto-released to the creator the moment the post is verified — no chasing payments.</p>
          <div style={{ marginTop: 11, display: "flex", gap: 7 }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.7)", borderRadius: 11, padding: "8px 10px" }}>
              <p style={{ margin: 0, fontFamily: T.body, fontSize: 10, color: T.ink3, fontWeight: 600 }}>To creator</p>
              <p style={{ margin: "2px 0 0", fontFamily: T.display, fontWeight: 700, fontSize: 14, color: T.mintInk }}>{inr(ev.amount - fee)}</p>
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.7)", borderRadius: 11, padding: "8px 10px" }}>
              <p style={{ margin: 0, fontFamily: T.body, fontSize: 10, color: T.ink3, fontWeight: 600 }}>Platform fee 10%</p>
              <p style={{ margin: "2px 0 0", fontFamily: T.display, fontWeight: 700, fontSize: 14, color: T.ink2 }}>{inr(fee)}</p>
            </div>
          </div>
        </div>
      </div>
      <p style={{ textAlign: "center", fontFamily: T.body, fontSize: 10.5, color: T.ink3, margin: "5px 0 0" }}>{ev.time}</p>
    </div>
  );
}

function SubmissionCard({ ev, deal, role, peers }: { ev: Extract<import("@/lib/biz-data").LogEvent, { type: "submission" }>; deal: Deal; role: string; peers: Peers }) {
  const s = deal.submission;
  const me = role === "creator";
  const av = me ? null : { emoji: peers.creator.emoji, from: peers.creator.from, to: peers.creator.to };
  return (
    <Row side={me ? "me" : "them"} avatar={av}>
      <div style={{ width: 250, background: "#fff", borderRadius: 18, overflow: "hidden", border: `1px solid ${T.line}`, boxShadow: "0 6px 20px rgba(31,17,16,0.07)" }}>
        <div style={{ position: "relative", height: 150, background: `linear-gradient(150deg, ${s.from}, ${s.to})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 52, filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.18))" }}>{s.emoji}</span>
          <div style={{ position: "absolute", top: 9, left: 9 }}><Pill tone="inkSolid"><Icon name="play" size={11} c="#fff" fill="#fff" /> Reel</Pill></div>
          <div style={{ position: "absolute", bottom: 9, right: 9 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 999, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", fontFamily: T.body, fontSize: 10.5, color: "#fff", fontWeight: 700 }}>
              <Icon name="eye" size={11} c="#fff" /> {kfmt(s.views)}
            </span>
          </div>
        </div>
        <div style={{ padding: "12px 13px" }}>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 12.5, lineHeight: 1.45, color: T.ink2 }}>{s.caption}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 9, padding: "7px 10px", background: T.bg, borderRadius: 10 }}>
            <Icon name="play" size={13} c={T.rose} fill={T.rose} />
            <span style={{ fontFamily: T.body, fontSize: 11.5, color: T.ink2, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.link}</span>
            <Icon name="arrowR" size={13} c={T.ink3} />
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
            {[["heart", s.likes], ["chat", s.comments], ["eye", s.views]].map(([ic, v], i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.body, fontSize: 12, fontWeight: 600, color: T.ink2 }}>
                <Icon name={ic as "heart"} size={13} c={T.ink3} /> {kfmt(v as number)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Row>
  );
}

function ReleaseCard({ ev }: { ev: Extract<import("@/lib/biz-data").LogEvent, { type: "release" }> }) {
  const fee = feeOf(ev.amount);
  return (
    <div style={{ margin: "14px 0 6px" }}>
      <div style={{ borderRadius: 18, padding: "15px 16px", background: "linear-gradient(150deg, #ecfaf2, #ddf3e7)", border: `1px solid ${T.mintTint2}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 999, background: T.mint, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="check" size={19} c="#fff" w={2.6} />
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: T.body, fontSize: 11.5, fontWeight: 700, color: T.mintInk, letterSpacing: 0.3, textTransform: "uppercase" }}>Payment released</p>
            <p style={{ margin: "2px 0 0", fontFamily: T.display, fontSize: 21, fontWeight: 700, color: T.ink }}>{inr(ev.amount - fee)} <span style={{ fontSize: 13, fontWeight: 600, color: T.ink3 }}>to creator</span></p>
          </div>
        </div>
        <p style={{ margin: "9px 0 0", fontFamily: T.body, fontSize: 11.5, color: T.ink2 }}>{inr(ev.amount)} escrow − {inr(fee)} platform fee (10%). Settled instantly.</p>
      </div>
      <p style={{ textAlign: "center", fontFamily: T.body, fontSize: 10.5, color: T.ink3, margin: "5px 0 0" }}>{ev.time}</p>
    </div>
  );
}

function ReviewCard({ ev, deal, peers }: { ev: Extract<import("@/lib/biz-data").LogEvent, { type: "review" }>; deal: Deal; peers: Peers }) {
  const r = deal.review;
  const peerData = (peers as unknown as Record<string, Peer>)["business"];
  return (
    <Row side="them" avatar={{ emoji: peerData.emoji, from: peerData.from, to: peerData.to }}>
      <div style={{ width: 256, background: "#fff", borderRadius: 18, padding: 14, border: `1px solid ${T.line}`, boxShadow: "0 4px 14px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
          {[0,1,2,3,4].map(i => <Icon key={i} name="star" size={15} c={i < r.rating ? "#f5a623" : "#e7e0dd"} fill={i < r.rating ? "#f5a623" : "none"} />)}
        </div>
        <p style={{ margin: 0, fontFamily: T.display, fontStyle: "italic", fontSize: 14, lineHeight: 1.5, color: T.ink }}>"{r.text}"</p>
        <p style={{ margin: "9px 0 0", fontFamily: T.body, fontSize: 11.5, color: T.ink3, fontWeight: 600 }}>— {deal.business.name}</p>
      </div>
    </Row>
  );
}

function TimelineEvent({ ev, deal, role, peers }: { ev: import("@/lib/biz-data").LogEvent; deal: Deal; role: string; peers: Peers }) {
  switch (ev.type) {
    case "date": return <DateDivider label={ev.label} />;
    case "text": return <TextBubble ev={ev} role={role} peers={peers} />;
    case "brief": return <BriefCard ev={ev} deal={deal} role={role} peers={peers} />;
    case "offer": return <OfferCard ev={ev} />;
    case "system": return ev.kind === "accepted" ? <AcceptedEvent ev={ev} /> : null;
    case "escrow": return <EscrowCard ev={ev} />;
    case "submission": return <SubmissionCard ev={ev} deal={deal} role={role} peers={peers} />;
    case "release": return <ReleaseCard ev={ev} />;
    case "review": return <ReviewCard ev={ev} deal={deal} peers={peers} />;
    default: return null;
  }
}

// ── Action bar (role + stage aware) ──────────────────────────
function ActionBar({ deal, rt, role, peers, on }: {
  deal: Deal; rt: DealRuntime; role: "business" | "creator";
  peers: Peers; on: Record<string, () => void>;
}) {
  const amt = rt.amount;
  const payout = payoutOf(amt);
  const s = STAGES[rt.stage].key;

  const wait = (text: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "12px 14px", background: "#fff", borderRadius: 15, border: `1px solid ${T.line}` }}>
      <Icon name="clock" size={17} c={T.ink3} />
      <span style={{ fontFamily: T.body, fontSize: 12.5, color: T.ink2, fontWeight: 500, lineHeight: 1.4 }}>{text}</span>
    </div>
  );

  let content: React.ReactNode = null;

  if (s === "pitched") {
    if (role === "creator") {
      content = rt.pendingCounter
        ? wait(`Counter sent for ${inr(amt)}. Waiting for ${deal.business.short} to respond.`)
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <div style={{ display: "flex", gap: 9 }}>
              <Btn variant="danger" size="sm" onClick={on.decline} style={{ width: "auto", flex: 1 }}>Decline</Btn>
              <Btn variant="ghost" size="sm" icon="swap" onClick={on.counter} style={{ width: "auto", flex: 1.2 }}>Counter</Btn>
            </div>
            <Btn variant="primary" icon="check" onClick={on.accept}>Accept · {inr(amt)}</Btn>
          </div>
        );
    } else {
      content = rt.pendingCounter
        ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 2px" }}>
              <Icon name="swap" size={15} c={T.amber} />
              <span style={{ fontFamily: T.body, fontSize: 12.5, color: T.ink2, fontWeight: 600 }}>{deal.creator.name.split(" ")[0]} countered at {inr(amt)}</span>
            </div>
            <Btn variant="primary" icon="check" onClick={on.accept}>Accept counter · {inr(amt)}</Btn>
          </div>
        )
        : wait(`Pitch sent to ${deal.creator.name.split(" ")[0]} · awaiting reply. Switch to Creator view to respond.`);
    }
  } else if (s === "accepted") {
    content = role === "business"
      ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <Btn variant="mint" size="lg" icon="lock" onClick={on.fund}>Fund escrow · {inr(amt)}</Btn>
          <p style={{ margin: 0, textAlign: "center", fontFamily: T.body, fontSize: 11, color: T.ink3 }}>Held safely until the post goes live</p>
        </div>
      )
      : wait(`Accepted ✓ Waiting for ${deal.business.short} to fund escrow before you start.`);
  } else if (s === "funded") {
    content = role === "creator"
      ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <Btn variant="primary" size="lg" icon="send" onClick={on.submit}>Submit your post</Btn>
          <p style={{ margin: 0, textAlign: "center", fontFamily: T.body, fontSize: 11, color: T.mintInk, fontWeight: 600 }}>🔒 {inr(amt)} secured — deliver when ready</p>
        </div>
      )
      : wait(`Escrow funded ✓ ${deal.creator.name.split(" ")[0]} is creating your content.`);
  } else if (s === "submitted") {
    content = role === "business"
      ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <Btn variant="mint" size="lg" icon="shield" onClick={on.release}>Verify & release · {inr(payout)}</Btn>
          <Btn variant="ghost" size="sm" onClick={on.changes}>Request changes</Btn>
        </div>
      )
      : wait(`Submitted ✓ Waiting for ${deal.business.short} to verify the post & release ${inr(payout)}.`);
  } else if (s === "released") {
    content = (
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 14px", background: T.mintTint, borderRadius: 14 }}>
          <Icon name="checkCircle" size={19} c={T.mintInk} />
          <span style={{ fontFamily: T.body, fontSize: 12.5, color: T.mintInk, fontWeight: 650 }}>Collaboration complete · {inr(payout)} paid out</span>
        </div>
        {!rt.reviewed && <Btn variant="ghost" icon="star" onClick={on.review}>Leave a review</Btn>}
      </div>
    );
  }

  return <div style={{ padding: "10px 14px 8px" }}>{content}</div>;
}

// ── Composer with attachments ─────────────────────────────────
function Composer({ onSend }: { onSend: (text: string, att?: Attachment) => void }) {
  const [v, setV] = useState("");
  const [attach, setAttach] = useState<Attachment | null>(null);
  const [mode, setMode] = useState<null | "picker" | "url">(null);
  const [urlInput, setUrlInput] = useState("");
  const imgRef = useRef<HTMLInputElement>(null);

  function send() {
    if (!v.trim() && !attach) return;
    onSend(v.trim(), attach ?? undefined);
    setV(""); setAttach(null); setUrlInput(""); setMode(null);
  }
  function addUrl() {
    const raw = urlInput.trim(); if (!raw) return;
    const url = /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
    setAttach({ type: "url", value: url, name: raw.replace(/^https?:\/\//i, "").slice(0, 48) });
    setUrlInput(""); setMode(null);
  }

  return (
    <div style={{ background: T.bg, borderTop: `1px solid ${T.line}`, padding: "8px 14px 22px" }}>
      <input ref={imgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
        const f = e.target.files?.[0]; if (!f) return;
        setAttach({ type: "image", value: URL.createObjectURL(f), name: f.name });
        setMode(null); e.target.value = "";
      }} />
      {attach && (
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8, padding: "8px 11px", background: "#fff", border: `1px solid ${T.line}`, borderRadius: 13 }}>
          {attach.type === "image"
            ? <img src={attach.value} alt="" style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
            : <div style={{ width: 38, height: 38, borderRadius: 8, background: T.roseTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="arrowR" size={17} c={T.roseDark} /></div>}
          <span style={{ flex: 1, fontFamily: T.body, fontSize: 12.5, color: T.ink2, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{attach.name || attach.value}</span>
          <button onClick={() => setAttach(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}><Icon name="x" size={16} c={T.ink3} /></button>
        </div>
      )}
      {mode === "url" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addUrl()} placeholder="Paste a link or video URL…" autoFocus
            style={{ flex: 1, border: `1px solid ${T.line}`, background: "#fff", borderRadius: 999, padding: "9px 14px", fontFamily: T.body, fontSize: 13.5, color: T.ink, outline: "none" }} />
          <button onClick={addUrl} style={{ padding: "0 14px", borderRadius: 999, border: "none", background: T.rose, cursor: "pointer", fontFamily: T.body, fontSize: 13, fontWeight: 700, color: "#fff" }}>Add</button>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button onClick={() => setMode(mode ? null : "picker")} style={{ width: 34, height: 34, borderRadius: 999, background: mode ? T.roseTint : "#fff", border: `1px solid ${mode ? T.rose : T.line}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Icon name="plus" size={18} c={mode ? T.roseDark : T.ink3} />
          </button>
          {mode === "picker" && (
            <div style={{ position: "absolute", bottom: 42, left: 0, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, boxShadow: "0 8px 24px rgba(31,17,16,0.13)", padding: 6, minWidth: 160, zIndex: 30 }}>
              <button onClick={() => setMode("url")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "none", border: "none", borderRadius: 11, cursor: "pointer", fontFamily: T.body, fontSize: 13.5, fontWeight: 650, color: T.ink }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: T.roseTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="arrowR" size={16} c={T.roseDark} /></div>Link / URL
              </button>
              <button onClick={() => { imgRef.current?.click(); setMode(null); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "none", border: "none", borderRadius: 11, cursor: "pointer", fontFamily: T.body, fontSize: 13.5, fontWeight: 650, color: T.ink }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: T.mintTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="image" size={16} c={T.mintInk} /></div>Photo
              </button>
            </div>
          )}
        </div>
        <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message…"
          style={{ flex: 1, border: `1px solid ${T.line}`, background: "#fff", borderRadius: 999, padding: "9px 15px", fontFamily: T.body, fontSize: 14, color: T.ink, outline: "none" }} />
        <button onClick={send} style={{ width: 38, height: 38, borderRadius: 999, border: "none", background: (v.trim() || attach) ? `linear-gradient(135deg,${T.rose},${T.roseDark})` : "#eadfdb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
          <Icon name="send" size={17} c="#fff" />
        </button>
      </div>
    </div>
  );
}

// ── Role toggle ───────────────────────────────────────────────
function RoleToggle({ role, setRole, peers }: { role: "business" | "creator"; setRole: (r: "business" | "creator") => void; peers: Peers }) {
  const opts: { k: "business" | "creator"; label: string; em: string }[] = [
    { k: "business", label: "Business", em: peers.business.emoji },
    { k: "creator",  label: "Creator",  em: peers.creator.emoji },
  ];
  return (
    <div style={{ display: "flex", background: "#f0e9e6", borderRadius: 999, padding: 3, gap: 2 }}>
      {opts.map(o => {
        const on = role === o.k;
        return (
          <button key={o.k} onClick={() => setRole(o.k)} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 999, border: "none", cursor: "pointer",
            background: on ? "#fff" : "transparent", boxShadow: on ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            fontFamily: T.body, fontSize: 12, fontWeight: 700, color: on ? T.ink : T.ink3,
          }}>
            <span style={{ fontSize: 12 }}>{o.em}</span>{o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Action sheets ─────────────────────────────────────────────

function EscrowSheet({ open, onClose, amount, creator, onConfirm }: {
  open: boolean; onClose: () => void; amount: number;
  creator: { name: string; emoji: string }; onConfirm: () => void;
}) {
  const fee = feeOf(amount), payout = payoutOf(amount);
  return (
    <OBSheet open={open} onClose={onClose} title="Fund escrow" accent="mint">
      <div style={{ background: "linear-gradient(150deg,#f2fbf6,#e4f5ec)", border: `1px solid ${T.mintTint2}`, borderRadius: 18, padding: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="shield" size={26} c={T.mint} />
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 13, lineHeight: 1.5, color: T.mintInk, fontWeight: 600 }}>
            Your money is held by Influenza — not paid out until you verify {creator.name.split(" ")[0]}'s post is live.
          </p>
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${T.line}`, padding: "6px 16px", marginBottom: 14 }}>
        {[
          { label: "Deal amount", val: inr(amount), tone: "" },
          { label: `Creator receives (${inr(payout)} on verify)`, val: inr(payout), tone: "mint" },
          { label: "Platform fee (10%)", val: inr(fee), tone: "" },
          { label: "Charged today", val: inr(amount), tone: "", strong: true },
        ].map((row, i, arr) => (
          <React.Fragment key={i}>
            {i === arr.length - 2 && <div style={{ height: 1, background: T.lineSoft }} />}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0" }}>
              <span style={{ fontFamily: T.body, fontSize: 13.5, color: row.strong ? T.ink : T.ink2, fontWeight: row.strong ? 700 : 500 }}>{row.label}</span>
              <span style={{ fontFamily: T.display, fontSize: row.strong ? 18 : 14.5, fontWeight: 700, color: row.tone === "mint" ? T.mintInk : T.ink }}>{row.val}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "#fff", border: `1px solid ${T.line}`, borderRadius: 14, marginBottom: 16 }}>
        <div style={{ width: 34, height: 22, borderRadius: 5, background: "linear-gradient(135deg,#2a2a35,#4a4a58)" }} />
        <span style={{ fontFamily: T.body, fontSize: 13.5, color: T.ink, fontWeight: 600 }}>HDFC •••• 4821</span>
        <Icon name="chevD" size={16} c={T.ink3} style={{ marginLeft: "auto" }} />
      </div>
      <Btn variant="mint" size="lg" icon="lock" onClick={onConfirm}>Hold {inr(amount)} in escrow</Btn>
      <p style={{ textAlign: "center", fontFamily: T.body, fontSize: 11, color: T.ink3, margin: "10px 0 0" }}>🔒 Secured by Stripe · refundable until the post is verified</p>
    </OBSheet>
  );
}

function SubmitSheet({ open, onClose, deal, onConfirm }: { open: boolean; onClose: () => void; deal: Deal; onConfirm: () => void }) {
  const s = deal.submission;
  return (
    <OBSheet open={open} onClose={onClose} title="Submit your post" accent="rose">
      <p style={{ margin: "0 0 14px", fontFamily: T.body, fontSize: 13.5, lineHeight: 1.5, color: T.ink2 }}>
        Paste the live Instagram link. Once {deal.business.short} verifies it's up, escrow releases to you automatically.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", background: "#fff", border: `1.5px solid ${T.rose}`, borderRadius: 14, marginBottom: 12 }}>
        <Icon name="play" size={17} c={T.rose} fill={T.rose} />
        <span style={{ fontFamily: T.body, fontSize: 13.5, color: T.ink, flex: 1 }}>{s.link || "instagram.com/reel/…"}</span>
        <Icon name="check" size={17} c={T.mint} w={2.4} />
      </div>
      <div style={{ display: "flex", gap: 11, alignItems: "center", background: "#fff", borderRadius: 16, border: `1px solid ${T.line}`, padding: 11, marginBottom: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: `linear-gradient(150deg,${s.from},${s.to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{s.emoji}</div>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 12.5, color: T.ink, lineHeight: 1.4 }}>{s.caption || deal.title}</p>
          <p style={{ margin: "4px 0 0", fontFamily: T.body, fontSize: 11, color: T.ink3 }}>Detected: Reel · public</p>
        </div>
      </div>
      <Btn variant="primary" size="lg" icon="send" onClick={onConfirm}>Submit for review</Btn>
    </OBSheet>
  );
}

function CounterSheet({ open, onClose, base, onConfirm }: { open: boolean; onClose: () => void; base: number; onConfirm: (v: number) => void }) {
  const presets = [base, Math.round(base * 1.15 / 500) * 500, Math.round(base * 1.3 / 500) * 500];
  const [val, setVal] = useState(presets[1] || base);
  useEffect(() => {
    if (!open) return;
    const mid = Math.round(base * 1.15 / 500) * 500;
    setVal(mid > 0 ? mid : base);
  }, [open, base]);
  return (
    <OBSheet open={open} onClose={onClose} title="Counter-offer" accent="rose">
      <p style={{ margin: "0 0 14px", fontFamily: T.body, fontSize: 13.5, lineHeight: 1.5, color: T.ink2 }}>
        Their offer was {inr(base)}. Propose your rate — they can accept or keep talking.
      </p>
      <div style={{ textAlign: "center", padding: "10px 0 16px" }}>
        <span style={{ fontFamily: T.display, fontSize: 44, fontWeight: 700, color: T.ink }}>{inr(val)}</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {presets.map((p, i) => (
          <button key={i} onClick={() => setVal(p)} style={{
            flex: 1, padding: "11px 0", borderRadius: 13, cursor: "pointer", fontFamily: T.display, fontWeight: 700, fontSize: 15,
            border: val === p ? `1.5px solid ${T.rose}` : `1px solid ${T.line}`,
            background: val === p ? T.roseTint : "#fff", color: val === p ? T.roseDark : T.ink2,
          }}>{inr(p)}</button>
        ))}
      </div>
      <Btn variant="primary" size="lg" icon="swap" onClick={() => onConfirm(val)}>Send counter-offer</Btn>
    </OBSheet>
  );
}

function ReviewSheet({ open, onClose, counterpart, onConfirm }: { open: boolean; onClose: () => void; counterpart: Peer; onConfirm: () => void }) {
  const [rating, setRating] = useState(5);
  return (
    <OBSheet open={open} onClose={onClose} title="Leave a review" accent="mint">
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
        <Avatar emoji={counterpart.emoji} from={counterpart.from} to={counterpart.to} size={46} />
        <div>
          <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink }}>{counterpart.name}</p>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 12.5, color: T.ink3 }}>{counterpart.handle}</p>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "6px 0 18px" }}>
        {[1,2,3,4,5].map(i => (
          <button key={i} onClick={() => setRating(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            <Icon name="star" size={34} c={i <= rating ? "#f5a623" : "#e7e0dd"} fill={i <= rating ? "#f5a623" : "none"} />
          </button>
        ))}
      </div>
      <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 14, padding: "12px 14px", marginBottom: 16 }}>
        <span style={{ fontFamily: T.body, fontSize: 13.5, color: T.ink3 }}>Great communication, delivered on time…</span>
      </div>
      <Btn variant="mint" size="lg" icon="check" onClick={onConfirm}>Post review</Btn>
    </OBSheet>
  );
}

function SummarySheet({ open, onClose, deal, amount, peers }: { open: boolean; onClose: () => void; deal: Deal; amount: number; peers: Peers }) {
  const fee = feeOf(amount);
  return (
    <OBSheet open={open} onClose={onClose} title={deal.title} accent="rose">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <Avatar emoji={peers.business.emoji} from={peers.business.from} to={peers.business.to} size={40} />
        <Icon name="swap" size={18} c={T.ink3} />
        <Avatar emoji={peers.creator.emoji} from={peers.creator.from} to={peers.creator.to} size={40} />
        <div style={{ marginLeft: 4 }}>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 13, fontWeight: 700, color: T.ink }}>{deal.business.short} × {deal.creator.name.split(" ")[0]}</p>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>{deal.business.area}</p>
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${T.line}`, padding: 14, marginBottom: 14 }}>
        <p style={{ margin: "0 0 10px", fontFamily: T.body, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: T.ink3, textTransform: "uppercase" }}>Deliverables</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {deal.deliverables.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{d.emoji}</span>
              <span style={{ fontFamily: T.body, fontSize: 13.5, color: T.ink2, flex: 1 }}>{d.label}</span>
              <span style={{ fontFamily: T.body, fontSize: 13.5, fontWeight: 700, color: T.ink }}>×{d.qty}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${T.line}`, padding: "6px 14px" }}>
        {[
          { label: "Agreed amount", val: inr(amount), strong: true, tone: "" },
          { label: "Creator payout (90%)", val: inr(amount - fee), tone: "mint" },
          { label: "Platform fee (10%)", val: inr(fee), tone: "" },
        ].map((row, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ height: 1, background: T.lineSoft }} />}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0" }}>
              <span style={{ fontFamily: T.body, fontSize: 13.5, color: row.strong ? T.ink : T.ink2, fontWeight: row.strong ? 700 : 500 }}>{row.label}</span>
              <span style={{ fontFamily: T.display, fontSize: row.strong ? 18 : 14.5, fontWeight: 700, color: row.tone === "mint" ? T.mintInk : T.ink }}>{row.val}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </OBSheet>
  );
}

function ReleaseSheet({ open, onClose, deal, amount, onConfirm }: { open: boolean; onClose: () => void; deal: Deal; amount: number; onConfirm: () => void }) {
  const s = deal.submission;
  const fee = feeOf(amount), payout = payoutOf(amount);
  const [checked, setChecked] = useState(false);
  return (
    <OBSheet open={open} onClose={onClose} title="Verify & release" accent="mint">
      <p style={{ margin: "0 0 13px", fontFamily: T.body, fontSize: 13.5, lineHeight: 1.5, color: T.ink2 }}>
        Confirm {deal.creator.name.split(" ")[0]}'s post is live and matches the brief. Escrow releases instantly — there's no take-back after this.
      </p>
      <div style={{ display: "flex", gap: 11, alignItems: "center", background: "#fff", borderRadius: 16, border: `1px solid ${T.line}`, padding: 11, marginBottom: 12 }}>
        <div style={{ width: 54, height: 54, borderRadius: 12, background: `linear-gradient(150deg,${s.from},${s.to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{s.emoji}</div>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 12.5, color: T.ink, lineHeight: 1.4 }}>{s.caption || deal.title}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
            <Icon name="checkCircle" size={13} c={T.mint} />
            <span style={{ fontFamily: T.body, fontSize: 11, color: T.mintInk, fontWeight: 600 }}>Live · public · matches brief</span>
          </div>
        </div>
      </div>
      <button onClick={() => setChecked(!checked)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: "#fff", border: `1px solid ${checked ? T.mint : T.line}`, borderRadius: 14, padding: "12px 14px", marginBottom: 14, cursor: "pointer" }}>
        <div style={{ width: 22, height: 22, borderRadius: 7, background: checked ? T.mint : "#fff", border: checked ? "none" : `1.5px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {checked && <Icon name="check" size={14} c="#fff" w={2.6} />}
        </div>
        <span style={{ fontFamily: T.body, fontSize: 13, color: T.ink2, textAlign: "left", lineHeight: 1.4 }}>I've checked the post is live and approve release</span>
      </button>
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${T.line}`, padding: "6px 16px", marginBottom: 16 }}>
        {[
          { label: "Release to creator", val: inr(payout), tone: "mint", strong: true },
          { label: "Platform keeps (10%)", val: inr(fee), tone: "" },
        ].map((row, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ height: 1, background: T.lineSoft }} />}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0" }}>
              <span style={{ fontFamily: T.body, fontSize: 13.5, color: row.strong ? T.ink : T.ink2, fontWeight: row.strong ? 700 : 500 }}>{row.label}</span>
              <span style={{ fontFamily: T.display, fontSize: row.strong ? 18 : 14.5, fontWeight: 700, color: row.tone === "mint" ? T.mintInk : T.ink }}>{row.val}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
      <Btn variant="mint" size="lg" icon="shield" disabled={!checked} onClick={onConfirm}>Release {inr(payout)} now</Btn>
    </OBSheet>
  );
}

// ── Main DealRoom ─────────────────────────────────────────────
type SheetName = "escrow" | "submit" | "counter" | "review" | "summary" | "release";

export function DealRoom({ deal, rt, role, setRole, onBack, onAdvance, onSend }: {
  deal: Deal;
  rt: DealRuntime;
  role: "business" | "creator";
  setRole: (r: "business" | "creator") => void;
  onBack: () => void;
  onAdvance: (action: string, payload?: number) => void;
  onSend: (text: string, by: "business" | "creator", att?: Attachment) => void;
}) {
  const peers: Peers = { business: deal.business, creator: deal.creator };
  const them = peers[role === "business" ? "creator" : "business"];
  const [sheet, setSheet] = useState<SheetName | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [rt.log.length, role]);

  const close = () => setSheet(null);
  const on: Record<string, () => void> = {
    accept: () => onAdvance("accept"),
    decline: () => onAdvance("decline"),
    counter: () => setSheet("counter"),
    fund: () => setSheet("escrow"),
    submit: () => setSheet("submit"),
    release: () => setSheet("release"),
    changes: () => onSend("Could you tweak the opening shot? Otherwise looks great!", "business"),
    review: () => setSheet("review"),
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, position: "relative", overflow: "hidden" }}>
      {/* header */}
      <div style={{ paddingTop: 52, background: T.bg, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "4px 12px 9px" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex" }}><Icon name="back" size={24} c={T.ink} /></button>
          <Avatar emoji={them.emoji} from={them.from} to={them.to} size={38} r={12} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{them.name}</p>
            <p style={{ margin: 0, fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>{them.handle}</p>
          </div>
          <Pill tone={STAGES[rt.stage].tone}>{STAGES[rt.stage].label}</Pill>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px 10px" }}>
          <span style={{ fontFamily: T.body, fontSize: 11, fontWeight: 600, color: T.ink3 }}>Viewing as</span>
          <RoleToggle role={role} setRole={setRole} peers={peers} />
        </div>
      </div>

      {/* stage tracker */}
      <StageTracker stage={rt.stage} onTap={() => setSheet("summary")} />

      {/* timeline */}
      <div ref={scroller} style={{ flex: 1, overflowY: "auto", padding: "12px 14px 6px" }}>
        {rt.log.map((ev, i) => <TimelineEvent key={i} ev={ev} deal={deal} role={role} peers={peers} />)}
      </div>

      {/* action bar + composer */}
      <ActionBar deal={deal} rt={rt} role={role} peers={peers} on={on} />
      <Composer onSend={(text, att) => onSend(text, role, att)} />

      {/* sheets */}
      <EscrowSheet open={sheet === "escrow"} onClose={close} amount={rt.amount} creator={deal.creator} onConfirm={() => { close(); onAdvance("fund"); }} />
      <SubmitSheet open={sheet === "submit"} onClose={close} deal={deal} onConfirm={() => { close(); onAdvance("submit"); }} />
      <CounterSheet open={sheet === "counter"} onClose={close} base={rt.amount} onConfirm={(v) => { close(); onAdvance("counter", v); }} />
      <ReviewSheet open={sheet === "review"} onClose={close} counterpart={them} onConfirm={() => { close(); onAdvance("review"); }} />
      <SummarySheet open={sheet === "summary"} onClose={close} deal={deal} amount={rt.amount} peers={peers} />
      <ReleaseSheet open={sheet === "release"} onClose={close} deal={deal} amount={rt.amount} onConfirm={() => { close(); onAdvance("release"); }} />
    </div>
  );
}
