import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (!userId) {
      return NextResponse.json({ error: "user_id obrigatorio" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get completed tasks
    const { data: completedTasks } = await supabase
      .from("tasks")
      .select("id, title, repository_name, completed_at, estimated_hours, completed_hours")
      .eq("assigned_to", userId)
      .eq("status", "done")
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Get time entries (notes instead of description per schema)
    const { data: timeEntries } = await supabase
      .from("time_entries")
      .select("id, task_id, started_at, ended_at, duration_minutes, notes, tasks(title)")
      .eq("user_id", userId)
      .not("ended_at", "is", null)
      .order("started_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Get focus sessions (session_type, was_interrupted instead of pomodoros_completed per schema)
    const { data: focusSessions } = await supabase
      .from("focus_sessions")
      .select("id, task_id, started_at, completed_at, duration_minutes, session_type, was_interrupted, tasks(title)")
      .eq("user_id", userId)
      .not("completed_at", "is", null)
      .order("started_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Get achievements earned
    const { data: achievements } = await supabase
      .from("user_achievements")
      .select("id, created_at, achievements(name, description, icon, points)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Combine and sort all activities
    const activities: any[] = []

    // Add completed tasks
    completedTasks?.forEach(task => {
      activities.push({
        id: `task-${task.id}`,
        type: "task_completed",
        title: "Tarefa Concluida",
        description: task.title,
        metadata: {
          repository: task.repository_name,
          estimatedHours: task.estimated_hours,
          completedHours: task.completed_hours
        },
        timestamp: task.completed_at
      })
    })

    // Add time entries
    timeEntries?.forEach(entry => {
      activities.push({
        id: `time-${entry.id}`,
        type: "time_logged",
        title: "Tempo Registrado",
        description: `${Math.round((entry.duration_minutes || 0) / 60 * 10) / 10}h em ${(entry.tasks as any)?.title || "tarefa"}`,
        metadata: {
          duration: entry.duration_minutes,
          taskId: entry.task_id
        },
        timestamp: entry.ended_at
      })
    })

    // Add focus sessions
    focusSessions?.forEach(session => {
      const sessionTypeLabel = session.session_type === "pomodoro" ? "Pomodoro" : "Foco Livre"
      activities.push({
        id: `focus-${session.id}`,
        type: "focus_session",
        title: "Sessao de Foco",
        description: `${sessionTypeLabel} de ${session.duration_minutes || 0} min em ${(session.tasks as any)?.title || "tarefa"}`,
        metadata: {
          duration: session.duration_minutes,
          sessionType: session.session_type,
          wasInterrupted: session.was_interrupted
        },
        timestamp: session.completed_at
      })
    })

    // Add achievements
    achievements?.forEach(ach => {
      const achievement = ach.achievements as any
      activities.push({
        id: `achievement-${ach.id}`,
        type: "achievement_earned",
        title: "Conquista Desbloqueada",
        description: achievement?.name,
        metadata: {
          icon: achievement?.icon,
          points: achievement?.points,
          achievementDescription: achievement?.description
        },
        timestamp: ach.created_at
      })
    })

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Calculate summary stats
    const totalTasks = completedTasks?.length || 0
    const totalMinutes = timeEntries?.reduce((sum, t) => sum + (t.duration_minutes || 0), 0) || 0
    const totalFocusSessions = focusSessions?.filter(s => s.session_type === "pomodoro").length || 0
    const totalAchievements = achievements?.length || 0

    return NextResponse.json({
      activities: activities.slice(0, limit),
      summary: {
        tasksCompleted: totalTasks,
        hoursWorked: Math.round(totalMinutes / 60 * 10) / 10,
        focusSessions: totalFocusSessions,
        achievementsEarned: totalAchievements
      }
    })

  } catch (error: any) {
    console.error("Error fetching activity history:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
