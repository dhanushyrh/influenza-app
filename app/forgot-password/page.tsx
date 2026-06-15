"use client";

import { useState } from "react";
import { T } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Btn, Field, Spinner, StepHead } from "@/components/ob-primitives";
import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const browserClient = () => createBrowserClient(SUPABASE_URL, SUPABASE_KEY);

type PageState = "idle" | "submitting" | "sent" | "error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<PageState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit() {
    if (!email) return;
    setState("submitting");
    setErrorMsg("");

    const supabase = browserClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) {
      setErrorMsg(error.message ?? "Could not send reset email. Please try again.");
      setState("error");
      return;
    }

    setState("sent");
  }

  if (state === "sent") {
    return (
      <div style={{ height: "100svh", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: T.mintTint, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="checkCircle" size={32} c={T.mint} />
          </div>
          <h1 style={{ margin: 0, fontFamily: T.display, fontSize: 24, fontWeight: 700, color: T.ink, textAlign: "center" }}>Check your inbox</h1>
          <p style={{ margin: 0, fontFamily: T.body, fontSize: 14, color: T.ink3, textAlign: "center", lineHeight: 1.5 }}>
            We sent a reset link to <strong style={{ color: T.ink }}>{email}</strong>. Click the link to set a new password.
          </p>
          <a href="/login" style={{ fontFamily: T.body, fontSize: 13, color: T.rose, fontWeight: 700, textDecoration: "none", marginTop: 8 }}>
            ← Back to sign in
          </a>
        </div>
      </div>
    );
  }

  const submitting = state === "submitting";

  return (
    <div style={{ height: "100svh", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      {/* back link */}
      <div style={{ flexShrink: 0, padding: "18px 22px 0" }}>
        <a href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.body, fontSize: 13, color: T.ink3, fontWeight: 600, textDecoration: "none" }}>
          <Icon name="back" size={17} c={T.ink3} /> Back to sign in
        </a>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 22px 8px" }}>
        <StepHead emoji="🔑" title="Reset your password" sub="Enter your email address and we'll send you a reset link." />

        {state === "error" && (
          <div style={{ background: "#fff1f1", border: "1px solid #fcc", borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
            <p style={{ margin: 0, fontFamily: T.body, fontSize: 13, color: "#b42318" }}>{errorMsg}</p>
          </div>
        )}

        <Field
          label="Email"
          icon="mail"
          type="email"
          value={email}
          onChange={(v) => { setEmail(v); if (state === "error") setState("idle"); }}
          placeholder="you@example.com"
        />
      </div>

      <div style={{ padding: "10px 22px 36px", background: T.bg, borderTop: `1px solid ${T.line}` }}>
        <Btn
          variant="primary"
          size="lg"
          disabled={submitting || !email}
          onClick={handleSubmit}
        >
          {submitting ? <><Spinner size={18} c="#fff" /> Sending…</> : "Send reset link"}
        </Btn>
      </div>
    </div>
  );
}
