"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, TrendingUp, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface SmartPriorityViewProps {
  analysisId: string
  findings: any[]
}

export function SmartPriorityView({ analysisId, findings }: SmartPriorityViewProps) {
  const [loading, setLoading] = useState(false)
  const [priorities, setPriorities] = useState<any[]>([])

  const calculatePriorities = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/ai/prioritize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ findings }),
      })

      if (!response.ok) throw new Error("Failed to prioritize")

      const data = await response.json()
      setPriorities(data.priorities)
      toast.success("Priorização inteligente calculada!")
    } catch (error) {
      toast.error("Erro ao calcular prioridades")
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (level: string) => {
    switch (level) {
      case "urgent":
        return "bg-red-500/10 text-red-700 border-red-500/20"
      case "high":
        return "bg-orange-500/10 text-orange-700 border-orange-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
      default:
        return "bg-blue-500/10 text-blue-700 border-blue-500/20"
    }
  }

  return (
    <Card className="border-[#0052CC]/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-[#0052CC]">
              <TrendingUp className="h-5 w-5" />
              Priorização Inteligente IA
            </CardTitle>
            <CardDescription>Gemini analisa e prioriza correções automaticamente</CardDescription>
          </div>
          <Button
            onClick={calculatePriorities}
            disabled={loading}
            size="sm"
            className="bg-[#0052CC] hover:bg-[#0052CC]/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Calcular Prioridades
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {priorities.length > 0 && (
        <CardContent className="space-y-3">
          {priorities.slice(0, 10).map((priority, idx) => {
            const finding = findings[Number.parseInt(priority.finding_id)]
            return (
              <div key={idx} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-[#0052CC] text-white">#{priority.order}</Badge>
                    <div>
                      <p className="font-semibold text-sm">{finding?.file_path?.split("/").pop()}</p>
                      <p className="text-xs text-muted-foreground font-mono">{finding?.field_name}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getPriorityColor(priority.priority_level)}>
                    {priority.priority_level}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">{priority.reason}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {priority.estimated_hours}h
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Sprint {priority.recommended_sprint}
                  </div>
                  {priority.dependencies.length > 0 && (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {priority.dependencies.length} deps
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      )}
    </Card>
  )
}
