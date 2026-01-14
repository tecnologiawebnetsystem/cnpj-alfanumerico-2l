"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Clock, AlertCircle, Loader2, User } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface Task {
  id: string
  title: string
  description: string
  task_type: string
  priority: string
  status: string
  assigned_to: string | null
  assigned_to_name: string | null
  estimated_hours: number
  actual_hours: number | null
  file_path: string | null
  table_name: string | null
  created_at: string
}

interface TaskStats {
  total: number
  pending: number
  in_progress: number
  awaiting_qa: number
  completed: number
  blocked: number
}

export function TasksTab() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [userRole, setUserRole] = useState<string>("dev")

  useEffect(() => {
    loadTasks()
    loadStats()
    loadUserRole()
  }, [filter])

  const loadTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?filter=${filter}`)
      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (error) {
      console.error(" Error loading tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch("/api/tasks/stats")
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error(" Error loading stats:", error)
    }
  }

  const loadUserRole = async () => {
    try {
      const response = await fetch("/api/auth/me")
      const data = await response.json()
      setUserRole(data.user?.role || "dev")
    } catch (error) {
      console.error(" Error loading user role:", error)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await loadTasks()
        await loadStats()
      }
    } catch (error) {
      console.error(" Error updating task:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      pending: { variant: "secondary", label: "Pendente", icon: Clock },
      in_progress: { variant: "default", label: "Em Progresso", icon: Loader2 },
      awaiting_qa: { variant: "outline", label: "Aguardando QA", icon: AlertCircle },
      completed: { variant: "default", label: "Concluído", icon: CheckCircle2 },
      blocked: { variant: "destructive", label: "Bloqueado", icon: AlertCircle },
    }

    const config = variants[status] || variants.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    }

    return <Badge className={colors[priority] || colors.medium}>{priority.toUpperCase()}</Badge>
  }

  const completionPercentage = stats ? (stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{userRole === "dev" ? "Minhas Tarefas" : "Gerenciar Tarefas"}</h2>

        {stats && (
          <div className="grid gap-4 md:grid-cols-5 mb-6">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Pendente</div>
              <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Em Progresso</div>
              <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Aguardando QA</div>
              <div className="text-2xl font-bold text-orange-600">{stats.awaiting_qa}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Concluído</div>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </Card>
          </div>
        )}

        {/* Barra de Progresso */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso Geral</span>
            <span className="text-sm font-bold">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </Card>

        {/* Filtros */}
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="in_progress">Em Progresso</SelectItem>
              <SelectItem value="awaiting_qa">Aguardando QA</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Tarefas */}
      {tasks.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Nenhuma tarefa encontrada</h3>
              <p className="text-muted-foreground mt-1">
                {filter === "all" ? "Não há tarefas cadastradas" : `Não há tarefas ${filter}`}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    {getPriorityBadge(task.priority)}
                  </div>
                  {task.description && <p className="text-sm text-muted-foreground mb-3">{task.description}</p>}

                  <div className="flex flex-wrap gap-4 text-sm">
                    {task.file_path && (
                      <div>
                        <span className="text-muted-foreground">Arquivo:</span>
                        <span className="ml-2 font-mono">{task.file_path}</span>
                      </div>
                    )}
                    {task.table_name && (
                      <div>
                        <span className="text-muted-foreground">Tabela:</span>
                        <span className="ml-2 font-mono">{task.table_name}</span>
                      </div>
                    )}
                    {task.estimated_hours && (
                      <div>
                        <span className="text-muted-foreground">Estimativa:</span>
                        <span className="ml-2">{task.estimated_hours}h</span>
                      </div>
                    )}
                    {task.assigned_to_name && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{task.assigned_to_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(task.status)}
                  {userRole === "dev" && task.status !== "completed" && (
                    <Select value={task.status} onValueChange={(value) => handleStatusChange(task.id, value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_progress">Em Progresso</SelectItem>
                        <SelectItem value="awaiting_qa">Aguardando QA</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
