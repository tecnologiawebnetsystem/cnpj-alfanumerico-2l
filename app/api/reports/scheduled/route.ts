import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("client_id")

    if (!clientId) {
      return NextResponse.json({ error: "client_id is required" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: schedules } = await supabase
      .from("scheduled_analyses")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    return NextResponse.json({ schedules: schedules || [] })
  } catch (error) {
    console.error(" Error loading schedules:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client_id, name, schedule_type, email, format, is_active } = body

    if (!client_id || !name || !schedule_type || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Calculate next run time
    const nextRun = new Date()
    if (schedule_type === "daily") {
      nextRun.setDate(nextRun.getDate() + 1)
    } else if (schedule_type === "weekly") {
      nextRun.setDate(nextRun.getDate() + 7)
    } else {
      nextRun.setMonth(nextRun.getMonth() + 1)
    }

    const { data, error } = await supabase
      .from("scheduled_analyses")
      .insert({
        client_id,
        name,
        schedule_type,
        schedule_config: { email, format },
        is_active: is_active ?? true,
        next_run_at: nextRun.toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ schedule: data })
  } catch (error) {
    console.error(" Error creating schedule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
