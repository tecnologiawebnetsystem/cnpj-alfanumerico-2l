"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileCode, Download, Eye, FileJson, FileSpreadsheet, FileText, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function AnalysesSection() {
  // Mock data - will be replaced with real data from Supabase
  const analyses = [
    {
      id: "1",
      repository_name: "sistema-contabil-v2",
      status: "completed",
      language: "Java",
      cnpj_occurrences: 45,
      database_fields: 12,
      estimated_hours: 18.5,
      created_at: "2025-01-27T08:00:00Z",
      completed_at: "2025-01-27T08:15:00Z",
    },
    {
      id: "2",
      repository_name: "portal-seguros",
      status: "completed",
      language: "C#",
      cnpj_occurrences: 67,
      database_fields: 8,
      estimated_hours: 24.0,
      created_at: "2025-01-26T14:30:00Z",
      completed_at: "2025-01-26T14:48:00Z",
    },
    {
      id: "3",
      repository_name: "api-capitalizacao",
      status: "processing",
      language: "TypeScript",
      cnpj_occurrences: 0,
      database_fields: 0,
      estimated_hours: 0,
      created_at: "2025-01-27T10:00:00Z",
      completed_at: null,
    },
  ]

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      completed: { variant: "default", label: "Concluída" },
      processing: { variant: "secondary", label: "Processando" },
      pending: { variant: "secondary", label: "Pendente" },
      failed: { variant: "destructive", label: "Falhou" },
    }
    const config = variants[status] || variants.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const downloadReport = (analysisId: string, format: string) => {
    // In production, this would call the API
    console.log(` Downloading ${format} report for analysis ${analysisId}`)
    // window.open(`/api/v1/reports/${analysisId}?format=${format}`, '_blank')
  }

  const handleDeleteAnalysis = async (analysisId: string) => {
    console.log(" Delete button clicked for analysis:", analysisId)
    setAnalysisToDelete(analysisId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!analysisToDelete) return

    try {
      console.log(" Deleting analysis:", analysisToDelete)
      setDeleting(true)

      const response = await fetch(`/api/analyses/${analysisToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao excluir análise")
      }

      console.log(" Analysis deleted successfully")
      setDeleteDialogOpen(false)
      setAnalysisToDelete(null)

      // Refresh the page to reload analyses
      window.location.reload()
    } catch (error) {
      console.error(" Error deleting analysis:", error)
      alert("Erro ao excluir análise. Tente novamente.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Análises Recentes</h2>
            <p className="text-sm text-muted-foreground">Histórico de análises de repositórios</p>
          </div>
          <Link href="/analyzer">
            <Button>
              <FileCode className="h-4 w-4 mr-2" />
              Nova Análise
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {analyses.map((analysis) => (
            <Card key={analysis.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{analysis.repository_name}</h3>
                    {getStatusBadge(analysis.status)}
                    {analysis.language && (
                      <Badge variant="outline" className="text-xs">
                        {analysis.language}
                      </Badge>
                    )}
                  </div>

                  {analysis.status === "completed" && (
                    <div className="grid grid-cols-3 gap-4 mb-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Ocorrências CNPJ:</span>
                        <span className="ml-2 font-semibold">{analysis.cnpj_occurrences}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Campos BD:</span>
                        <span className="ml-2 font-semibold">{analysis.database_fields}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Estimativa:</span>
                        <span className="ml-2 font-semibold">{analysis.estimated_hours}h</span>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    Criada em: {new Date(analysis.created_at).toLocaleString("pt-BR")}
                    {analysis.completed_at &&
                      ` • Concluída em: ${new Date(analysis.completed_at).toLocaleString("pt-BR")}`}
                  </div>
                </div>

                <div className="flex gap-2">
                  {analysis.status === "completed" && (
                    <>
                      <Link href={`/analysis/${analysis.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Relatório
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => downloadReport(analysis.id, "json")}>
                            <FileJson className="h-4 w-4 mr-2" />
                            JSON
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadReport(analysis.id, "pdf")}>
                            <FileText className="h-4 w-4 mr-2" />
                            PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadReport(analysis.id, "excel")}>
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Excel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAnalysis(analysis.id)}
                        disabled={deleting}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                      >
                        {deleting && analysisToDelete === analysis.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir Análise"
        description="Tem certeza que deseja excluir esta análise? Esta ação não pode ser desfeita e removerá todos os dados relacionados (tarefas, findings, etc.)."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  )
}
