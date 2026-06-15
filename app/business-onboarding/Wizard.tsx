"use client";

import { useState, useEffect, useRef } from "react";
import { T } from "@/lib/ob-tokens";
import { CITIES, CREATOR_CATEGORIES } from "@/lib/ob-data";
import { Icon } from "@/components/ob-icons";
import {
  Avatar, Pill, Btn, Field, OptionCard,
  WizardChrome, StepHead, SectionLabel, Footer, PendingCard,
} from "@/components/ob-primitives";
import { browserClient } from "@/lib/supabase";

interface BizForm {
  name: string; handle: string; email: string; phone: string;
  category: string; city: string; bio: string;
  hiring: string;
  password: string; confirmPassword: string;
}

type Step = "ig" | "details" | "info" | "hiring" | "password" | "done";
const B_STEPS: Step[] = ["ig", "details", "info", "hiring", "password"];
const TOTAL = B_STEPS.length;

// ── Step: Details ──
function DetailsStep({ form, set }: { form: BizForm; set: (p: Partial<BizForm>) => void }) {
  return (
    <div>
      <StepHead title="Business details" sub="Prefilled from Instagram — edit anything that needs updating." />
      <Field label="Business name"     icon="building" value={form.name}   onChange={(v) => set({ name: v })}  placeholder="Your brand name" />
      <Field label="Instagram handle"  icon="instagram" value={form.handle} locked verified />
      <Field label="Contact email"     icon="mail"     value={form.email}  onChange={(v) => set({ email: v })} placeholder="hello@yourbrand.com" type="email" />
      <Field label="Phone" icon="phone" type="tel" prefix="+91" value={form.phone} onChange={(v) => set({ phone: v.replace(/[^0-9]/g, "").slice(0, 10) })} placeholder="98765 43210" hint="For booking confirmations only — never shown publicly." />
    </div>
  );
}

// ── SearchSelect ──
function SearchSelect({
  label, value, options, placeholder, onSelect,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  placeholder: string;
  onSelect: (v: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 16 }}>
      <SectionLabel>{label}</SectionLabel>
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setQuery(""); }}
        style={{
          width: "100%", boxSizing: "border-box", display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 8, padding: "0 14px", height: 48,
          borderRadius: 14, border: `1.5px solid ${value ? T.rose : T.line}`,
          background: "#fff", cursor: "pointer", fontFamily: T.body, fontSize: 14,
          color: value ? T.ink : T.ink3, textAlign: "left",
        }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedLabel || placeholder}
        </span>
        <Icon name="chevD" size={16} c={T.ink3} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100,
          background: "#fff", border: `1.5px solid ${T.line}`, borderRadius: 16,
          boxShadow: "0 8px 24px rgba(31,17,16,0.10)", overflow: "hidden",
        }}>
          <div style={{ padding: "10px 10px 6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 10px", height: 38, borderRadius: 10, background: T.bg, border: `1px solid ${T.line}` }}>
              <Icon name="search" size={15} c={T.ink3} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}…`}
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: T.body, fontSize: 13.5, color: T.ink }}
              />
            </div>
          </div>
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "12px 18px", fontFamily: T.body, fontSize: 13, color: T.ink3 }}>No results</div>
            )}
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onSelect(o.value); setOpen(false); setQuery(""); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "11px 18px", border: "none", background: o.value === value ? T.roseTint : "transparent",
                  cursor: "pointer", fontFamily: T.body, fontSize: 13.5, color: o.value === value ? T.roseDark : T.ink,
                  textAlign: "left",
                }}
              >
                {o.label}
                {o.value === value && <Icon name="check" size={14} c={T.rose} w={2.4} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step: Info (category + city + bio) ──
function InfoStep({ form, set }: { form: BizForm; set: (p: Partial<BizForm>) => void }) {
  const [cities, setCities] = useState<{ value: string; label: string }[]>(
    CITIES.map((c) => ({ value: c, label: c }))
  );
  const [categories, setCategories] = useState<{ value: string; label: string }[]>(
    CREATOR_CATEGORIES.map((c) => ({ value: c.slug, label: c.label }))
  );

  useEffect(() => {
    const sb = browserClient();
    sb.from("locations").select("city").order("city").then(({ data }) => {
      if (data && data.length > 0) {
        setCities(data.map((r) => ({ value: r.city, label: r.city })));
      }
    });
    sb.from("creator_categories").select("slug, label").order("sort_order").then(({ data }) => {
      if (data && data.length > 0) {
        setCategories(data.map((r) => ({ value: r.slug, label: r.label })));
      }
    });
  }, []);

  return (
    <div>
      <StepHead emoji="🏪" title="Tell us about the business" sub="Creators use this to decide if you're a good fit before they even swipe." />

      <SearchSelect
        label="Category"
        value={form.category}
        options={categories}
        placeholder="Select a category"
        onSelect={(v) => set({ category: v })}
      />

      <SearchSelect
        label="City"
        value={form.city}
        options={cities}
        placeholder="Select your city"
        onSelect={(v) => set({ city: v })}
      />

      <SectionLabel>One-line bio</SectionLabel>
      <div style={{ position: "relative", marginBottom: 14 }}>
        <textarea
          value={form.bio}
          onChange={(e) => set({ bio: e.target.value.slice(0, 120) })}
          placeholder="e.g. Specialty coffee roasters with 3 cafés across Bengaluru"
          rows={3}
          style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${T.line}`, borderRadius: 14, padding: "12px 14px", fontFamily: T.body, fontSize: 14, color: T.ink, background: "#fff", outline: "none", resize: "none", lineHeight: 1.5 }}
        />
        <span style={{ position: "absolute", bottom: 10, right: 12, fontFamily: T.body, fontSize: 10.5, color: T.ink3 }}>{form.bio.length}/120</span>
      </div>
    </div>
  );
}

// ── Step: Hiring ──
function HiringStep({ form, set }: { form: BizForm; set: (p: Partial<BizForm>) => void }) {
  const statuses = [
    { key: "open",     emoji: "🟢", title: "Open to pitches",   desc: "Creators can pitch you — you get inbound proposals right away.", accent: "mint" as const },
    { key: "scouting", emoji: "🔍", title: "Actively scouting", desc: "Show the 'Scouting' badge — you're browsing and will reach out.", accent: "rose" as const },
    { key: "closed",   emoji: "⏸",  title: "Not hiring yet",    desc: "Set up your profile first. You can flip this on any time.",     accent: "neutral" as const },
  ];
  return (
    <div>
      <StepHead emoji="📣" title="Are you hiring?" sub="This badge shows on your business card in the creator's swipe deck. You can change it whenever." />
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {statuses.map((s) => (
          <OptionCard key={s.key} emoji={s.emoji} title={s.title} desc={s.desc} active={form.hiring === s.key} onClick={() => set({ hiring: s.key })} accent={s.accent} />
        ))}
      </div>
      <div style={{ marginTop: 20, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, padding: "14px 15px" }}>
        <p style={{ margin: "0 0 10px", fontFamily: T.body, fontSize: 11, fontWeight: 700, color: T.ink3, letterSpacing: 0.3, textTransform: "uppercase" }}>Your first month includes</p>
        {["5 pitch credits to reach out to creators", "Verified business badge on all campaigns", "Priority matching with local hyper-creators"].map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 0" }}>
            <Icon name="check" size={14} c={T.rose} w={2.4} />
            <span style={{ fontFamily: T.body, fontSize: 12.5, color: T.ink2 }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Password step ──
function PasswordStep({ form, set }: { form: BizForm; set: (p: Partial<BizForm>) => void }) {
  const [show, setShow] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const mismatch = attempted && form.confirmPassword !== form.password;
  const tooShort = attempted && form.password.length > 0 && form.password.length < 8;

  return (
    <div>
      <StepHead emoji="🔐" title="Set your password" sub="You'll use this to sign in next time, no Instagram required." />

      <div style={{ marginBottom: 14 }}>
        <span style={{ display: "block", marginBottom: 6, fontFamily: T.body, fontSize: 12, fontWeight: 650, color: T.ink2 }}>Password</span>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 13px", height: 48, borderRadius: 14, background: "#fff", border: `1.5px solid ${tooShort ? "#f3d3cf" : T.line}` }}>
          <Icon name="lock" size={18} c={T.ink3} />
          <input
            value={form.password}
            onChange={(e) => { set({ password: e.target.value }); setAttempted(true); }}
            type={show ? "text" : "password"}
            placeholder="••••••••"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: T.body, fontSize: 15, color: T.ink, minWidth: 0 }}
          />
          <button onClick={() => setShow((s) => !s)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }} type="button">
            <Icon name="eye" size={17} c={T.ink3} />
          </button>
        </div>
        {tooShort && <span style={{ display: "block", marginTop: 5, fontFamily: T.body, fontSize: 11, color: "#b42318" }}>At least 8 characters required</span>}
      </div>

      <div style={{ marginBottom: 14 }}>
        <span style={{ display: "block", marginBottom: 6, fontFamily: T.body, fontSize: 12, fontWeight: 650, color: T.ink2 }}>Confirm password</span>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 13px", height: 48, borderRadius: 14, background: "#fff", border: `1.5px solid ${mismatch ? "#f3d3cf" : T.line}` }}>
          <Icon name="lock" size={18} c={T.ink3} />
          <input
            value={form.confirmPassword}
            onChange={(e) => { set({ confirmPassword: e.target.value }); setAttempted(true); }}
            type={show ? "text" : "password"}
            placeholder="••••••••"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: T.body, fontSize: 15, color: T.ink, minWidth: 0 }}
          />
        </div>
        {mismatch && <span style={{ display: "block", marginTop: 5, fontFamily: T.body, fontSize: 11, color: "#b42318" }}>Passwords don't match</span>}
      </div>
    </div>
  );
}

// ── Done screen ──
function DoneScreen({ form, displayName, handle }: { form: BizForm; displayName: string; handle: string }) {
  const hiringMap: Record<string, { label: string; tone: "mint" | "rose" | "neutral"; emoji: string }> = {
    open:     { label: "Open to pitches",   tone: "mint",    emoji: "🟢" },
    scouting: { label: "Actively scouting", tone: "rose",    emoji: "🔍" },
    closed:   { label: "Not hiring yet",    tone: "neutral", emoji: "⏸" },
  };
  const h   = hiringMap[form.hiring] || hiringMap.open;
  const cat = CREATOR_CATEGORIES.find((c) => c.slug === form.category);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "64px 20px 12px" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 52, lineHeight: 1.1 }}>📬</div>
          <h1 style={{ margin: "12px 0 0", fontFamily: T.display, fontSize: 28, fontWeight: 700, color: T.ink, letterSpacing: -0.5, lineHeight: 1.1 }}>
            Application<br /><span style={{ color: T.mint, fontStyle: "italic" }}>submitted!</span>
          </h1>
          <p style={{ margin: "9px 0 0", fontFamily: T.body, fontSize: 13.5, color: T.ink3, lineHeight: 1.5 }}>
            We've received your business profile. Once our team approves it you'll be visible to creators in your area.
          </p>
        </div>

        <PendingCard eta="12–24 hours" />

        <p style={{ margin: "4px 0 10px", fontFamily: T.body, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: T.ink3, textTransform: "uppercase" }}>Your application</p>
        <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 20, padding: 16, boxShadow: "0 4px 16px rgba(31,17,16,0.05)", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 11 }}>
            <Avatar emoji="☕" from="#ffe4cc" to="#ffb27a" size={48} r={14} ring="#d4ead8" />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink }}>{form.name || displayName}</p>
              <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 12, color: T.ink3 }}>{handle}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: form.bio ? 9 : 0 }}>
            <Pill tone={h.tone}>{h.emoji} {h.label}</Pill>
            {cat && <Pill tone="rose">{cat.label}</Pill>}
            {form.city && <Pill tone="neutral">📍 {form.city}</Pill>}
          </div>
          {form.bio && (
            <p style={{ margin: 0, fontFamily: T.body, fontSize: 12.5, color: T.ink2, lineHeight: 1.45, padding: "9px 0 0", borderTop: `1px solid ${T.lineSoft}` }}>{form.bio}</p>
          )}
        </div>

        <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, padding: "14px 16px" }}>
          <p style={{ margin: "0 0 10px", fontFamily: T.body, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, color: T.ink3, textTransform: "uppercase" }}>Once approved you can</p>
          {[
            { icon: "search", text: "Swipe through verified creators in your city" },
            { icon: "send",   text: "Pitch creators with a brief + budget in seconds" },
            { icon: "shield", text: "Escrow protects your payment until the post is live" },
          ].map((n, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "5px 0" }}>
              <Icon name={n.icon as any} size={15} c={T.mint} style={{ marginTop: 1 }} />
              <span style={{ fontFamily: T.body, fontSize: 13, color: T.ink2, lineHeight: 1.4 }}>{n.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 18px 28px", background: T.bg, borderTop: `1px solid ${T.line}`, display: "flex", flexDirection: "column", gap: 9 }}>
        <Btn variant="mint" size="lg" onClick={() => { window.location.href = "/"; }}>Got it — I'll wait for the notification</Btn>
        <button onClick={() => { window.location.href = "/"; }} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.body, fontSize: 13.5, color: T.ink3, fontWeight: 650 }}>Edit my profile</button>
      </div>
    </div>
  );
}

// ── Root wizard ──
export function BusinessWizard({
  profileId, displayName, handle, igConfigured,
}: {
  profileId: string; displayName: string; handle: string; igConfigured: boolean;
}) {
  const [step, setStep] = useState<Step>("ig");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<BizForm>({
    name: displayName, handle, email: "", phone: "",
    category: "", city: "", bio: "",
    hiring: "",
    password: "", confirmPassword: "",
  });
  const set = (patch: Partial<BizForm>) => setForm((f) => ({ ...f, ...patch }));

  const B_STEPS_W: Step[] = ["ig", "details", "info", "hiring", "password"];
  const idx     = B_STEPS_W.indexOf(step);
  const stepNum = idx + 1;

  function back() {
    if (step === "ig" || step === "details") { window.location.href = "/"; return; }
    if (step === "password") { setStep("hiring"); return; }
    setStep(B_STEPS_W[idx - 1] as Step);
  }
  async function next() {
    if (step === "password") {
      setSubmitting(true);
      try {
        await fetch("/api/onboarding/business/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId,
            name: form.name, email: form.email, phone: form.phone,
            category: form.category, city: form.city,
            bio: form.bio, hiring: form.hiring,
            password: form.password,
          }),
        });
      } catch (_) { /* non-blocking */ }
      setSubmitting(false);
      setStep("done");
      return;
    }
    setStep(B_STEPS_W[idx + 1] as Step);
  }

  const canContinue: Record<Step, boolean> = {
    ig:       true,
    details:  !!(form.name && form.email),
    info:     !!(form.category && form.city),
    hiring:   !!form.hiring,
    password: form.password.length >= 8 && form.password === form.confirmPassword,
    done:     true,
  };

  const continueLabel: Partial<Record<Step, string>> = {
    hiring:   form.hiring ? "Finish & go live" : "Continue",
    password: "Create account",
  };

  // ig step — show connected card (already authenticated via OAuth)
  if (step === "ig") {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
        <WizardChrome label="Business sign-up" step={1} total={TOTAL} onBack={back} />
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 18px 8px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 999, background: T.mintTint, marginBottom: 14 }}>
            <Icon name="checkCircle" size={16} c={T.mint} />
            <span style={{ fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: T.mintInk }}>Instagram connected</span>
          </div>
          <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 6px 20px rgba(31,17,16,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16 }}>
              <Avatar emoji="☕" from="#ffe4cc" to="#ffb27a" size={54} r={16} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 17, color: T.ink }}>{displayName || "Your business"}</p>
                  <Icon name="verified" size={15} c="#3897f0" />
                </div>
                <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 12.5, color: T.ink3 }}>{handle || "@yourbusiness"}</p>
                <span style={{ display: "inline-block", marginTop: 5, fontFamily: T.body, fontSize: 10.5, fontWeight: 700, color: T.ink2, background: T.bg, padding: "2px 8px", borderRadius: 999 }}>Business account</span>
              </div>
            </div>
            <div style={{ padding: "10px 14px 14px", borderTop: `1px solid ${T.lineSoft}` }}>
              <p style={{ margin: "0 0 8px", fontFamily: T.body, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3, color: T.ink3, textTransform: "uppercase" }}>Recent posts pulled</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 5 }}>
                {[["#ffe4cc","#ffc299"],["#e8d5bd","#c9a87e"],["#ffe8c2","#ffd28a"],["#dfe7d0","#b6c79a"],["#f0dcc0","#d9b384"],["#d9e8d4","#aacaa0"]].map(([f, t], i) => (
                  <div key={i} style={{ aspectRatio: "1", borderRadius: 9, background: `linear-gradient(135deg,${f},${t})` }} />
                ))}
              </div>
            </div>
          </div>
          <p style={{ margin: "12px 4px 0", fontFamily: T.body, fontSize: 11.5, color: T.ink3, lineHeight: 1.5 }}>
            Looks good? We'll refresh these stats automatically every week.
          </p>
        </div>
        <Footer onContinue={next} label="Continue" />
      </div>
    );
  }

  if (step === "done") {
    return <DoneScreen form={form} displayName={displayName} handle={handle} />;
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <WizardChrome label="Business sign-up" step={stepNum} total={TOTAL} onBack={back} />
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px 8px" }}>
        {step === "details"  && <DetailsStep  form={form} set={set} />}
        {step === "info"     && <InfoStep     form={form} set={set} />}
        {step === "hiring"   && <HiringStep   form={form} set={set} />}
        {step === "password" && <PasswordStep form={form} set={set} />}
      </div>
      <Footer
        onContinue={next}
        label={submitting ? "Saving…" : (continueLabel[step] || "Continue")}
        disabled={!canContinue[step] || submitting}
      />
    </div>
  );
}
