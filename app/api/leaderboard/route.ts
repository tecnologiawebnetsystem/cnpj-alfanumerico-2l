import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"

// GET /api/leaderboard - Get leaderboard
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "all_time" // daily, weekly, monthly, all_time
    const metric = searchParams.get("metric") || "points" // points, tasks, analyses, speed
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const supabase = await createClient()

    // Get leaderboard based on metric
    let query = supabase
      .from("user_stats")
      .select(`
        *,
        users!inner (
          id,
          name,
          email,
          role,
          client_id
        )
      `)
      .eq("users.client_id", user.client_id)
      .limit(limit)

    if (metric === "points") {
      query = query.order("total_points", { ascending: false })
    } else if (metric === "tasks") {
      query = query.order("tasks_completed", { ascending: false })
    } else if (metric === "analyses") {
      query = query.order("analyses_completed", { ascending: false })
    } else if (metric === "streak") {
      query = query.order("current_streak", { ascending: false })
    }

    const { data: leaderboard, error } = await query

    if (error) throw error

    // Add rank
    const leaderboardWithRank = leaderboard?.map((entry, index) => ({
      rank: index + 1,
      user_id: entry.users.id,
      user_name: entry.users.name,
      user_email: entry.users.email,
      user_role: entry.users.role,
      total_points: entry.total_points,
      tasks_completed: entry.tasks_completed,
      analyses_completed: entry.analyses_completed,
      current_streak: entry.current_streak,
      achievements_earned: entry.achievements_earned,
      rank_title: entry.rank,
    }))

    // Find current user's position
    const userPosition = leaderboardWithRank?.findIndex((entry) => entry.user_id === user.id) ?? -1

    return NextResponse.json({
      leaderboard: leaderboardWithRank,
      user_position: userPosition + 1,
      period,
      metric,
    })
  } catch (error: any) {
    console.error(" Error fetching leaderboard:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
