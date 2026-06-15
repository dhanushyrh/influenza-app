"use client";
import React, { useState } from "react";
import { T, inr, kfmt } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Pill, Btn } from "@/components/ob-primitives";
import { AGE_BUCKETS, catOf, type Creator, type Work } from "@/lib/biz-data";

function AgeBars({ age }: { age: Record<string, number> }) {
  const max = Math.max(...Object.values(age));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {AGE_BUCKETS.map((b) => (
        <div key={b} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 44, fontFamily: T.body, fontSize: 11.5, fontWeight: 600, color: T.ink3, flexShrink: 0 }}>{b}</span>
          <div style={{ flex: 1, height: 8, borderRadius: 999, background: T.lineSoft, overflow: "hidden" }}>
            <div style={{ width: `${(age[b] / max) * 100}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${T.rose}, ${T.roseDark})` }} />
          </div>
          <span style={{ width: 30, textAlign: "right", fontFamily: T.body, fontSize: 11.5, fontWeight: 700, color: T.ink2, flexShrink: 0 }}>{age[b]}%</span>
        </div>
      ))}
    </div>
  );
}

function SectionCard({ title, icon, children, action }: { title: string; icon?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 20, padding: 16, marginBottom: 13 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}>
        {icon && <Icon name={icon as "video" | "grid" | "user" | "rupee"} size={17} c={T.rose} />}
        <h3 style={{ margin: 0, fontFamily: T.display, fontSize: 15.5, fontWeight: 700, color: T.ink, flex: 1 }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function WorkViewer({ w, onClose }: { w: Work; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 90, background: "rgba(13,7,9,0.92)", display: "flex", flexDirection: "column", animation: "fadeIn .2s ease" }}>
      <div style={{ flex: 1, position: "relative", margin: "60px 16px 20px", borderRadius: 22, overflow: "hidden", background: `linear-gradient(150deg, ${w.from}, ${w.to})` }} onClick={(e) => e.stopPropagation()}>
        {w.image
          ? <img src={w.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 120 }}>{w.emoji}</span>
            </div>}
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, width: 36, height: 36, borderRadius: 999, border: "none", background: "rgba(20,8,10,0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name="x" size={20} c="#fff" />
        </button>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, background: "linear-gradient(180deg, transparent, rgba(20,8,10,0.8))" }}>
          <Pill tone="inkSolid" style={{ marginBottom: 8, display: "inline-flex" }}>
            <Icon name={w.kind === "Reel" ? "play" : "image"} size={11} c="#fff" fill={w.kind === "Reel" ? "#fff" : "none"} />{w.kind}
          </Pill>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 14, color: "#fff", lineHeight: 1.4 }}>{w.caption}</p>
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: "#fff" }}>
              <Icon name="heart" size={14} c="#fff" fill="#fff" />{kfmt(w.likes)}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: "#fff" }}>
              <Icon name="eye" size={14} c="#fff" />{kfmt(w.views)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Lookbook({ creator, onBack, onReachOut }: {
  creator: Creator; onBack: () => void; onReachOut: (c: Creator) => void;
}) {
  const cat = catOf(creator.category);
  const [workIdx, setWorkIdx] = useState<number | null>(null);
  const w = workIdx != null ? creator.works[workIdx] : null;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 70, background: T.bg, display: "flex", flexDirection: "column", animation: "fadeIn .22s ease" }}>
      {/* scrolling body */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 96 }}>
        {/* hero */}
        <div style={{ position: "relative", height: 230, background: `linear-gradient(150deg, ${creator.from}, ${creator.to})`, overflow: "hidden" }}>
          {(() => { const cover = creator.coverUrl || creator.works[0]?.image; return cover
            ? <img src={cover} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            : <>
                <div style={{ position: "absolute", inset: 0, opacity: 0.16, background: "radial-gradient(circle at 25% 30%, #fff 0 1.5px, transparent 2px)", backgroundSize: "32px 32px" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 96, filter: "drop-shadow(0 14px 26px rgba(0,0,0,0.3))" }}>{creator.emoji}</span>
                </div>
              </>; })()}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.22) 0%, transparent 30%, transparent 55%, rgba(20,8,10,0.55) 100%)" }} />
          <button onClick={onBack} style={{ position: "absolute", top: 50, left: 14, width: 38, height: 38, borderRadius: 999, border: "none", background: "rgba(20,8,10,0.4)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 5 }}>
            <Icon name="back" size={22} c="#fff" />
          </button>
          {creator.available && (
            <div style={{ position: "absolute", top: 56, right: 14, zIndex: 5, display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 999, background: "rgba(19,138,94,0.92)", fontFamily: T.body, fontSize: 11, fontWeight: 700, color: "#fff" }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "#fff" }} />Available now
            </div>
          )}
          <div style={{ position: "absolute", left: 18, bottom: 14, right: 18 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <h1 style={{ margin: 0, fontFamily: T.display, fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: -0.5, textShadow: "0 2px 10px rgba(0,0,0,0.4)" }}>{creator.name}</h1>
              {creator.verified && <Icon name="verified" size={21} c="#fff" />}
            </div>
            <p style={{ margin: "3px 0 0", fontFamily: T.body, fontSize: 13, color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>{creator.handle} · {cat.emoji} {cat.label}</p>
          </div>
        </div>

        <div style={{ padding: "16px 16px 0" }}>
          {/* rating + area */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.body, fontSize: 13, fontWeight: 700, color: T.ink }}>
              <Icon name="star" size={15} c="#f5a623" fill="#f5a623" />{creator.rating} <span style={{ color: T.ink3, fontWeight: 500 }}>({creator.reviews})</span>
            </span>
            <span style={{ width: 3, height: 3, borderRadius: 999, background: T.line }} />
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.body, fontSize: 13, color: T.ink2, fontWeight: 600 }}>
              <Icon name="pin" size={15} c={T.ink3} />{creator.area} · {creator.dist} km away
            </span>
          </div>

          <p style={{ margin: "0 0 16px", fontFamily: T.body, fontSize: 14, lineHeight: 1.55, color: T.ink2 }}>{creator.bio}</p>

          {/* stats row */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {[["Followers", kfmt(creator.followers)], ["Avg views", kfmt(creator.avgViews)], ["Avg likes", kfmt(creator.avgLikes)], ["Engagement", creator.eng + "%"]].map(([l, v], i) => (
              <div key={l} style={{ flex: 1, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 15, padding: "11px 4px", textAlign: "center" }}>
                <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 17, color: i === 3 ? T.roseDark : T.ink }}>{v}</p>
                <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 9.5, fontWeight: 600, color: T.ink3, textTransform: "uppercase", letterSpacing: 0.3 }}>{l}</p>
              </div>
            ))}
          </div>

          {/* verified note */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 13px", background: T.mintTint, borderRadius: 13, marginBottom: 16 }}>
            <Icon name="verified" size={17} c={T.mintInk} />
            <span style={{ fontFamily: T.body, fontSize: 12, color: T.mintInk, fontWeight: 600, lineHeight: 1.4 }}>Metrics verified via Instagram · refreshed weekly</span>
          </div>

          {/* video pitch */}
          <SectionCard title="Video pitch" icon="video">
            <button onClick={() => setWorkIdx(0)} style={{ width: "100%", position: "relative", height: 150, borderRadius: 14, border: "none", overflow: "hidden", cursor: "pointer", background: `linear-gradient(150deg, ${creator.works[0]?.from ?? creator.from}, ${creator.works[0]?.to ?? creator.to})` }}>
              {creator.works[0]?.image && <img src={creator.works[0].image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.18)" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 54, height: 54, borderRadius: 999, background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(0,0,0,0.25)" }}>
                  <Icon name="play" size={24} c={T.roseDark} fill={T.roseDark} />
                </div>
              </div>
              <span style={{ position: "absolute", bottom: 10, left: 12, fontFamily: T.body, fontSize: 12, fontWeight: 700, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>30s intro · why brands love working with me</span>
            </button>
          </SectionCard>

          {/* recent work grid */}
          <SectionCard title="Recent work" icon="grid" action={<span style={{ fontFamily: T.body, fontSize: 12, color: T.ink3 }}>{creator.works.length} posts</span>}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
              {creator.works.map((wk, i) => (
                <button key={i} onClick={() => setWorkIdx(i)} style={{ position: "relative", aspectRatio: "1", borderRadius: 12, border: "none", overflow: "hidden", cursor: "pointer", background: `linear-gradient(150deg, ${wk.from}, ${wk.to})` }}>
                  {wk.image
                    ? <img src={wk.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}>{wk.emoji}</span>}
                  <span style={{ position: "absolute", top: 6, right: 6 }}><Icon name={wk.kind === "Reel" ? "play" : "image"} size={13} c="#fff" fill={wk.kind === "Reel" ? "#fff" : "none"} /></span>
                  <span style={{ position: "absolute", bottom: 5, left: 6, display: "inline-flex", alignItems: "center", gap: 3, fontFamily: T.body, fontSize: 9.5, fontWeight: 700, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                    <Icon name="heart" size={10} c="#fff" fill="#fff" />{kfmt(wk.likes)}
                  </span>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* audience */}
          <SectionCard title="Audience" icon="user">
            <p style={{ margin: "0 0 10px", fontFamily: T.body, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, color: T.ink3, textTransform: "uppercase" }}>Age</p>
            <AgeBars age={creator.age} />
            <p style={{ margin: "16px 0 9px", fontFamily: T.body, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, color: T.ink3, textTransform: "uppercase" }}>Gender</p>
            <div style={{ display: "flex", height: 28, borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${creator.gender.f}%`, background: `linear-gradient(90deg, ${T.rose}, ${T.roseDark})`, display: "flex", alignItems: "center", paddingLeft: 11, fontFamily: T.body, fontSize: 11.5, fontWeight: 700, color: "#fff" }}>{creator.gender.f}% F</div>
              <div style={{ flex: 1, background: "#3a4a78", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 11, fontFamily: T.body, fontSize: 11.5, fontWeight: 700, color: "#fff" }}>{creator.gender.m}% M</div>
            </div>
          </SectionCard>

          {/* services */}
          <SectionCard title="Services & rates" icon="rupee">
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {creator.services.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < creator.services.length - 1 ? `1px solid ${T.lineSoft}` : "none" }}>
                  <Icon name={s.code === "reel" ? "play" : s.code === "post" ? "image" : "spark"} size={17} c={T.rose} fill={s.code === "reel" ? T.rose : "none"} />
                  <span style={{ flex: 1, fontFamily: T.body, fontSize: 13.5, color: T.ink2, fontWeight: 600 }}>{s.label}</span>
                  {s.negotiable && <Pill tone="amber" style={{ fontSize: 10 }}>Negotiable</Pill>}
                  <span style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.ink }}>{inr(s.price)}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: 13, borderRadius: 14, background: T.roseTint, display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="spark" size={20} c={T.roseDark} fill={T.roseDark} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 14, color: T.ink }}>{creator.pkg.name}</p>
                <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink2 }}>{creator.pkg.items}</p>
              </div>
              <span style={{ fontFamily: T.display, fontSize: 17, fontWeight: 700, color: T.roseDark, flexShrink: 0 }}>{inr(creator.pkg.price)}</span>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* sticky reach-out bar */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "11px 16px 22px", background: "rgba(250,248,246,0.94)", backdropFilter: "blur(14px)", borderTop: `1px solid ${T.line}` }}>
        <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
          <div style={{ flexShrink: 0 }}>
            <p style={{ margin: 0, fontFamily: T.body, fontSize: 10.5, color: T.ink3, fontWeight: 600 }}>Starts at</p>
            <p style={{ margin: 0, fontFamily: T.display, fontSize: 19, fontWeight: 700, color: T.ink }}>{inr(creator.rateFrom)}</p>
          </div>
          <Btn variant="primary" icon="send" onClick={() => onReachOut(creator)} style={{ flex: 1 }}>Reach out</Btn>
        </div>
      </div>

      {/* work viewer overlay */}
      {w && <WorkViewer w={w} onClose={() => setWorkIdx(null)} />}
    </div>
  );
}
