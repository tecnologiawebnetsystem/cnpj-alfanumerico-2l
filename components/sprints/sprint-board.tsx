"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Target, TrendingUp } from "lucide-react"

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

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  story_points: number
  assigned_to_user: { name: string; email: string } | null
}

interface SprintBoardProps {
  sprint: Sprint
  tasks: Task[]
  clientId: string
}

export function SprintBoard({ sprint, tasks, clientId }: SprintBoardProps) {
  const columns = [
    { id: "todo", title: "A Fazer", status: "pending" },
    { id: "in_progress", title: "Em Progresso", status: "in_progress" },
    { id: "review", title: "Em Revisão", status: "review" },
    { id: "done", title: "Concluído", status: "completed" },
  ]

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status)
  }

  const completionPercentage = sprint.velocity > 0 ? Math.round((sprint.completed_velocity / sprint.velocity) * 100) : 0

  const daysRemaining = Math.ceil((new Date(sprint.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      {/* Sprint Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{sprint.name}</h2>
            <p className="text-muted-foreground mt-1">{sprint.goal}</p>
          </div>
          <Badge variant={sprint.status === "active" ? "default" : "secondary"}>{sprint.status}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duração</p>
              <p className="font-semibold">{daysRemaining} dias restantes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Velocity</p>
              <p className="font-semibold">
                {sprint.completed_velocity} / {sprint.velocity} pts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Progresso</p>
              <Progress value={completionPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{completionPercentage}%</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.status)
          const totalPoints = columnTasks.reduce((sum, task) => sum + (task.story_points || 0), 0)

          return (
            <div key={column.id} className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <h3 className="font-semibold">{column.title}</h3>
                <Badge variant="outline">
                  {columnTasks.length} ({totalPoints} pts)
                </Badge>
              </div>

              <div className="space-y-2">
                {columnTasks.map((task) => (
                  <Card key={task.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      {task.story_points > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {task.story_points} pts
                        </Badge>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          task.priority === "high"
                            ? "border-red-500 text-red-500"
                            : task.priority === "medium"
                              ? "border-yellow-500 text-yellow-500"
                              : "border-green-500 text-green-500"
                        }`}
                      >
                        {task.priority}
                      </Badge>

                      {task.assigned_to_user && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                            {task.assigned_to_user.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}

                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                    Nenhuma tarefa
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
