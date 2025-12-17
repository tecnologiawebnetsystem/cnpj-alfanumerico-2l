"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, LineChart, PieChart, TrendingUp, Download, Calendar } from 'lucide-react'
import { AnalysesChart } from "./analyses-chart"
import { TasksChart } from "./tasks-chart"
import { PerformanceChart } from "./performance-chart"
import { ClientsChart } from "./clients-chart"

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState("30d")
  const [loading, setLoading] = useState(false)

  const handleExport = async (format: "pdf" | "excel") => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/export?format=${format}&period=${period}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analytics-${period}.${format === "pdf" ? "pdf" : "csv"}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Métricas e insights sobre o uso do sistema</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => handleExport("excel")} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analyses">Análises</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Total de Análises</h3>
                <BarChart className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold">1,234</div>
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% vs período anterior
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Tarefas Concluídas</h3>
                <LineChart className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold">856</div>
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +8% vs período anterior
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Tempo Médio</h3>
                <PieChart className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-3xl font-bold">4.2h</div>
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 rotate-180" />
                -5% vs período anterior
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Clientes Ativos</h3>
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-3xl font-bold">42</div>
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +3 novos este mês
              </p>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <AnalysesChart period={period} />
            <TasksChart period={period} />
          </div>
        </TabsContent>

        <TabsContent value="analyses">
          <AnalysesChart period={period} detailed />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksChart period={period} detailed />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceChart period={period} />
        </TabsContent>

        <TabsContent value="clients">
          <ClientsChart period={period} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
