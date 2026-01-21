import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()
    const { status, notes, duration_minutes } = body

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (status) {
      updateData.status = status
      if (status === "completed") {
        updateData.ended_at = new Date().toISOString()
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    if (duration_minutes !== undefined) {
      updateData.duration_minutes = duration_minutes
    }

    const { data: entry, error } = await supabase
      .from("time_entries")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating time entry:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update task completed_hours if completing
    if (status === "completed" && duration_minutes && entry?.task_id) {
      const { data: task } = await supabase
        .from("tasks")
        .select("completed_hours")
        .eq("id", entry.task_id)
        .single()

      const currentHours = task?.completed_hours || 0
      const newHours = currentHours + (duration_minutes / 60)

      await supabase
        .from("tasks")
        .update({ 
          completed_hours: Math.round(newHours * 100) / 100,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entry.task_id)
    }

    return NextResponse.json({ success: true, entry })
  } catch (error: any) {
    console.error("Error in time entry PATCH:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
