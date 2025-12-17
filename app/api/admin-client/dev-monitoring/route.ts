import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
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

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    // Get all DEVs performance
    const { data: devsPerformance, error: devsError } = await supabase
      .from("dev_performance_dashboard")
      .select("*")
      .eq("client_id", user.client_id)

    if (devsError) throw devsError

    // Get DEVs without progress update
    const { data: devsNoUpdate, error: noUpdateError } = await supabase
      .from("devs_no_progress_update")
      .select("*")
      .eq("client_id", user.client_id)

    if (noUpdateError) throw noUpdateError

    // Get all delayed tasks
    const devIds = devsPerformance.map((d) => d.dev_id)
    const { data: delayedTasks, error: delayedError } = await supabase
      .from("dev_delayed_tasks")
      .select("*")
      .in("dev_id", devIds)

    if (delayedError) throw delayedError

    // Get unread notifications
    const { data: notifications, error: notifError } = await supabase
      .from("admin_dev_notifications")
      .select("*")
      .eq("admin_id", user.id)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(50)

    if (notifError) throw notifError

    return NextResponse.json({
      devsPerformance,
      devsNoUpdate,
      delayedTasks,
      notifications,
    })
  } catch (error) {
    console.error("[v0] Error fetching dev monitoring:", error)
    return NextResponse.json({ error: "Failed to fetch monitoring data" }, { status: 500 })
  }
}
