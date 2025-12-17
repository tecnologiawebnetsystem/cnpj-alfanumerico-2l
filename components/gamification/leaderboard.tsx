"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Zap, Target, Clock, Medal } from "lucide-react"
import { cn } from "@/lib/utils"

interface LeaderboardEntry {
  rank: number
  user_id: string
  user_name: string
  user_email: string
  score: number
  tasks_completed?: number
  analyses_completed?: number
  avg_completion_time?: number
  streak_days?: number
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [metric, setMetric] = useState<"points" | "tasks" | "speed" | "streak">("points")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [metric])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/leaderboard?metric=${metric}`)
      const data = await response.json()
      setLeaderboard(data)
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500"
    if (rank === 2) return "text-gray-400"
    if (rank === 3) return "text-amber-600"
    return "text-muted-foreground"
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getMetricValue = (entry: LeaderboardEntry) => {
    switch (metric) {
      case "points":
        return `${entry.score} pts`
      case "tasks":
        return `${entry.tasks_completed} tarefas`
      case "speed":
        return `${entry.avg_completion_time}h média`
      case "streak":
        return `${entry.streak_days} dias`
      default:
        return entry.score
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando ranking...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs value={metric} onValueChange={(v: any) => setMetric(v)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="points" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Pontos</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Tarefas</span>
          </TabsTrigger>
          <TabsTrigger value="speed" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Velocidade</span>
          </TabsTrigger>
          <TabsTrigger value="streak" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Sequência</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={metric} className="mt-6">
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <Card
                key={entry.user_id}
                className={cn(
                  "p-4 transition-all hover:shadow-md",
                  entry.rank <= 3 && "border-2",
                  entry.rank === 1 && "border-yellow-500/50 bg-yellow-500/5",
                  entry.rank === 2 && "border-gray-400/50 bg-gray-400/5",
                  entry.rank === 3 && "border-amber-600/50 bg-amber-600/5",
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12">
                    {entry.rank <= 3 ? (
                      <Medal className={cn("h-8 w-8", getMedalColor(entry.rank))} />
                    ) : (
                      <span className="text-2xl font-bold text-muted-foreground">{entry.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(entry.user_name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{entry.user_name}</p>
                    <p className="text-sm text-muted-foreground truncate">{entry.user_email}</p>
                  </div>

                  {/* Score */}
                  <Badge variant="secondary" className="text-base font-bold px-4 py-2">
                    {getMetricValue(entry)}
                  </Badge>
                </div>
              </Card>
            ))}

            {leaderboard.length === 0 && (
              <Card className="p-8 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum dado disponível ainda</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
