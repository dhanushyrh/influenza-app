import { isInstagramConfigured } from "@/lib/instagram";
import { BusinessWizard } from "./Wizard";

export default function BusinessOnboardingPage({
  searchParams,
}: {
  searchParams: { pid?: string; name?: string; handle?: string };
}) {
  return (
    <BusinessWizard
      profileId={searchParams.pid ?? ""}
      displayName={searchParams.name ?? ""}
      handle={searchParams.handle ?? ""}
      igConfigured={isInstagramConfigured}
    />
  );
}
