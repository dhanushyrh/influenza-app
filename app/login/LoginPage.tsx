"use client";

import { useState } from "react";
import { T } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Avatar, Btn, Field, Spinner, StepHead, PendingCard } from "@/components/ob-primitives";

type PageState = "idle" | "submitting" | "error" | "pending" | "success";

// Dev-only quick-fill accounts (mirror supabase/seed.sql + mock personas).
const DEMO_LOGINS =
  process.env.NODE_ENV === "production"
    ? []
    : [
        { username: "aisha.eats", password: "taste123", role: "creator", emoji: "🍜", from: "#ffd1c4", to: "#ff8f74" },
        { username: "thirdwave.ind", password: "brew1234", role: "business", emoji: "☕", from: "#ffe4cc", to: "#ffb27a" },
      ];

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [state, setState] = useState<PageState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit() {
    if (!username || !password) return;
    setState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setState("error");
        return;
      }

      if (!data.verified) {
        setState("pending");
        return;
      }

      setState("success");
      window.location.href = data.role === "business" ? "/biz" : "/inf";
    } catch {
      setErrorMsg("Network error. Please check your connection.");
      setState("error");
    }
  }

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (state === "pending") {
    return (
      <div style={{ height: "100svh", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "60px 22px 24px" }}>
          <StepHead emoji="📬" title="We're reviewing your account" sub="You're in the queue! We'll alert you by email once your account is verified." />
          <PendingCard eta="24–48 hours" />
        </div>
        <div style={{ padding: "10px 22px 36px", background: T.bg, borderTop: `1px solid ${T.line}` }}>
          <Btn variant="ghost" size="lg" onClick={handleSignOut}>Sign out</Btn>
        </div>
      </div>
    );
  }

  const submitting = state === "submitting";

  return (
    <div style={{ height: "100svh", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      {/* wordmark */}
      <div style={{ flexShrink: 0, padding: "52px 22px 0", display: "flex", justifyContent: "center" }}>
        <p style={{ margin: 0, fontFamily: T.body, fontSize: 13, fontWeight: 700, letterSpacing: 1, color: T.rose, textTransform: "uppercase" }}>
          Influen<span style={{ color: T.roseDark }}>za</span>
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "26px 22px 12px" }}>
        <StepHead emoji="🔐" title="Welcome back" sub="Sign in to your Influenza account." />

        {state === "error" && (
          <div style={{ background: "#fff1f1", border: "1px solid #fcc", borderRadius: 12, padding: "10px 14px", marginBottom: 14 }}>
            <p style={{ margin: 0, fontFamily: T.body, fontSize: 13, color: "#b42318" }}>{errorMsg}</p>
          </div>
        )}

        <Field
          label="Username"
          icon="user"
          value={username}
          onChange={(v) => { setUsername(v.replace(/\s/g, "")); if (state === "error") setState("idle"); }}
          placeholder="yourname"
          onEnter={handleSubmit}
        />

        <div style={{ marginBottom: 14 }}>
          <span style={{ display: "block", marginBottom: 6, fontFamily: T.body, fontSize: 12, fontWeight: 650, color: T.ink2 }}>Password</span>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 13px", height: 48, borderRadius: 14, background: "#fff", border: `1.5px solid ${T.line}` }}>
            <Icon name="lock" size={18} c={T.ink3} />
            <input
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (state === "error") setState("idle"); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: T.body, fontSize: 15, color: T.ink, minWidth: 0 }}
            />
            <button onClick={() => setShowPw((s) => !s)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }} type="button">
              <Icon name="eye" size={17} c={T.ink3} />
            </button>
          </div>
        </div>

        <Btn variant="primary" size="lg" disabled={submitting || !username || !password} onClick={handleSubmit} style={{ marginTop: 4 }}>
          {submitting ? <><Spinner size={18} c="#fff" /> Signing in…</> : "Sign in"}
        </Btn>

        <div style={{ textAlign: "center", padding: "13px 0 0" }}>
          <a href="/forgot-password" style={{ fontFamily: T.body, fontSize: 13, color: T.rose, fontWeight: 600, textDecoration: "none" }}>
            Forgot password?
          </a>
        </div>

        {DEMO_LOGINS.length > 0 && (
          <div style={{ marginTop: 18, background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 16, padding: "12px 14px" }}>
            <p style={{ margin: "0 0 9px", fontFamily: T.body, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, color: T.ink3, textTransform: "uppercase" }}>Demo logins · tap to fill</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {DEMO_LOGINS.map((a) => (
                <button key={a.username} onClick={() => { setUsername(a.username); setPassword(a.password); setState("idle"); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 9px", borderRadius: 12, border: `1px solid ${T.line}`, background: T.bg, cursor: "pointer", textAlign: "left" }}>
                  <Avatar emoji={a.emoji} from={a.from} to={a.to} size={32} r={10} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontFamily: T.body, fontSize: 12.5, fontWeight: 700, color: T.ink }}>{a.username} <span style={{ color: T.ink3, fontWeight: 500 }}>· {a.role}</span></p>
                    <p style={{ margin: 0, fontFamily: T.body, fontSize: 11, color: T.ink3 }}>tap to fill · then Sign in</p>
                  </div>
                  <Icon name="arrowR" size={15} c={T.ink3} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ flexShrink: 0, padding: "14px 22px 36px", textAlign: "center", borderTop: `1px solid ${T.line}` }}>
        <p style={{ margin: 0, fontFamily: T.body, fontSize: 13, color: T.ink3 }}>
          New to Influenza?{" "}
          <a href="/" style={{ color: T.rose, fontWeight: 700, textDecoration: "none" }}>Sign up</a>
        </p>
      </div>
    </div>
  );
}
