import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"

// GET /api/scheduled-analyses - Get scheduled analyses
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: scheduledAnalyses, error } = await supabase
      .from("scheduled_analyses")
      .select(`
        *,
        repository:repositories (
          id,
          name,
          full_name
        )
      `)
      .eq("client_id", user.client_id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ scheduled_analyses: scheduledAnalyses })
  } catch (error: any) {
    console.error(" Error fetching scheduled analyses:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/scheduled-analyses - Create scheduled analysis
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { repository_id, name, description, schedule_type, schedule_config } = body

    const supabase = await createClient()

    // Calculate next run time based on schedule
    const nextRunAt = calculateNextRun(schedule_type, schedule_config)

    const { data: scheduledAnalysis, error } = await supabase
      .from("scheduled_analyses")
      .insert({
        client_id: user.client_id,
        repository_id,
        name,
        description,
        schedule_type,
        schedule_config,
        next_run_at: nextRunAt,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ scheduled_analysis: scheduledAnalysis })
  } catch (error: any) {
    console.error(" Error creating scheduled analysis:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function calculateNextRun(scheduleType: string, config: any): string {
  const now = new Date()

  if (scheduleType === "daily") {
    now.setDate(now.getDate() + 1)
  } else if (scheduleType === "weekly") {
    now.setDate(now.getDate() + 7)
  } else if (scheduleType === "monthly") {
    now.setMonth(now.getMonth() + 1)
  }

  return now.toISOString()
}
