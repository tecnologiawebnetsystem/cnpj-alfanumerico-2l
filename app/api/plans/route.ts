import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/plans - Get all active plans (public)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: plans, error } = await supabase
      .from("plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) throw error

    return NextResponse.json({ plans })
  } catch (error: any) {
    console.error(" Error fetching plans:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
