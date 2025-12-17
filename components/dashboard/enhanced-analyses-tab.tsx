"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PremiumGrid } from "@/components/analysis/premium-grid"
import { Search, GitBranch, FileBarChart, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase"

interface Analysis {
  id: string
  repository_name: string
  status: string
  progress: number
  created_at: string
  completed_at: string | null
  results?: any
  findings_count?: number
}

export function EnhancedAnalysesTab({ clientId }: { clientId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadAnalyses()

    const interval = setInterval(() => {
      const hasInProgress = analyses.some(
        (a) => a.status === "pending" || a.status === "processing" || a.status === "in_progress",
      )
      if (hasInProgress) {
        loadAnalyses()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [clientId])

  const loadAnalyses = async () => {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) return

      const { data: analysesData, error } = await supabase
        .from("analyses")
        .select("id, repository_id, status, created_at, completed_at, progress, results")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error

      const enrichedAnalyses = await Promise.all(
        analysesData?.map(async (a: any) => {
          const { data: repo } = await supabase.from("repositories").select("name").eq("id", a.repository_id).single()

          const { count: findingsCount } = await supabase
            .from("findings")
            .select("*", { count: "exact", head: true })
            .eq("analysis_id", a.id)

          return {
            id: a.id,
            repository_name: repo?.name || "Repositório desconhecido",
            status: a.status,
            progress: a.progress || 0,
            created_at: a.created_at,
            completed_at: a.completed_at,
            results: a.results,
            findings_count: findingsCount || 0,
          }
        }) || [],
      )

      setAnalyses(enrichedAnalyses)
    } catch (error) {
      console.error("[v0] Error loading analyses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (analysisId: string, format: "csv" | "json" | "pdf") => {
    try {
      setExporting(true)
      const response = await fetch(`/api/reports/${analysisId}/${format}`)

      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `relatorio-${analysisId}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Exportado com sucesso!",
        description: `Relatório em ${format.toUpperCase()} foi baixado.`,
      })
    } catch (error) {
      console.error("[v0] Export error:", error)
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o relatório.",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const filteredAnalyses = analyses.filter((a) => a.repository_name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5" />
                Análises Realizadas
              </CardTitle>
              <CardDescription>
                Total: {analyses.length} | Concluídas: {analyses.filter((a) => a.status === "completed").length}
              </CardDescription>
            </div>
            <Button onClick={() => router.push("/analyzer")} className="gap-2">
              <GitBranch className="h-4 w-4" />
              Nova Análise
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por repositório..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <PremiumGrid
            analyses={filteredAnalyses}
            onExportCsv={(id) => handleExport(id, "csv")}
            onExportJson={(id) => handleExport(id, "json")}
            onExportPdf={(id) => handleExport(id, "pdf")}
          />
        </CardContent>
      </Card>
    </div>
  )
}
