"use client";
import React, { useState } from "react";
import { T, inr } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Avatar, Pill, Btn } from "@/components/ob-primitives";
import { STAGES, type Deal, type DealRuntime } from "@/lib/biz-data";
import { PageHead } from "@/components/biz-nav";

// What the BUSINESS must do next (null = ball is in the creator's court).
function bizYourMove(stage: number, deal?: Deal, rt?: DealRuntime): { label: string; icon: "shield" | "eye" | "check" } | null {
  if (stage === 0 && deal?.sent && rt && !rt.declined) {
    return rt.pendingCounter
      ? { label: "Accept counter", icon: "check" }
      : { label: "Review pitch", icon: "check" };
  }
  if (stage === 1) return { label: "Fund escrow", icon: "shield" };
  if (stage === 3) return { label: "Review work", icon: "eye" };
  return null;
}

function MiniProgress({ stage }: { stage: number }) {
  return (
    <div style={{ display: "flex", gap: 3, flex: 1 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= stage ? T.rose : T.line }} />
      ))}
    </div>
  );
}

function CollabCard({ deal, rt, onOpen, onAccept, onDecline }: {
  deal: Deal; rt: DealRuntime; onOpen: () => void;
  onAccept?: () => void; onDecline?: () => void;
}) {
  const c = deal.creator;
  const stage = STAGES[rt.stage];
  const move = bizYourMove(rt.stage, deal, rt);
  const highlight = !!move;
  const delivText = deal.deliverables
    .map((d) => `${d.qty} ${d.qty > 1 ? (d.label === "Story" ? "Stories" : d.label + "s") : d.label}`)
    .join(" · ");
  const showActions = rt.stage === 0 && !rt.declined && deal.sent && onAccept && onDecline;
  return (
    <div style={{
      width: "100%", background: "#fff",
      border: `1px solid ${highlight ? T.roseTint2 : T.line}`,
      borderRadius: 20, padding: 14,
      display: "flex", flexDirection: "column", gap: 11,
      boxShadow: highlight ? "0 4px 16px rgba(255,77,109,0.07)" : "0 2px 10px rgba(31,17,16,0.04)",
    }}>
      <button type="button" onClick={onOpen} style={{
        width: "100%", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 11, WebkitTapHighlightColor: "transparent",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <Avatar emoji={c.emoji} from={c.from} to={c.to} size={46} r={14} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 15.5, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</p>
            {deal.fresh && rt.stage === 0 && <Pill tone="rose" style={{ fontSize: 9.5 }}>New</Pill>}
          </div>
          <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{deal.title}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink }}>{inr(rt.amount)}</p>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 10.5, color: T.ink3 }}>{delivText}</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <MiniProgress stage={rt.stage} />
        {move ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, background: T.rose, color: "#fff", fontFamily: T.body, fontSize: 10.5, fontWeight: 700, flexShrink: 0 }}>
            <Icon name={move.icon} size={11} c="#fff" />{move.label}
          </span>
        ) : (
          <Pill tone={stage.tone} style={{ fontSize: 10.5 }}>{stage.label}</Pill>
        )}
      </div>
      </button>
      {showActions && (
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" size="sm" onClick={onOpen} style={{ flex: 1 }}>Chat</Btn>
          {rt.pendingCounter ? (
            <Btn variant="primary" size="sm" icon="check" onClick={onAccept} style={{ flex: 1.3 }}>Accept · {inr(rt.amount)}</Btn>
          ) : (
            <>
              <Btn variant="danger" size="sm" onClick={onDecline} style={{ flex: 0.85 }}>Pass</Btn>
              <Btn variant="primary" size="sm" icon="check" onClick={onAccept} style={{ flex: 1 }}>Accept</Btn>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function Collabs({ deals, states, onOpen, onAccept, onDecline }: {
  deals: Deal[];
  states: Record<string, DealRuntime>;
  onOpen: (dealId: string) => void;
  onAccept?: (dealId: string) => void;
  onDecline?: (dealId: string) => void;
}) {
  const [tab, setTab] = useState<"all" | "pitched" | "active" | "done">("all");

  const activeCount = deals.filter((d) => { const s = states[d.id]?.stage ?? 0; return s > 0 && s < 4; }).length;
  const pitchCount = deals.filter((d) => (states[d.id]?.stage ?? 0) === 0).length;
  const moveCount = deals.filter((d) => bizYourMove(states[d.id]?.stage ?? 0, d, states[d.id])).length;
  const inEscrow = deals
    .filter((d) => { const s = states[d.id]?.stage ?? 0; return s === 2 || s === 3; })
    .reduce((a, d) => a + (states[d.id]?.amount ?? 0), 0);

  const rows = deals.filter((d) => {
    const s = states[d.id]?.stage ?? 0;
    if (tab === "pitched") return s === 0;
    if (tab === "active") return s > 0 && s < 4;
    if (tab === "done") return s === 4;
    return true;
  });
  // Surface the cards that need the business first, then by stage.
  const sorted = [...rows].sort((a, b) => {
    const sa = states[a.id]?.stage ?? 0, sb = states[b.id]?.stage ?? 0;
    return (bizYourMove(sb, b, states[b.id]) ? 1 : 0) - (bizYourMove(sa, a, states[a.id]) ? 1 : 0) || sa - sb;
  });

  const tabs: [string, string][] = [
    ["all", "All"],
    ["pitched", `Pitched${pitchCount ? ` ${pitchCount}` : ""}`],
    ["active", "Active"],
    ["done", "Done"],
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <PageHead kicker="Manage" title="Collabs" />

      {/* stat strip — escrow is the hero, flanked by what needs you / what's active */}
      <div style={{ flexShrink: 0, display: "flex", gap: 10, padding: "0 16px 14px" }}>
        <div style={{ flex: 1, background: "#fff", border: `1px solid ${moveCount ? T.roseTint2 : T.line}`, borderRadius: 16, padding: "11px 13px" }}>
          <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 22, color: moveCount ? T.roseDark : T.ink3 }}>{moveCount}</p>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 10.5, color: T.ink3, fontWeight: 600 }}>Your move</p>
        </div>
        <div style={{ flex: 1.5, background: "linear-gradient(150deg,#f2fbf6,#e6f6ee)", border: `1px solid ${T.mintTint2}`, borderRadius: 16, padding: "11px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Icon name="shield" size={14} c={T.mint} />
            <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 19, color: T.ink }}>{inr(inEscrow)}</p>
          </div>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 10.5, color: T.mintInk, fontWeight: 600 }}>In escrow</p>
        </div>
        <div style={{ flex: 1, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, padding: "11px 13px" }}>
          <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 22, color: T.ink }}>{activeCount}</p>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 10.5, color: T.ink3, fontWeight: 600 }}>Active</p>
        </div>
      </div>

      {/* tabs */}
      <div style={{ flexShrink: 0, display: "flex", gap: 20, padding: "0 18px", borderBottom: `1px solid ${T.line}` }}>
        {tabs.map(([k, lab]) => (
          <button key={k} onClick={() => setTab(k as typeof tab)} style={{ background: "none", border: "none", padding: "0 0 10px", cursor: "pointer", position: "relative", fontFamily: T.body, fontSize: 13.5, fontWeight: 700, color: tab === k ? T.ink : T.ink3 }}>
            {lab}
            {tab === k && <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 2.5, borderRadius: 999, background: T.rose }} />}
          </button>
        ))}
      </div>

      {/* list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
        {sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "44px 20px" }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: T.lineSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Icon name="chat" size={28} c={T.ink3} />
            </div>
            <p style={{ margin: 0, fontFamily: T.display, fontSize: 17, fontWeight: 700, color: T.ink }}>Nothing here yet</p>
            <p style={{ margin: "6px 0 0", fontFamily: T.body, fontSize: 13, color: T.ink3, lineHeight: 1.5 }}>Swipe right on a creator in Discover to send your first pitch.</p>
          </div>
        ) : sorted.map((d) => {
          const rt = states[d.id] ?? { stage: d.stage, amount: d.offer, log: [], pendingCounter: false, declined: false, reviewed: false };
          return (
            <CollabCard
              key={d.id}
              deal={d}
              rt={rt}
              onOpen={() => onOpen(d.id)}
              onAccept={onAccept ? () => onAccept(d.id) : undefined}
              onDecline={onDecline ? () => onDecline(d.id) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
