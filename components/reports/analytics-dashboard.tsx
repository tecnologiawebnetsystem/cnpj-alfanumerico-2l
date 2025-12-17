"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown, Download, Filter, Calendar } from "lucide-react"

interface AnalyticsDashboardProps {
  clientId: string
}

export function AnalyticsDashboard({ clientId }: AnalyticsDashboardProps) {
  const [period, setPeriod] = useState("30")
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [clientId, period, selectedProject])

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        client_id: clientId,
        period,
        project: selectedProject,
      })

      const response = await fetch(`/api/reports/analytics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error("[v0] Error loading metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

  if (loading) {
    return <div className="p-8 text-center">Carregando métricas...</div>
  }

  if (!metrics) {
    return <div className="p-8 text-center">Nenhuma métrica disponível</div>
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Período</label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Projeto</label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os projetos</SelectItem>
              {metrics.projects?.map((p: any) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={loadMetrics}>
          <Filter className="h-4 w-4 mr-2" />
          Aplicar Filtros
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Análises</CardDescription>
            <CardTitle className="text-3xl">{metrics.totalAnalyses || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+{metrics.analysesGrowth || 0}%</span>
              <span className="text-muted-foreground ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ocorrências Encontradas</CardDescription>
            <CardTitle className="text-3xl">{metrics.totalFindings || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-500">-{metrics.findingsReduction || 0}%</span>
              <span className="text-muted-foreground ml-1">resolvidas</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tarefas Criadas</CardDescription>
            <CardTitle className="text-3xl">{metrics.totalTasks || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <span className="text-blue-500 font-medium">{metrics.tasksCompleted || 0}</span>
              <span className="text-muted-foreground ml-1">concluídas</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Horas Estimadas</CardDescription>
            <CardTitle className="text-3xl">{metrics.totalHours || 0}h</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 text-purple-500 mr-1" />
              <span className="text-purple-500">{metrics.estimatedDays || 0} dias</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Evolution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Temporal</CardTitle>
            <CardDescription>Ocorrências ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.evolution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="findings" stroke="#8b5cf6" name="Ocorrências" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" name="Resolvidas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Projects Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Projeto</CardTitle>
            <CardDescription>Ocorrências por projeto</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.projectsDistribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {(metrics.projectsDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 10 Repositories */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Top 10 Repositórios com Mais Ocorrências</CardTitle>
            <CardDescription>Repositórios que precisam de mais atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.topRepositories || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="findings" fill="#3b82f6" name="Ocorrências" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={() => window.print()}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Dashboard
        </Button>
      </div>
    </div>
  )
}
