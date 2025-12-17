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

  // Calculate date range
  const days = Number.parseInt(period.replace("d", "").replace("y", "")) * (period.includes("y") ? 365 : 1)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Fetch analyses data grouped by date
  const { data: analyses, error } = await supabase
    .from("analyses")
    .select("created_at, status")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group by date and status
  const groupedData: Record<string, { completed: number; processing: number; failed: number }> = {}

  analyses?.forEach((analysis) => {
    const date = new Date(analysis.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })

    if (!groupedData[date]) {
      groupedData[date] = { completed: 0, processing: 0, failed: 0 }
    }

    if (analysis.status === "completed") groupedData[date].completed++
    else if (analysis.status === "processing") groupedData[date].processing++
    else if (analysis.status === "failed") groupedData[date].failed++
  })

  const chartData = Object.entries(groupedData).map(([date, counts]) => ({
    date,
    ...counts,
  }))

  return NextResponse.json(chartData)
}
