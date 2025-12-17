import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    // Create Supabase client inside the function, not at module level
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { client_id } = await request.json()

    if (!client_id) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
    }

    console.log("[v0] Starting cleanup of all tasks for client:", client_id)

    // Get all tasks for this client
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id")
      .eq("client_id", client_id)

    if (tasksError) {
      console.error("[v0] Error fetching tasks:", tasksError)
      return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
    }

    if (!tasks || tasks.length === 0) {
      console.log("[v0] No tasks found for client")
      return NextResponse.json({
        message: "No tasks to delete",
        deleted_tasks: 0,
        deleted_progress: 0,
        deleted_history: 0,
        deleted_comments: 0
      })
    }

    const taskIds = tasks.map(t => t.id)
    console.log("[v0] Found tasks to delete:", taskIds.length)

    // Delete comments
    const { error: commentsError, count: commentsCount } = await supabase
      .from("comments")
      .delete()
      .in("task_id", taskIds)

    if (commentsError) {
      console.error("[v0] Error deleting comments:", commentsError)
    }

    // Delete task_history
    const { error: historyError, count: historyCount } = await supabase
      .from("task_history")
      .delete()
      .in("task_id", taskIds)

    if (historyError) {
      console.error("[v0] Error deleting history:", historyError)
    }

    // Delete task_progress
    const { error: progressError, count: progressCount } = await supabase
      .from("task_progress")
      .delete()
      .in("task_id", taskIds)

    if (progressError) {
      console.error("[v0] Error deleting progress:", progressError)
    }

    // Finally, delete the tasks themselves
    const { error: tasksDeleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("client_id", client_id)

    if (tasksDeleteError) {
      console.error("[v0] Error deleting tasks:", tasksDeleteError)
      return NextResponse.json({ error: "Failed to delete tasks" }, { status: 500 })
    }

    console.log("[v0] Cleanup completed successfully")

    return NextResponse.json({
      message: "All tasks deleted successfully",
      deleted_tasks: tasks.length,
      deleted_progress: progressCount || 0,
      deleted_history: historyCount || 0,
      deleted_comments: commentsCount || 0
    })
  } catch (error) {
    console.error("[v0] Error in cleanup-client-tasks:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
