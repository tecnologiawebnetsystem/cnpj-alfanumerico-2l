import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getUserFromRequest } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    const { user, error: authError } = await getUserFromRequest(request)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createServerClient()

    const { data: profile } = await supabase.from("users").select("role, client_id").eq("email", user.email).single()

    let repositoriesQuery = supabase.from("repositories").select("id", { count: "exact", head: true })
    let analysesQuery = supabase.from("analyses").select("*")
    let tasksQuery = supabase.from("tasks").select("*")

    const isDev = profile?.role === "dev"
    const isAdmin = ["admin", "super_admin"].includes(profile?.role || "")

    if (!isAdmin && profile?.client_id) {
      repositoriesQuery = repositoriesQuery.eq("client_id", profile.client_id)
      analysesQuery = analysesQuery.eq("client_id", profile.client_id)
      tasksQuery = tasksQuery.eq("client_id", profile.client_id)
    }

    if (isDev) {
      const { data: userRecord } = await supabase.from("users").select("id").eq("email", user.email).single()
      if (userRecord) {
        tasksQuery = tasksQuery.eq("assigned_to", userRecord.id)
      }
    }

    // Execute queries
    const [{ count: totalRepositories }, { data: analyses }, { data: tasks }] = await Promise.all([
      repositoriesQuery,
      analysesQuery.order("created_at", { ascending: false }).limit(5),
      tasksQuery,
    ])

    // Calculate stats
    const totalAnalyses = analyses?.length || 0
    const totalFieldsIdentified = analyses?.reduce((sum, a) => sum + (a.fields_count || 0), 0) || 0
    const estimatedHours = analyses?.reduce((sum, a) => sum + (a.estimated_hours || 0), 0) || 0

    const taskStats = {
      total: tasks?.length || 0,
      pending: tasks?.filter((t) => t.status === "pending").length || 0,
      in_progress: tasks?.filter((t) => t.status === "in_progress").length || 0,
      awaiting_qa: tasks?.filter((t) => t.status === "awaiting_qa").length || 0,
      completed: tasks?.filter((t) => t.status === "completed").length || 0,
      blocked: tasks?.filter((t) => t.status === "blocked").length || 0,
    }

    return NextResponse.json({
      totalRepositories: totalRepositories || 0,
      totalAnalyses,
      totalFieldsIdentified,
      estimatedHours: Math.round(estimatedHours),
      recentAnalyses:
        analyses?.map((a) => ({
          id: a.id,
          repository_name: a.repository_name,
          fields_count: a.fields_count,
          estimated_hours: a.estimated_hours,
          status: a.status,
        })) || [],
      tasks: taskStats,
    })
  } catch (error) {
    console.error(" Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
