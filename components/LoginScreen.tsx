"use client";

import { useEffect, useState } from "react";

const IG_ERRORS: Record<string, string> = {
  denied: "Instagram login was cancelled.",
  missing_code: "OAuth code missing. Please try again.",
  needs_professional: "A Business or Creator account is required.",
  invalid_invite: "This invite is invalid or has already been used.",
  exchange_failed: "Could not connect to Instagram. Please try again.",
  mock_failed: "Mock auth failed. Please try again.",
};

export function LoginScreen({ igConfigured }: { igConfigured: boolean }) {
  const [role, setRole] = useState<"creator" | "business" | null>(null);
  const [inviteToken, setInviteToken] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const err = p.get("ig_error");
    if (err) setError(IG_ERRORS[err] ?? "Something went wrong, please try again.");
  }, []);

  const creatorHref = igConfigured
    ? `/api/auth/instagram?role=creator&token=${encodeURIComponent(inviteToken)}`
    : `/api/auth/instagram/mock?role=creator&token=${encodeURIComponent(inviteToken)}`;

  const businessHref = igConfigured
    ? `/api/auth/instagram?role=business`
    : `/api/auth/instagram/mock?role=business`;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Influen<span className="text-brand">za</span>
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Connect local businesses with hyper-local creators.
        </p>
      </div>

      {error && (
        <p className="w-full max-w-xs rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex w-full max-w-xs gap-2">
        <button
          onClick={() => setRole("creator")}
          className={`flex-1 rounded-2xl border py-3 text-sm font-semibold transition-all ${
            role === "creator"
              ? "border-brand bg-brand/10 text-brand"
              : "border-neutral-200 text-neutral-600"
          }`}
        >
          I&apos;m a Creator
        </button>
        <button
          onClick={() => setRole("business")}
          className={`flex-1 rounded-2xl border py-3 text-sm font-semibold transition-all ${
            role === "business"
              ? "border-brand bg-brand/10 text-brand"
              : "border-neutral-200 text-neutral-600"
          }`}
        >
          I&apos;m a Business
        </button>
      </div>

      {role === "creator" && (
        <div className="flex w-full max-w-xs flex-col gap-3">
          <input
            type="text"
            placeholder="Paste your invite token"
            value={inviteToken}
            onChange={(e) => setInviteToken(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-brand"
          />
          <a
            href={inviteToken.trim() ? creatorHref : undefined}
            className={`block w-full rounded-2xl py-3 text-center font-semibold text-white ${
              inviteToken.trim() ? "bg-brand" : "cursor-not-allowed bg-neutral-300"
            }`}
          >
            Continue with Instagram
          </a>
          {!igConfigured && (
            <p className="text-xs text-neutral-400">mock auth · dev only</p>
          )}
        </div>
      )}

      {role === "business" && (
        <div className="flex w-full max-w-xs flex-col gap-3">
          <a
            href={businessHref}
            className="block w-full rounded-2xl bg-brand py-3 text-center font-semibold text-white"
          >
            Continue with Instagram
          </a>
          <p className="text-xs text-neutral-400">
            Your account will be reviewed before going live.
          </p>
          {!igConfigured && (
            <p className="text-xs text-neutral-400">mock auth · dev only</p>
          )}
        </div>
      )}
    </main>
  );
}
