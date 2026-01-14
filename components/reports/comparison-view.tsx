"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, CheckCircle2, AlertCircle } from "lucide-react"

interface ComparisonViewProps {
  clientId: string
}

export function ComparisonView({ clientId }: ComparisonViewProps) {
  const [analyses, setAnalyses] = useState<any[]>([])
  const [baseAnalysisId, setBaseAnalysisId] = useState<string>("")
  const [compareAnalysisId, setCompareAnalysisId] = useState<string>("")
  const [comparison, setComparison] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAnalyses()
  }, [clientId])

  const loadAnalyses = async () => {
    try {
      const response = await fetch(`/api/analyses?client_id=${clientId}&status=completed`)
      if (response.ok) {
        const data = await response.json()
        setAnalyses(data.analyses || [])
      }
    } catch (error) {
      console.error(" Error loading analyses:", error)
    }
  }

  const loadComparison = async () => {
    if (!baseAnalysisId || !compareAnalysisId) {
      alert("Selecione duas análises para comparar")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/reports/comparison?base=${baseAnalysisId}&compare=${compareAnalysisId}`)
      if (response.ok) {
        const data = await response.json()
        setComparison(data)
      }
    } catch (error) {
      console.error(" Error loading comparison:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Análises</CardTitle>
          <CardDescription>Compare duas análises para ver a evolução e progresso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Análise Base (Anterior)</label>
              <Select value={baseAnalysisId} onValueChange={setBaseAnalysisId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione análise base" />
                </SelectTrigger>
                <SelectContent>
                  {analyses.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {new Date(a.created_at).toLocaleDateString()} -{" "}
                      {a.name || `${a.total_repositories || 0} repositórios`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Análise para Comparar (Atual)</label>
              <Select value={compareAnalysisId} onValueChange={setCompareAnalysisId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione análise" />
                </SelectTrigger>
                <SelectContent>
                  {analyses.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {new Date(a.created_at).toLocaleDateString()} -{" "}
                      {a.name || `${a.total_repositories || 0} repositórios`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={loadComparison}
            disabled={loading || !baseAnalysisId || !compareAnalysisId}
            className="w-full"
          >
            {loading ? "Comparando..." : "Comparar Análises"}
          </Button>
        </CardContent>
      </Card>

      {comparison && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Comparação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{comparison.resolved || 0}</div>
                  <div className="text-sm text-green-700">Ocorrências Resolvidas</div>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{comparison.new || 0}</div>
                  <div className="text-sm text-red-700">Novas Ocorrências</div>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <TrendingDown className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{comparison.improvement || 0}%</div>
                  <div className="text-sm text-blue-700">Melhoria Geral</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Changes */}
          <Card>
            <CardHeader>
              <CardTitle>Mudanças Detalhadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comparison.changes?.map((change: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{change.repository}</div>
                      <div className="text-sm text-muted-foreground">{change.file}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={change.status === "resolved" ? "default" : "destructive"}>
                        {change.status === "resolved" ? "Resolvido" : "Novo"}
                      </Badge>
                      {change.status === "resolved" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                      {change.status === "new" && <AlertCircle className="h-5 w-5 text-red-600" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
