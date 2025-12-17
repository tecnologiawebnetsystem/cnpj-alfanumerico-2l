import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUser()
    
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN_CLIENT")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const { developer_id, preview } = await request.json()

    if (!developer_id) {
      return NextResponse.json({ error: "ID do desenvolvedor é obrigatório" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Get tasks assigned to this developer
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id")
      .eq("assigned_to", developer_id)

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError)
      return NextResponse.json({ error: "Erro ao buscar tarefas" }, { status: 500 })
    }

    const taskIds = tasks?.map((t) => t.id) || []

    // Get related records counts
    const { count: progressCount } = await supabase
      .from("task_progress")
      .select("*", { count: "exact", head: true })
      .eq("dev_id", developer_id)

    const { count: historyCount } = await supabase
      .from("task_history")
      .select("*", { count: "exact", head: true })
      .in("task_id", taskIds)

    const { count: commentsCount } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", developer_id)
      .eq("entity_type", "task")

    const previewData = {
      tasks_count: tasks?.length || 0,
      task_progress_count: progressCount || 0,
      task_history_count: historyCount || 0,
      comments_count: commentsCount || 0,
    }

    // If preview mode, return counts only
    if (preview) {
      return NextResponse.json({
        success: true,
        preview: previewData,
      })
    }

    // 1. Delete comments first
    if (commentsCount && commentsCount > 0) {
      await supabase
        .from("comments")
        .delete()
        .eq("user_id", developer_id)
        .eq("entity_type", "task")
    }

    // 2. Delete task history
    if (taskIds.length > 0 && historyCount && historyCount > 0) {
      await supabase
        .from("task_history")
        .delete()
        .in("task_id", taskIds)
    }

    // 3. Delete task progress
    if (progressCount && progressCount > 0) {
      await supabase
        .from("task_progress")
        .delete()
        .eq("dev_id", developer_id)
    }

    // 4. Finally delete tasks
    if (tasks && tasks.length > 0) {
      const { error: deleteError } = await supabase
        .from("tasks")
        .delete()
        .eq("assigned_to", developer_id)

      if (deleteError) {
        console.error("Error deleting tasks:", deleteError)
        return NextResponse.json({ error: "Erro ao excluir tarefas" }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Tarefas excluídas com sucesso",
      deleted_tasks: previewData.tasks_count,
      deleted_progress: previewData.task_progress_count,
      deleted_history: previewData.task_history_count,
      deleted_comments: previewData.comments_count,
    })
  } catch (error) {
    console.error("Error in cleanup-developer-tasks:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
