"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, User, Bell, Eye } from 'lucide-react'

export default function DevMonitoringPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMonitoring()
    const interval = setInterval(fetchMonitoring, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchMonitoring = async () => {
    try {
      const res = await fetch("/api/admin-client/dev-monitoring")
      const data = await res.json()
      setData(data)
    } catch (error) {
      console.error("Error fetching monitoring:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Carregando monitoramento...</div>
  }

  if (!data) {
    return <div className="p-8">Erro ao carregar dados</div>
  }

  const devsPerformance = data.devsPerformance || []
  const devsNoUpdate = data.devsNoUpdate || []
  const delayedTasks = data.delayedTasks || []
  const notifications = data.notifications || []

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50"
    if (score >= 60) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Monitoramento de Desenvolvedores</h1>
        <p className="text-muted-foreground">Acompanhe a performance da sua equipe em tempo real</p>
      </div>

      {/* Alertas e Notificações */}
      {notifications.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Bell className="h-5 w-5" />
              Notificações ({notifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.slice(0, 5).map((notif: any) => (
              <Alert key={notif.id}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{notif.title}</AlertTitle>
                <AlertDescription>{notif.message}</AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* DEVs sem Atualização */}
      {devsNoUpdate.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Clock className="h-5 w-5" />
              DEVs sem Atualização de Progresso ({devsNoUpdate.length})
            </CardTitle>
            <CardDescription>Desenvolvedores que não reportaram progresso nas últimas 24h</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Desenvolvedor</TableHead>
                  <TableHead>Tarefas Ativas</TableHead>
                  <TableHead>Última Atualização</TableHead>
                  <TableHead>Dias sem Atualização</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devsNoUpdate.map((dev: any) => (
                  <TableRow key={dev.dev_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{dev.dev_name}</div>
                        <div className="text-sm text-muted-foreground">{dev.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>{dev.active_tasks}</Badge>
                    </TableCell>
                    <TableCell>
                      {dev.last_progress_update
                        ? new Date(dev.last_progress_update).toLocaleString("pt-BR")
                        : "Nunca"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{Math.round(dev.days_since_last_update)} dias</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Performance de DEVs */}
      <Card>
        <CardHeader>
          <CardTitle>Performance da Equipe</CardTitle>
          <CardDescription>Visão geral do desempenho de todos os desenvolvedores</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Desenvolvedor</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Concluídas</TableHead>
                <TableHead className="text-center">Em Progresso</TableHead>
                <TableHead className="text-center">Atrasadas</TableHead>
                <TableHead className="text-center">Bloqueadas</TableHead>
                <TableHead className="text-center">Performance</TableHead>
                <TableHead>Última Atividade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devsPerformance.map((dev: any) => (
                <TableRow key={dev.dev_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{dev.dev_name}</div>
                      <div className="text-sm text-muted-foreground">{dev.dev_email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{dev.total_tasks}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-green-100 text-green-800">{dev.tasks_completed}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-blue-100 text-blue-800">{dev.tasks_in_progress}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {dev.delayed_tasks > 0 ? (
                      <Badge variant="destructive">{dev.delayed_tasks}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {dev.tasks_blocked > 0 ? (
                      <Badge variant="outline" className="border-orange-500 text-orange-700">
                        {dev.tasks_blocked}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className={`font-bold text-2xl px-3 py-1 rounded ${getScoreColor(dev.performance_score_7d || 0)}`}>
                      {Math.round(dev.performance_score_7d || 0)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {dev.last_progress_update
                        ? new Date(dev.last_progress_update).toLocaleDateString("pt-BR")
                        : "N/A"}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tarefas Atrasadas por DEV */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Tarefas Atrasadas ({delayedTasks.length})</CardTitle>
          <CardDescription>Visão consolidada de atrasos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Desenvolvedor</TableHead>
                <TableHead>Tarefa</TableHead>
                <TableHead>Repositório</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Atraso</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {delayedTasks.map((task: any) => (
                <TableRow key={task.task_id}>
                  <TableCell className="font-medium">{task.dev_name}</TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium truncate">{task.task_title}</div>
                      <Badge variant="outline" className="mt-1">
                        {task.priority}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{task.repository_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={task.progress_percentage} className="w-20" />
                      <span className="text-sm font-medium">{task.progress_percentage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive">{task.delay_days} dias</Badge>
                  </TableCell>
                  <TableCell>
                    {task.is_blocked ? (
                      <Badge variant="outline" className="border-orange-500 text-orange-700">
                        Bloqueada
                      </Badge>
                    ) : (
                      <Badge>{task.status}</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
