"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react"

interface DevDashboardCleanProps {
  stats: {
    total: number
    completed: number
    inProgress: number
    delayed: number
    performanceScore: number
  }
  tasks: any[]
}

export function DevDashboardClean({ stats, tasks }: DevDashboardCleanProps) {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50"
    if (score >= 60) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  return (
    <div className="space-y-6 p-6">
      {/* Performance Score - Destaque Principal */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Performance Score</p>
              <div className={`text-6xl font-bold ${getScoreColor(stats.performanceScore)}`}>
                {stats.performanceScore}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Últimos 7 dias</p>
            </div>
            <TrendingUp className="h-16 w-16 text-primary/20" />
          </div>
        </CardContent>
      </Card>

      {/* Grid de Métricas Simples */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.delayed}</p>
                <p className="text-xs text-muted-foreground">Atrasadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progresso Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Conclusão</span>
              <span className="font-semibold">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Tarefas Pendentes - Lista Simples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Minhas Tarefas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.repository_name}</p>
                </div>
                <Badge
                  variant={
                    task.status === "pending" ? "outline" : task.status === "in_progress" ? "default" : "secondary"
                  }
                >
                  {task.status === "pending"
                    ? "Pendente"
                    : task.status === "in_progress"
                      ? "Em Andamento"
                      : "Concluída"}
                </Badge>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma tarefa atribuída</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
