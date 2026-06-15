"use client";
import React, { useState, useMemo } from "react";
import { T, inr } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Btn, Pill, OBSheet, SectionLabel, Field } from "@/components/ob-primitives";
import { CreditCoin } from "@/components/inf-credits";
import { type MyCreator } from "@/lib/inf-data";
import { type Deal, type DealRuntime } from "@/lib/biz-data";

const FEE = 0.10;
const net = (n: number) => Math.round(n * (1 - FEE));

const PAST_TXN: { id: string; date: string; label: string; sub: string; amount: number; kind: "credit" | "withdraw" | "escrow" | "pending" }[] = [
  { id: "t1", date: "May 28", label: "Withdrawal to UPI",       sub: "aisha@okhdfc",    amount: -32000,       kind: "withdraw" },
  { id: "t2", date: "May 22", label: "Sundowner Menu Feature",  sub: "Nightjar Rooftop",amount: net(14000),   kind: "credit" },
  { id: "t3", date: "May 20", label: "Withdrawal to UPI",       sub: "aisha@okhdfc",    amount: -18000,       kind: "withdraw" },
  { id: "t4", date: "May 12", label: "Street Food Reel",        sub: "Forktale Bowls",  amount: net(8500),    kind: "credit" },
  { id: "t5", date: "May 8",  label: "Withdrawal to UPI",       sub: "aisha@okhdfc",    amount: -14000,       kind: "withdraw" },
  { id: "t6", date: "Apr 30", label: "Chai Campaign",           sub: "Chai Nivas",      amount: net(11000),   kind: "credit" },
  { id: "t7", date: "Apr 24", label: "Withdrawal to UPI",       sub: "aisha@okhdfc",    amount: -10000,       kind: "withdraw" },
  { id: "t8", date: "Apr 18", label: "Brunch Launch",           sub: "Toast & Co.",     amount: net(7500),    kind: "credit" },
];

function TxnRow({ txn }: { txn: typeof PAST_TXN[0] }) {
  const isCredit  = txn.kind === "credit";
  const isEscrow  = txn.kind === "escrow";
  const isPending = txn.kind === "pending";
  const iconName  = isCredit ? "check" as const : isEscrow ? "lock" as const : isPending ? "spark" as const : "chevR" as const;
  const iconBg    = isCredit ? T.mintTint : isEscrow ? "#fff7e6" : isPending ? T.roseTint : "#f0f0f0";
  const iconC     = isCredit ? T.mintInk : isEscrow ? T.amber : isPending ? T.rose : T.ink3;
  const amtColor  = isCredit ? T.mintInk : isEscrow ? T.amber : isPending ? T.ink2 : T.ink;
  const amtStr    = isCredit ? `+${inr(txn.amount)}` : isEscrow || isPending ? inr(txn.amount) : inr(Math.abs(txn.amount));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.lineSoft}` }}>
      <div style={{ width: 38, height: 38, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={iconName} size={17} c={iconC} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontFamily: T.body, fontSize: 13.5, fontWeight: 650, color: T.ink, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{txn.label}</p>
        <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>{txn.sub} · {txn.date}</p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ margin: 0, fontFamily: T.display, fontSize: 14, fontWeight: 700, color: amtColor }}>{amtStr}</p>
        {(isEscrow || isPending) && <Pill tone="amber" style={{ fontSize: 9, marginTop: 2 }}>Held</Pill>}
      </div>
    </div>
  );
}

function WithdrawSheet({ available, payout, onClose, onWithdraw }: {
  available: number;
  payout: { method: string; handle: string };
  onClose: () => void;
  onWithdraw: (amt: number) => void;
}) {
  const [amt, setAmt] = useState(available);
  const valid = amt > 0 && amt <= available;
  return (
    <OBSheet open onClose={onClose} title="Withdraw funds" accent="rose">
      <div style={{ background: T.mintTint, border: `1px solid ${T.mintTint2}`, borderRadius: 16, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <Icon name="shield" size={20} c={T.mintInk} />
        <div>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 13, fontWeight: 700, color: T.mintInk }}>Withdrawing to {payout.method}</p>
          <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 12, color: T.mintInk, opacity: 0.8 }}>{payout.handle}</p>
        </div>
      </div>
      <SectionLabel>Amount</SectionLabel>
      <div style={{ position: "relative", marginBottom: 6 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontFamily: T.display, fontSize: 20, fontWeight: 700, color: T.ink }}>₹</span>
        <input
          type="number" value={amt} onChange={(e) => setAmt(Math.min(Number(e.target.value), available))}
          style={{ width: "100%", boxSizing: "border-box", padding: "14px 14px 14px 28px", border: `1.5px solid ${valid ? T.line : "#e53e3e"}`, borderRadius: 14, fontFamily: T.display, fontSize: 20, fontWeight: 700, color: T.ink, background: "#fff", outline: "none" }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {[0.25, 0.5, 1].map((f) => (
          <button key={f} onClick={() => setAmt(Math.floor(available * f))} style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: `1px solid ${T.line}`, background: "#fff", fontFamily: T.body, fontSize: 12, fontWeight: 700, color: T.ink2, cursor: "pointer" }}>
            {f === 1 ? "Max" : `${f * 100}%`}
          </button>
        ))}
      </div>
      <p style={{ margin: "0 0 16px", fontFamily: T.body, fontSize: 12, color: T.ink3, textAlign: "center" }}>Usually credited within 1–2 business days</p>
      <Btn variant="primary" size="lg" icon="chevR" disabled={!valid} onClick={() => onWithdraw(amt)}>Withdraw {valid ? inr(amt) : ""}</Btn>
    </OBSheet>
  );
}

function ManagePayouts({ me, onBack }: { me: MyCreator; onBack: () => void }) {
  const [sheet, setSheet] = useState<string | null>(null);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "52px 16px 12px", background: "#fff", borderBottom: `1px solid ${T.line}` }}>
        <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: 10, background: T.lineSoft, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="back" size={18} c={T.ink} />
        </button>
        <h2 style={{ margin: 0, fontFamily: T.display, fontSize: 17, fontWeight: 700, color: T.ink }}>Payout settings</h2>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 0 32px" }}>
        <div style={{ margin: "0 16px 14px" }}>
          <h3 style={{ margin: "0 0 10px", padding: "0 2px", fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.ink }}>Payout methods</h3>
          <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", marginBottom: 10, background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", padding: "18px 18px 16px" }}>
            <div style={{ position: "absolute", top: -18, right: -18, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <span style={{ fontFamily: T.body, fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" as const, letterSpacing: 1 }}>UPI</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.12)" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.mint }} />
                    <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>Default</span>
                  </div>
                  <button onClick={() => setSheet("editUpi")} style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", fontFamily: T.body, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Edit</button>
                </div>
              </div>
              <p style={{ margin: "0 0 4px", fontFamily: T.display, fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: 0.2 }}>{me.payout.handle}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Icon name="check" size={12} c={T.mint} />
                <span style={{ fontFamily: T.body, fontSize: 11.5, color: "rgba(255,255,255,0.6)" }}>Verified · HDFC Bank</span>
              </div>
            </div>
          </div>
          <button onClick={() => setSheet("addMethod")} style={{ width: "100%", padding: "13px 14px", background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, boxSizing: "border-box" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: T.lineSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="plus" size={16} c={T.ink3} /></div>
            <div style={{ textAlign: "left" }}>
              <p style={{ margin: 0, fontFamily: T.body, fontSize: 13.5, fontWeight: 650, color: T.ink2 }}>Add bank account</p>
              <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>NEFT / IMPS · 1–2 business days</p>
            </div>
          </button>
        </div>
        <div style={{ margin: "8px 16px 0" }}>
          <h3 style={{ margin: "0 0 10px", padding: "0 2px", fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.ink }}>Tax &amp; compliance</h3>
          <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 18, overflow: "hidden" }}>
            {[["PAN number","Required above ₹20k/yr","Not added"],["GST number","Optional","Not added"]].map(([label, hint, val], i, arr) => (
              <button key={label} onClick={() => setSheet("tax")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", background: "none", border: "none", borderBottom: i < arr.length - 1 ? `1px solid ${T.lineSoft}` : "none", cursor: "pointer", textAlign: "left" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontFamily: T.body, fontSize: 13.5, fontWeight: 650, color: T.ink }}>{label}</p>
                  <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>{hint}</p>
                </div>
                <span style={{ fontFamily: T.body, fontSize: 12.5, color: T.ink3, marginRight: 6 }}>{val}</span>
                <Icon name="chevR" size={15} c={T.ink3} />
              </button>
            ))}
          </div>
          <p style={{ margin: "10px 2px 0", fontFamily: T.body, fontSize: 11.5, color: T.ink3, lineHeight: 1.5 }}>10% TDS deducted on payouts above ₹20,000 in a financial year.</p>
        </div>
      </div>
      {sheet === "editUpi" && (
        <OBSheet open onClose={() => setSheet(null)} title="Edit UPI" accent="rose">
          <div style={{ background: T.mintTint, border: `1px solid ${T.mintTint2}`, borderRadius: 14, padding: "13px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 11 }}>
            <Icon name="shield" size={18} c={T.mintInk} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontFamily: T.body, fontSize: 13.5, fontWeight: 700, color: T.mintInk }}>{me.payout.handle}</p>
              <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 12, color: T.mintInk, opacity: 0.8 }}>Verified · HDFC Bank</p>
            </div>
          </div>
          <Field label="UPI ID" icon="send" value={me.payout.handle} locked />
          <Btn variant="primary" size="lg" icon="check" onClick={() => setSheet(null)}>Save</Btn>
        </OBSheet>
      )}
      {sheet === "addMethod" && (
        <OBSheet open onClose={() => setSheet(null)} title="Add bank account" accent="rose">
          <Field label="Account holder name" icon="user" value="" onChange={() => {}} />
          <Field label="Account number" icon="lock" value="" onChange={() => {}} />
          <Field label="IFSC code" icon="info" value="" onChange={() => {}} />
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["Savings","Current"].map((k) => (
              <button key={k} style={{ flex: 1, padding: "10px 0", borderRadius: 11, border: `1.5px solid ${T.line}`, background: "#fff", fontFamily: T.body, fontSize: 13, fontWeight: 700, color: T.ink2, cursor: "pointer" }}>{k}</button>
            ))}
          </div>
          <Btn variant="primary" size="lg" icon="check" onClick={() => setSheet(null)}>Add account</Btn>
        </OBSheet>
      )}
      {sheet === "tax" && (
        <OBSheet open onClose={() => setSheet(null)} title="Tax details" accent="rose">
          <p style={{ margin: "0 0 16px", fontFamily: T.body, fontSize: 13, color: T.ink2, lineHeight: 1.5 }}>10% TDS is deducted on payouts above ₹20,000/year. Adding your PAN ensures correct deduction and helps with ITR filing.</p>
          <Field label="PAN number" icon="user" value="" onChange={() => {}} placeholder="ABCDE1234F" />
          <Field label="GST number (optional)" icon="info" value="" onChange={() => {}} placeholder="22AAAAA0000A1Z5" />
          <Btn variant="primary" size="lg" icon="check" onClick={() => setSheet(null)}>Save</Btn>
        </OBSheet>
      )}
    </div>
  );
}

export function InfPayouts({ me, deals, states, credits = 0, promoMonth = 0, onOpenCredits }: {
  me: MyCreator;
  deals: Deal[];
  states: Record<string, DealRuntime>;
  credits?: number;
  promoMonth?: number;
  onOpenCredits?: () => void;
}) {
  const [sheet, setSheet] = useState<string | null>(null);
  const [page, setPage] = useState<"wallet" | "manage">("wallet");
  const [localTxns, setLocalTxns] = useState<typeof PAST_TXN>([]);

  const escrowDeals = useMemo(() => deals.filter((d) => { const st = states[d.id]; return st && (st.stage === 2 || st.stage === 3); }), [deals, states]);
  const escrowTotal = escrowDeals.reduce((s, d) => s + (states[d.id]?.amount || d.offer), 0);
  const available = me.totalEarned - escrowTotal - 132050;

  const liveTxns = useMemo(() => {
    const rows: typeof PAST_TXN = [];
    for (const d of deals) {
      const st = states[d.id];
      if (!st) continue;
      const biz = d.business.short;
      const amt = st.amount || d.offer;
      if (st.stage === 4) rows.push({ id: d.id + "_rel", date: "Jun 3", label: d.title, sub: biz, amount: net(amt), kind: "credit" });
      else if (st.stage === 3) rows.push({ id: d.id + "_esc", date: "Jun 5", label: d.title, sub: biz, amount: amt, kind: "escrow" });
      else if (st.stage === 2) rows.push({ id: d.id + "_esc2", date: "Jun 8", label: d.title, sub: biz, amount: amt, kind: "escrow" });
    }
    return rows;
  }, [deals, states]);

  const allTxns = [...localTxns, ...liveTxns, ...PAST_TXN];

  function handleWithdraw(amt: number) {
    setLocalTxns((prev) => [{ id: "w_" + Date.now(), date: "Today", label: "Withdrawal to " + me.payout.method, sub: me.payout.handle, amount: -amt, kind: "withdraw" }, ...prev]);
    setSheet(null);
  }

  if (page === "manage") return <ManagePayouts me={me} onBack={() => setPage("wallet")} />;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* gradient header */}
        <div style={{ padding: "52px 20px 20px", background: `linear-gradient(160deg, ${me.from}, ${me.to})`, position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 50%, rgba(20,8,10,0.28) 100%)", pointerEvents: "none" }} />
          <button onClick={() => setPage("manage")} style={{ position: "absolute", top: 52, right: 20, width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
            <Icon name="sliders" size={16} c="#fff" />
          </button>
          <div style={{ position: "relative" }}>
            <p style={{ margin: "0 0 2px", fontFamily: T.body, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.65)", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Total earned</p>
            <p style={{ margin: "0 0 16px", fontFamily: T.display, fontSize: 34, fontWeight: 700, color: "#fff", letterSpacing: -1, lineHeight: 1 }}>{inr(net(me.totalEarned))}</p>
            <div style={{ height: "1px", background: "rgba(255,255,255,0.2)", marginBottom: 16 }} />
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: "0 0 2px", fontFamily: T.body, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.65)", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Available to withdraw</p>
              <p style={{ margin: "0 0 14px", fontFamily: T.display, fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>{inr(Math.max(0, available))}</p>
              <Btn variant="primary" size="lg" icon="chevR" onClick={() => setSheet("withdraw")} style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.35)", color: "#fff" }}>
                Withdraw funds
              </Btn>
            </div>
          </div>
        </div>

        {/* credits card */}
        <div style={{ padding: "16px 16px 0" }}>
          <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 20, padding: 15, boxShadow: "0 2px 10px rgba(31,17,16,0.04)" }}>
            <button onClick={onOpenCredits} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 13, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
              <CreditCoin size={46} glow />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontFamily: T.display, fontSize: 26, fontWeight: 700, color: T.ink, letterSpacing: -0.5 }}>{credits}</span>
                  <span style={{ fontFamily: T.body, fontSize: 13, fontWeight: 650, color: T.ink2 }}>pitch credits</span>
                </div>
                <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>1 credit = 1 campaign pitch</p>
              </div>
              <Icon name="chevR" size={18} c={T.ink3} />
            </button>
            <div style={{ display: "flex", gap: 9, marginTop: 13 }}>
              <Btn variant="mint" size="sm" icon="spark" onClick={onOpenCredits}>Earn free</Btn>
              <Btn variant="soft" size="sm" onClick={onOpenCredits} style={{ background: T.roseTint, color: T.roseDark }}>Buy credits</Btn>
            </div>
          </div>
        </div>

        {/* summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "16px 16px 0" }}>
          {[
            { label: "In escrow",      value: inr(escrowTotal),           tone: "amber", icon: "lock" as const,  sub: `${escrowDeals.length} active deal${escrowDeals.length !== 1 ? "s" : ""}` },
            { label: "You've received", value: inr(net(me.totalEarned)),  tone: "mint",  icon: "star" as const,  sub: `${me.completed} collabs · after ${FEE * 100}% fee` },
          ].map(({ label, value, tone, icon, sub }) => (
            <div key={label} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 18, padding: "14px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <Icon name={icon} size={15} c={tone === "amber" ? T.amber : T.mintInk} />
                <span style={{ fontFamily: T.body, fontSize: 11, fontWeight: 700, color: T.ink3, textTransform: "uppercase" as const, letterSpacing: 0.3 }}>{label}</span>
              </div>
              <p style={{ margin: "0 0 3px", fontFamily: T.display, fontSize: 20, fontWeight: 700, color: T.ink, letterSpacing: -0.5 }}>{value}</p>
              <p style={{ margin: 0, fontFamily: T.body, fontSize: 11, color: T.ink3 }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* escrow breakdown */}
        {escrowDeals.length > 0 && (
          <div style={{ margin: "14px 16px 0", background: "#fff", border: `1px solid ${T.line}`, borderRadius: 18, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
              <Icon name="lock" size={15} c={T.amber} />
              <h3 style={{ margin: 0, fontFamily: T.display, fontSize: 14, fontWeight: 700, color: T.ink, flex: 1 }}>Escrow breakdown</h3>
              <span style={{ fontFamily: T.display, fontSize: 14, fontWeight: 700, color: T.amber }}>{inr(escrowTotal)}</span>
            </div>
            {escrowDeals.map((d, i) => {
              const st = states[d.id];
              const amt = st?.amount || d.offer;
              const isSubmitted = st?.stage === 3;
              return (
                <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i > 0 ? `1px solid ${T.lineSoft}` : "none" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${d.business.from}, ${d.business.to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{d.business.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontFamily: T.body, fontSize: 13, fontWeight: 650, color: T.ink }}>{d.business.short}</p>
                    <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>{d.title}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontFamily: T.display, fontSize: 14, fontWeight: 700, color: T.ink }}>{inr(amt)}</p>
                    <Pill tone={isSubmitted ? "mint" : "amber"} style={{ fontSize: 9, marginTop: 2 }}>{isSubmitted ? "Pending review" : "In production"}</Pill>
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 12, padding: "10px 12px", background: "#fff7e6", borderRadius: 11 }}>
              <p style={{ margin: 0, fontFamily: T.body, fontSize: 12, color: T.amber, lineHeight: 1.45 }}>Escrow releases after the brand approves your submission. You receive <strong>{(1 - FEE) * 100}%</strong> ({inr(Math.round(escrowTotal * (1 - FEE)))} net).</p>
            </div>
          </div>
        )}

        {/* transaction history */}
        <div style={{ margin: "14px 16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, padding: "0 2px" }}>
            <h3 style={{ margin: 0, fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.ink, flex: 1 }}>Transactions</h3>
            <span style={{ fontFamily: T.body, fontSize: 12, color: T.ink3 }}>{allTxns.length} entries</span>
          </div>
          <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 18, padding: "0 14px" }}>
            {allTxns.map((txn) => <TxnRow key={txn.id} txn={txn} />)}
          </div>
        </div>
      </div>

      {sheet === "withdraw" && (
        <WithdrawSheet available={Math.max(0, available)} payout={me.payout} onClose={() => setSheet(null)} onWithdraw={handleWithdraw} />
      )}
    </div>
  );
}
