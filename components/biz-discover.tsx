"use client";
import React, { useState, useRef, useEffect } from "react";
import { T, inr, kfmt } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Btn } from "@/components/ob-primitives";
import { catOf, type Creator } from "@/lib/biz-data";

const SWIPE_THRESHOLD = 96;
const FLY = 520;

function MediaBg({ work }: { work: Creator["works"][0] }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(150deg, ${work.from}, ${work.to})`, overflow: "hidden" }}>
      {work.image
        ? <img src={work.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        : <div style={{ position: "absolute", inset: 0, opacity: 0.16, background: "radial-gradient(circle at 22% 26%, #fff 0 1.5px, transparent 2px), radial-gradient(circle at 70% 60%, #fff 0 1.5px, transparent 2px)", backgroundSize: "30px 30px, 38px 38px" }} />}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 22%, transparent 45%, rgba(20,8,10,0.72) 100%)" }} />
    </div>
  );
}

function Stamp({ kind, dx }: { kind: "like" | "nope"; dx: number }) {
  const right = kind === "like";
  const t = Math.max(0, Math.min(1, (right ? dx : -dx) / SWIPE_THRESHOLD));
  if (t <= 0.02) return null;
  return (
    <div style={{
      position: "absolute", top: 30, [right ? "left" : "right"]: 22, zIndex: 6,
      transform: `rotate(${right ? -16 : 16}deg) scale(${0.8 + t * 0.25})`,
      opacity: Math.min(1, t * 1.4),
      padding: "6px 16px", borderRadius: 12,
      border: `4px solid ${right ? T.rose : "#fff"}`,
      color: right ? T.rose : "#fff",
      background: right ? "rgba(255,255,255,0.12)" : "rgba(20,8,10,0.18)",
      fontFamily: T.display, fontWeight: 800, fontSize: 26, letterSpacing: 1.5,
      backdropFilter: "blur(2px)",
    }}>{right ? "REACH OUT" : "PASS"}</div>
  );
}

function GlassStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ flex: 1, textAlign: "center", padding: "7px 4px", borderRadius: 12, background: "rgba(255,255,255,0.16)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.22)" }}>
      <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 15, color: "#fff", lineHeight: 1.05 }}>{value}</p>
      <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.82)", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</p>
    </div>
  );
}

function CreatorCard({ creator, workIdx, setWorkIdx, dx = 0, dragging, live, depth = 0, showRates, onInfo }: {
  creator: Creator; workIdx: number; setWorkIdx: (i: number) => void;
  dx?: number; dragging?: boolean; live?: boolean; depth?: number;
  showRates?: boolean; onInfo?: () => void;
}) {
  const cat = catOf(creator.category);
  const work = creator.works[workIdx] || creator.works[0];
  const rot = dx / 22;
  const lift = live ? 0 : depth;
  const transform = live
    ? `translateX(${dx}px) rotate(${rot}deg)`
    : `translateY(${lift * 12}px) scale(${1 - lift * 0.045})`;

  return (
    <div style={{
      position: "absolute", inset: 0, borderRadius: 28, overflow: "hidden",
      background: "#1a0e10", boxShadow: live ? "0 26px 60px rgba(31,17,16,0.32)" : "0 16px 36px rgba(31,17,16,0.14)",
      transform, transition: dragging ? "none" : "transform .42s cubic-bezier(.2,.85,.25,1)",
      cursor: live ? "grab" : "default", touchAction: "pan-y", userSelect: "none", WebkitUserSelect: "none",
    }}>
      <MediaBg work={work} />

      {!work.image && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 132, filter: "drop-shadow(0 16px 30px rgba(0,0,0,0.32))" }}>{work.emoji}</span>
        </div>
      )}

      {/* progress segments */}
      <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", gap: 5, zIndex: 5 }}>
        {creator.works.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3.5, borderRadius: 999, background: i <= workIdx ? "#fff" : "rgba(255,255,255,0.34)", transition: "background .2s" }} />
        ))}
      </div>

      {/* work meta */}
      <div style={{ position: "absolute", top: 26, left: 14, right: 14, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 5 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 999, background: "rgba(20,8,10,0.5)", backdropFilter: "blur(6px)", fontFamily: T.body, fontSize: 11, fontWeight: 700, color: "#fff" }}>
          <Icon name={work.kind === "Reel" ? "play" : "image"} size={12} c="#fff" fill={work.kind === "Reel" ? "#fff" : "none"} />{work.kind}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 999, background: "rgba(20,8,10,0.5)", backdropFilter: "blur(6px)", fontFamily: T.body, fontSize: 11, fontWeight: 700, color: "#fff" }}>
          <Icon name="eye" size={12} c="#fff" />{kfmt(work.views)}
        </span>
      </div>

      {/* available ribbon */}
      {creator.available && (
        <div style={{ position: "absolute", top: 52, left: 14, zIndex: 5, display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 999, background: "rgba(19,138,94,0.92)", fontFamily: T.body, fontSize: 10.5, fontWeight: 700, color: "#fff" }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: "#fff" }} />Available now
        </div>
      )}

      {/* work tap zones */}
      {live && (
        <>
          <div onClick={(e) => { e.stopPropagation(); setWorkIdx(Math.max(0, workIdx - 1)); }} style={{ position: "absolute", top: 60, bottom: 200, left: 0, width: "32%", zIndex: 4 }} />
          <div onClick={(e) => { e.stopPropagation(); setWorkIdx(Math.min(creator.works.length - 1, workIdx + 1)); }} style={{ position: "absolute", top: 60, bottom: 200, right: 0, width: "32%", zIndex: 4 }} />
        </>
      )}

      <Stamp kind="like" dx={dx} />
      <Stamp kind="nope" dx={dx} />

      {/* identity + stats scrim */}
      <div onClick={live ? onInfo : undefined} style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 16px 18px", zIndex: 5 }}>
        <p style={{ margin: "0 0 8px", fontFamily: T.body, fontSize: 12.5, color: "rgba(255,255,255,0.92)", lineHeight: 1.35, textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>&ldquo;{work.caption}&rdquo;</p>
        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontFamily: T.display, fontSize: 23, fontWeight: 700, color: "#fff", letterSpacing: -0.4, lineHeight: 1.1, textShadow: "0 2px 10px rgba(0,0,0,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{creator.name}</h2>
          {creator.verified && <Icon name="verified" size={19} c="#fff" style={{ flexShrink: 0 }} />}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: "#fff" }}>{cat.emoji} {cat.label}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.6)" }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: T.body, fontSize: 12.5, color: "rgba(255,255,255,0.9)" }}>
            <Icon name="pin" size={13} c="rgba(255,255,255,0.9)" />{creator.area} · {creator.dist} km
          </span>
        </div>
        <div style={{ display: "flex", gap: 7, marginTop: 12 }}>
          <GlassStat label="Followers" value={kfmt(creator.followers)} />
          <GlassStat label="Engagement" value={creator.eng + "%"} />
          <GlassStat label="Avg views" value={kfmt(creator.avgViews)} />
        </div>
        {showRates && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 11, padding: "9px 13px", borderRadius: 13, background: "rgba(255,255,255,0.14)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <span style={{ fontFamily: T.body, fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>From <strong style={{ color: "#fff", fontFamily: T.display, fontSize: 15 }}>{inr(creator.rateFrom)}</strong></span>
            <span style={{ fontFamily: T.body, fontSize: 11.5, color: "rgba(255,255,255,0.82)" }}>{creator.pkg.name} · {inr(creator.pkg.price)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ icon, size = 58, color, bg, border, onClick, fill, iconSize }: {
  icon: "back" | "x" | "eye" | "heart"; size?: number; color: string; bg: string;
  border?: string; onClick?: () => void; fill?: string; iconSize?: number;
}) {
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: 999, border: border || "none", background: bg, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      boxShadow: "0 8px 20px rgba(31,17,16,0.12)", transition: "transform .12s",
      WebkitTapHighlightColor: "transparent",
    }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.9)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <Icon name={icon} size={iconSize || size * 0.42} c={color} w={2.4} fill={fill} />
    </button>
  );
}

export function Discover({ deck, onLike, onPass, onInfo, showRates, onOpenFilters }: {
  deck: Creator[];
  onLike: (c: Creator) => void;
  onPass: (c: Creator) => void;
  onInfo: (c: Creator) => void;
  showRates?: boolean;
  onOpenFilters: () => void;
}) {
  const [idx, setIdx] = useState(() => {
    if (typeof window === "undefined") return 0;
    const s = Number(localStorage.getItem("iz_biz_deck_idx"));
    return Number.isFinite(s) && s > 0 ? s : 0;
  });
  const [workIdx, setWorkIdx] = useState(0);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [flyOut, setFlyOut] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);

  useEffect(() => { localStorage.setItem("iz_biz_deck_idx", String(idx)); }, [idx]);
  useEffect(() => { setWorkIdx(0); }, [idx]);

  const creator = deck[idx];
  const next = deck[idx + 1];
  const third = deck[idx + 2];

  function commit(dir: "left" | "right") {
    const c = deck[idx];
    setFlyOut(dir === "right" ? FLY : -FLY);
    setDragging(false);
    setHistory((h) => [...h, idx]);
    setTimeout(() => {
      setFlyOut(0); setDx(0);
      setIdx((i) => i + 1);
      if (dir === "right") onLike(c); else onPass(c);
    }, 300);
  }
  function rewind() {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setDx(0); setFlyOut(0); setIdx(prev);
  }

  function onDown(e: React.PointerEvent) {
    if (flyOut) return;
    start.current = { x: e.clientX, y: e.clientY };
    moved.current = false;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    if (!start.current) return;
    const ddx = e.clientX - start.current.x;
    const ddy = e.clientY - start.current.y;
    if (Math.abs(ddx) > 7 || Math.abs(ddy) > 7) moved.current = true;
    if (Math.abs(ddx) > Math.abs(ddy)) setDx(ddx);
  }
  function onUp(e: React.PointerEvent) {
    if (!start.current) return;
    const ddx = e.clientX - start.current.x;
    start.current = null;
    setDragging(false);
    if (!moved.current) return;
    if (ddx > SWIPE_THRESHOLD) return commit("right");
    if (ddx < -SWIPE_THRESHOLD) return commit("left");
    setDx(0);
  }

  const liveDx = flyOut || dx;

  if (!creator) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 36px", textAlign: "center", background: T.bg }}>
        <div style={{ width: 78, height: 78, borderRadius: 24, background: T.roseTint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
          <Icon name="checkCircle" size={40} c={T.rose} />
        </div>
        <h2 style={{ margin: 0, fontFamily: T.display, fontSize: 23, fontWeight: 700, color: T.ink }}>You&apos;re all caught up</h2>
        <p style={{ margin: "8px 0 22px", fontFamily: T.body, fontSize: 14, color: T.ink3, lineHeight: 1.5 }}>You&apos;ve seen every creator near Indiranagar. New ones join weekly — or widen your filters to see more.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" size="sm" icon="back" onClick={rewind} style={{ width: "auto" }}>Rewind</Btn>
          <Btn variant="soft" size="sm" icon="sliders" onClick={onOpenFilters} style={{ width: "auto" }}>Adjust filters</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      {/* slim top bar */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "54px 16px 8px" }}>
        <div>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: T.rose, textTransform: "uppercase" }}>Influen<span style={{ color: T.roseDark }}>za</span></p>
          <h1 style={{ margin: "1px 0 0", fontFamily: T.display, fontSize: 24, fontWeight: 700, color: T.ink, letterSpacing: -0.5 }}>Discover</h1>
        </div>
        <button onClick={onOpenFilters} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: 999, background: "#fff", border: `1px solid ${T.line}`, cursor: "pointer", fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: T.ink2 }}>
          <Icon name="pin" size={14} c={T.rose} />Bengaluru<Icon name="sliders" size={15} c={T.ink3} />
        </button>
      </div>

      {/* deck */}
      <div style={{ flex: 1, position: "relative", margin: "6px 16px 4px", touchAction: "pan-y" }}>
        {third && <CreatorCard key={third.id} creator={third} workIdx={0} setWorkIdx={() => {}} depth={2} showRates={showRates} />}
        {next  && <CreatorCard key={next.id}  creator={next}  workIdx={0} setWorkIdx={() => {}} depth={1} showRates={showRates} />}
        <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} style={{ position: "absolute", inset: 0 }}>
          <CreatorCard
            key={creator.id} creator={creator} workIdx={workIdx} setWorkIdx={setWorkIdx}
            dx={liveDx} dragging={dragging && !flyOut} live showRates={showRates}
            onInfo={() => { if (!moved.current) onInfo(creator); }}
          />
        </div>
      </div>

      {/* action buttons */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "8px 0 14px" }}>
        <ActionBtn icon="back" size={46} iconSize={20} color={T.amber} bg="#fff" border={`1px solid ${T.line}`} onClick={rewind} />
        <ActionBtn icon="x"    size={62} iconSize={28} color={T.ink2} bg="#fff" border={`1px solid ${T.line}`} onClick={() => commit("left")} />
        <ActionBtn icon="eye"  size={46} iconSize={21} color={T.roseDark} bg="#fff" border={`1px solid ${T.line}`} onClick={() => onInfo(creator)} />
        <ActionBtn icon="heart" size={62} iconSize={28} color="#fff" fill="#fff" bg={`linear-gradient(135deg, ${T.rose}, ${T.roseDark})`} onClick={() => commit("right")} />
      </div>
      <p style={{ flexShrink: 0, textAlign: "center", margin: "0 0 8px", fontFamily: T.body, fontSize: 11, color: T.ink3 }}>
        Swipe right to view their profile &amp; reach out · tap the work to flick through
      </p>
    </div>
  );
}
