"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Flame, Star, ArrowRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface GamificationStats {
  total_points: number
  achievements_unlocked: number
  total_achievements: number
  current_streak: number
  next_achievement?: {
    name: string
    progress: number
    total: number
  }
}

export function GamificationWidget() {
  const [stats, setStats] = useState<GamificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats?include=gamification")
      if (!response.ok) {
        console.error("[v0] Gamification API error:", response.status, response.statusText)
        setError(true)
        return
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[v0] Gamification API returned non-JSON response")
        setError(true)
        return
      }

      const data = await response.json()
      setStats(data.gamification)
    } catch (error) {
      console.error("[v0] Error fetching gamification stats:", error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (error || loading || !stats) {
    return null
  }

  const achievementProgress = (stats.achievements_unlocked / stats.total_achievements) * 100

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Seu Progresso
        </h3>
        <Link href="/dashboard/gamification">
          <Button variant="ghost" size="sm">
            Ver tudo
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {/* Points */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Pontos Totais</span>
          </div>
          <span className="font-bold text-lg">{stats.total_points}</span>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">Sequência</span>
          </div>
          <span className="font-bold text-lg">{stats.current_streak} dias</span>
        </div>

        {/* Achievements Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Conquistas</span>
            <span className="font-medium">
              {stats.achievements_unlocked}/{stats.total_achievements}
            </span>
          </div>
          <Progress value={achievementProgress} className="h-2" />
        </div>

        {/* Next Achievement */}
        {stats.next_achievement && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Próxima conquista</p>
            <p className="text-sm font-medium mb-2">{stats.next_achievement.name}</p>
            <div className="space-y-1">
              <Progress
                value={(stats.next_achievement.progress / stats.next_achievement.total) * 100}
                className="h-1.5"
              />
              <p className="text-xs text-muted-foreground text-right">
                {stats.next_achievement.progress}/{stats.next_achievement.total}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
