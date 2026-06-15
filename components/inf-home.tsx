"use client";
import React from "react";
import { T, inr } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Avatar, Pill } from "@/components/ob-primitives";
import { type MyCreator, type Opp } from "@/lib/inf-data";
import { type Deal, type DealRuntime, payoutOf } from "@/lib/biz-data";

const plural = (label: string, qty: number) =>
  qty > 1 ? (label === "Story" ? "Stories" : label + "s") : label;

function AvailabilityToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      display: "flex", alignItems: "center", gap: 8, padding: "7px 12px 7px 10px", borderRadius: 999, cursor: "pointer",
      border: `1px solid ${on ? T.mintTint2 : T.line}`, background: on ? T.mintTint : "#fff",
    }}>
      <span style={{ position: "relative", width: 34, height: 20, borderRadius: 999, background: on ? T.mint : "#dcd3cf", transition: "background .2s", flexShrink: 0 }}>
        <span style={{ position: "absolute", top: 2, left: on ? 16 : 2, width: 16, height: 16, borderRadius: 999, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.2)", transition: "left .2s" }} />
      </span>
      <span style={{ fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: on ? T.mintInk : T.ink3 }}>{on ? "Available" : "Paused"}</span>
    </button>
  );
}

const ACTION_HINTS: Record<number, { tone: "amber" | "rose" | "mint"; label: string; hint: string }> = {
  1: { tone: "amber", label: "Awaiting escrow", hint: "Brand is funding — sit tight" },
  2: { tone: "rose",  label: "Your move",       hint: "Shoot & submit your post" },
  3: { tone: "mint",  label: "In review",        hint: "Brand is verifying your post" },
};

export function InfHome({ me, setMe, deals, states, onOpenDeal, onGoBriefs, briefs, showEarnings = true }: {
  me: MyCreator;
  setMe: (m: MyCreator) => void;
  deals: Deal[];
  states: Record<string, DealRuntime>;
  onOpenDeal: (id: string) => void;
  onGoBriefs: () => void;
  briefs: Opp[];
  showEarnings?: boolean;
}) {
  const requests = deals.filter((d) => states[d.id]?.stage === 0);
  const active   = deals.filter((d) => { const s = states[d.id]?.stage; return s != null && s >= 1 && s <= 3; });
  const inEscrow = deals
    .filter((d) => { const s = states[d.id]?.stage; return s === 2 || s === 3; })
    .reduce((a, d) => a + payoutOf(states[d.id].amount), 0);
  const paidMonth   = deals.filter((d) => states[d.id]?.stage === 4).reduce((a, d) => a + payoutOf(states[d.id].amount), 0);
  const pendingValue = requests.reduce((a, d) => a + states[d.id].amount, 0);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>

        {/* header */}
        <div style={{ padding: "56px 18px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <Avatar emoji={me.emoji} from={me.from} to={me.to} size={44} ring={me.available ? T.mint : undefined} />
              <div>
                <p style={{ margin: 0, fontFamily: T.body, fontSize: 12, color: T.ink3, fontWeight: 600 }}>Welcome back</p>
                <h1 style={{ margin: "1px 0 0", fontFamily: T.display, fontSize: 22, fontWeight: 700, color: T.ink, letterSpacing: -0.4 }}>{me.name.split(" ")[0]} 👋</h1>
              </div>
            </div>
            <AvailabilityToggle on={me.available} onChange={(v) => setMe({ ...me, available: v })} />
          </div>
        </div>

        <div style={{ padding: "0 16px" }}>
          {/* earnings hero */}
          <div style={{ position: "relative", borderRadius: 22, overflow: "hidden", background: "linear-gradient(150deg, #f2fbf6 0%, #e3f5ec 100%)", border: `1px solid ${T.mintTint2}`, padding: "16px 17px", marginBottom: 14 }}>
            <div style={{ position: "absolute", top: -30, right: -20, width: 120, height: 120, borderRadius: 999, background: T.mintTint }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Icon name="shield" size={15} c={T.mint} />
                <p style={{ margin: 0, fontFamily: T.body, fontSize: 11.5, fontWeight: 700, color: T.mintInk, letterSpacing: 0.3, textTransform: "uppercase" as const }}>Secured in escrow</p>
              </div>
              <p style={{ margin: "5px 0 0", fontFamily: T.display, fontSize: 34, fontWeight: 700, color: T.ink, letterSpacing: -0.5, filter: showEarnings ? "none" : "blur(9px)", transition: "filter .2s" }}>{inr(inEscrow)}</p>
              <p style={{ margin: "3px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink2 }}>Releases to you automatically once each post is verified.</p>
              <div style={{ display: "flex", gap: 9, marginTop: 13 }}>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.75)", borderRadius: 12, padding: "9px 11px" }}>
                  <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.mintInk, filter: showEarnings ? "none" : "blur(7px)" }}>{inr(paidMonth)}</p>
                  <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 10.5, color: T.ink3, fontWeight: 600 }}>Paid this month</p>
                </div>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.75)", borderRadius: 12, padding: "9px 11px" }}>
                  <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink }}>{inr(pendingValue)}</p>
                  <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 10.5, color: T.ink3, fontWeight: 600 }}>Pending replies</p>
                </div>
              </div>
            </div>
          </div>

          {/* new requests */}
          {requests.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 2px 11px" }}>
                <h2 style={{ margin: 0, fontFamily: T.display, fontSize: 17, fontWeight: 700, color: T.ink, whiteSpace: "nowrap" as const }}>New requests</h2>
                <span style={{ minWidth: 20, height: 20, padding: "0 6px", borderRadius: 999, background: T.rose, color: "#fff", fontFamily: T.body, fontSize: 11.5, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{requests.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {requests.map((d) => (
                  <button key={d.id} onClick={() => onOpenDeal(d.id)} style={{ width: "100%", textAlign: "left", background: "#fff", border: `1px solid ${T.roseTint2}`, borderRadius: 20, padding: 14, cursor: "pointer", boxShadow: "0 4px 16px rgba(255,77,109,0.07)", WebkitTapHighlightColor: "transparent" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <Avatar emoji={d.business.emoji} from={d.business.from} to={d.business.to} size={46} r={14} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 15.5, color: T.ink, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{d.business.short}</p>
                          <Pill tone="rose" style={{ fontSize: 9.5 }}>New</Pill>
                        </div>
                        <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 12.5, color: T.ink2, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{d.title}</p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 17, color: T.ink }}>{inr(d.offer)}</p>
                        <p style={{ margin: 0, fontFamily: T.body, fontSize: 10, color: T.mintInk, fontWeight: 600 }}>~{inr(payoutOf(d.offer))} to you</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 11 }}>
                      {d.deliverables.map((x, i) => (
                        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 999, background: T.bg, fontFamily: T.body, fontSize: 11.5, fontWeight: 650, color: T.ink2 }}>{x.emoji} {x.qty} {plural(x.label, x.qty)}</span>
                      ))}
                      <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.body, fontSize: 12, fontWeight: 700, color: T.roseDark }}>Respond <Icon name="arrowR" size={14} c={T.roseDark} /></span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* active collabs */}
          {active.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ margin: "4px 2px 11px", fontFamily: T.display, fontSize: 17, fontWeight: 700, color: T.ink }}>Active collabs</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {active.map((d) => {
                  const st = states[d.id].stage;
                  const h = ACTION_HINTS[st] ?? ACTION_HINTS[1];
                  return (
                    <button key={d.id} onClick={() => onOpenDeal(d.id)} style={{ width: "100%", textAlign: "left", background: "#fff", border: `1px solid ${T.line}`, borderRadius: 20, padding: 14, cursor: "pointer", boxShadow: "0 2px 10px rgba(31,17,16,0.04)", WebkitTapHighlightColor: "transparent" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <Avatar emoji={d.business.emoji} from={d.business.from} to={d.business.to} size={42} r={13} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 15, color: T.ink, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{d.business.short}</p>
                          <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink3, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{d.title}</p>
                        </div>
                        <Pill tone={h.tone} style={{ fontSize: 10.5 }}>{h.label}</Pill>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 11 }}>
                        <div style={{ display: "flex", gap: 3, flex: 1 }}>
                          {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= st ? T.rose : T.line }} />)}
                        </div>
                        <span style={{ fontFamily: T.body, fontSize: 11.5, color: T.ink3, fontWeight: 600 }}>{h.hint}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* hiring near you */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "4px 2px 11px" }}>
            <h2 style={{ margin: 0, fontFamily: T.display, fontSize: 17, fontWeight: 700, color: T.ink }}>Hiring near you</h2>
            <button onClick={onGoBriefs} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: T.rose }}>See all</button>
          </div>
          <div style={{ display: "flex", gap: 11, overflowX: "auto", paddingBottom: 4 }}>
            {briefs.slice(0, 3).map((o) => (
              <button key={o.key} onClick={onGoBriefs} style={{ flexShrink: 0, width: 180, textAlign: "left", background: "#fff", border: `1px solid ${T.line}`, borderRadius: 18, padding: 13, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <Avatar emoji={o.biz.emoji} from={o.biz.from} to={o.biz.to} size={36} r={11} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 13.5, color: T.ink, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{o.biz.short}</p>
                    <p style={{ margin: 0, fontFamily: T.body, fontSize: 10.5, color: T.ink3 }}>{o.dist} km</p>
                  </div>
                </div>
                <p style={{ margin: "10px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink2, fontWeight: 600, lineHeight: 1.35, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{o.brief.title}</p>
                <p style={{ margin: "5px 0 0", fontFamily: T.display, fontSize: 13.5, fontWeight: 700, color: T.roseDark }}>{inr(o.brief.budgetLo)}–{inr(o.brief.budgetHi).replace("₹", "")}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
