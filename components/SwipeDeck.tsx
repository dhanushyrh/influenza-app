"use client";

import { useState } from "react";
import Link from "next/link";
import { InfluencerProfile } from "@/lib/types";
import { formatCount } from "@/lib/metrics";

// Lightweight swipe deck. Buttons + click; real gesture/drag layer is a
// Phase 2 task (docs/tasks/04-swipe-deck.md). Right = interest → Lookbook,
// Left = hide. State is local/mock here.

export function SwipeDeck({ deck }: { deck: InfluencerProfile[] }) {
  const [index, setIndex] = useState(0);
  const [log, setLog] = useState<{ id: string; dir: "left" | "right" }[]>([]);

  const current = deck[index];

  function swipe(dir: "left" | "right") {
    if (!current) return;
    setLog((l) => [...l, { id: current.id, dir }]);
    setIndex((i) => i + 1);
  }

  if (!current) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-neutral-500">
        <p className="text-lg font-medium">You&apos;re all caught up 🎉</p>
        <p className="mt-1 text-sm">
          Check back as new creators join your area.
        </p>
        <p className="mt-4 text-xs">
          Swiped this session: {log.filter((l) => l.dir === "right").length} interested ·{" "}
          {log.filter((l) => l.dir === "left").length} hidden
        </p>
      </div>
    );
  }

  const s = current.stats;

  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="relative flex-1 overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-b from-brand/10 to-white shadow-sm">
        <div className="flex h-44 items-center justify-center bg-brand/20 text-5xl">
          🍜
        </div>
        <div className="p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold">{current.displayName}</h2>
            <span className="text-sm text-neutral-500">{current.handle}</span>
          </div>
          <p className="text-sm text-neutral-500">
            {current.location.city} ·{" "}
            {current.niches.map((n) => n.subtopic).join(", ")}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Metric label="Followers" value={formatCount(s.followers)} />
            <Metric label="Avg likes" value={formatCount(s.avgLikes)} />
            <Metric label="Engagement" value={`${s.engagementRate}%`} />
          </div>

          <p className="mt-3 text-sm text-neutral-600">{current.bio}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6">
        <button
          onClick={() => swipe("left")}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-200 text-2xl text-neutral-400 shadow-sm active:scale-95"
          aria-label="Hide"
        >
          ✕
        </button>
        <Link
          href={`/influencer/${current.id}`}
          onClick={() => swipe("right")}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-2xl text-white shadow-md active:scale-95"
          aria-label="Interested — open Lookbook"
        >
          ♥
        </Link>
      </div>
      <p className="mt-2 text-center text-xs text-neutral-400">
        Tap ✕ to hide · tap ♥ to view full Lookbook
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/70 py-2">
      <div className="text-base font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</div>
    </div>
  );
}
