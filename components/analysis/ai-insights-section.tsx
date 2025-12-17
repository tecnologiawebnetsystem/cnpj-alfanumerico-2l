"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Zap, TrendingUp } from "lucide-react"

interface AIInsight {
  summary: string
  severity: "critical" | "high" | "medium" | "low"
  recommendation: string
  estimated_effort: number
  business_impact: string
  technical_solution: string
}

interface AIInsightsSectionProps {
  finding: any
  onAnalysisComplete?: (insight: AIInsight) => void
}

const severityColors = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  low: "bg-green-100 text-green-800 border-green-300",
}

export function AIInsightsSection({ finding, onAnalysisComplete }: AIInsightsSectionProps) {
  const [insight, setInsight] = useState<AIInsight | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function analyzeWithAI() {
      try {
        setLoading(true)
        const response = await fetch("/api/ai/analyze-cnpj", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ finding }),
        })

        if (!response.ok) throw new Error("Failed to analyze with Gemini")

        const data = await response.json()
        setInsight(data.analysis)
        onAnalysisComplete?.(data.analysis)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error analyzing")
      } finally {
        setLoading(false)
      }
    }

    if (finding) {
      analyzeWithAI()
    }
  }, [finding, onAnalysisComplete])

  if (loading) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Análise com IA Gemini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-blue-200 rounded w-3/4"></div>
            <div className="h-4 bg-blue-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !insight) {
    return null
  }

  return (
    <Card className={`border-l-4 ${severityColors[insight.severity]}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Análise Inteligente (Gemini)
          </CardTitle>
          <Badge className={severityColors[insight.severity]}>{insight.severity.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-1">Resumo</h4>
          <p className="text-sm text-gray-700">{insight.summary}</p>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Impacto no Negócio
          </h4>
          <p className="text-sm text-gray-700">{insight.business_impact}</p>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-1">Solução Técnica</h4>
          <p className="text-sm text-gray-700">{insight.technical_solution}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{insight.estimated_effort}</div>
            <div className="text-xs text-gray-600">Horas Estimadas</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">{insight.severity}</div>
            <div className="text-xs text-gray-600">Severidade</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold">Recomendação</div>
            <div className="text-xs text-gray-600">Verificar</div>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <p className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Próximo Passo
          </p>
          <p className="text-sm text-blue-800">{insight.recommendation}</p>
        </div>
      </CardContent>
    </Card>
  )
}
