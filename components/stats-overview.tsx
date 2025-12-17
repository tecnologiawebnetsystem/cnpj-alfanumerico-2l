"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileCode, Database, Clock, AlertCircle } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase"

export function StatsOverview() {
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    totalFindings: 0,
    totalHours: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      const supabase = getSupabaseBrowserClient()

      if (!supabase) {
        setStats({
          totalAnalyses: 12,
          totalFindings: 847,
          totalHours: 156.5,
        })
        return
      }

      const { count: analysesCount } = await supabase.from("analyses").select("*", { count: "exact", head: true })

      const { count: findingsCount } = await supabase.from("findings").select("*", { count: "exact", head: true })

      const { data: analyses } = await supabase.from("analyses").select("estimated_hours")

      const totalHours = analyses?.reduce((sum, a) => sum + (a.estimated_hours || 0), 0) || 0

      setStats({
        totalAnalyses: analysesCount || 0,
        totalFindings: findingsCount || 0,
        totalHours: Math.round(totalHours * 10) / 10,
      })
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Estatísticas Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileCode className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalAnalyses}</p>
              <p className="text-xs text-muted-foreground">Análises realizadas</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
              <Database className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalFindings}</p>
              <p className="text-xs text-muted-foreground">Campos identificados</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
              <Clock className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalHours}h</p>
              <p className="text-xs text-muted-foreground">Tempo estimado total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">Prazo Importante</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-orange-800 dark:text-orange-200">
            A mudança para CNPJ alfanumérico entra em vigor em <strong>julho de 2026</strong>. Prepare seu sistema com
            antecedência.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
