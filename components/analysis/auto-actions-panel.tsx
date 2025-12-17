"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, FileText, ListTodo, Loader2, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AutoActionsPanelProps {
  batchId: string
  analysisStatus: string
  totalFindings: number
}

export function AutoActionsPanel({ batchId, analysisStatus, totalFindings }: AutoActionsPanelProps) {
  const [generatingTasks, setGeneratingTasks] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [tasksCreated, setTasksCreated] = useState<number | null>(null)
  const [reportGenerated, setReportGenerated] = useState(false)

  const handleGenerateTasks = async () => {
    setGeneratingTasks(true)
    try {
      const response = await fetch("/api/analyze/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch_id: batchId }),
      })

      const data = await response.json()

      if (response.ok) {
        setTasksCreated(data.tasks_created)
      } else {
        alert(`Erro ao gerar tarefas: ${data.error}`)
      }
    } catch (error: any) {
      alert(`Erro: ${error.message}`)
    } finally {
      setGeneratingTasks(false)
    }
  }

  const handleGenerateReport = async () => {
    setGeneratingReport(true)
    try {
      const response = await fetch("/api/analyze/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch_id: batchId, format: "json" }),
      })

      const data = await response.json()

      if (response.ok) {
        setReportGenerated(true)

        // Download report as JSON
        const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `analise-${batchId}.json`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        alert(`Erro ao gerar relatório: ${data.error}`)
      }
    } catch (error: any) {
      alert(`Erro: ${error.message}`)
    } finally {
      setGeneratingReport(false)
    }
  }

  if (analysisStatus !== "completed") {
    return null
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="flex items-center gap-3 mb-4">
        <CheckCircle2 className="h-6 w-6 text-green-600" />
        <h3 className="text-lg font-semibold">Análise Concluída!</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        {totalFindings > 0
          ? `Encontramos ${totalFindings} ocorrências de CNPJ. Agora você pode gerar tarefas e relatórios automaticamente.`
          : "Nenhuma ocorrência de CNPJ encontrada nesta análise."}
      </p>

      {totalFindings > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Button
              onClick={handleGenerateTasks}
              disabled={generatingTasks || tasksCreated !== null}
              className="w-full"
              variant="default"
            >
              {generatingTasks ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando tarefas...
                </>
              ) : tasksCreated !== null ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {tasksCreated} Tarefas Criadas
                </>
              ) : (
                <>
                  <ListTodo className="mr-2 h-4 w-4" />
                  Gerar Tarefas
                </>
              )}
            </Button>

            {tasksCreated !== null && (
              <Badge variant="secondary" className="w-full justify-center">
                Tarefas prontas para serem atribuídas
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="w-full bg-transparent"
              variant="outline"
            >
              {generatingReport ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando relatório...
                </>
              ) : reportGenerated ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Relatório Baixado
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </>
              )}
            </Button>

            {reportGenerated && (
              <Badge variant="secondary" className="w-full justify-center">
                <Download className="mr-1 h-3 w-3" />
                Arquivo salvo
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
