import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

export function GET() {
  return NextResponse.json({
    status: "ok",
    phase: "mvp-skeleton",
    supabaseConfigured: isSupabaseConfigured,
    dataSource: "mock",
  });
}
