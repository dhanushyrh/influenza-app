import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";

// Fallback list used when Supabase is not configured or the table is empty.
const FALLBACK = [
  "Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Chennai",
  "Pune", "Kolkata", "Ahmedabad",
];

export async function GET() {
  try {
    const supabase = adminClient();
    const { data, error } = await supabase
      .from("locations")
      .select("city")
      .order("city", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ cities: FALLBACK });
    }

    return NextResponse.json({ cities: data.map((r) => r.city) });
  } catch {
    return NextResponse.json({ cities: FALLBACK });
  }
}
