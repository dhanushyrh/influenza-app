"use client";
import React, { useState } from "react";
import { T, inr } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Avatar, Pill } from "@/components/ob-primitives";
import { PageHead } from "@/components/biz-nav";
import { type MyCreator } from "@/lib/inf-data";
import { type Deal, type DealRuntime, STAGES, payoutOf } from "@/lib/biz-data";

const plr = (label: string, qty: number) => qty > 1 ? (label === "Story" ? "Stories" : label + "s") : label;

function statusFor(deal: Deal, stage: number): { tone: "amber" | "rose" | "mint" | "neutral"; label: string } {
  if (stage === 0) return deal.sent ? { tone: "neutral", label: "Awaiting reply" } : { tone: "rose", label: "Needs your reply" };
  return STAGES[stage] ?? STAGES[0];
}

function MiniProgress({ stage }: { stage: number }) {
  return (
    <div style={{ display: "flex", gap: 3, flex: 1 }}>
      {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= stage ? T.rose : T.line }} />)}
    </div>
  );
}

function DealRow({ deal, rt, onOpen }: { deal: Deal; rt: DealRuntime; onOpen: () => void }) {
  const b = deal.business;
  const stage = rt.stage;
  const s = statusFor(deal, stage);
  const delivText = deal.deliverables.map((d) => `${d.qty} ${plr(d.label, d.qty)}`).join(" · ");
  const needsReply = stage === 0 && !deal.sent;
  return (
    <button onClick={onOpen} style={{ width: "100%", textAlign: "left", background: "#fff", border: `1px solid ${needsReply ? T.roseTint2 : T.line}`, borderRadius: 20, padding: 14, cursor: "pointer", display: "flex", flexDirection: "column", gap: 11, boxShadow: needsReply ? "0 4px 16px rgba(255,77,109,0.07)" : "0 2px 10px rgba(31,17,16,0.04)", WebkitTapHighlightColor: "transparent" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <Avatar emoji={b.emoji} from={b.from} to={b.to} size={46} r={14} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 15.5, color: T.ink, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{b.short}</p>
            {deal.sent && stage === 0 && <Pill tone="neutral" style={{ fontSize: 9.5 }}>Sent</Pill>}
          </div>
          <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink3, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{deal.title}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink }}>{inr(rt.amount)}</p>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 10, color: stage >= 2 && stage <= 3 ? T.mintInk : T.ink3, fontWeight: 600 }}>{stage === 4 ? "paid " : "~"}{inr(payoutOf(rt.amount))} to you</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <MiniProgress stage={stage} />
        <Pill tone={s.tone} style={{ fontSize: 10.5 }}>{s.label}</Pill>
      </div>
      {delivText ? <p style={{ margin: 0, fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>{delivText}</p> : null}
    </button>
  );
}

export function InfCollabs({ me, deals, states, onOpen }: {
  me: MyCreator;
  deals: Deal[];
  states: Record<string, DealRuntime>;
  onOpen: (id: string) => void;
}) {
  const [tab, setTab] = useState("all");

  const reqCount  = deals.filter((d) => states[d.id]?.stage === 0 && !d.sent).length;
  const inEscrow  = deals.filter((d) => { const s = states[d.id]?.stage; return s === 2 || s === 3; }).reduce((a, d) => a + payoutOf(states[d.id].amount), 0);
  const earned    = deals.filter((d) => states[d.id]?.stage === 4).reduce((a, d) => a + payoutOf(states[d.id].amount), 0);

  const rows = deals.filter((d) => {
    const s = states[d.id]?.stage;
    if (s == null) return false;
    if (tab === "requests") return s === 0;
    if (tab === "active")   return s >= 1 && s <= 3;
    if (tab === "done")     return s === 4;
    return true;
  });
  const sorted = [...rows].sort((a, b) => (states[a.id]?.stage ?? 0) - (states[b.id]?.stage ?? 0));
  const tabDefs: [string, string][] = [["all","All"],["requests",`Requests${reqCount ? ` ${reqCount}` : ""}`],["active","Active"],["done","Done"]];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <PageHead kicker="Manage" title="Collabs" right={<Avatar emoji={me.emoji} from={me.from} to={me.to} size={42} ring={me.available ? T.mint : undefined} />} />

      {/* summary */}
      <div style={{ flexShrink: 0, display: "flex", gap: 10, padding: "0 16px 14px" }}>
        <div style={{ flex: 1, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, padding: "11px 13px" }}>
          <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 22, color: T.roseDark }}>{reqCount}</p>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 10.5, color: T.ink3, fontWeight: 600 }}>Need reply</p>
        </div>
        <div style={{ flex: 1.4, background: "linear-gradient(150deg,#f2fbf6,#e6f6ee)", border: `1px solid ${T.mintTint2}`, borderRadius: 16, padding: "11px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Icon name="shield" size={14} c={T.mint} />
            <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 19, color: T.ink }}>{inr(inEscrow)}</p>
          </div>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 10.5, color: T.mintInk, fontWeight: 600 }}>In escrow</p>
        </div>
        <div style={{ flex: 1.2, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, padding: "11px 13px" }}>
          <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 19, color: T.ink }}>{inr(earned)}</p>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 10.5, color: T.ink3, fontWeight: 600 }}>Earned</p>
        </div>
      </div>

      {/* tabs */}
      <div style={{ flexShrink: 0, display: "flex", gap: 20, padding: "0 18px", borderBottom: `1px solid ${T.line}` }}>
        {tabDefs.map(([k, lab]) => (
          <button key={k} onClick={() => setTab(k)} style={{ background: "none", border: "none", padding: "0 0 10px", cursor: "pointer", position: "relative", fontFamily: T.body, fontSize: 13.5, fontWeight: 700, color: tab === k ? T.ink : T.ink3 }}>
            {lab}
            {tab === k && <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 2.5, borderRadius: 999, background: T.rose }} />}
          </button>
        ))}
      </div>

      {/* list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
        {sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "44px 20px" }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: T.lineSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><Icon name="chat" size={28} c={T.ink3} /></div>
            <p style={{ margin: 0, fontFamily: T.display, fontSize: 17, fontWeight: 700, color: T.ink }}>Nothing here yet</p>
            <p style={{ margin: "6px 0 0", fontFamily: T.body, fontSize: 13, color: T.ink3, lineHeight: 1.5 }}>Browse Briefs to pitch brands directly.</p>
          </div>
        ) : sorted.map((d) => (
          <DealRow key={d.id} deal={d} rt={states[d.id]} onOpen={() => onOpen(d.id)} />
        ))}
      </div>
    </div>
  );
}
