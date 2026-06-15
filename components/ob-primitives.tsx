"use client";

import React, { useState } from "react";
import { T, inr } from "@/lib/ob-tokens";
import { Icon, IconName } from "@/components/ob-icons";

// ── Spinner ──
export function Spinner({ size = 22, c = T.rose, w = 2.6 }: { size?: number; c?: string; w?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: "spin 0.8s linear infinite", display: "block" }}>
      <circle cx="12" cy="12" r="9" fill="none" stroke={c} strokeOpacity={0.18} strokeWidth={w} />
      <path d="M12 3a9 9 0 019 9" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" />
    </svg>
  );
}

// ── Avatar ──
export function Avatar({ emoji, from = "#ffd6cc", to = "#ff9e8a", size = 44, r = 14, ring, src }: {
  emoji: string; from?: string; to?: string; size?: number; r?: number; ring?: string; src?: string | null;
}) {
  return (
    <div style={{
      width: size, height: size, borderRadius: r, flexShrink: 0, overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.5, background: `linear-gradient(135deg, ${from}, ${to})`,
      boxShadow: ring ? `0 0 0 2px ${T.bg}, 0 0 0 4px ${ring}` : "inset 0 1px 0 rgba(255,255,255,0.4)",
    }}>
      {src
        ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : emoji}
    </div>
  );
}

// ── Pill ──
export function Pill({ children, tone = "neutral", style = {} }: {
  children: React.ReactNode; tone?: "neutral" | "rose" | "mint" | "amber" | "inkSolid"; style?: React.CSSProperties;
}) {
  const tones = {
    neutral: { bg: "#f1ecea", fg: T.ink2 },
    rose:    { bg: T.roseTint, fg: T.roseDark },
    mint:    { bg: T.mintTint, fg: T.mintInk },
    amber:   { bg: T.amberTint, fg: T.amber },
    inkSolid:{ bg: T.ink, fg: "#fff" },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: t.bg, color: t.fg,
      fontFamily: T.body, fontSize: 11.5, fontWeight: 650, letterSpacing: 0.1,
      padding: "4px 9px", borderRadius: 999, lineHeight: 1, whiteSpace: "nowrap" as const, ...style,
    }}>{children}</span>
  );
}

// ── Button ──
export function Btn({ children, onClick, variant = "primary", icon, size: sz = "md", disabled, style = {} }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "mint" | "ink" | "ghost" | "soft" | "danger";
  icon?: IconName;
  size?: "lg" | "md" | "sm";
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const pad = sz === "lg" ? "15px 18px" : sz === "sm" ? "9px 13px" : "12px 16px";
  const fs  = sz === "lg" ? 16 : sz === "sm" ? 13.5 : 15;
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: `linear-gradient(135deg, ${T.rose}, ${T.roseDark})`, color: "#fff", boxShadow: "0 8px 20px rgba(255,77,109,0.30)" },
    mint:    { background: `linear-gradient(135deg, #17a06d, ${T.mintInk})`, color: "#fff", boxShadow: "0 8px 20px rgba(19,138,94,0.28)" },
    ink:     { background: T.ink, color: "#fff" },
    ghost:   { background: "#fff", color: T.ink, border: `1px solid ${T.line}` },
    soft:    { background: T.roseTint, color: T.roseDark },
    danger:  { background: "#fff", color: "#b42318", border: "1px solid #f3d3cf" },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        fontFamily: T.body, fontSize: fs, fontWeight: 680, letterSpacing: 0.1,
        padding: pad, borderRadius: 15, border: "none", cursor: disabled ? "default" : "pointer",
        width: "100%", opacity: disabled ? 0.45 : 1, transition: "transform .12s ease, opacity .15s",
        WebkitTapHighlightColor: "transparent", ...variants[variant], ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.975)"; }}
      onMouseUp={(e)   => { e.currentTarget.style.transform = "scale(1)"; }}
      onMouseLeave={(e)=> { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {icon && <Icon name={icon} size={fs + 3} c="currentColor" />}
      {children}
    </button>
  );
}

// ── Text field ──
export function Field({ label, icon, value, onChange, placeholder, type = "text", locked, verified, prefix, hint, onEnter, autoFocus }: {
  label?: string; icon?: IconName; value: string; onChange?: (v: string) => void;
  placeholder?: string; type?: string; locked?: boolean; verified?: boolean;
  prefix?: string; hint?: string; onEnter?: () => void; autoFocus?: boolean;
}) {
  const [foc, setFoc] = useState(false);
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      {label && (
        <span style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontFamily: T.body, fontSize: 12, fontWeight: 650, color: T.ink2 }}>
          {label}
          {verified && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: T.mintInk, fontSize: 10.5, fontWeight: 700 }}>
              <Icon name="verified" size={13} c={T.mint} /> Verified
            </span>
          )}
        </span>
      )}
      <div style={{
        display: "flex", alignItems: "center", gap: 9, padding: "0 13px", height: 48, borderRadius: 14,
        background: locked ? "#f6f1ee" : "#fff",
        border: `1.5px solid ${foc ? T.rose : T.line}`, transition: "border-color .15s",
      }}>
        {icon && <Icon name={icon} size={18} c={foc ? T.rose : T.ink3} />}
        {prefix && <span style={{ fontFamily: T.body, fontSize: 15, color: T.ink2, fontWeight: 600 }}>{prefix}</span>}
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }}
          placeholder={placeholder}
          type={type}
          readOnly={locked}
          autoFocus={autoFocus}
          onFocus={() => setFoc(true)}
          onBlur={() => setFoc(false)}
          style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: T.body, fontSize: 15, color: T.ink, minWidth: 0 }}
        />
        {locked && <Icon name="lock" size={15} c={T.ink3} />}
      </div>
      {hint && <span style={{ display: "block", marginTop: 5, fontFamily: T.body, fontSize: 11, color: T.ink3 }}>{hint}</span>}
    </label>
  );
}

// ── Toggle ──
export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 44, height: 26, borderRadius: 999, border: "none", cursor: "pointer", padding: 3, flexShrink: 0,
      background: on ? T.rose : "#dcd3cf", transition: "background .2s",
      display: "flex", justifyContent: on ? "flex-end" : "flex-start",
    }}>
      <span style={{ width: 20, height: 20, borderRadius: 999, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "all .2s" }} />
    </button>
  );
}

// ── Chip ──
export function Chip({ active, onClick, children, icon }: {
  active?: boolean; onClick?: () => void; children: React.ReactNode; icon?: string;
}) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 999, cursor: "pointer",
      border: `1.5px solid ${active ? T.rose : T.line}`, background: active ? T.roseTint : "#fff",
      fontFamily: T.body, fontSize: 13.5, fontWeight: 650, color: active ? T.roseDark : T.ink2, transition: "all .15s",
    }}>
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      {children}
      {active && <Icon name="check" size={14} c={T.roseDark} w={2.4} />}
    </button>
  );
}

// ── Option card ──
export function OptionCard({ emoji, icon, title, desc, active, onClick, accent = "rose", trailing }: {
  emoji?: string; icon?: IconName; title: string; desc?: string;
  active?: boolean; onClick?: () => void; accent?: "rose" | "mint" | "amber" | "neutral";
  trailing?: React.ReactNode;
}) {
  const ac     = accent === "mint" ? T.mint : accent === "amber" ? T.amber : accent === "neutral" ? T.ink3 : T.rose;
  const acTint = accent === "mint" ? T.mintTint : accent === "amber" ? T.amberTint : accent === "neutral" ? T.lineSoft : T.roseTint;
  return (
    <button onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 13, textAlign: "left", cursor: "pointer",
      padding: 15, borderRadius: 18, border: `1.5px solid ${active ? ac : T.line}`,
      background: active ? acTint : "#fff", transition: "all .15s",
    }}>
      {emoji && (
        <div style={{ width: 44, height: 44, borderRadius: 13, background: "#fff", border: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{emoji}</div>
      )}
      {icon && (
        <div style={{ width: 44, height: 44, borderRadius: 13, background: active ? "#fff" : T.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={icon} size={22} c={ac} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 15.5, color: T.ink }}>{title}</p>
        {desc && <p style={{ margin: "2px 0 0", fontFamily: T.body, fontSize: 12.5, color: T.ink3, lineHeight: 1.4 }}>{desc}</p>}
      </div>
      {trailing !== undefined ? trailing : (
        <div style={{ width: 22, height: 22, borderRadius: 999, border: active ? "none" : `2px solid ${T.line}`, background: active ? ac : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {active && <Icon name="check" size={13} c="#fff" w={2.6} />}
        </div>
      )}
    </button>
  );
}

// ── Wizard chrome (header + progress) ──
export function WizardChrome({ label, step, total, onBack, canBack = true }: {
  label: string; step: number; total: number; onBack?: () => void; canBack?: boolean;
}) {
  return (
    <div style={{ paddingTop: 52, background: T.bg, borderBottom: `1px solid ${T.line}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 14px 10px" }}>
        <button
          onClick={canBack ? onBack : undefined}
          style={{ width: 34, height: 34, borderRadius: 999, border: `1px solid ${T.line}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: canBack ? "pointer" : "default", opacity: canBack ? 1 : 0.35, flexShrink: 0 }}
        >
          <Icon name="back" size={19} c={T.ink} />
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: T.rose, textTransform: "uppercase" }}>{label}</p>
          <p style={{ margin: "1px 0 0", fontFamily: T.body, fontSize: 11, color: T.ink3, fontWeight: 600 }}>Step {step} of {total}</p>
        </div>
        <div style={{ width: 34, flexShrink: 0 }} />
      </div>
      <div style={{ display: "flex", gap: 4, padding: "0 14px 11px" }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3.5, borderRadius: 999, background: i < step ? T.rose : T.line, transition: "background .3s" }} />
        ))}
      </div>
    </div>
  );
}

// ── Step heading ──
export function StepHead({ title, sub, emoji }: { title: string; sub?: string; emoji?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {emoji && <div style={{ fontSize: 30, marginBottom: 8 }}>{emoji}</div>}
      <h1 style={{ margin: 0, fontFamily: T.display, fontSize: 25, fontWeight: 700, color: T.ink, letterSpacing: -0.4, lineHeight: 1.12 }}>{title}</h1>
      {sub && <p style={{ margin: "7px 0 0", fontFamily: T.body, fontSize: 13.5, lineHeight: 1.5, color: T.ink3 }}>{sub}</p>}
    </div>
  );
}

// ── Section label ──
export function SectionLabel({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ margin: "0 0 9px", fontFamily: T.body, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: T.ink3, textTransform: "uppercase", ...style }}>{children}</p>;
}

// ── Footer ──
export function Footer({ onContinue, label = "Continue", disabled, secondary }: {
  onContinue?: () => void; label?: string; disabled?: boolean; secondary?: React.ReactNode;
}) {
  return (
    <div style={{ padding: "10px 16px 22px", background: T.bg, borderTop: `1px solid ${T.line}` }}>
      {secondary}
      <Btn variant="primary" size="lg" disabled={disabled} onClick={onContinue} icon={label === "Continue" ? "arrowR" : undefined}>
        {label}
      </Btn>
    </div>
  );
}

// ── Bottom sheet ──
export function OBSheet({ open, onClose, title, children, accent = "rose" }: {
  open: boolean; onClose?: () => void; title?: string; children: React.ReactNode; accent?: "rose" | "mint";
}) {
  if (!open) return null;
  const bar = accent === "mint" ? T.mint : T.rose;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 80, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(31,17,16,0.42)", animation: "fadeIn .2s ease" }} />
      <div style={{
        position: "relative", background: T.bg, borderTopLeftRadius: 26, borderTopRightRadius: 26,
        padding: "10px 18px calc(20px + env(safe-area-inset-bottom))",
        boxShadow: "0 -10px 40px rgba(0,0,0,0.2)", animation: "sheetUp .28s cubic-bezier(.2,.9,.3,1)",
        maxHeight: "90%", overflowY: "auto",
      }}>
        <div style={{ width: 40, height: 5, borderRadius: 999, background: "#e2d8d4", margin: "0 auto 14px" }} />
        {title && (
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
            <div style={{ width: 4, height: 18, borderRadius: 999, background: bar }} />
            <h3 style={{ margin: 0, fontFamily: T.display, fontSize: 19, fontWeight: 700, color: T.ink }}>{title}</h3>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ── Price row (service price + negotiable toggle) ──
export function PriceRow({ price, negotiable, onPrice, onNeg }: {
  price: number; negotiable: boolean; onPrice: (v: number) => void; onNeg: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, height: 42, padding: "0 12px", borderRadius: 11, border: `1px solid ${T.line}`, background: T.bg }}>
        <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink3 }}>₹</span>
        <input
          type="tel"
          value={price}
          onChange={(e) => onPrice(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
          style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink, minWidth: 0, width: "100%" }}
        />
      </div>
      <button onClick={() => onNeg(!negotiable)} style={{
        display: "flex", alignItems: "center", gap: 7, height: 42, padding: "0 12px", borderRadius: 11, cursor: "pointer",
        border: `1px solid ${negotiable ? T.amber : T.line}`, background: negotiable ? T.amberTint : "#fff",
        fontFamily: T.body, fontSize: 12.5, fontWeight: 650, color: negotiable ? T.amber : T.ink3,
      }}>
        <Icon name="swap" size={14} c={negotiable ? T.amber : T.ink3} /> Negotiable
      </button>
    </div>
  );
}

// ── Pending review card ──
export function PendingCard({ eta = "24–48 hours" }: { eta?: string }) {
  return (
    <div style={{ background: "#fffdf2", border: "1px solid #f0e2a0", borderRadius: 18, padding: "14px 16px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: "#fef3c0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="clock" size={21} c={T.amber} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 13, fontWeight: 750, color: T.amber, letterSpacing: 0.2, textTransform: "uppercase" }}>Under review</p>
          <p style={{ margin: "4px 0 0", fontFamily: T.body, fontSize: 13, lineHeight: 1.5, color: "#7a5f04" }}>
            Our team reviews every application to keep the quality high. Expect a decision within <strong>{eta}</strong>.
          </p>
        </div>
      </div>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
        {[
          { icon: "mail" as IconName,   text: "Email confirmation sent to your inbox" },
          { icon: "phone" as IconName,  text: "SMS alert when approved or if we need more info" },
          { icon: "pencil" as IconName, text: "You can edit your profile while waiting" },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Icon name={r.icon} size={14} c={T.amber} />
            <span style={{ fontFamily: T.body, fontSize: 12.5, color: "#7a5f04" }}>{r.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

