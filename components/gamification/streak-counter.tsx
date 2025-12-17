"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Flame, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreakData {
  current_streak: number
  longest_streak: number
  last_activity: string
  activity_calendar: { date: string; count: number }[]
}

export function StreakCounter() {
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStreak()
  }, [])

  const fetchStreak = async () => {
    try {
      const response = await fetch("/api/stats?include=streak")
      const data = await response.json()
      setStreak(data.streak)
    } catch (error) {
      console.error("Error fetching streak:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !streak) {
    return null
  }

  const isStreakActive = () => {
    const lastActivity = new Date(streak.last_activity)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 1
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn("p-3 rounded-lg", isStreakActive() ? "bg-orange-500/20" : "bg-muted")}>
            <Flame className={cn("h-6 w-6", isStreakActive() ? "text-orange-500" : "text-muted-foreground")} />
          </div>
          <div>
            <h3 className="font-semibold">Sequência Atual</h3>
            <p className="text-3xl font-bold text-orange-500">{streak.current_streak} dias</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">Recorde</p>
          <p className="text-2xl font-bold">{streak.longest_streak} dias</p>
        </div>
      </div>

      {!isStreakActive() && streak.current_streak > 0 && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
          Sua sequência está em risco! Faça uma atividade hoje para mantê-la.
        </div>
      )}

      {/* Activity Calendar (last 30 days) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Últimos 30 dias</span>
        </div>
        <div className="grid grid-cols-10 gap-1">
          {streak.activity_calendar.slice(-30).map((day, index) => (
            <div
              key={index}
              className={cn(
                "aspect-square rounded-sm",
                day.count === 0 && "bg-muted",
                day.count > 0 && day.count <= 2 && "bg-green-500/30",
                day.count > 2 && day.count <= 5 && "bg-green-500/60",
                day.count > 5 && "bg-green-500",
              )}
              title={`${day.date}: ${day.count} atividades`}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
