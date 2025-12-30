import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all tasks for this developer
    const { data: tasks, error } = await supabase
      .from("kanban_tasks")
      .select(`
        *,
        assignment:repository_assignments!kanban_tasks_assignment_id_fkey(
          repository_name,
          repository_url
        )
      `)
      .eq("developer_id", user.id)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })

    if (error) throw error

    // Group by status
    const grouped = {
      todo: tasks?.filter((t) => t.status === "todo") || [],
      in_progress: tasks?.filter((t) => t.status === "in_progress") || [],
      done: tasks?.filter((t) => t.status === "done") || [],
    }

    return NextResponse.json({ tasks: grouped })
  } catch (error: any) {
    console.error("Error fetching kanban tasks:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { task_id, status } = body

    const updates: any = { status, updated_at: new Date().toISOString() }

    if (status === "in_progress") {
      updates.moved_to_in_progress_at = new Date().toISOString()
    } else if (status === "done") {
      updates.completed_at = new Date().toISOString()
    }

    const { data: task, error } = await supabase
      .from("kanban_tasks")
      .update(updates)
      .eq("id", task_id)
      .eq("developer_id", user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
