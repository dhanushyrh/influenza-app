import { redirect } from "next/navigation";
import { getCreatorIds } from "@/lib/inf-auth";
import { getMyCreator, getCreatorCredits, getCreatorDeals, getBriefs } from "@/lib/queries";
import { CreatorApp } from "./CreatorApp";

export const dynamic = "force-dynamic";

export default async function InfPage() {
  const ids = await getCreatorIds();
  if (!ids) redirect("/login");

  const [creator, credits, deals, briefs] = await Promise.all([
    getMyCreator(ids.profileId),
    getCreatorCredits(ids.appUserId),
    getCreatorDeals(ids.profileId),
    getBriefs(ids.profileId),
  ]);

  return (
    <div style={{ height: "100svh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <CreatorApp
        initialCreator={creator}
        initialCredits={credits}
        initialDeals={deals}
        initialBriefs={briefs}
      />
    </div>
  );
}
