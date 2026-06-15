import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { CREATOR_CATEGORIES } from "@/lib/ob-data";

export async function GET() {
  try {
    const supabase = adminClient();
    const { data, error } = await supabase
      .from("creator_categories")
      .select("slug, label")
      .order("label", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ categories: CREATOR_CATEGORIES });
    }

    return NextResponse.json({ categories: data });
  } catch {
    return NextResponse.json({ categories: CREATOR_CATEGORIES });
  }
}
