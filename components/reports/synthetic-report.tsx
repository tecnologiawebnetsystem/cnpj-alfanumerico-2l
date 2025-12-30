"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Download, AlertTriangle, CheckCircle2, TrendingUp, FileCode } from "lucide-react"

interface SyntheticReportProps {
  batchId: string
  stats: {
    total_findings: number
    critical: number
    high: number
    medium: number
    low: number
    repositories_analyzed: number
    files_analyzed: number
    lines_analyzed: number
  }
  topIssues: Array<{
    issue_type: string
    count: number
    severity: string
  }>
  repositoryStats: Array<{
    repository_name: string
    findings_count: number
    critical_count: number
  }>
  onExportPDF: () => void
}

export function SyntheticReport({ batchId, stats, topIssues, repositoryStats, onExportPDF }: SyntheticReportProps) {
  const getSeverityPercentage = (count: number) => {
    return stats.total_findings > 0 ? (count / stats.total_findings) * 100 : 0
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Relatório Sintético - Resumo Geral</CardTitle>
            <Button onClick={onExportPDF} variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estatísticas Principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-red-800 mb-1">Total de Problemas</div>
              <div className="text-3xl font-bold text-red-900">{stats.total_findings}</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800 mb-1">Repositórios</div>
              <div className="text-3xl font-bold text-blue-900">{stats.repositories_analyzed}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-800 mb-1">Arquivos Analisados</div>
              <div className="text-3xl font-bold text-purple-900">{stats.files_analyzed}</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-800 mb-1">Linhas de Código</div>
              <div className="text-3xl font-bold text-green-900">{stats.lines_analyzed.toLocaleString()}</div>
            </div>
          </div>

          {/* Distribuição por Severidade */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">Distribuição por Severidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Crítico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-red-600">{stats.critical}</span>
                    <span className="text-sm text-muted-foreground">
                      ({getSeverityPercentage(stats.critical).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <Progress value={getSeverityPercentage(stats.critical)} className="h-3 bg-red-100" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Alto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-orange-600">{stats.high}</span>
                    <span className="text-sm text-muted-foreground">
                      ({getSeverityPercentage(stats.high).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <Progress value={getSeverityPercentage(stats.high)} className="h-3 bg-orange-100" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Médio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-yellow-600">{stats.medium}</span>
                    <span className="text-sm text-muted-foreground">
                      ({getSeverityPercentage(stats.medium).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <Progress value={getSeverityPercentage(stats.medium)} className="h-3 bg-yellow-100" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Baixo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">{stats.low}</span>
                    <span className="text-sm text-muted-foreground">
                      ({getSeverityPercentage(stats.low).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <Progress value={getSeverityPercentage(stats.low)} className="h-3 bg-green-100" />
              </div>
            </CardContent>
          </Card>

          {/* Top Problemas */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top 10 Problemas Mais Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topIssues.slice(0, 10).map((issue, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                      <div>
                        <code className="text-sm font-medium">{issue.issue_type}</code>
                        <div className="text-xs text-muted-foreground mt-1">Severidade: {issue.severity}</div>
                      </div>
                    </div>
                    <Badge variant="destructive" className="text-lg px-3 py-1">
                      {issue.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas por Repositório */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Problemas por Repositório
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {repositoryStats.map((repo, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{repo.repository_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {repo.critical_count > 0 && (
                          <span className="text-red-600 font-semibold">{repo.critical_count} críticos</span>
                        )}
                      </div>
                    </div>
                    <Badge variant={repo.findings_count > 10 ? "destructive" : "outline"} className="text-lg px-3 py-1">
                      {repo.findings_count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
