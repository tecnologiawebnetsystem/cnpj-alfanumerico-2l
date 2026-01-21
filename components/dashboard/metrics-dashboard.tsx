"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  FileCode, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  GitBranch,
  Users,
  Activity,
  Target,
  Loader2,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface MetricsDashboardProps {
  clientId: string
}

interface Metrics {
  totalRepositories: number
  analyzedRepositories: number
  totalFindings: number
  resolvedFindings: number
  pendingTasks: number
  completedTasks: number
  criticalIssues: number
  developersAssigned: number
  avgResolutionTime: number
  weeklyProgress: { week: string; resolved: number; found: number }[]
  findingsByType: { type: string; count: number }[]
  tasksByStatus: { status: string; count: number }[]
  tasksByPriority: { priority: string; count: number }[]
  recentActivity: { date: string; analyses: number; tasks: number }[]
}

const COLORS = {
  primary: "#0052CC",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  muted: "#94a3b8"
}

const PIE_COLORS = [COLORS.success, COLORS.primary, COLORS.warning, COLORS.danger]

export function MetricsDashboard({ clientId }: MetricsDashboardProps) {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin-client/metrics?client_id=${clientId}`)
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error("Error fetching metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [clientId])

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#0052CC]" />
      </div>
    )
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Erro ao carregar metricas
        </CardContent>
      </Card>
    )
  }

  const resolutionRate = metrics.totalFindings > 0 
    ? Math.round((metrics.resolvedFindings / metrics.totalFindings) * 100) 
    : 0
  
  const taskCompletionRate = (metrics.pendingTasks + metrics.completedTasks) > 0
    ? Math.round((metrics.completedTasks / (metrics.pendingTasks + metrics.completedTasks)) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard de Metricas</h2>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Ultima atualizacao: {lastUpdated.toLocaleTimeString("pt-BR")}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resolucao</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolutionRate}%</div>
            <Progress value={resolutionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.resolvedFindings} de {metrics.totalFindings} findings resolvidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Concluidas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskCompletionRate}%</div>
            <Progress value={taskCompletionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.completedTasks} de {metrics.pendingTasks + metrics.completedTasks} tarefas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Issues Criticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.criticalIssues}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Requerem atencao imediata
            </p>
            {metrics.criticalIssues > 0 && (
              <Badge variant="destructive" className="mt-2">
                Alta Prioridade
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo Medio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResolutionTime}h</div>
            <p className="text-xs text-muted-foreground mt-2">
              Tempo medio de resolucao
            </p>
            {metrics.avgResolutionTime < 24 && (
              <Badge className="mt-2 bg-green-100 text-green-700">
                <TrendingDown className="h-3 w-3 mr-1" />
                Bom desempenho
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Repositorios</p>
                <p className="text-2xl font-bold text-blue-900">
                  {metrics.analyzedRepositories}/{metrics.totalRepositories}
                </p>
              </div>
              <GitBranch className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Total Findings</p>
                <p className="text-2xl font-bold text-purple-900">{metrics.totalFindings}</p>
              </div>
              <FileCode className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Desenvolvedores</p>
                <p className="text-2xl font-bold text-green-900">{metrics.developersAssigned}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Tarefas Pendentes</p>
                <p className="text-2xl font-bold text-orange-900">{metrics.pendingTasks}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress">Progresso Semanal</TabsTrigger>
          <TabsTrigger value="distribution">Distribuicao</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Evolucao Semanal</CardTitle>
              <CardDescription>Comparativo de findings encontrados vs resolvidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="found" 
                      name="Encontrados" 
                      stroke={COLORS.warning} 
                      fill={COLORS.warning}
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="resolved" 
                      name="Resolvidos" 
                      stroke={COLORS.success} 
                      fill={COLORS.success}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Findings por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.findingsByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="type"
                        label={({ type, count }) => `${type}: ${count}`}
                      >
                        {metrics.findingsByType.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tarefas por Prioridade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.tasksByPriority} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="priority" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="count" name="Quantidade">
                        {metrics.tasksByPriority.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.priority === "critical" ? COLORS.danger :
                              entry.priority === "high" ? COLORS.warning :
                              entry.priority === "medium" ? COLORS.info :
                              COLORS.muted
                            } 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Status das Tarefas</CardTitle>
              <CardDescription>Distribuicao atual das tarefas por status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.tasksByStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Quantidade" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
