import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, RefreshCw } from "lucide-react"
import Link from "next/link"

interface Analysis {
  id: string
  repository_name: string
  language: string
  status: string
  created_at: string
  completed_at: string | null
}

export function AnalysisHeader({ analysis }: { analysis: Analysis }) {
  const statusColors = {
    completed: "bg-green-500",
    processing: "bg-yellow-500",
    failed: "bg-red-500",
    pending: "bg-gray-500",
  }

  const statusLabels = {
    completed: "Concluída",
    processing: "Processando",
    failed: "Falhou",
    pending: "Pendente",
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{analysis.repository_name}</h1>
                <Badge variant="secondary">{analysis.language}</Badge>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${statusColors[analysis.status as keyof typeof statusColors]}`}
                  />
                  <span className="text-sm text-muted-foreground">
                    {statusLabels[analysis.status as keyof typeof statusLabels]}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Análise iniciada em {new Date(analysis.created_at).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reanalisar
            </Button>
            <Button size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
