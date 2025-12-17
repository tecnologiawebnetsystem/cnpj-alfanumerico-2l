import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client not available" }, { status: 500 })
    }

    // Buscar análises travadas (processing/pending há mais de 24h com progress 0)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: stuckAnalyses, error } = await supabase
      .from("analyses")
      .select("id, repository_id, created_at, status, progress")
      .in("status", ["pending", "processing", "in_progress"])
      .lte("created_at", twentyFourHoursAgo)
      .eq("progress", 0)

    if (error) throw error

    return NextResponse.json({
      stuck_count: stuckAnalyses?.length || 0,
      stuck_analyses: stuckAnalyses || [],
    })
  } catch (error: any) {
    console.error("[API] Error checking stuck analyses:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Resetar análises travadas
export async function POST(request: NextRequest) {
  try {
    const { analysis_ids } = await request.json()
    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client not available" }, { status: 500 })
    }

    const { error } = await supabase
      .from("analyses")
      .update({
        status: "failed",
        current_step: "Análise travada - timeout após 24h",
        completed_at: new Date().toISOString(),
      })
      .in("id", analysis_ids)

    if (error) throw error

    return NextResponse.json({ success: true, reset_count: analysis_ids.length })
  } catch (error: any) {
    console.error("[API] Error resetting stuck analyses:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
