"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, BarChart3, Loader2 } from "lucide-react"
import { AnalyticalReport } from "@/components/reports/analytical-report"
import { SyntheticReport } from "@/components/reports/synthetic-report"
import { useToast } from "@/hooks/use-toast"

export default function ReportPage() {
  const params = useParams()
  const batchId = params.id as string
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchReportData()
  }, [batchId])

  const fetchReportData = async () => {
    try {
      const res = await fetch(`/api/analysis/${batchId}/report`)
      const data = await res.json()
      setReportData(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar relatório",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    toast({
      title: "Exportando...",
      description: "Gerando PDF do relatório",
    })

    try {
      const res = await fetch(`/api/analysis/${batchId}/export-pdf`, {
        method: "POST",
      })
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `relatorio-${batchId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Sucesso",
        description: "PDF exportado com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar PDF",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Erro ao carregar relatório</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Relatório de Análise</h1>

        <Tabs defaultValue="analytical" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="analytical" className="gap-2">
              <FileText className="h-4 w-4" />
              Analítico (Detalhado)
            </TabsTrigger>
            <TabsTrigger value="synthetic" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Sintético (Resumo)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytical">
            <AnalyticalReport batchId={batchId} findings={reportData.findings || []} onExportPDF={handleExportPDF} />
          </TabsContent>

          <TabsContent value="synthetic">
            <SyntheticReport
              batchId={batchId}
              stats={reportData.stats || {}}
              topIssues={reportData.topIssues || []}
              repositoryStats={reportData.repositoryStats || []}
              onExportPDF={handleExportPDF}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
