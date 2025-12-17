"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Target, Eye } from "lucide-react"
import Link from "next/link"

interface Sprint {
  id: string
  name: string
  goal: string
  start_date: string
  end_date: string
  status: string
  velocity: number
  completed_velocity: number
}

interface SprintListProps {
  sprints: Sprint[]
  clientId: string
}

export function SprintList({ sprints }: SprintListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700"
      case "completed":
        return "bg-blue-100 text-blue-700"
      case "planning":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      planning: "Planejamento",
      active: "Ativa",
      review: "Revisão",
      retrospective: "Retrospectiva",
      completed: "Concluída",
      cancelled: "Cancelada",
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-4">
      {sprints.map((sprint) => {
        const completionPercentage =
          sprint.velocity > 0 ? Math.round((sprint.completed_velocity / sprint.velocity) * 100) : 0

        return (
          <Card key={sprint.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">{sprint.name}</h3>
                  <Badge className={getStatusColor(sprint.status)}>{getStatusLabel(sprint.status)}</Badge>
                </div>
                <p className="text-muted-foreground">{sprint.goal}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/sprints/${sprint.id}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Período</p>
                  <p className="text-sm font-medium">
                    {new Date(sprint.start_date).toLocaleDateString("pt-BR")} -{" "}
                    {new Date(sprint.end_date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Velocity</p>
                  <p className="text-sm font-medium">
                    {sprint.completed_velocity} / {sprint.velocity} pontos
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Progresso</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${completionPercentage}%` }} />
                  </div>
                  <span className="text-sm font-medium">{completionPercentage}%</span>
                </div>
              </div>
            </div>
          </Card>
        )
      })}

      {sprints.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Nenhuma sprint criada ainda</p>
        </Card>
      )}
    </div>
  )
}
