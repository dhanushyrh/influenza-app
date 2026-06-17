import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminClient } from "@/lib/supabase";
import { getCreatorDeck, getBusinessDeals, getBusinessCampaigns } from "@/lib/queries";
import { BizApp } from "./BizApp";

export const dynamic = "force-dynamic";

export default async function BizPage() {
  const cookieStore = cookies();
  const appUserId = cookieStore.get("bus_uid")?.value;
  if (!appUserId) redirect("/login");

  // Look up the business profile via the app_users foreign key (column is user_id, not app_user_id).
  const supabase = adminClient();
  const { data: profile } = await supabase
    .from("business_profiles")
    .select("id, approved, name, bio, category, hiring_status, target_creator_size, target_budget")
    .eq("user_id", appUserId)
    .maybeSingle();

  if (!profile) redirect("/login");

  // `approved` defaults to false in the DB schema but may not exist if migration
  // 20260611000006_business_approval.sql hasn't been pushed yet — treat null as false.
  const approved = (profile as Record<string, unknown>).approved ?? false;

  if (!approved) {
    return (
      <div style={{ height: "100svh", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center", background: "#fff9f7", fontFamily: "var(--font-space), sans-serif" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>⏳</div>
        <h1 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 700, color: "#1f1110" }}>Account pending</h1>
        <p style={{ margin: 0, fontSize: 15, color: "#6b5855", lineHeight: 1.6 }}>
          Your business account is under review. We&apos;ll notify you once you&apos;re approved — usually within 24 hours.
        </p>
      </div>
    );
  }

  // Map DB hiring_status to UI hiring key
  const hiringMap: Record<string, "open" | "scouting" | "closed"> = {
    actively_looking: "scouting",
    looking_out: "open",
    not_looking: "closed",
  };

  const [deck, deals, campaigns] = await Promise.all([
    getCreatorDeck(),
    getBusinessDeals(profile.id),
    getBusinessCampaigns(profile.id),
  ]);

  return (
    <div style={{ height: "100svh", width: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <BizApp
      initialBiz={{
        name: profile.name ?? undefined,
        bio: profile.bio ?? undefined,
        category: profile.category ?? undefined,
        hiring: hiringMap[profile.hiring_status ?? ""] ?? "open",
        creatorSize: profile.target_creator_size ?? [],
        budget: profile.target_budget ?? "mid",
      }}
      initialDeck={deck}
      initialDeals={deals}
      initialCampaigns={campaigns}
    />
    </div>
  );
}
