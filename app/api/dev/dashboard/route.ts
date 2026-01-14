import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get("user")

    if (!userCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)

    const supabase = await createServerClient()

    // Get DEV performance dashboard
    const { data: dashboard, error: dashboardError } = await supabase
      .from("dev_performance_dashboard")
      .select("*")
      .eq("dev_id", user.id)
      .single()

    if (dashboardError) throw dashboardError

    // Get delayed tasks
    const { data: delayedTasks, error: delayedError } = await supabase
      .from("dev_delayed_tasks")
      .select("*")
      .eq("dev_id", user.id)

    if (delayedError) throw delayedError

    // Get active alerts
    const { data: alerts, error: alertsError } = await supabase
      .from("dev_alerts")
      .select("*")
      .eq("dev_id", user.id)
      .eq("status", "active")
      .order("severity", { ascending: false })
      .order("created_at", { ascending: false })

    if (alertsError) throw alertsError

    // Get last 7 days metrics
    const { data: weeklyMetrics, error: metricsError } = await supabase
      .from("dev_daily_metrics")
      .select("*")
      .eq("dev_id", user.id)
      .gte("metric_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
      .order("metric_date", { ascending: true })

    if (metricsError) throw metricsError

    return NextResponse.json({
      dashboard,
      delayedTasks,
      alerts,
      weeklyMetrics,
    })
  } catch (error) {
    console.error(" Error fetching dev dashboard:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 })
  }
}
