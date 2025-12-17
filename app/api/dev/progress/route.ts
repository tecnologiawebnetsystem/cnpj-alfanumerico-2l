import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get("user")

    if (!userCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    const body = await request.json()
    const { task_id, progress_percentage, actual_hours_spent, progress_notes, status } = body

    const supabase = await createServerClient()

    // Update task progress
    const { data, error } = await supabase
      .from("task_progress")
      .update({
        progress_percentage,
        actual_hours_spent,
        progress_notes,
        status,
        last_progress_update: new Date().toISOString(),
      })
      .eq("task_id", task_id)
      .eq("dev_id", user.id)
      .select()
      .single()

    if (error) throw error

    // Update daily metrics
    await supabase.rpc("update_dev_daily_metrics")

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error updating progress:", error)
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }
}
