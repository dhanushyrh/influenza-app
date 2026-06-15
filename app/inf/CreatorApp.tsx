"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { T } from "@/lib/ob-tokens";
import {
  makeProposalDeal,
  PROMO_PER, PROMO_CAP, REFERRAL_REWARD,
  type MyCreator, type Opp, type CreditLedgerEntry, type Referral, type Promo,
} from "@/lib/inf-data";
import { type Deal, type DealRuntime, type Attachment, type Deliverable } from "@/lib/biz-data";
import type { CreatorCredits, DealBundle } from "@/lib/queries";
import { InfBottomNav, InfToast, type InfTab } from "@/components/inf-nav";
import { InfHome } from "@/components/inf-home";
import { Briefs } from "@/components/inf-briefs";
import { InfCollabs } from "@/components/inf-collabs";
import { InfPayouts } from "@/components/inf-wallet";
import { InfProfile } from "@/components/inf-profile";
import { DealRoom } from "@/components/deal-room";
import {
  CreditBurst, CreditsHub, BuyCreditsSheet, CreditGateSheet,
} from "@/components/inf-credits";

// Fire-and-forget persistence — optimistic UI already updated, errors are non-fatal.
async function post(url: string, body: unknown): Promise<any> {
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await r.json().catch(() => ({}));
  } catch {
    return {};
  }
}

interface CreatorAppProps {
  initialCreator: MyCreator;
  initialCredits: CreatorCredits;
  initialDeals: DealBundle;
  initialBriefs: Opp[];
}

export function CreatorApp({ initialCreator, initialCredits, initialDeals, initialBriefs }: CreatorAppProps) {
  const [tab, setTab] = useState<InfTab>("home");
  const [me, setMe] = useState<MyCreator>(initialCreator);
  const [deals, setDeals] = useState<Deal[]>(initialDeals.deals);
  const [dealStates, setDealStates] = useState<Record<string, DealRuntime>>(initialDeals.states);
  const [openDealId, setOpenDealId] = useState<string | null>(null);
  const [sentKeys, setSentKeys] = useState<string[]>([]);
  const [toast, setToast] = useState("");

  // ── credit economy ──
  const [credits, setCredits] = useState(initialCredits.balance);
  const [ledger, setLedger] = useState<CreditLedgerEntry[]>(initialCredits.ledger);
  const [referrals, setReferrals] = useState<Referral[]>(initialCredits.referrals);
  const [promos, setPromos] = useState<Promo[]>(initialCredits.promos);
  const [promoMonth, setPromoMonth] = useState(() =>
    initialCredits.promos.filter((p) => p.status === "claimed").reduce((s, p) => s + Math.min(p.credits, PROMO_PER), 0));
  const [creditsView, setCreditsView] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [burst, setBurst] = useState(0);
  const [burstAmt, setBurstAmt] = useState(0);

  // ── debounced profile autosave (skips first render) ──
  const firstSave = useRef(true);
  useEffect(() => {
    if (firstSave.current) { firstSave.current = false; return; }
    const t = setTimeout(() => {
      post("/api/creator/profile", {
        displayName: me.name,
        bio: me.bio,
        available: me.available,
        cities: me.cities,
        categories: me.cats,
        avatarUrl: me.photoUrl,
        coverUrl: me.coverUrl,
        services: me.services.map((s) => ({ code: s.code, title: s.label, price: s.price, negotiable: s.negotiable })),
      });
    }, 800);
    return () => clearTimeout(t);
  }, [me]);

  function addCredits(n: number, entry?: Omit<CreditLedgerEntry, "id">) {
    setCredits((c) => Math.max(0, c + n));
    if (entry) setLedger((l) => [{ id: "l_" + Date.now(), ...entry }, ...l]);
    if (n > 0) { setBurstAmt(n); setBurst((b) => b + 1); }
  }

  function buyCredits(pack: { credits: number; price: number; tag: string | null | undefined; bonus: number }) {
    addCredits(pack.credits, { kind: "buy", label: `Bought ${pack.credits} credits`, when: "Now", amount: pack.credits });
    setBuyOpen(false);
    setToast(`+${pack.credits} credits added 🎉`);
    post("/api/creator/credits", { action: "buy", credits: pack.credits });
  }

  function claimPromo(id: string) {
    const p = promos.find((x) => x.id === id);
    if (!p || p.status !== "ready") return;
    const allowed = Math.min(PROMO_PER, PROMO_CAP - promoMonth);
    if (allowed <= 0) { setToast("Monthly promo cap reached — resets on the 1st"); return; }
    const bonus = p.overperform ? 5 : 0;
    const total = allowed + bonus;
    setPromoMonth((m) => m + allowed);
    setPromos((ps) => ps.map((x) => x.id === id ? { ...x, status: "claimed" as const, credits: total } : x));
    addCredits(total, { kind: "promote", label: "Promo reward" + (bonus ? " · overperformed 🎉" : ""), when: "Now", amount: total, note: bonus ? "+5 bonus" : undefined });
    setToast(`+${total} credits from your post 🎉`);
    post("/api/creator/credits", { action: "claim-promo", promoId: id, credits: total, bonus });
  }

  function sharePromo(type: string) {
    const np: Promo = { id: "pm_" + Date.now(), type, emoji: type === "Story" ? "✨" : "📷", when: "Just now", reach: 0, status: "pending", credits: 0, hrsLeft: 24 };
    setPromos((ps) => [np, ...ps]);
    setToast("Shared! Credits land in 24h ⏳");
    post("/api/creator/credits", { action: "share-promo", type }).then((r) => {
      if (r?.id) setPromos((ps) => ps.map((x) => x.id === np.id ? { ...x, id: r.id } : x));
    });
  }

  function inviteReferral() {
    const np: Referral = { id: "ref_" + Date.now(), name: "Invite sent", handle: "via link", emoji: "📨", from: "#eee7e3", to: "#d8ccc6", status: "invited", when: "Just now", earned: 0 };
    setReferrals((rs) => [np, ...rs]);
    setToast("Invite link copied — share it!");
    post("/api/creator/credits", { action: "invite-referral" }).then((r) => {
      if (r?.id) setReferrals((rs) => rs.map((x) => x.id === np.id ? { ...x, id: r.id } : x));
    });
  }

  function verifyReferral(id: string) {
    setReferrals((rs) => rs.map((r) => r.id === id ? { ...r, status: "verified" as const, when: "Just now", earned: REFERRAL_REWARD } : r));
    addCredits(REFERRAL_REWARD, { kind: "referral", label: "Friend joined & verified", when: "Now", amount: REFERRAL_REWARD });
    setToast(`Your referral verified — +${REFERRAL_REWARD} credits 🎉`);
    post("/api/creator/credits", { action: "verify-referral", referralId: id });
  }

  const briefs = useMemo(() => [...initialBriefs].sort((a, b) => a.dist - b.dist), [initialBriefs]);
  const reqCount = deals.filter((d) => dealStates[d.id] && dealStates[d.id].stage === 0 && !d.sent).length;

  function mutate(id: string, fn: (rt: DealRuntime) => DealRuntime) {
    setDealStates((prev) => ({ ...prev, [id]: fn({ ...prev[id], log: [...prev[id].log] }) }));
  }

  function advance(id: string, action: string, payload?: number) {
    const deal = deals.find((d) => d.id === id);
    if (!deal) return;
    const meFirst = me.name.split(" ")[0];
    mutate(id, (rt) => {
      switch (action) {
        case "accept":
          rt.stage = 1; rt.pendingCounter = false;
          if (!rt.log.some((e) => e.type === "system" && (e as { kind: string }).kind === "accepted"))
            rt.log.push({ type: "system", kind: "accepted", amount: rt.amount, time: "Now" });
          break;
        case "decline":
          rt.declined = true;
          rt.log.push({ type: "text", by: "creator", time: "Now", text: "Thanks so much for thinking of me — I can't take this one on right now 🙏" });
          break;
        case "counter":
          rt.log.push({ type: "offer", byName: meFirst, amount: payload!, prev: rt.amount, time: "Now" });
          rt.amount = payload!; rt.pendingCounter = true;
          break;
        case "fund":
          rt.stage = 2;
          rt.log.push({ type: "escrow", amount: rt.amount, time: "Now" });
          break;
        case "submit":
          rt.stage = 3;
          rt.log.push({ type: "submission", by: "creator", time: "Now" });
          break;
        case "release":
          rt.stage = 4;
          rt.log.push({ type: "release", amount: rt.amount, time: "Now" });
          break;
        case "review":
          rt.reviewed = true;
          if (!rt.log.some((e) => e.type === "review"))
            rt.log.push({ type: "review", by: "business", time: "Now" });
          break;
      }
      return rt;
    });
    post("/api/creator/deal", { dealId: id, action, payload });
  }

  function send(id: string, text: string, by: "business" | "creator", att?: Attachment) {
    mutate(id, (rt) => {
      const e: Deal["log"][0] = att
        ? { type: "text", by, text: text || "", time: "Now", attachment: att }
        : { type: "text", by, text: text || "", time: "Now" };
      rt.log.push(e);
      return rt;
    });
    post("/api/creator/deal", { dealId: id, action: "message", text, by, attachment: att });
  }

  function sendProposal(opp: Opp, payload: { title: string; deliverables: Deliverable[]; amount: number; message: string }) {
    const deal = makeProposalDeal(opp, me, payload);
    setDeals((ds) => [deal, ...ds]);
    setDealStates((prev) => ({
      ...prev,
      [deal.id]: { stage: 0, amount: payload.amount, log: deal.log.map((e) => ({ ...e })), pendingCounter: true, declined: false, reviewed: false },
    }));
    setSentKeys((k) => [...k, opp.key]);
    setCredits((c) => Math.max(0, c - 1));
    setLedger((l) => [{ id: "l_" + Date.now(), kind: "spend", label: "Pitch · " + opp.biz.short, when: "Now", amount: -1 }, ...l]);
    setToast(`Proposal sent to ${opp.biz.short} · 1 credit used`);
    post("/api/creator/proposal", {
      businessId: opp.key,
      title: payload.title,
      message: payload.message,
      amount: payload.amount,
      deliverables: payload.deliverables,
    }).then((r) => {
      if (r?.pitchId) {
        setDeals((ds) => ds.map((d) => d.id === deal.id ? { ...d, id: "pitch_" + r.pitchId } : d));
        setDealStates((prev) => {
          const next = { ...prev };
          if (next[deal.id]) { next["pitch_" + r.pitchId] = next[deal.id]; delete next[deal.id]; }
          return next;
        });
      }
    });
  }

  const openDeal = openDealId ? deals.find((d) => d.id === openDealId) : null;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, position: "relative", overflow: "hidden" }}>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {tab === "home" && (
          <InfHome me={me} setMe={setMe} deals={deals} states={dealStates} briefs={briefs} onOpenDeal={(id) => setOpenDealId(id)} onGoBriefs={() => setTab("briefs")} />
        )}
        {tab === "briefs" && (
          <Briefs
            me={me} briefs={briefs} sentKeys={sentKeys} credits={credits}
            onSendProposal={sendProposal}
            onNeedCredits={() => setGateOpen(true)}
            onOpenCredits={() => setCreditsView("hub")}
          />
        )}
        {tab === "collabs" && (
          <InfCollabs me={me} deals={deals} states={dealStates} onOpen={(id) => setOpenDealId(id)} />
        )}
        {tab === "payouts" && (
          <InfPayouts
            me={me} deals={deals} states={dealStates}
            credits={credits} promoMonth={promoMonth}
            onOpenCredits={() => setCreditsView("hub")}
          />
        )}
        {tab === "profile" && (
          <InfProfile me={me} setMe={setMe} onToast={(m) => setToast(m)} />
        )}
      </div>

      <InfBottomNav tab={tab} setTab={setTab} badges={{ collabs: reqCount || undefined }} />

      {openDeal && (
        <div style={{ position: "absolute", inset: 0, zIndex: 75, background: T.bg }}>
          <DealRoom
            deal={openDeal}
            rt={dealStates[openDealId!]}
            role="creator"
            setRole={(_r) => {}}
            onBack={() => setOpenDealId(null)}
            onAdvance={(action, payload) => advance(openDealId!, action, payload)}
            onSend={(text, by, att) => send(openDealId!, text, by, att)}
          />
        </div>
      )}

      {creditsView && (
        <CreditsHub
          key={"ch-" + creditsView}
          credits={credits}
          ledger={ledger}
          referrals={referrals}
          promos={promos}
          promoMonth={promoMonth}
          initialView={creditsView}
          onClose={() => setCreditsView(null)}
          onOpenBuy={() => setBuyOpen(true)}
          onClaimPromo={claimPromo}
          onSharePromo={sharePromo}
          onInvite={inviteReferral}
          onVerifyReferral={verifyReferral}
        />
      )}

      <CreditGateSheet
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        onEarn={() => { setGateOpen(false); setCreditsView("hub"); }}
        onBuy={() => { setGateOpen(false); setBuyOpen(true); }}
      />
      <BuyCreditsSheet open={buyOpen} onClose={() => setBuyOpen(false)} onBuy={buyCredits} />
      <CreditBurst seed={burst} amount={burstAmt} />

      <InfToast msg={toast} onDone={() => setToast("")} />
    </div>
  );
}
