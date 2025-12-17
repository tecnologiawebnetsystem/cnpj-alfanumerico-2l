import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase/api-client"

export async function GET(request: NextRequest) {
  console.log("[v0] === CLIENT STATS API START ===", new Date().toISOString())

  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")

    console.log("[v0] User ID:", userId)

    if (!userId) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 401 })
    }

    console.log("[v0] Creating service Supabase client (NO cookies)...")
    const supabase = createSupabaseServiceClient()
    console.log("[v0] ✅ Service client created instantly")

    console.log("[v0] Fetching user...")
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("client_id, role")
      .eq("id", userId)
      .single()

    if (userError || !user?.client_id) {
      console.error("[v0] User fetch error:", userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    console.log("[v0] ✅ User found, client:", user.client_id)

    console.log("[v0] Fetching devs...")
    const { data: devs } = await supabase
      .from("users")
      .select("id, status")
      .eq("client_id", user.client_id)
      .eq("role", "dev")

    const totalDevs = devs?.length || 0
    const activeDevs = devs?.filter((d) => d.status === "active").length || 0
    console.log("[v0] ✅ Devs:", totalDevs)

    console.log("[v0] Fetching tasks...")
    const { data: tasks } = await supabase.from("tasks").select("status").eq("client_id", user.client_id)

    const totalTasks = tasks?.length || 0
    const pendingTasks = tasks?.filter((t) => t.status === "pending").length || 0
    const inProgressTasks = tasks?.filter((t) => t.status === "in_progress").length || 0
    const completedTasks = tasks?.filter((t) => t.status === "completed").length || 0
    console.log("[v0] ✅ Tasks:", totalTasks)

    console.log("[v0] Fetching repos & analyses...")
    const { count: totalRepositories } = await supabase
      .from("repositories")
      .select("*", { count: "exact", head: true })
      .eq("client_id", user.client_id)

    const { count: totalAnalyses } = await supabase
      .from("analyses")
      .select("*", { count: "exact", head: true })
      .eq("client_id", user.client_id)

    console.log("[v0] ✅ Repos:", totalRepositories, "Analyses:", totalAnalyses)

    const responseData = {
      totalDevs,
      activeDevs,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      totalRepositories: totalRepositories || 0,
      totalAnalyses: totalAnalyses || 0,
    }

    console.log("[v0] === CLIENT STATS API SUCCESS ===")
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] === CLIENT STATS API ERROR ===", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
