import { getInviteByToken } from "@/lib/queries";
import { isInstagramConfigured } from "@/lib/instagram";
import { OnboardingWizard } from "./Wizard";

// Validates the single-use invite token. Live validation uses the service-role
// client (bypasses RLS); falls back to mock. See docs/tasks/01-influencer-onboarding.md.
export default async function OnboardingPage({ params }: { params: { token: string } }) {
  // "direct" = tokenless creator signup (from the signup role-select). Identity is
  // already established via the inf_uid cookie set by the IG callback; no invite.
  if (params.token === "direct") {
    return <OnboardingWizard token="direct" email={undefined} igConfigured={isInstagramConfigured} />;
  }

  const invite = await getInviteByToken(params.token);

  if (!invite || invite.revoked || invite.usedAt) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-2xl">🔒</p>
        <h1 className="text-lg font-semibold">This invite isn&apos;t valid</h1>
        <p className="text-sm text-neutral-500">
          The link may have expired or already been used. Ask the team for a fresh invite.
        </p>
      </main>
    );
  }

  return (
    <OnboardingWizard
      token={params.token}
      email={invite.email}
      igConfigured={isInstagramConfigured}
    />
  );
}
