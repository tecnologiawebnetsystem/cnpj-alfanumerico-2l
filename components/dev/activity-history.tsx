"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  History,
  CheckCircle2,
  Clock,
  GitCommit,
  FileCode,
  PlayCircle,
  Timer,
  Calendar,
  TrendingUp,
  Filter,
} from "lucide-react"

interface ActivityItem {
  id: string
  type: "task_completed" | "task_started" | "time_logged" | "commit" | "pr_created"
  title: string
  description: string
  timestamp: string
  metadata?: {
    duration?: number
    task_id?: string
    commit_hash?: string
    pr_number?: string
    repository?: string
  }
}

interface ActivityHistoryProps {
  userId: string
  clientId?: string
}

export function ActivityHistory({ userId }: ActivityHistoryProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    hoursLogged: 0,
    commits: 0,
    streak: 0,
  })

  useEffect(() => {
    fetchActivities()
    fetchStats()
  }, [userId, filter])

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/dev/activity-history?user_id=${userId}&filter=${filter}`)
      const data = await res.json()
      setActivities(data.activities || [])
    } catch (error) {
      console.error("Error fetching activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/dev/activity-stats?user_id=${userId}`)
      const data = await res.json()
      setStats(data.stats || stats)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "task_started":
        return <PlayCircle className="h-4 w-4 text-blue-500" />
      case "time_logged":
        return <Timer className="h-4 w-4 text-purple-500" />
      case "commit":
        return <GitCommit className="h-4 w-4 text-orange-500" />
      case "pr_created":
        return <FileCode className="h-4 w-4 text-cyan-500" />
      default:
        return <History className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "task_completed":
        return "border-l-green-500 bg-green-50/50"
      case "task_started":
        return "border-l-blue-500 bg-blue-50/50"
      case "time_logged":
        return "border-l-purple-500 bg-purple-50/50"
      case "commit":
        return "border-l-orange-500 bg-orange-50/50"
      case "pr_created":
        return "border-l-cyan-500 bg-cyan-50/50"
      default:
        return "border-l-gray-300 bg-gray-50/50"
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}m atras`
    if (diffHours < 24) return `${diffHours}h atras`
    if (diffDays < 7) return `${diffDays}d atras`
    return date.toLocaleDateString("pt-BR")
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            Historico de Atividades
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Ultimos 30 dias
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 bg-green-50 rounded-lg text-center">
            <p className="text-lg font-bold text-green-600">{stats.tasksCompleted}</p>
            <p className="text-[10px] text-muted-foreground">Concluidas</p>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg text-center">
            <p className="text-lg font-bold text-purple-600">{formatDuration(stats.hoursLogged * 60)}</p>
            <p className="text-[10px] text-muted-foreground">Horas</p>
          </div>
          <div className="p-2 bg-orange-50 rounded-lg text-center">
            <p className="text-lg font-bold text-orange-600">{stats.commits}</p>
            <p className="text-[10px] text-muted-foreground">Commits</p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg text-center">
            <p className="text-lg font-bold text-blue-600">{stats.streak}</p>
            <p className="text-[10px] text-muted-foreground">Streak</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1 text-xs">Todos</TabsTrigger>
            <TabsTrigger value="tasks" className="flex-1 text-xs">Tarefas</TabsTrigger>
            <TabsTrigger value="time" className="flex-1 text-xs">Tempo</TabsTrigger>
            <TabsTrigger value="git" className="flex-1 text-xs">Git</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Activity List */}
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Carregando atividades...
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Nenhuma atividade encontrada
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-start gap-3 p-2 rounded-lg border-l-4 ${getActivityColor(activity.type)}`}
                >
                  <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    {activity.metadata?.duration && (
                      <Badge variant="secondary" className="mt-1 text-[10px]">
                        {formatDuration(activity.metadata.duration)}
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {formatDate(activity.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
