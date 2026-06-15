"use client";

import { useEffect, useState } from "react";
import { T } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Btn, Spinner, StepHead } from "@/components/ob-primitives";
import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const browserClient = () => createBrowserClient(SUPABASE_URL, SUPABASE_KEY);

type PageState = "waiting" | "ready" | "submitting" | "error" | "done";

export default function ResetPasswordPage() {
  const [pageState, setPageState] = useState<PageState>("waiting");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    const supabase = browserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setPageState("ready");
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit() {
    setAttempted(true);
    if (password.length < 8 || password !== confirm) return;

    setPageState("submitting");
    setErrorMsg("");

    const supabase = browserClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg(error.message ?? "Could not update password. Please try again.");
      setPageState("error");
      return;
    }

    setPageState("done");
    setTimeout(() => { window.location.href = "/login"; }, 1500);
  }

  if (pageState === "waiting") {
    return (
      <div style={{ height: "100svh", maxWidth: 480, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (pageState === "done") {
    return (
      <div style={{ height: "100svh", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: T.bg, gap: 16, padding: "0 28px" }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: T.mintTint, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="checkCircle" size={32} c={T.mint} />
        </div>
        <h1 style={{ margin: 0, fontFamily: T.display, fontSize: 24, fontWeight: 700, color: T.ink }}>Password updated!</h1>
        <p style={{ margin: 0, fontFamily: T.body, fontSize: 14, color: T.ink3 }}>Redirecting to sign in…</p>
      </div>
    );
  }

  const submitting = pageState === "submitting";
  const mismatch = attempted && password !== confirm;
  const tooShort = attempted && password.length < 8;

  return (
    <div style={{ height: "100svh", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "60px 22px 8px" }}>
        <StepHead emoji="🔐" title="Set new password" sub="Choose a password at least 8 characters long." />

        {pageState === "error" && (
          <div style={{ background: "#fff1f1", border: "1px solid #fcc", borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
            <p style={{ margin: 0, fontFamily: T.body, fontSize: 13, color: "#b42318" }}>{errorMsg}</p>
          </div>
        )}

        {/* new password */}
        <div style={{ marginBottom: 14 }}>
          <span style={{ display: "block", marginBottom: 6, fontFamily: T.body, fontSize: 12, fontWeight: 650, color: T.ink2 }}>New password</span>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 13px", height: 48, borderRadius: 14, background: "#fff", border: `1.5px solid ${tooShort ? "#f3d3cf" : T.line}` }}>
            <Icon name="lock" size={18} c={T.ink3} />
            <input
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (pageState === "error") setPageState("ready"); }}
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: T.body, fontSize: 15, color: T.ink, minWidth: 0 }}
            />
            <button onClick={() => setShowPw((s) => !s)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }} type="button">
              <Icon name="eye" size={17} c={T.ink3} />
            </button>
          </div>
          {tooShort && <span style={{ display: "block", marginTop: 5, fontFamily: T.body, fontSize: 11, color: "#b42318" }}>At least 8 characters required</span>}
        </div>

        {/* confirm password */}
        <div style={{ marginBottom: 14 }}>
          <span style={{ display: "block", marginBottom: 6, fontFamily: T.body, fontSize: 12, fontWeight: 650, color: T.ink2 }}>Confirm password</span>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 13px", height: 48, borderRadius: 14, background: "#fff", border: `1.5px solid ${mismatch ? "#f3d3cf" : T.line}` }}>
            <Icon name="lock" size={18} c={T.ink3} />
            <input
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); if (pageState === "error") setPageState("ready"); }}
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: T.body, fontSize: 15, color: T.ink, minWidth: 0 }}
            />
          </div>
          {mismatch && <span style={{ display: "block", marginTop: 5, fontFamily: T.body, fontSize: 11, color: "#b42318" }}>Passwords don't match</span>}
        </div>
      </div>

      <div style={{ padding: "10px 22px 36px", background: T.bg, borderTop: `1px solid ${T.line}` }}>
        <Btn
          variant="primary"
          size="lg"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? <><Spinner size={18} c="#fff" /> Updating…</> : "Update password"}
        </Btn>
      </div>
    </div>
  );
}
