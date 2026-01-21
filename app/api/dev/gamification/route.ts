import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "user_id obrigatorio" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user info
    const { data: user } = await supabase
      .from("users")
      .select("id, name")
      .eq("id", userId)
      .single()
    
    // Get user stats (points, level, etc)
    const { data: userStats } = await supabase
      .from("user_stats")
      .select("total_points, rank, current_streak, longest_streak, tasks_completed, achievements_earned")
      .eq("user_id", userId)
      .single()

    // Get completed tasks count
    const { count: completedTasks } = await supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("assigned_to", userId)
      .eq("status", "done")

    // Get total hours worked
    const { data: timeEntries } = await supabase
      .from("time_entries")
      .select("duration_minutes")
      .eq("user_id", userId)

    const totalMinutes = timeEntries?.reduce((sum, t) => sum + (t.duration_minutes || 0), 0) || 0
    const totalHours = Math.round(totalMinutes / 60)

    // Get user achievements
    const { data: userAchievements } = await supabase
      .from("user_achievements")
      .select("*, achievements(*)")
      .eq("user_id", userId)

    // Get all achievements for progress
    const { data: allAchievements } = await supabase
      .from("achievements")
      .select("*")
      .order("points", { ascending: true })

    // Get ranking from user_stats joined with users
    const { data: ranking } = await supabase
      .from("user_stats")
      .select("user_id, total_points, users(id, name)")
      .order("total_points", { ascending: false })
      .limit(10)

    const userRank = ranking?.findIndex(r => r.user_id === userId) ?? -1

    // Calculate streak (consecutive days with completed tasks)
    const { data: recentTasks } = await supabase
      .from("tasks")
      .select("completed_at")
      .eq("assigned_to", userId)
      .eq("status", "done")
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(30)

    let streak = 0
    if (recentTasks?.length) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(checkDate.getDate() - i)
        const dateStr = checkDate.toISOString().split("T")[0]
        
        const hasTaskOnDay = recentTasks.some(t => {
          const taskDate = new Date(t.completed_at!).toISOString().split("T")[0]
          return taskDate === dateStr
        })
        
        if (hasTaskOnDay) {
          streak++
        } else if (i > 0) {
          break
        }
      }
    }

    // Calculate level from points
    const points = userStats?.total_points || 0
    const level = Math.floor(points / 100) + 1

    return NextResponse.json({
      user: {
        ...user,
        points,
        level
      },
      stats: {
        completedTasks: userStats?.tasks_completed || completedTasks || 0,
        totalHours,
        streak: userStats?.current_streak || streak,
        rank: userRank + 1
      },
      achievements: {
        earned: userAchievements?.map(ua => ({
          ...ua.achievements,
          earnedAt: ua.created_at
        })) || [],
        all: allAchievements || []
      },
      ranking: ranking || []
    })

  } catch (error: any) {
    console.error("Error fetching gamification:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Award points for completing a task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, action, task_id } = body

    if (!user_id || !action) {
      return NextResponse.json({ error: "user_id e action obrigatorios" }, { status: 400 })
    }

    const supabase = await createClient()

    // Define points for actions
    const pointsMap: Record<string, number> = {
      complete_task: 10,
      complete_critical_task: 25,
      first_task_of_day: 5,
      streak_bonus: 15,
      fast_completion: 20
    }

    const pointsToAdd = pointsMap[action] || 0

    // Update user_stats points
    const { data: stats } = await supabase
      .from("user_stats")
      .select("total_points")
      .eq("user_id", user_id)
      .single()

    const currentPoints = stats?.total_points || 0
    const newPoints = currentPoints + pointsToAdd
    
    // Calculate new level (every 100 points = 1 level)
    const newLevel = Math.floor(newPoints / 100) + 1

    // Upsert user_stats
    await supabase
      .from("user_stats")
      .upsert({ 
        user_id, 
        total_points: newPoints,
        rank: `Nivel ${newLevel}`,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" })

    // Check for new achievements
    const { data: achievements } = await supabase
      .from("achievements")
      .select("*")
    
    const { data: userAchievements } = await supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", user_id)

    const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || [])
    const newAchievements: any[] = []

    // Check each achievement
    for (const achievement of achievements || []) {
      if (earnedIds.has(achievement.id)) continue

      let earned = false
      const criteria = achievement.criteria as any

      if (criteria?.type === "tasks_completed") {
        const { count } = await supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .eq("assigned_to", user_id)
          .eq("status", "done")
        
        earned = (count || 0) >= criteria.value
      } else if (criteria?.type === "points_reached") {
        earned = newPoints >= criteria.value
      } else if (criteria?.type === "streak_days") {
        // Would need to calculate streak
        earned = false
      }

      if (earned) {
        await supabase
          .from("user_achievements")
          .insert({ user_id, achievement_id: achievement.id })
        
        newAchievements.push(achievement)
      }
    }

    return NextResponse.json({
      success: true,
      pointsAdded: pointsToAdd,
      newTotal: newPoints,
      newLevel,
      newAchievements
    })

  } catch (error: any) {
    console.error("Error updating gamification:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
