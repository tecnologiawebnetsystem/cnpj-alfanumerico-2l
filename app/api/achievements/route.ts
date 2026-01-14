import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"

// GET /api/achievements - Get all achievements
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const supabase = await createClient()

    // Get all achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from("achievements")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (achievementsError) throw achievementsError

    // Get user's earned achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from("user_achievements")
      .select("achievement_id, earned_at, progress")
      .eq("user_id", user.id)

    if (userAchievementsError) throw userAchievementsError

    // Merge data
    const earnedIds = new Set(userAchievements?.map((ua) => ua.achievement_id) || [])
    const achievementsWithProgress = achievements?.map((achievement) => ({
      ...achievement,
      earned: earnedIds.has(achievement.id),
      earned_at: userAchievements?.find((ua) => ua.achievement_id === achievement.id)?.earned_at,
      progress: userAchievements?.find((ua) => ua.achievement_id === achievement.id)?.progress || 0,
    }))

    return NextResponse.json({ achievements: achievementsWithProgress })
  } catch (error: any) {
    console.error(" Error fetching achievements:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
