"use client";

import { useEffect, useState } from "react";
import { T } from "@/lib/ob-tokens";
import { Icon } from "@/components/ob-icons";
import { Spinner } from "@/components/ob-primitives";

const IG_ERRORS: Record<string, string> = {
  denied:             "Instagram login was cancelled.",
  missing_code:       "OAuth code missing — please try again.",
  needs_professional: "A Business or Creator IG account is required.",
  invalid_invite:     "This invite is invalid or has already been used.",
  exchange_failed:    "Could not connect to Instagram — please try again.",
  mock_failed:        "Mock auth failed — please try again.",
};

export function WelcomeScreen({ igConfigured }: { igConfigured: boolean }) {
  const [error, setError] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const err = p.get("ig_error");
    if (!err) return;
    const base = IG_ERRORS[err] ?? "Something went wrong — please try again.";
    const detail = p.get("detail");
    setError(detail ? `${base}\n\nDetail: ${detail}` : base);
  }, []);

  // Tokenless signup for both roles — invites still work via /onboarding/<token> links.
  const businessHref = igConfigured
    ? "/api/auth/instagram?role=business"
    : "/api/auth/instagram/mock?role=business";
  const creatorHref = igConfigured
    ? "/api/auth/instagram?role=creator"
    : "/api/auth/instagram/mock?role=creator";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "84px 22px 0" }}>
        <p style={{ margin: 0, fontFamily: T.body, fontSize: 13, fontWeight: 700, letterSpacing: 1, color: T.rose, textTransform: "uppercase" }}>
          Influen<span style={{ color: T.roseDark }}>za</span>
        </p>
        <h1 style={{ margin: "10px 0 0", fontFamily: T.display, fontSize: 34, fontWeight: 700, color: T.ink, lineHeight: 1.08, letterSpacing: -0.8 }}>
          Local brands.<br />Local creators.<br /><span style={{ color: T.rose, fontStyle: "italic" }}>Real reach.</span>
        </h1>
        <p style={{ margin: "14px 0 0", fontFamily: T.body, fontSize: 14.5, lineHeight: 1.5, color: T.ink2 }}>
          The two-sided marketplace where neighbourhood businesses and hyper-local creators collab directly — no agencies, no middlemen.
        </p>

        {error && (
          <div style={{ marginTop: 20, background: "#fff1f1", border: "1px solid #fcc", borderRadius: 12, padding: "10px 14px" }}>
            <p style={{ margin: 0, fontFamily: T.body, fontSize: 13, color: "#b42318", whiteSpace: "pre-wrap" }}>{error}</p>
          </div>
        )}

        <p style={{ margin: "30px 0 12px", fontFamily: T.body, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, color: T.ink3, textTransform: "uppercase" }}>Get started as</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <RoleCard
            emoji="🍜" title="I'm a Creator"
            desc="Show your reach, set your rates, get booked by local brands."
            accent="rose"
            href={creatorHref}
          />
          <RoleCard
            emoji="☕" title="I'm a Business"
            desc="Discover verified local creators and run campaigns that convert."
            accent="mint"
            href={businessHref}
          />
        </div>
        {!igConfigured && (
          <p style={{ margin: "12px 2px 0", textAlign: "center", fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>mock auth · dev only</p>
        )}
      </div>
      <div style={{ padding: "12px 22px 24px", textAlign: "center" }}>
        <p style={{ margin: "0 0 10px", fontFamily: T.body, fontSize: 13, color: T.ink3 }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: T.rose, fontWeight: 700, textDecoration: "none" }}>Sign in</a>
        </p>
        <p style={{ margin: 0, fontFamily: T.body, fontSize: 11.5, color: T.ink3 }}>
          By continuing you agree to our{" "}
          <span style={{ color: T.ink2, fontWeight: 600 }}>Terms</span>{" "}
          &{" "}
          <span style={{ color: T.ink2, fontWeight: 600 }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}

function RoleCard({ emoji, title, desc, accent, onClick, href }: {
  emoji: string; title: string; desc: string; accent: "rose" | "mint";
  onClick?: () => void; href?: string;
}) {
  // Tapping a role triggers a full OAuth redirect that can take a few seconds.
  // Show a spinner immediately so the PWA doesn't feel frozen during the wait.
  const [navigating, setNavigating] = useState(false);
  const ac   = accent === "mint" ? T.mint : T.rose;
  const grad = accent === "mint"
    ? "linear-gradient(135deg,#eafaf1,#d6f1e3)"
    : "linear-gradient(135deg,#fff1ef,#ffe3de)";

  const inner = (
    <>
      <div style={{ width: 52, height: 52, borderRadius: 15, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>{emoji}</div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 18, color: T.ink }}>{title}</p>
        <p style={{ margin: "3px 0 0", fontFamily: T.body, fontSize: 12.5, color: T.ink2, lineHeight: 1.4 }}>{desc}</p>
      </div>
      {navigating ? <Spinner size={20} c={ac} /> : <Icon name="arrowR" size={20} c={ac} />}
    </>
  );

  const style: React.CSSProperties = {
    width: "100%", display: "flex", alignItems: "center", gap: 14, textAlign: "left",
    padding: 17, borderRadius: 20, border: `1px solid ${T.line}`, background: grad,
    boxShadow: "0 4px 16px rgba(31,17,16,0.05)", textDecoration: "none",
    cursor: navigating ? "progress" : "pointer", opacity: navigating ? 0.7 : 1,
    pointerEvents: navigating ? "none" : "auto",
  };

  if (href) {
    return <a href={href} style={style} onClick={() => setNavigating(true)}>{inner}</a>;
  }
  return <button onClick={onClick} style={style}>{inner}</button>;
}
