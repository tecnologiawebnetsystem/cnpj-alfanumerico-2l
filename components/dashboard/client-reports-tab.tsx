"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Download,
  BarChart3,
  CheckSquare,
  Users,
  FileBarChart,
  GitCompare,
  Clock,
  Activity,
} from "lucide-react"
import { AnalyticsDashboard } from "@/components/reports/analytics-dashboard"
import { ComparisonView } from "@/components/reports/comparison-view"
import { ScheduledReportsManager } from "@/components/reports/scheduled-reports-manager"

interface ClientReportsTabProps {
  clientId: string
}

export function ClientReportsTab({ clientId }: ClientReportsTabProps) {
  const [reportType, setReportType] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterDev, setFilterDev] = useState<string>("all")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("quick")

  const generateReport = async () => {
    if (!reportType) {
      alert("Selecione o tipo de relatório")
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        client_id: clientId,
        type: reportType,
        status: filterStatus,
        dev: filterDev,
      })

      const response = await fetch(`/api/reports/generate?${params}`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `relatorio-${reportType}-${new Date().toISOString().split("T")[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert("Erro ao gerar relatório")
      }
    } catch (error) {
      console.error("[v0] Error generating report:", error)
      alert("Erro ao gerar relatório")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quick" className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4" />
            Relatórios Rápidos
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dashboard Visual
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <GitCompare className="h-4 w-4" />
            Comparação
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Agendados
          </TabsTrigger>
        </TabsList>

        {/* Analytics Dashboard tab */}
        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsDashboard clientId={clientId} />
        </TabsContent>

        {/* Comparison tab */}
        <TabsContent value="comparison" className="space-y-4">
          <ComparisonView clientId={clientId} />
        </TabsContent>

        {/* Scheduled Reports tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <ScheduledReportsManager clientId={clientId} />
        </TabsContent>

        <TabsContent value="quick" className="space-y-6">
          {/* Quick report cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setReportType("analyses")
                setFilterStatus("completed")
              }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-200/50">
                  <FileBarChart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">Análises Concluídas</p>
                  <Button variant="link" className="p-0 h-auto text-blue-900 font-bold">
                    Gerar Relatório
                  </Button>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setReportType("tasks-by-repo")
              }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-200/50">
                  <CheckSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700">Tarefas por Repositório</p>
                  <Button variant="link" className="p-0 h-auto text-purple-900 font-bold">
                    Gerar Relatório
                  </Button>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setReportType("tasks-by-status")
              }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-200/50">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Tarefas por Status</p>
                  <Button variant="link" className="p-0 h-auto text-green-900 font-bold">
                    Gerar Relatório
                  </Button>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setReportType("tasks-by-dev")
              }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-200/50">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-700">Tarefas por Desenvolvedor</p>
                  <Button variant="link" className="p-0 h-auto text-orange-900 font-bold">
                    Gerar Relatório
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Custom report generator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Gerar Relatório Personalizado
              </CardTitle>
              <CardDescription>Configure filtros e gere relatórios detalhados em PDF</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="report-type">Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Selecione o tipo de relatório" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analyses">Análises Concluídas</SelectItem>
                    <SelectItem value="tasks-by-repo">Tarefas por Repositório</SelectItem>
                    <SelectItem value="tasks-by-status">Tarefas por Status</SelectItem>
                    <SelectItem value="tasks-by-dev">Tarefas por Desenvolvedor</SelectItem>
                    <SelectItem value="general">Relatório Geral (Completo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="filter-status">Filtrar por Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger id="filter-status">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in_progress">Em Desenvolvimento</SelectItem>
                      <SelectItem value="completed">Finalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="filter-dev">Filtrar por Desenvolvedor</Label>
                  <Select value={filterDev} onValueChange={setFilterDev}>
                    <SelectTrigger id="filter-dev">
                      <SelectValue placeholder="Todos os desenvolvedores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os desenvolvedores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={generateReport} disabled={loading || !reportType} className="w-full">
                  {loading ? (
                    <>Gerando Relatório...</>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Gerar e Baixar Relatório PDF
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Relatório Geral</strong> inclui: estatísticas completas de análises, tarefas agrupadas por
                  status e desenvolvedor, lista detalhada de repositórios conectados e resumo executivo do projeto CNPJ
                  Alfanumérico com gráficos e métricas.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
