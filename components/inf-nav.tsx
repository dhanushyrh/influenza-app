"use client";
import React, { useEffect } from "react";
import { T } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";

export type InfTab = "home" | "briefs" | "collabs" | "payouts" | "profile";

function InfTabGlyph({ name, active }: { name: InfTab; active: boolean }) {
  const c = active ? T.rose : T.ink3;
  const w = active ? 2.1 : 1.85;
  const p = { fill: "none", stroke: c, strokeWidth: w, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const glyphs: Record<InfTab, React.ReactNode> = {
    home: (
      <g>
        <path d="M4 11l8-6.5 8 6.5" {...p} />
        <path d="M6 9.7V19.5h12V9.7" {...p} fill={active ? T.roseTint : "none"} />
        <path d="M10 19.5v-5h4v5" {...p} />
      </g>
    ),
    briefs: (
      <g>
        <circle cx="12" cy="12" r="8.2" {...p} fill={active ? T.roseTint : "none"} />
        <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" {...p} fill={active ? T.rose : "none"} stroke={active ? T.rose : c} />
      </g>
    ),
    collabs: (
      <g>
        <path d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v7a2.5 2.5 0 01-2.5 2.5H9l-5 4z" {...p} fill={active ? T.roseTint : "none"} />
        <path d="M8.5 9.5h7M8.5 12.5h4" {...p} />
      </g>
    ),
    payouts: (
      <g>
        <rect x="3.5" y="7" width="17" height="13" rx="2.5" {...p} fill={active ? T.roseTint : "none"} />
        <path d="M3.5 10.5h17" {...p} />
        <circle cx="15.5" cy="15" r="1.8" fill={active ? T.rose : c} stroke="none" />
      </g>
    ),
    profile: (
      <g>
        <circle cx="12" cy="9" r="3.4" {...p} fill={active ? T.roseTint : "none"} />
        <path d="M5.5 19.5c1.2-3.2 3.6-4.8 6.5-4.8s5.3 1.6 6.5 4.8" {...p} />
      </g>
    ),
  };
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" style={{ display: "block" }}>
      {glyphs[name]}
    </svg>
  );
}

export function InfBottomNav({ tab, setTab, badges = {} }: {
  tab: InfTab; setTab: (t: InfTab) => void; badges?: Partial<Record<InfTab, number>>;
}) {
  const tabs: { k: InfTab; label: string }[] = [
    { k: "home",    label: "Home" },
    { k: "briefs",  label: "Briefs" },
    { k: "collabs", label: "Collabs" },
    { k: "payouts", label: "Wallet" },
    { k: "profile", label: "Profile" },
  ];
  return (
    <div style={{
      flexShrink: 0, display: "flex",
      background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(18px) saturate(160%)",
      WebkitBackdropFilter: "blur(18px) saturate(160%)",
      borderTop: `1px solid ${T.line}`,
      padding: "8px 6px calc(20px + env(safe-area-inset-bottom))",
    }}>
      {tabs.map((t) => {
        const on = tab === t.k;
        return (
          <button key={t.k} onClick={() => setTab(t.k)} style={{
            flex: 1, background: "none", border: "none", cursor: "pointer", padding: "4px 0",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            position: "relative", WebkitTapHighlightColor: "transparent",
          }}>
            <div style={{ position: "relative" }}>
              <InfTabGlyph name={t.k} active={on} />
              {badges[t.k] ? (
                <span style={{
                  position: "absolute", top: -3, right: -7, minWidth: 16, height: 16,
                  padding: "0 4px", borderRadius: 999, background: T.rose, color: "#fff",
                  fontFamily: T.body, fontSize: 10, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 1px 3px rgba(255,77,109,0.5)",
                }}>{badges[t.k]}</span>
              ) : null}
            </div>
            <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: on ? 750 : 600, color: on ? T.rose : T.ink3, letterSpacing: 0.1 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function InfToast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <div style={{ position: "absolute", left: 16, right: 16, bottom: 92, zIndex: 90, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 9, padding: "11px 16px", borderRadius: 14,
        background: T.ink, color: "#fff", fontFamily: T.body, fontSize: 13, fontWeight: 600,
        boxShadow: "0 12px 30px rgba(31,17,16,0.3)", animation: "sheetUp .3s cubic-bezier(.2,.9,.3,1)", maxWidth: "92%",
      }}>
        <span style={{ display: "inline-flex", width: 20, height: 20, borderRadius: 999, background: T.mint, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="check" size={13} c="#fff" w={2.6} />
        </span>
        {msg}
      </div>
    </div>
  );
}
