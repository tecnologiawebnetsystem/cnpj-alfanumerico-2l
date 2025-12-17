"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [jobStats, setJobStats] = useState<any[]>([])
  const [problematicAnalyses, setProblematicAnalyses] = useState<any[]>([])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000) // Atualizar a cada 5 segundos
    return () => clearInterval(interval)
  }, [])

  async function loadData() {
    const metricsRes = await fetch("/api/monitoring/metrics")
    if (metricsRes.ok) {
      const data = await metricsRes.json()
      setMetrics(data.metrics || [])
    }

    const alertsRes = await fetch("/api/monitoring/alerts")
    if (alertsRes.ok) {
      const data = await alertsRes.json()
      setAlerts(data.alerts || [])
    }

    const jobStatsRes = await fetch("/api/monitoring/job-stats")
    if (jobStatsRes.ok) {
      const data = await jobStatsRes.json()
      setJobStats(data.stats || [])
    }

    const analysesRes = await fetch("/api/monitoring/problematic-analyses")
    if (analysesRes.ok) {
      const data = await analysesRes.json()
      setProblematicAnalyses(data.analyses || [])
    }
  }

  async function acknowledgeAlert(alertId: string) {
    await fetch(`/api/monitoring/alerts/${alertId}/acknowledge`, {
      method: "POST",
    })
    loadData()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Monitoramento do Sistema</h1>
        <Badge variant="outline">Atualização em tempo real</Badge>
      </div>

      {/* Alertas ativos */}
      {alerts.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50">
          <h2 className="text-lg font-semibold mb-4">
            Alertas Ativos ({alerts.length})
          </h2>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start justify-between p-3 bg-white rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={
                        alert.severity === "critical"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {alert.severity}
                    </Badge>
                    <span className="font-medium">{alert.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {alert.message}
                  </p>
                  {alert.suggested_action && (
                    <p className="text-sm text-blue-600 mt-1">
                      Ação sugerida: {alert.suggested_action}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => acknowledgeAlert(alert.id)}
                >
                  Reconhecer
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Tabs defaultValue="metrics">
        <TabsList>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="analyses">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index} className="p-4">
                <div className="text-sm text-muted-foreground mb-1">
                  {metric.metric_name}
                </div>
                <div className="text-2xl font-bold">
                  {metric.avg_value.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Min: {metric.min_value.toFixed(2)} | Max:{" "}
                  {metric.max_value.toFixed(2)}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobStats.map((stat, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{stat.job_type}</span>
                  <Badge>{stat.status}</Badge>
                </div>
                <div className="text-3xl font-bold">{stat.count}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  Tentativas médias: {stat.avg_attempts?.toFixed(1) || 0}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analyses" className="space-y-4">
          {problematicAnalyses.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Nenhuma análise problemática encontrada
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {problematicAnalyses.map((analysis) => (
                <Card key={analysis.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge>{analysis.status}</Badge>
                        <span className="font-medium">{analysis.id}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Cliente: {analysis.client_name} | Usuário:{" "}
                        {analysis.user_name}
                      </div>
                      <div className="text-sm mt-1">
                        Duração: {Math.round(analysis.duration_seconds / 60)}{" "}
                        minutos | Findings: {analysis.findings_count}
                      </div>
                      {analysis.error_message && (
                        <div className="text-sm text-red-600 mt-1">
                          Erro: {analysis.error_message}
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/analysis/${analysis.id}`}>Ver detalhes</a>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
