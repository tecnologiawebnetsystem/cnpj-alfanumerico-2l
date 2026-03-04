import { NextResponse } from "next/server"
import { db as supabase } from "@/lib/db/sqlserver"

export async function POST(request: Request) {
  try {
    const { client_id } = await request.json()

    if (!client_id) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
    }

    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id")
      .eq("client_id", client_id)

    if (tasksError) {
      return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ message: "No tasks to delete", deleted_tasks: 0, deleted_progress: 0, deleted_history: 0, deleted_comments: 0 })
    }

    const taskIds = tasks.map((t: any) => t.id)

    const { count: commentsCount } = await supabase.from("comments").delete().in("task_id", taskIds)
    const { count: historyCount } = await supabase.from("task_history").delete().in("task_id", taskIds)
    const { count: progressCount } = await supabase.from("task_progress").delete().in("task_id", taskIds)

    const { error: tasksDeleteError } = await supabase.from("tasks").delete().eq("client_id", client_id)
    if (tasksDeleteError) {
      return NextResponse.json({ error: "Failed to delete tasks" }, { status: 500 })
    }

    return NextResponse.json({
      message: "All tasks deleted successfully",
      deleted_tasks: tasks.length,
      deleted_progress: progressCount || 0,
      deleted_history: historyCount || 0,
      deleted_comments: commentsCount || 0,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
