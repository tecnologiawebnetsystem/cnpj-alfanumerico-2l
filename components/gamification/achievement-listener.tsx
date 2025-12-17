"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AchievementToast } from "./achievement-toast"

interface UnlockedAchievement {
  id: string
  name: string
  description: string
  points: number
  icon: string
}

export function AchievementListener({ userId }: { userId: string }) {
  const [unlockedAchievement, setUnlockedAchievement] = useState<UnlockedAchievement | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to new achievements
    const channel = supabase
      .channel("user_achievements")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_achievements",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          // Fetch achievement details
          const { data: achievement } = await supabase
            .from("achievements")
            .select("*")
            .eq("id", payload.new.achievement_id)
            .single()

          if (achievement) {
            setUnlockedAchievement(achievement)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  if (!unlockedAchievement) return null

  return <AchievementToast achievement={unlockedAchievement} onClose={() => setUnlockedAchievement(null)} />
}
