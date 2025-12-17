import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get("period") || "30d"

  const days = Number.parseInt(period.replace("d", "").replace("y", "")) * (period.includes("y") ? 365 : 1)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Fetch completed tasks with completion time
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("created_at, completed_at, estimated_hours")
    .eq("status", "completed")
    .gte("created_at", startDate.toISOString())
    .not("completed_at", "is", null)
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group by date and calculate metrics
  const groupedData: Record<string, { total_time: number; count: number; tasks_completed: number }> = {}

  tasks?.forEach((task) => {
    const date = new Date(task.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })

    if (!groupedData[date]) {
      groupedData[date] = { total_time: 0, count: 0, tasks_completed: 0 }
    }

    if (task.completed_at && task.created_at) {
      const completionTime =
        (new Date(task.completed_at).getTime() - new Date(task.created_at).getTime()) / (1000 * 60 * 60)
      groupedData[date].total_time += completionTime
      groupedData[date].count++
    }
    groupedData[date].tasks_completed++
  })

  const chartData = Object.entries(groupedData).map(([date, data]) => ({
    date,
    avg_completion_time: data.count > 0 ? Number((data.total_time / data.count).toFixed(2)) : 0,
    throughput: data.tasks_completed,
  }))

  return NextResponse.json(chartData)
}
