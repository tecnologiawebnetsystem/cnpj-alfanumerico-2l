"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertCircle, CheckCircle2, Play, Check } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  created_at: string
  completed_at: string | null
}

interface DevTaskDetailProps {
  task: Task
  onUpdateStatus: (taskId: string, status: string) => void
}

export function DevTaskDetail({ task, onUpdateStatus }: DevTaskDetailProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Em Progresso
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Concluída
          </Badge>
        )
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800 border-gray-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-red-100 text-red-800 border-red-200",
    }
    return (
      <Badge className={colors[priority as keyof typeof colors] || ""}>
        Prioridade: {priority === "low" ? "Baixa" : priority === "medium" ? "Média" : "Alta"}
      </Badge>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-xl">{task.title}</CardTitle>
          {getStatusBadge(task.status)}
        </div>
        <CardDescription className="flex items-center gap-2">{getPriorityBadge(task.priority)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Descrição</h3>
          <p className="text-slate-600 whitespace-pre-wrap">{task.description}</p>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Atualizar Status</h3>
          <div className="space-y-2">
            {task.status === "pending" && (
              <Button
                onClick={() => onUpdateStatus(task.id, "in_progress")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Tarefa
              </Button>
            )}

            {task.status === "in_progress" && (
              <Button
                onClick={() => onUpdateStatus(task.id, "completed")}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Marcar como Concluída
              </Button>
            )}

            {task.status === "completed" && (
              <div className="text-center py-4">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Tarefa concluída em{" "}
                  {task.completed_at ? new Date(task.completed_at).toLocaleDateString("pt-BR") : "Data não disponível"}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4 text-sm text-muted-foreground">
          <p>
            Criada em:{" "}
            {new Date(task.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
