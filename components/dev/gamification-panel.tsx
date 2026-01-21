"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, Star, Flame, Target, Award, Users, TrendingUp, Zap, Crown, Medal } from "lucide-react"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  unlocked: boolean
  unlocked_at?: string
  progress?: number
  max_progress?: number
}

interface DevStats {
  total_points: number
  level: number
  tasks_completed: number
  streak_days: number
  rank: number
  total_devs: number
}

interface LeaderboardEntry {
  user_id: string
  user_name: string
  points: number
  level: number
  rank: number
}

interface GamificationPanelProps {
  userId: string
}

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000]
const LEVEL_NAMES = ["Novato", "Aprendiz", "Junior", "Pleno", "Senior", "Especialista", "Expert", "Mestre", "Guru", "Lenda"]

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "trophy": return Trophy
    case "star": return Star
    case "flame": return Flame
    case "target": return Target
    case "award": return Award
    case "zap": return Zap
    case "crown": return Crown
    case "medal": return Medal
    default: return Trophy
  }
}

export function GamificationPanel({ userId }: GamificationPanelProps) {
  const [stats, setStats] = useState<DevStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    try {
      const [statsRes, achievementsRes, leaderboardRes] = await Promise.all([
        fetch(`/api/dev/stats?user_id=${userId}`),
        fetch(`/api/dev/achievements?user_id=${userId}`),
        fetch(`/api/dev/leaderboard`)
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
      if (achievementsRes.ok) {
        const data = await achievementsRes.json()
        setAchievements(data.achievements || [])
      }
      if (leaderboardRes.ok) {
        const data = await leaderboardRes.json()
        setLeaderboard(data.leaderboard || [])
      }
    } catch (error) {
      console.error("Error fetching gamification data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelProgress = () => {
    if (!stats) return 0
    const currentThreshold = LEVEL_THRESHOLDS[stats.level - 1] || 0
    const nextThreshold = LEVEL_THRESHOLDS[stats.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
    const progress = ((stats.total_points - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    return Math.min(progress, 100)
  }

  const pointsToNextLevel = () => {
    if (!stats) return 0
    const nextThreshold = LEVEL_THRESHOLDS[stats.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
    return nextThreshold - stats.total_points
  }

  // Mock data for demonstration
  const mockStats: DevStats = {
    total_points: 1250,
    level: 4,
    tasks_completed: 47,
    streak_days: 5,
    rank: 3,
    total_devs: 12
  }

  const mockAchievements: Achievement[] = [
    { id: "1", name: "Primeira Tarefa", description: "Complete sua primeira tarefa", icon: "star", points: 10, unlocked: true, unlocked_at: "2024-01-15" },
    { id: "2", name: "Velocista", description: "Complete 5 tarefas em um dia", icon: "zap", points: 50, unlocked: true, unlocked_at: "2024-01-20" },
    { id: "3", name: "Maratonista", description: "Mantenha uma sequencia de 7 dias", icon: "flame", points: 100, unlocked: false, progress: 5, max_progress: 7 },
    { id: "4", name: "Centuriao", description: "Complete 100 tarefas", icon: "trophy", points: 200, unlocked: false, progress: 47, max_progress: 100 },
    { id: "5", name: "Perfecionista", description: "Complete 10 tarefas sem revisao", icon: "target", points: 75, unlocked: true, unlocked_at: "2024-01-25" },
    { id: "6", name: "Lider", description: "Alcance o primeiro lugar do ranking", icon: "crown", points: 500, unlocked: false },
  ]

  const mockLeaderboard: LeaderboardEntry[] = [
    { user_id: "1", user_name: "Carlos Silva", points: 2150, level: 5, rank: 1 },
    { user_id: "2", user_name: "Ana Costa", points: 1890, level: 5, rank: 2 },
    { user_id: "3", user_name: "Voce", points: 1250, level: 4, rank: 3 },
    { user_id: "4", user_name: "Pedro Santos", points: 980, level: 3, rank: 4 },
    { user_id: "5", user_name: "Julia Lima", points: 750, level: 3, rank: 5 },
  ]

  const displayStats = stats || mockStats
  const displayAchievements = achievements.length > 0 ? achievements : mockAchievements
  const displayLeaderboard = leaderboard.length > 0 ? leaderboard : mockLeaderboard

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <CardTitle>Gamificacao</CardTitle>
            <CardDescription>Seus pontos, conquistas e ranking</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stats" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="stats">Estatisticas</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
            <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            {/* Level Card */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star className="h-6 w-6" />
                  <span className="text-lg font-bold">
                    Nivel {displayStats.level} - {LEVEL_NAMES[displayStats.level - 1]}
                  </span>
                </div>
                <span className="text-2xl font-bold">{displayStats.total_points} pts</span>
              </div>
              <Progress value={getLevelProgress()} className="h-2 bg-white/30" />
              <p className="text-xs mt-1 opacity-80">
                {pointsToNextLevel()} pontos para o proximo nivel
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                <Target className="h-6 w-6 mx-auto text-green-600 mb-1" />
                <div className="text-2xl font-bold text-green-600">{displayStats.tasks_completed}</div>
                <div className="text-xs text-muted-foreground">Tarefas Concluidas</div>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-center">
                <Flame className="h-6 w-6 mx-auto text-orange-600 mb-1" />
                <div className="text-2xl font-bold text-orange-600">{displayStats.streak_days}</div>
                <div className="text-xs text-muted-foreground">Dias Seguidos</div>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center">
                <TrendingUp className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                <div className="text-2xl font-bold text-purple-600">#{displayStats.rank}</div>
                <div className="text-xs text-muted-foreground">No Ranking</div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                <Users className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                <div className="text-2xl font-bold text-blue-600">{displayStats.total_devs}</div>
                <div className="text-xs text-muted-foreground">Desenvolvedores</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <ScrollArea className="h-[300px]">
              <div className="grid gap-3">
                {displayAchievements.map((achievement) => {
                  const IconComponent = getIconComponent(achievement.icon)
                  return (
                    <div
                      key={achievement.id}
                      className={`p-3 rounded-lg border ${
                        achievement.unlocked
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 opacity-70"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          achievement.unlocked ? "bg-green-100" : "bg-slate-200"
                        }`}>
                          <IconComponent className={`h-5 w-5 ${
                            achievement.unlocked ? "text-green-600" : "text-slate-400"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{achievement.name}</p>
                            <Badge variant={achievement.unlocked ? "default" : "secondary"}>
                              +{achievement.points} pts
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          {!achievement.unlocked && achievement.progress !== undefined && (
                            <div className="mt-2">
                              <Progress
                                value={(achievement.progress / (achievement.max_progress || 1)) * 100}
                                className="h-1"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {achievement.progress}/{achievement.max_progress}
                              </p>
                            </div>
                          )}
                          {achievement.unlocked && achievement.unlocked_at && (
                            <p className="text-xs text-green-600 mt-1">
                              Desbloqueado em {new Date(achievement.unlocked_at).toLocaleDateString("pt-BR")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="leaderboard">
            <div className="space-y-2">
              {displayLeaderboard.map((entry, index) => (
                <div
                  key={entry.user_id}
                  className={`p-3 rounded-lg flex items-center gap-3 ${
                    entry.user_name === "Voce"
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200"
                      : "bg-slate-50 dark:bg-slate-800"
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? "bg-yellow-400 text-yellow-900" :
                    index === 1 ? "bg-slate-300 text-slate-700" :
                    index === 2 ? "bg-orange-400 text-orange-900" :
                    "bg-slate-200 text-slate-600"
                  }`}>
                    {entry.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{entry.user_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Nivel {entry.level} - {LEVEL_NAMES[entry.level - 1]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{entry.points}</p>
                    <p className="text-xs text-muted-foreground">pontos</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
