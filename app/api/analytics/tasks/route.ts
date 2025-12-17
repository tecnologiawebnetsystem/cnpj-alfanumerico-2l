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

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("created_at, status")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const groupedData: Record<string, { completed: number; in_progress: number; pending: number }> = {}

  tasks?.forEach((task) => {
    const date = new Date(task.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })

    if (!groupedData[date]) {
      groupedData[date] = { completed: 0, in_progress: 0, pending: 0 }
    }

    if (task.status === "completed") groupedData[date].completed++
    else if (task.status === "in_progress") groupedData[date].in_progress++
    else if (task.status === "pending") groupedData[date].pending++
  })

  const chartData = Object.entries(groupedData).map(([date, counts]) => ({
    date,
    ...counts,
  }))

  return NextResponse.json(chartData)
}
