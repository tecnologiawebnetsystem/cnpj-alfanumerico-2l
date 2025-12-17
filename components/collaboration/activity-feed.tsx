"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, FileCode, CheckCircle2, MessageSquare, UserPlus, Settings, Sparkles } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ActivityItem {
  id: string
  user_id: string
  user_name: string
  action: string
  entity_type: string
  entity_id: string
  metadata: Record<string, any>
  created_at: string
}

interface ActivityFeedProps {
  limit?: number
  entityType?: string
  entityId?: string
}

export function ActivityFeed({ limit = 20, entityType, entityId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [entityType, entityId])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      let url = `/api/activity-logs?limit=${limit}`
      if (entityType && entityId) {
        url += `&entity_type=${entityType}&entity_id=${entityId}`
      }

      const response = await fetch(url)
      const data = await response.json()
      setActivities(data)
    } catch (error) {
      console.error("Error fetching activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (action: string) => {
    switch (action) {
      case "created":
      case "analysis_created":
        return <FileCode className="h-4 w-4 text-blue-500" />
      case "completed":
      case "task_completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "commented":
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      case "assigned":
        return <UserPlus className="h-4 w-4 text-orange-500" />
      case "updated":
        return <Settings className="h-4 w-4 text-gray-500" />
      case "ai_suggestion":
        return <Sparkles className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getActionText = (activity: ActivityItem) => {
    const { action, entity_type, metadata } = activity

    switch (action) {
      case "created":
        return `criou ${entity_type === "task" ? "uma tarefa" : "uma análise"}`
      case "completed":
        return `concluiu ${entity_type === "task" ? "a tarefa" : "a análise"}`
      case "commented":
        return `comentou em ${entity_type === "task" ? "uma tarefa" : "uma análise"}`
      case "assigned":
        return `atribuiu ${metadata.assigned_to_name} à tarefa`
      case "updated":
        return `atualizou ${entity_type === "task" ? "a tarefa" : "a análise"}`
      case "ai_suggestion":
        return `gerou uma sugestão de código com IA`
      default:
        return action
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Carregando atividades...</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Atividades Recentes</h3>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma atividade registrada ainda</p>
          ) : (
            activities.map((activity, index) => (
              <div key={activity.id} className="flex gap-3 relative">
                {/* Timeline Line */}
                {index < activities.length - 1 && <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />}

                {/* Avatar */}
                <Avatar className="h-10 w-10 border-2 border-background">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {getInitials(activity.user_name)}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{activity.user_name}</span>
                      <span className="text-sm text-muted-foreground">{getActionText(activity)}</span>
                      {getIcon(activity.action)}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>

                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {Object.entries(activity.metadata)
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
