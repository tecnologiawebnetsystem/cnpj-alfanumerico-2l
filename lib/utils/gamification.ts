import { createClient } from "@/lib/supabase/server"
import { createNotification } from "./notifications"

export async function updateUserStats(
  userId: string,
  updates: {
    tasks_completed?: number
    analyses_completed?: number
    comments_made?: number
  },
) {
  const supabase = await createClient()

  // Get current stats
  const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

  if (!stats) {
    // Create initial stats
    await supabase.from("user_stats").insert({
      user_id: userId,
      ...updates,
      last_activity_date: new Date().toISOString().split("T")[0],
    })
  } else {
    // Update stats
    const newStats: any = {
      last_activity_date: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString(),
    }

    if (updates.tasks_completed) {
      newStats.tasks_completed = (stats.tasks_completed || 0) + updates.tasks_completed
    }
    if (updates.analyses_completed) {
      newStats.analyses_completed = (stats.analyses_completed || 0) + updates.analyses_completed
    }
    if (updates.comments_made) {
      newStats.comments_made = (stats.comments_made || 0) + updates.comments_made
    }

    await supabase.from("user_stats").update(newStats).eq("user_id", userId)
  }

  // Check for new achievements
  await checkAndAwardAchievements(userId)
}

export async function checkAndAwardAchievements(userId: string) {
  const supabase = await createClient()

  // Get user stats
  const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

  if (!stats) return

  // Get all active achievements
  const { data: achievements } = await supabase.from("achievements").select("*").eq("is_active", true)

  if (!achievements) return

  // Get user's current achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId)

  const earnedAchievementIds = new Set(userAchievements?.map((ua) => ua.achievement_id) || [])

  // Check each achievement
  for (const achievement of achievements) {
    if (earnedAchievementIds.has(achievement.id)) continue

    let earned = false

    // Check if requirements are met
    if (achievement.requirement_type === "tasks_completed") {
      earned = stats.tasks_completed >= achievement.requirement_value
    } else if (achievement.requirement_type === "analyses_completed") {
      earned = stats.analyses_completed >= achievement.requirement_value
    } else if (achievement.requirement_type === "streak") {
      earned = stats.current_streak >= achievement.requirement_value
    } else if (achievement.requirement_type === "comments_made") {
      earned = stats.comments_made >= achievement.requirement_value
    }

    if (earned) {
      // Award achievement
      await supabase.from("user_achievements").insert({
        user_id: userId,
        achievement_id: achievement.id,
      })

      // Update user stats
      await supabase
        .from("user_stats")
        .update({
          achievements_earned: (stats.achievements_earned || 0) + 1,
          total_points: (stats.total_points || 0) + achievement.points,
        })
        .eq("user_id", userId)

      // Get user info for notification
      const { data: user } = await supabase.from("users").select("client_id").eq("id", userId).single()

      if (user) {
        // Send notification
        await createNotification({
          userId,
          clientId: user.client_id,
          type: "achievement_earned",
          title: "Nova Conquista!",
          message: `Você ganhou a conquista "${achievement.display_name}"! +${achievement.points} pontos`,
          priority: "normal",
          category: "achievement",
          metadata: {
            achievement_id: achievement.id,
            achievement_name: achievement.name,
            points: achievement.points,
          },
        })
      }
    }
  }
}

export async function calculateStreak(userId: string): Promise<number> {
  const supabase = await createClient()

  const { data: stats } = await supabase
    .from("user_stats")
    .select("last_activity_date, current_streak")
    .eq("user_id", userId)
    .single()

  if (!stats || !stats.last_activity_date) return 1

  const today = new Date().toISOString().split("T")[0]
  const lastActivity = stats.last_activity_date
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

  let newStreak = 1

  if (lastActivity === yesterday) {
    // Continue streak
    newStreak = (stats.current_streak || 0) + 1
  } else if (lastActivity === today) {
    // Same day, keep current streak
    newStreak = stats.current_streak || 1
  }

  // Update streak
  await supabase
    .from("user_stats")
    .update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, stats.current_streak || 0),
    })
    .eq("user_id", userId)

  return newStreak
}
