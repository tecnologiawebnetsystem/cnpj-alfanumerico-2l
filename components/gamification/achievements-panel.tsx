"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Lock, Star, Zap, Target, Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  points: number
  unlocked: boolean
  progress: number
  total: number
  unlocked_at?: string
}

export function AchievementsPanel() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const response = await fetch("/api/achievements")
      const data = await response.json()
      setAchievements(data)
    } catch (error) {
      console.error("Error fetching achievements:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      trophy: Trophy,
      star: Star,
      zap: Zap,
      target: Target,
      award: Award,
    }
    return icons[iconName] || Trophy
  }

  const filteredAchievements = achievements.filter((achievement) => {
    if (filter === "unlocked") return achievement.unlocked
    if (filter === "locked") return !achievement.unlocked
    return true
  })

  const totalPoints = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0)

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  if (loading) {
    return <div className="text-center py-8">Carregando conquistas...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conquistas</p>
              <p className="text-2xl font-bold">
                {unlockedCount}/{achievements.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Star className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pontos Totais</p>
              <p className="text-2xl font-bold">{totalPoints}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Zap className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Progresso</p>
              <p className="text-2xl font-bold">{Math.round((unlockedCount / achievements.length) * 100)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Badge
          variant={filter === "all" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilter("all")}
        >
          Todas
        </Badge>
        <Badge
          variant={filter === "unlocked" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilter("unlocked")}
        >
          Desbloqueadas
        </Badge>
        <Badge
          variant={filter === "locked" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilter("locked")}
        >
          Bloqueadas
        </Badge>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
          const Icon = getIcon(achievement.icon)
          const progressPercent = (achievement.progress / achievement.total) * 100

          return (
            <Card
              key={achievement.id}
              className={cn(
                "p-4 transition-all",
                achievement.unlocked ? "border-yellow-500/50 bg-yellow-500/5" : "opacity-60",
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-3 rounded-lg", achievement.unlocked ? "bg-yellow-500/20" : "bg-muted")}>
                  {achievement.unlocked ? (
                    <Icon className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm">{achievement.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {achievement.points}pts
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>

                  {!achievement.unlocked && (
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">
                          {achievement.progress}/{achievement.total}
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-1.5" />
                    </div>
                  )}

                  {achievement.unlocked && achievement.unlocked_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Desbloqueada em {new Date(achievement.unlocked_at).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
