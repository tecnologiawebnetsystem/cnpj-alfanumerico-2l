import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"
import { calculateStreak } from "@/lib/utils/gamification"

// GET /api/stats - Get user stats
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const supabase = await createClient()

    // Get or create user stats
    let { data: stats, error } = await supabase.from("user_stats").select("*").eq("user_id", user.id).single()

    if (error && error.code === "PGRST116") {
      // Create initial stats
      const { data: newStats, error: createError } = await supabase
        .from("user_stats")
        .insert({
          user_id: user.id,
          total_points: 0,
          current_streak: 0,
          longest_streak: 0,
          tasks_completed: 0,
          analyses_completed: 0,
          comments_made: 0,
          achievements_earned: 0,
          rank: "Beginner",
        })
        .select()
        .single()

      if (createError) throw createError
      stats = newStats
    } else if (error) {
      throw error
    }

    // Calculate current streak
    const currentStreak = await calculateStreak(user.id)

    return NextResponse.json({
      stats: {
        ...stats,
        current_streak: currentStreak,
      },
    })
  } catch (error: any) {
    console.error(" Error fetching stats:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
