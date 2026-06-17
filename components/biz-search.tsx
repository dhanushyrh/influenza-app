"use client";
import React, { useState, useMemo, useEffect } from "react";
import { T, inr, kfmt } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Btn, Avatar, Chip, OBSheet, SectionLabel, Toggle } from "@/components/ob-primitives";
import { CAT, SIZE, AGE_BUCKETS, AREAS, BUDGETS, catOf, sizeOf, type Creator } from "@/lib/biz-data";
import { creatorMatchesFilterCategories } from "@/lib/categories";
import { PageHead, BizSegmented } from "@/components/biz-nav";

interface Filters {
  cats: string[]; ages: string[]; sizes: string[]; minEng: number;
  budget: string | null; areas: string[]; availOnly: boolean;
}
const EMPTY: Filters = { cats: [], ages: [], sizes: [], minEng: 0, budget: null, areas: [], availOnly: false };
const ENG_OPTS = [{ v: 0, label: "Any" }, { v: 8, label: "8%+" }, { v: 12, label: "12%+" }, { v: 15, label: "15%+" }];

function filterCount(f: Filters) {
  return f.cats.length + f.ages.length + f.sizes.length + f.areas.length +
    (f.minEng > 0 ? 1 : 0) + (f.budget ? 1 : 0) + (f.availOnly ? 1 : 0);
}
function applyFilters(list: Creator[], f: Filters, q: string) {
  const qq = q.trim().toLowerCase();
  return list.filter((c) => {
    if (qq && !(`${c.name} ${c.handle} ${catOf(c.category).label}`.toLowerCase().includes(qq))) return false;
    if (f.cats.length && !creatorMatchesFilterCategories(c, f.cats)) return false;
    if (f.ages.length && !f.ages.includes(c.ageDom)) return false;
    if (f.sizes.length && !f.sizes.includes(sizeOf(c.followers))) return false;
    if (c.eng < f.minEng) return false;
    if (f.budget) { const b = BUDGETS.find((x) => x.key === f.budget); if (b && (c.rateFrom < b.lo || c.rateFrom > b.hi)) return false; }
    if (f.areas.length && !f.areas.includes(c.area)) return false;
    if (f.availOnly && !c.available) return false;
    return true;
  });
}

function FilterSheet({ initial, onClose, onApply }: { initial: Filters; onClose: () => void; onApply: (f: Filters) => void }) {
  const [f, setF] = useState(initial);
  const tog = (key: keyof Filters, val: string) => {
    const arr = f[key] as string[];
    setF({ ...f, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] });
  };
  const count = filterCount(f);
  return (
    <OBSheet open onClose={onClose} title="Filters" accent="rose">
      <SectionLabel>Category</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {CAT.map((c) => <Chip key={c.key} active={f.cats.includes(c.key)} onClick={() => tog("cats", c.key)} icon={c.emoji}>{c.label}</Chip>)}
      </div>

      <SectionLabel>Audience age group</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {AGE_BUCKETS.map((a) => <Chip key={a} active={f.ages.includes(a)} onClick={() => tog("ages", a)}>{a}</Chip>)}
      </div>

      <SectionLabel>Follower size</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {SIZE.map((s) => <Chip key={s.key} active={f.sizes.includes(s.key)} onClick={() => tog("sizes", s.key)}>{s.label} · {s.range}</Chip>)}
      </div>

      <SectionLabel>Minimum engagement</SectionLabel>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {ENG_OPTS.map((e) => {
          const on = f.minEng === e.v;
          return (
            <button key={e.v} onClick={() => setF({ ...f, minEng: e.v })} style={{ flex: 1, padding: "10px 0", borderRadius: 12, cursor: "pointer", border: on ? `1.5px solid ${T.rose}` : `1px solid ${T.line}`, background: on ? T.roseTint : "#fff", fontFamily: T.display, fontWeight: 700, fontSize: 14, color: on ? T.roseDark : T.ink2 }}>{e.label}</button>
          );
        })}
      </div>

      <SectionLabel>Budget per collab</SectionLabel>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {BUDGETS.map((b) => {
          const on = f.budget === b.key;
          return (
            <button key={b.key} onClick={() => setF({ ...f, budget: on ? null : b.key })} style={{ flex: 1, padding: "10px 0", borderRadius: 12, cursor: "pointer", border: on ? `1.5px solid ${T.rose}` : `1px solid ${T.line}`, background: on ? T.roseTint : "#fff", fontFamily: T.display, fontWeight: 700, fontSize: 13.5, color: on ? T.roseDark : T.ink2 }}>{b.label}</button>
          );
        })}
      </div>

      <SectionLabel>Neighbourhood</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {AREAS.map((a) => <Chip key={a} active={f.areas.includes(a)} onClick={() => tog("areas", a)} icon="📍">{a}</Chip>)}
      </div>

      <button onClick={() => setF({ ...f, availOnly: !f.availOnly })} style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "13px 15px", background: "#fff", border: `1px solid ${f.availOnly ? T.mint : T.line}`, borderRadius: 15, marginBottom: 18, cursor: "pointer" }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: T.mintTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="bolt" size={19} c={T.mintInk} fill={T.mintInk} />
        </div>
        <span style={{ flex: 1, textAlign: "left", fontFamily: T.body, fontSize: 14, fontWeight: 650, color: T.ink }}>Available now only</span>
        <Toggle on={f.availOnly} onChange={() => setF({ ...f, availOnly: !f.availOnly })} />
      </button>

      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="ghost" onClick={() => setF(EMPTY)} style={{ flex: 1 }}>Reset</Btn>
        <Btn variant="primary" onClick={() => onApply(f)} style={{ flex: 1.6 }}>Show results{count ? ` · ${count}` : ""}</Btn>
      </div>
    </OBSheet>
  );
}

function GridCard({ c, onOpen, showRates }: { c: Creator; onOpen: () => void; showRates?: boolean }) {
  const cat = catOf(c.category);
  // Creators without any portfolio posts have an empty `works` array — fall back
  // to the creator's own gradient/emoji so the card still renders.
  const w = c.works[0] ?? { from: c.from, to: c.to, emoji: c.emoji, image: undefined };
  return (
    <button onClick={onOpen} style={{ textAlign: "left", background: "#fff", border: `1px solid ${T.line}`, borderRadius: 18, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 8px rgba(31,17,16,0.04)", WebkitTapHighlightColor: "transparent" }}>
      <div style={{ position: "relative", aspectRatio: "1.1", background: `linear-gradient(150deg, ${w.from}, ${w.to})` }}>
        {w.image
          ? <img src={w.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.22))" }}>{w.emoji}</span>}
        {c.available && (
          <span style={{ position: "absolute", top: 8, left: 8, display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 7px", borderRadius: 999, background: "rgba(19,138,94,0.92)", fontFamily: T.body, fontSize: 9.5, fontWeight: 700, color: "#fff" }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: "#fff" }} />Now
          </span>
        )}
        <span style={{ position: "absolute", bottom: 8, right: 8, display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 999, background: "rgba(20,8,10,0.5)", backdropFilter: "blur(6px)", fontFamily: T.body, fontSize: 10, fontWeight: 700, color: "#fff" }}>
          <Icon name="bolt" size={11} c="#fff" fill="#fff" />{c.eng}%
        </span>
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 14.5, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</p>
          {c.verified && <Icon name="verified" size={13} c={T.mint} style={{ flexShrink: 0 }} />}
        </div>
        <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 11.5, color: T.ink3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cat.emoji} {cat.label} · {c.area}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontFamily: T.body, fontSize: 12, fontWeight: 700, color: T.ink2 }}>{kfmt(c.followers)} <span style={{ color: T.ink3, fontWeight: 500 }}>followers</span></span>
          {showRates && <span style={{ fontFamily: T.display, fontSize: 12.5, fontWeight: 700, color: T.roseDark }}>{inr(c.rateFrom)}</span>}
        </div>
      </div>
    </button>
  );
}

function ListRow({ c, onOpen, showRates }: { c: Creator; onOpen: () => void; showRates?: boolean }) {
  const cat = catOf(c.category);
  return (
    <button onClick={onOpen} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 18, padding: 12, cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
      <div style={{ position: "relative" }}>
        <Avatar emoji={c.emoji} from={c.from} to={c.to} size={50} r={15} src={c.photoUrl} />
        {c.available && <span style={{ position: "absolute", bottom: -2, right: -2, width: 14, height: 14, borderRadius: 999, background: T.mint, border: "2px solid #fff" }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 15, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</p>
          {c.verified && <Icon name="verified" size={14} c={T.mint} style={{ flexShrink: 0 }} />}
        </div>
        <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cat.emoji} {cat.label} · {c.area} · {c.dist} km</p>
        <div style={{ display: "flex", gap: 12, marginTop: 5 }}>
          <span style={{ fontFamily: T.body, fontSize: 11.5, fontWeight: 700, color: T.ink2 }}>{kfmt(c.followers)} <span style={{ color: T.ink3, fontWeight: 500 }}>foll.</span></span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: T.body, fontSize: 11.5, fontWeight: 700, color: T.ink2 }}><Icon name="bolt" size={12} c={T.rose} fill={T.rose} />{c.eng}%</span>
        </div>
      </div>
      {showRates && (
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ margin: 0, fontFamily: T.display, fontSize: 14, fontWeight: 700, color: T.roseDark }}>{inr(c.rateFrom)}</p>
          <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 10, color: T.ink3 }}>from</p>
        </div>
      )}
    </button>
  );
}

export function Search({ openFilters, clearOpenFilters, onOpen, showRates, creators, businessCategory }: {
  openFilters?: boolean; clearOpenFilters?: () => void;
  onOpen: (c: Creator) => void; showRates?: boolean;
  creators: Creator[];
  businessCategory?: string;
}) {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sheet, setSheet] = useState(false);

  useEffect(() => { if (openFilters) { setSheet(true); clearOpenFilters?.(); } }, [openFilters]);

  const results = useMemo(() => applyFilters(creators, filters, q), [creators, filters, q]);
  const count = filterCount(filters);

  // active filter chips
  const active: { k: string; label: string; rm: () => void }[] = [];
  filters.cats.forEach((k) => active.push({ k: "cat:" + k, label: catOf(k).label, rm: () => setFilters((s) => ({ ...s, cats: s.cats.filter((x) => x !== k) })) }));
  filters.ages.forEach((a) => active.push({ k: "age:" + a, label: a, rm: () => setFilters((s) => ({ ...s, ages: s.ages.filter((x) => x !== a) })) }));
  filters.sizes.forEach((z) => active.push({ k: "size:" + z, label: SIZE.find((s) => s.key === z)!.label, rm: () => setFilters((s) => ({ ...s, sizes: s.sizes.filter((x) => x !== z) })) }));
  filters.areas.forEach((a) => active.push({ k: "area:" + a, label: a, rm: () => setFilters((s) => ({ ...s, areas: s.areas.filter((x) => x !== a) })) }));
  if (filters.minEng > 0) active.push({ k: "eng", label: filters.minEng + "%+ eng", rm: () => setFilters((s) => ({ ...s, minEng: 0 })) });
  if (filters.budget) active.push({ k: "bud", label: BUDGETS.find((b) => b.key === filters.budget)!.label, rm: () => setFilters((s) => ({ ...s, budget: null })) });
  if (filters.availOnly) active.push({ k: "av", label: "Available now", rm: () => setFilters((s) => ({ ...s, availOnly: false })) });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <PageHead kicker="Find creators" title="Search" />

      {/* search box + filter button */}
      <div style={{ flexShrink: 0, padding: "0 16px 10px", display: "flex", gap: 9 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "0 13px", height: 44, borderRadius: 14, background: "#fff", border: `1px solid ${T.line}` }}>
          <Icon name="search" size={18} c={T.ink3} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, @handle or niche" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: T.body, fontSize: 14.5, color: T.ink, minWidth: 0 }} />
          {q && <button onClick={() => setQ("")} style={{ background: "none", border: "none", padding: 2, cursor: "pointer", display: "flex" }}><Icon name="x" size={16} c={T.ink3} /></button>}
        </div>
        <button onClick={() => setSheet(true)} style={{ position: "relative", width: 44, height: 44, borderRadius: 14, border: `1px solid ${count ? T.rose : T.line}`, background: count ? T.roseTint : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <Icon name="sliders" size={20} c={count ? T.roseDark : T.ink2} />
          {count > 0 && (
            <span style={{ position: "absolute", top: -6, right: -6, minWidth: 18, height: 18, padding: "0 4px", borderRadius: 999, background: T.rose, color: "#fff", fontFamily: T.body, fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(255,77,109,0.5)" }}>{count}</span>
          )}
        </button>
      </div>

      {/* active filter chips */}
      {active.length > 0 && (
        <div style={{ flexShrink: 0, display: "flex", gap: 7, padding: "0 16px 10px", overflowX: "auto" }}>
          {active.map((a) => (
            <button key={a.k} onClick={a.rm} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 999, border: `1px solid ${T.roseTint2}`, background: T.roseTint, cursor: "pointer", flexShrink: 0, fontFamily: T.body, fontSize: 12, fontWeight: 650, color: T.roseDark, whiteSpace: "nowrap" }}>
              {a.label}<Icon name="x" size={13} c={T.roseDark} />
            </button>
          ))}
        </div>
      )}

      {/* count + view toggle */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 16px 10px" }}>
        <span style={{ fontFamily: T.body, fontSize: 12.5, fontWeight: 650, color: T.ink3 }}>{results.length} creator{results.length === 1 ? "" : "s"} near you</span>
        <BizSegmented value={view} onChange={(v) => setView(v as "grid" | "list")} options={[{ k: "grid", icon: "grid" }, { k: "list", icon: "sliders" }]} />
      </div>

      {/* results */}
      <div style={{ flex: 1, overflowY: "auto", padding: "2px 16px 20px" }}>
        {results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "44px 20px" }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: T.lineSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Icon name="search" size={30} c={T.ink3} />
            </div>
            <p style={{ margin: 0, fontFamily: T.display, fontSize: 17, fontWeight: 700, color: T.ink }}>No matches</p>
            <p style={{ margin: "6px 0 16px", fontFamily: T.body, fontSize: 13, color: T.ink3 }}>Try loosening a filter or two.</p>
            <Btn variant="soft" size="sm" onClick={() => { setFilters(EMPTY); setQ(""); }} style={{ width: "auto", margin: "0 auto" }}>Clear all</Btn>
          </div>
        ) : view === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
            {results.map((c) => <GridCard key={c.id} c={c} onOpen={() => onOpen(c)} showRates={showRates} />)}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {results.map((c) => <ListRow key={c.id} c={c} onOpen={() => onOpen(c)} showRates={showRates} />)}
          </div>
        )}
      </div>

      {sheet && <FilterSheet initial={filters} onClose={() => setSheet(false)} onApply={(f) => { setFilters(f); setSheet(false); }} />}
    </div>
  );
}
