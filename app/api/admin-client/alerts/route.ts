import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Fixed: removed status and type columns that don't exist in findings table
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("client_id")

    if (!clientId) {
      return NextResponse.json({ error: "client_id required" }, { status: 400 })
    }

    const supabase = await createClient()
    const alerts: any[] = []

    // Check for critical findings (findings where task not created yet)
    const { data: criticalFindings } = await supabase
      .from("findings")
      .select("id, file_path, created_at, is_validation, is_database")
      .eq("client_id", clientId)
      .eq("task_created", false)
      .order("created_at", { ascending: false })
      .limit(5)

    if (criticalFindings?.length) {
      criticalFindings.forEach(f => {
        const isCritical = f.is_validation || f.is_database
        if (isCritical) {
          alerts.push({
            id: `finding-${f.id}`,
            type: "critical",
            title: "Finding Critico Encontrado",
            message: `${f.is_validation ? "Validacao" : "Database"} de CNPJ encontrada em ${f.file_path}`,
            timestamp: f.created_at,
            read: false,
            link: `/findings/${f.id}`
          })
        }
      })
    }

    // Check for overdue tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, title, due_date, status, created_at")
      .eq("client_id", clientId)
      .in("status", ["todo", "in_progress"])
    
    const now = new Date()
    tasks?.forEach(task => {
      if (task.due_date) {
        const dueDate = new Date(task.due_date)
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilDue < 0) {
          alerts.push({
            id: `task-overdue-${task.id}`,
            type: "critical",
            title: "Tarefa Atrasada",
            message: `"${task.title}" esta ${Math.abs(daysUntilDue)} dias atrasada`,
            timestamp: task.due_date,
            read: false,
            link: `/tasks/${task.id}`
          })
        } else if (daysUntilDue <= 2) {
          alerts.push({
            id: `task-due-${task.id}`,
            type: "warning",
            title: "Tarefa Proxima do Prazo",
            message: `"${task.title}" vence em ${daysUntilDue} ${daysUntilDue === 1 ? "dia" : "dias"}`,
            timestamp: task.due_date,
            read: false,
            link: `/tasks/${task.id}`
          })
        }
      }
    })

    // Check for recent completed batch analyses
    const { data: batchAnalyses } = await supabase
      .from("batch_analyses")
      .select("id, name, status, total_findings, created_at")
      .eq("client_id", clientId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(3)

    batchAnalyses?.forEach(analysis => {
      const hoursAgo = (now.getTime() - new Date(analysis.created_at).getTime()) / (1000 * 60 * 60)
      if (hoursAgo < 24) {
        alerts.push({
          id: `analysis-${analysis.id}`,
          type: "success",
          title: "Analise Concluida",
          message: `${analysis.name || "Analise"}: ${analysis.total_findings || 0} findings encontrados`,
          timestamp: analysis.created_at,
          read: false,
          link: `/analysis/${analysis.id}`
        })
      }
    })

    // Check for unassigned tasks
    const { data: unassignedTasks } = await supabase
      .from("tasks")
      .select("id")
      .eq("client_id", clientId)
      .is("assigned_to", null)
      .in("status", ["todo", "in_progress"])
    
    const unassignedCount = unassignedTasks?.length || 0
    if (unassignedCount > 0) {
      alerts.push({
        id: "unassigned-tasks",
        type: "info",
        title: "Tarefas sem Responsavel",
        message: `${unassignedCount} ${unassignedCount === 1 ? "tarefa precisa" : "tarefas precisam"} ser atribuidas`,
        timestamp: new Date().toISOString(),
        read: false,
        link: "/tasks"
      })
    }

    // Sort by timestamp (most recent first)
    alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({ alerts: alerts.slice(0, 20) })
  } catch (error: any) {
    console.error("Alerts error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
