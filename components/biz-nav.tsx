"use client";
import React, { useEffect } from "react";
import { T, inr, kfmt } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Pill } from "@/components/ob-primitives";

export type BizTab = "discover" | "search" | "collabs" | "profile";

// ── Custom tab glyphs ──
function TabGlyph({ name, active }: { name: BizTab; active: boolean }) {
  const c = active ? T.rose : T.ink3;
  const w = active ? 2.1 : 1.85;
  const p = { fill: "none", stroke: c, strokeWidth: w, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const glyphs: Record<BizTab, React.ReactNode> = {
    discover: (
      <g>
        <rect x="6" y="4.5" width="12" height="15" rx="3" {...p} transform="rotate(-7 12 12)" />
        <rect x="6" y="4.5" width="12" height="15" rx="3" {...p} transform="rotate(7 12 12)" fill={active ? T.roseTint : "none"} />
      </g>
    ),
    search: (
      <g>
        <circle cx="11" cy="11" r="6.5" {...p} />
        <path d="M16 16l4.5 4.5" {...p} />
      </g>
    ),
    collabs: (
      <g>
        <path d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v7a2.5 2.5 0 01-2.5 2.5H9l-5 4z" {...p} fill={active ? T.roseTint : "none"} />
        <path d="M8.5 9.5h7M8.5 12.5h4" {...p} />
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

export function BizBottomNav({ tab, setTab, badges = {} }: {
  tab: BizTab; setTab: (t: BizTab) => void; badges?: Partial<Record<BizTab, number>>;
}) {
  const tabs: { k: BizTab; label: string }[] = [
    { k: "discover", label: "Discover" },
    { k: "search",   label: "Search" },
    { k: "collabs",  label: "Collabs" },
    { k: "profile",  label: "Profile" },
  ];
  return (
    <div style={{
      flexShrink: 0, display: "flex",
      background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(18px) saturate(160%)",
      WebkitBackdropFilter: "blur(18px) saturate(160%)",
      borderTop: `1px solid ${T.line}`,
      padding: "8px 8px 22px",
    }}>
      {tabs.map((t) => {
        const on = tab === t.k;
        return (
          <button key={t.k} onClick={() => setTab(t.k)} style={{
            flex: 1, background: "none", border: "none", cursor: "pointer", padding: "4px 0",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3, position: "relative",
            WebkitTapHighlightColor: "transparent",
          }}>
            <div style={{ position: "relative" }}>
              <TabGlyph name={t.k} active={on} />
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
            <span style={{
              fontFamily: T.body, fontSize: 10.5, fontWeight: on ? 750 : 600,
              color: on ? T.rose : T.ink3, letterSpacing: 0.1,
            }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Page header (Search / Collabs / Profile tabs) ──
export function PageHead({ kicker, title, right, sub }: {
  kicker?: string; title: string; right?: React.ReactNode; sub?: string;
}) {
  return (
    <div style={{ padding: "56px 18px 12px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          {kicker && (
            <p style={{ margin: 0, fontFamily: T.body, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: T.rose, textTransform: "uppercase" }}>{kicker}</p>
          )}
          <h1 style={{ margin: "2px 0 0", fontFamily: T.display, fontSize: 30, fontWeight: 700, color: T.ink, letterSpacing: -0.6 }}>{title}</h1>
          {sub && <p style={{ margin: "5px 0 0", fontFamily: T.body, fontSize: 13, color: T.ink3, lineHeight: 1.4 }}>{sub}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}

// ── Segmented control ──
export function BizSegmented({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { k: string; icon?: string; label?: string }[];
}) {
  return (
    <div style={{ display: "flex", background: "#f0e9e6", borderRadius: 999, padding: 3, gap: 2 }}>
      {options.map((o) => {
        const on = value === o.k;
        return (
          <button key={o.k} onClick={() => onChange(o.k)} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer",
            background: on ? "#fff" : "transparent", boxShadow: on ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: on ? T.ink : T.ink3, transition: "all .2s",
          }}>
            {o.icon && <Icon name={o.icon as "grid" | "sliders"} size={15} c={on ? T.ink : T.ink3} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Toast ──
export function BizToast({ msg, onDone }: { msg: string; onDone: () => void }) {
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

// ── Small stat chip ──
export function StatChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ flex: 1, textAlign: "center" }}>
      <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 15, color: accent ? T.roseDark : T.ink, lineHeight: 1.1 }}>{value}</p>
      <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 9.5, fontWeight: 600, color: T.ink3, textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</p>
    </div>
  );
}

// ── Hiring-status pill ──
const HIRING_MAP = {
  open:     { tone: "mint"    as const, dot: T.mint,  label: "Open to pitches" },
  scouting: { tone: "rose"    as const, dot: T.rose,  label: "Actively scouting" },
  closed:   { tone: "neutral" as const, dot: T.ink3,  label: "Not hiring" },
};
export function HiringPill({ status, size = "md" }: { status: keyof typeof HIRING_MAP; size?: "sm" | "md" }) {
  const m = HIRING_MAP[status] ?? HIRING_MAP.closed;
  return (
    <Pill tone={m.tone} style={{ fontSize: size === "sm" ? 10.5 : 11.5 }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: m.dot }} />{m.label}
    </Pill>
  );
}
