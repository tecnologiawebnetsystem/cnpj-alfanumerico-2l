"use client"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, FileCode, AlertTriangle, Eye, Download, Loader2 } from "lucide-react"
import Link from "next/link"

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

interface PremiumGridProps {
  analyses: Analysis[]
  onExportPdf?: (id: string) => void
  onExportCsv?: (id: string) => void
  onExportJson?: (id: string) => void
}

export function PremiumGrid({ analyses, onExportPdf, onExportCsv, onExportJson }: PremiumGridProps) {
  const getStatusInfo = (status: string, progress: number) => {
    if (status === "completed" || progress >= 99) {
      return {
        label: "Concluída",
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "bg-green-500/10 text-green-600 border-green-500/20",
      }
    }
    if (status === "failed" || status === "error") {
      return {
        label: "Erro",
        icon: <XCircle className="h-4 w-4" />,
        color: "bg-red-500/10 text-red-600 border-red-500/20",
      }
    }
    return {
      label: `${progress}%`,
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    }
  }

  return (
    <div className="space-y-4">
      {analyses.length === 0 ? (
        <Card className="p-12 text-center">
          <FileCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhuma análise realizada ainda</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {analyses.map((analysis) => {
            const statusInfo = getStatusInfo(analysis.status, analysis.progress)
            const totalFiles = analysis.results?.summary?.total_files || 0
            const totalFindings = analysis.findings_count || 0

            return (
              <Card
                key={analysis.id}
                className="overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-primary"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{analysis.repository_name}</h3>
                      <Badge className={statusInfo.color}>
                        {statusInfo.icon}
                        <span className="ml-2">{statusInfo.label}</span>
                      </Badge>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {new Date(analysis.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-primary">{totalFiles}</div>
                      <div className="text-xs text-muted-foreground">Arquivos</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-pink-600">{totalFindings}</div>
                      <div className="text-xs text-muted-foreground">Ocorrências</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-600">{analysis.progress}%</div>
                      <div className="text-xs text-muted-foreground">Progresso</div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Link href={`/analysis/${analysis.id}`} className="flex-1">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full gap-2"
                        disabled={analysis.status !== "completed" && analysis.progress < 99}
                      >
                        <Eye className="h-4 w-4" />
                        Detalhes
                      </Button>
                    </Link>
                    {analysis.status === "completed" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onExportCsv?.(analysis.id)}
                          title="Exportar CSV"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onExportJson?.(analysis.id)}
                          title="Exportar JSON"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
