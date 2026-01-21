import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("task_id")
    const status = searchParams.get("status")
    const today = searchParams.get("today")

    let query = supabase.from("time_entries").select("*")

    if (taskId) {
      query = query.eq("task_id", taskId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (today === "true") {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      query = query.gte("created_at", startOfDay.toISOString())
    }

    const { data: entries, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching time entries:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If looking for running entry, return single
    if (status === "running" && entries?.length) {
      return NextResponse.json({ entry: entries[0] })
    }

    // If today, calculate total
    if (today === "true") {
      const totalMinutes = entries?.reduce((sum, e) => sum + (e.duration_minutes || 0), 0) || 0
      return NextResponse.json({ entries, totalMinutes })
    }

    return NextResponse.json({ entries })
  } catch (error: any) {
    console.error("Error in time entries GET:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { task_id, user_id, client_id } = body

    // Check for existing running entry for this task
    const { data: existing } = await supabase
      .from("time_entries")
      .select("id")
      .eq("task_id", task_id)
      .eq("user_id", user_id)
      .eq("status", "running")
      .limit(1)

    if (existing?.length) {
      return NextResponse.json(
        { error: "Ja existe um timer ativo para esta tarefa" },
        { status: 400 }
      )
    }

    const { data: entry, error } = await supabase
      .from("time_entries")
      .insert({
        task_id,
        user_id,
        client_id,
        started_at: new Date().toISOString(),
        status: "running",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating time entry:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ entry })
  } catch (error: any) {
    console.error("Error in time entries POST:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
