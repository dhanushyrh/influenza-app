"use client";
import React, { useState, useMemo } from "react";
import { T } from "@/lib/ob-tokens";
import { MY_BIZ, MY_CAMPAIGNS, makePitchDeal, type Creator, type Deal, type DealRuntime, type MyBiz, type Attachment, type Campaign } from "@/lib/biz-data";
import type { DealBundle } from "@/lib/queries";
import { BizBottomNav, BizToast, type BizTab } from "@/components/biz-nav";
import { Discover } from "@/components/biz-discover";
import { Search } from "@/components/biz-search";
import { Collabs } from "@/components/biz-collabs";
import { Profile } from "@/components/biz-profile";
import { Lookbook } from "@/components/biz-lookbook";
import { ReachOutSheet } from "@/components/biz-reachout";
import { CreateCampaignFlow } from "@/components/biz-campaigns";
import { DealRoom } from "@/components/deal-room";

async function post(url: string, body: unknown): Promise<any> {
  try {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return await r.json().catch(() => ({}));
  } catch {
    return {};
  }
}

interface BizAppProps {
  initialBiz?: Partial<MyBiz>;
  initialDeck: Creator[];
  initialDeals: DealBundle;
  initialCampaigns?: Campaign[];
}

export function BizApp({ initialBiz, initialDeck, initialDeals, initialCampaigns }: BizAppProps) {
  const [tab, setTab] = useState<BizTab>("discover");
  const [biz, setBiz] = useState<MyBiz>({ ...MY_BIZ, ...initialBiz });
  const [deals, setDeals] = useState<Deal[]>(initialDeals.deals);
  const [dealStates, setDealStates] = useState<Record<string, DealRuntime>>(initialDeals.states);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns ?? MY_CAMPAIGNS);
  const [creating, setCreating] = useState(false);
  const [role, setRole] = useState<"business" | "creator">("business");
  const [openDealId, setOpenDealId] = useState<string | null>(null);
  const [lookbook, setLookbook] = useState<Creator | null>(null);
  const [reach, setReach] = useState<Creator | null>(null);
  const [openFilters, setOpenFilters] = useState(false);
  const [toast, setToast] = useState("");

  function publishCampaign(c: Campaign) {
    setCampaigns((cs) => [c, ...cs]);
    setToast(`"${c.title}" is live · creators can pitch now`);
    post("/api/business/campaign", {
      title: c.title, catKey: c.catKey, blurb: c.blurb, deliv: c.deliv,
      lo: c.lo, hi: c.hi, sizes: c.sizes, deadline: c.deadline, status: c.status,
    }).then((r) => {
      if (r?.campaign?.id) setCampaigns((cs) => cs.map((x) => (x.id === c.id ? { ...x, id: r.campaign.id } : x)));
    });
  }

  async function signOut() {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
    window.location.href = "/";
  }

  const deck = useMemo(() => [...initialDeck].sort((a, b) => a.dist - b.dist), [initialDeck]);
  const pitchCount = deals.filter((d) => d.fresh && dealStates[d.id]?.stage === 0).length;

  // ── deal mutations ──────────────────────────────────────────
  function mutate(id: string, fn: (rt: DealRuntime) => DealRuntime) {
    setDealStates((prev) => ({ ...prev, [id]: fn({ ...prev[id], log: [...prev[id].log] }) }));
  }

  function advance(id: string, action: string, payload?: number) {
    const deal = deals.find((d) => d.id === id);
    if (!deal) return;
    const cFirst = deal.creator.name.split(" ")[0];
    mutate(id, (rt) => {
      switch (action) {
        case "accept":
          rt.stage = 1; rt.pendingCounter = false;
          if (!rt.log.some((e) => e.type === "system" && (e as { kind: string }).kind === "accepted"))
            rt.log.push({ type: "system", kind: "accepted", amount: rt.amount, time: "Now" });
          break;
        case "decline":
          rt.declined = true;
          rt.log.push({ type: "text", by: "creator", time: "Now", text: "Thanks for thinking of me — I'll have to pass this round 🙏" });
          break;
        case "counter":
          rt.log.push({ type: "offer", byName: cFirst, amount: payload!, prev: rt.amount, time: "Now" });
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
    post("/api/business/deal", { dealId: id, action, payload });
  }

  function send(id: string, text: string, by: "business" | "creator", att?: Attachment) {
    mutate(id, (rt) => {
      const e: import("@/lib/biz-data").LogEvent = { type: "text", by, text: text || "", time: "Now", ...(att ? { attachment: att } : {}) };
      rt.log.push(e);
      return rt;
    });
    post("/api/business/deal", { dealId: id, action: "message", text, by, attachment: att });
  }

  // ── discovery actions ───────────────────────────────────────
  function sendPitch(creator: Creator, payload: { title: string; deliverables: { label: string; qty: number; emoji: string }[]; amount: number; message: string }) {
    const deal = makePitchDeal(creator, biz, payload);
    setDeals((ds) => [deal, ...ds]);
    setDealStates((prev) => ({ ...prev, [deal.id]: { stage: 0, amount: payload.amount, log: deal.log.map((e) => ({ ...e })), pendingCounter: false, declined: false, reviewed: false } }));
    setBiz((b) => ({ ...b, credits: Math.max(0, b.credits - 1) }));
    setReach(null); setLookbook(null);
    setToast(`Pitch sent to ${creator.name.split(" ")[0]} · now in Collabs`);
    post("/api/business/pitch", {
      influencerId: creator.id,
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

  const openDeal = openDealId ? deals.find((d) => d.id === openDealId) ?? null : null;
  const openRt = openDealId ? dealStates[openDealId] : null;

  return (
    <div style={{ height: "100svh", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden", position: "relative" }}>
      {/* active tab */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {tab === "discover" && (
          <Discover
            deck={deck}
            onLike={(c) => setLookbook(c)}
            onPass={() => {}}
            onInfo={(c) => setLookbook(c)}
            showRates={false}
            onOpenFilters={() => { setTab("search"); setOpenFilters(true); }}
          />
        )}
        {tab === "search" && (
          <Search
            creators={deck}
            onOpen={(c) => setLookbook(c)}
            openFilters={openFilters}
            clearOpenFilters={() => setOpenFilters(false)}
            showRates
          />
        )}
        {tab === "collabs" && (
          <Collabs deals={deals} states={dealStates} onOpen={(id) => setOpenDealId(id)} />
        )}
        {tab === "profile" && (
          <Profile
            biz={biz}
            onUpdate={(delta) => setBiz((b) => ({ ...b, ...delta }))}
            campaigns={campaigns}
            onNewCampaign={() => setCreating(true)}
            onPreview={() => setToast("This is how creators see your card in their deck")}
            onSignOut={signOut}
          />
        )}
      </div>

      <BizBottomNav tab={tab} setTab={setTab} badges={{ collabs: pitchCount || undefined }} />

      {/* lookbook overlay */}
      {lookbook && (
        <div style={{ position: "absolute", inset: 0, zIndex: 70, background: T.bg }}>
          <Lookbook creator={lookbook} onBack={() => setLookbook(null)} onReachOut={(c) => { setReach(c); }} />
        </div>
      )}

      {/* reach-out sheet */}
      {reach && (
        <div style={{ position: "absolute", inset: 0, zIndex: 75 }}>
          <ReachOutSheet creator={reach} biz={biz} onClose={() => setReach(null)} onSend={(p) => sendPitch(reach, p)} />
        </div>
      )}

      {/* deal room overlay */}
      {openDeal && openRt && (
        <div style={{ position: "absolute", inset: 0, zIndex: 75, background: T.bg }}>
          <DealRoom
            deal={openDeal}
            rt={openRt}
            role={role}
            setRole={setRole}
            onBack={() => setOpenDealId(null)}
            onAdvance={(action, payload) => advance(openDealId!, action, payload)}
            onSend={(text, by, att) => send(openDealId!, text, by, att)}
          />
        </div>
      )}

      {/* create-campaign flow overlay */}
      {creating && (
        <CreateCampaignFlow
          defaultCatKey={biz.category}
          onClose={() => setCreating(false)}
          onPublish={publishCampaign}
        />
      )}

      {toast && <BizToast msg={toast} onDone={() => setToast("")} />}
    </div>
  );
}
