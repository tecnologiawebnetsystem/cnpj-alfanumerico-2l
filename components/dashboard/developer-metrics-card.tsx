'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Code2, GitBranch } from 'lucide-react'

interface DeveloperMetricsCardProps {
  metrics: {
    total_tasks: number
    completed_tasks: number
    in_progress_tasks: number
    pending_tasks: number
    overdue_tasks: number
    completion_rate: number
    avg_completion_time_hours: number
    tasks_this_week: number
    tasks_this_month: number
    prs_created: number
    prs_merged: number
  }
}

export function DeveloperMetricsCard({ metrics }: DeveloperMetricsCardProps) {
  const completionPercentage = metrics.total_tasks > 0 
    ? Math.round((metrics.completed_tasks / metrics.total_tasks) * 100)
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tarefas Totais</CardTitle>
          <Code2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.total_tasks}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.tasks_this_month} neste mês
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionPercentage}%</div>
          <Progress value={completionPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.completed_tasks} de {metrics.total_tasks} concluídas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.in_progress_tasks}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.pending_tasks} pendentes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pull Requests</CardTitle>
          <GitBranch className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.prs_created}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.prs_merged} merged
          </p>
        </CardContent>
      </Card>

      {metrics.overdue_tasks > 0 && (
        <Card className="border-destructive/50 bg-destructive/5 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.overdue_tasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requerem atenção imediata
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Tempo Médio de Conclusão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.avg_completion_time_hours > 0 
              ? `${metrics.avg_completion_time_hours.toFixed(1)}h`
              : 'N/A'
            }
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Por tarefa concluída
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
