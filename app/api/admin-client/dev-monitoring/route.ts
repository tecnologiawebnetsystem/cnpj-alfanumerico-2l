import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/sqlserver"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get("user")

    if (!userCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)

    if (user.role !== "admin_cliente") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: devsPerformance, error: devsError } = await db
      .from("dev_performance_dashboard")
      .select("*")
      .eq("client_id", user.client_id)

    if (devsError) throw new Error(devsError.message)

    const { data: devsNoUpdate, error: noUpdateError } = await db
      .from("devs_no_progress_update")
      .select("*")
      .eq("client_id", user.client_id)

    if (noUpdateError) throw new Error(noUpdateError.message)

    const devArr = Array.isArray(devsPerformance) ? devsPerformance : devsPerformance ? [devsPerformance] : []
    const devIds = devArr.map((d: Record<string, unknown>) => d.dev_id as string)

    const { data: delayedTasks, error: delayedError } = devIds.length
      ? await db.from("dev_delayed_tasks").select("*").in("dev_id", devIds)
      : { data: [], error: null }

    if (delayedError) throw new Error(delayedError.message)

    const { data: notifications, error: notifError } = await db
      .from("admin_dev_notifications")
      .select("*")
      .eq("admin_id", user.id)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(50)

    if (notifError) throw new Error(notifError.message)

    return NextResponse.json({
      devsPerformance: devArr,
      devsNoUpdate: Array.isArray(devsNoUpdate) ? devsNoUpdate : devsNoUpdate ? [devsNoUpdate] : [],
      delayedTasks: Array.isArray(delayedTasks) ? delayedTasks : delayedTasks ? [delayedTasks] : [],
      notifications: Array.isArray(notifications) ? notifications : notifications ? [notifications] : [],
    })
  } catch (error) {
    console.error("Error fetching dev monitoring:", error)
    return NextResponse.json({ error: "Failed to fetch monitoring data" }, { status: 500 })
  }
}
