import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("client_id")

    if (!clientId) {
      return NextResponse.json({ error: "client_id required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch repositories
    const { data: repositories } = await supabase
      .from("repositories")
      .select("id, last_analyzed_at")
      .eq("client_id", clientId)
    
    const totalRepositories = repositories?.length || 0
    const analyzedRepositories = repositories?.filter(r => r.last_analyzed_at).length || 0

    // Fetch findings
    const { data: findings } = await supabase
      .from("findings")
      .select("id, status, type, created_at")
      .eq("client_id", clientId)
    
    const totalFindings = findings?.length || 0
    const resolvedFindings = findings?.filter(f => f.status === "resolved" || f.status === "fixed").length || 0

    // Fetch tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, status, priority, assigned_to, created_at, completed_at")
      .eq("client_id", clientId)
    
    const pendingTasks = tasks?.filter(t => t.status === "todo" || t.status === "in_progress").length || 0
    const completedTasks = tasks?.filter(t => t.status === "done").length || 0
    const criticalIssues = tasks?.filter(t => t.priority === "critical" && t.status !== "done").length || 0
    
    // Count unique developers
    const developers = new Set(tasks?.filter(t => t.assigned_to).map(t => t.assigned_to))
    const developersAssigned = developers.size

    // Calculate average resolution time (in hours)
    const completedWithTime = tasks?.filter(t => t.completed_at && t.created_at) || []
    let avgResolutionTime = 0
    if (completedWithTime.length > 0) {
      const totalHours = completedWithTime.reduce((sum, t) => {
        const start = new Date(t.created_at).getTime()
        const end = new Date(t.completed_at).getTime()
        return sum + (end - start) / (1000 * 60 * 60)
      }, 0)
      avgResolutionTime = Math.round(totalHours / completedWithTime.length)
    }

    // Weekly progress (last 8 weeks)
    const weeklyProgress = []
    const now = new Date()
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - (i * 7))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)
      
      const weekLabel = `Sem ${8 - i}`
      
      const found = findings?.filter(f => {
        const date = new Date(f.created_at)
        return date >= weekStart && date < weekEnd
      }).length || 0
      
      const resolved = findings?.filter(f => {
        if (f.status !== "resolved" && f.status !== "fixed") return false
        const date = new Date(f.created_at)
        return date >= weekStart && date < weekEnd
      }).length || 0
      
      weeklyProgress.push({ week: weekLabel, found, resolved })
    }

    // Findings by type
    const typeCount: Record<string, number> = {}
    findings?.forEach(f => {
      const type = f.type || "Outros"
      typeCount[type] = (typeCount[type] || 0) + 1
    })
    const findingsByType = Object.entries(typeCount).map(([type, count]) => ({
      type: type === "field" ? "Campo" : 
            type === "validation" ? "Validacao" : 
            type === "mask" ? "Mascara" : 
            type === "database" ? "Banco" : type,
      count
    }))

    // Tasks by status
    const statusCount: Record<string, number> = {}
    tasks?.forEach(t => {
      const status = t.status || "todo"
      statusCount[status] = (statusCount[status] || 0) + 1
    })
    const tasksByStatus = Object.entries(statusCount).map(([status, count]) => ({
      status: status === "todo" ? "A Fazer" :
              status === "in_progress" ? "Em Progresso" :
              status === "review" ? "Revisao" :
              status === "done" ? "Concluido" : status,
      count
    }))

    // Tasks by priority
    const priorityCount: Record<string, number> = {}
    tasks?.forEach(t => {
      const priority = t.priority || "medium"
      priorityCount[priority] = (priorityCount[priority] || 0) + 1
    })
    const tasksByPriority = Object.entries(priorityCount).map(([priority, count]) => ({
      priority: priority === "critical" ? "Critico" :
                priority === "high" ? "Alta" :
                priority === "medium" ? "Media" :
                priority === "low" ? "Baixa" : priority,
      count
    }))

    // Recent activity (last 7 days)
    const recentActivity = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString("pt-BR", { weekday: "short" })
      
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      
      const analyses = findings?.filter(f => {
        const d = new Date(f.created_at)
        return d >= dayStart && d <= dayEnd
      }).length || 0
      
      const tasksCount = tasks?.filter(t => {
        const d = new Date(t.created_at)
        return d >= dayStart && d <= dayEnd
      }).length || 0
      
      recentActivity.push({ date: dateStr, analyses, tasks: tasksCount })
    }

    return NextResponse.json({
      totalRepositories,
      analyzedRepositories,
      totalFindings,
      resolvedFindings,
      pendingTasks,
      completedTasks,
      criticalIssues,
      developersAssigned,
      avgResolutionTime,
      weeklyProgress,
      findingsByType,
      tasksByStatus,
      tasksByPriority,
      recentActivity
    })
  } catch (error: any) {
    console.error("Metrics error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
