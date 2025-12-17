import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileCode, Database, AlertTriangle, CheckCircle } from "lucide-react"

interface Analysis {
  total_files: number
  files_with_cnpj: number
  status: string
}

export function AnalysisSummary({
  analysis,
  findingsCount,
  dbFindingsCount,
}: {
  analysis: Analysis
  findingsCount: number
  dbFindingsCount: number
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Arquivos Analisados</CardTitle>
          <FileCode className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analysis.total_files}</div>
          <p className="text-xs text-muted-foreground">Total de arquivos processados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Ocorrências no Código</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{findingsCount}</div>
          <p className="text-xs text-muted-foreground">Campos CNPJ encontrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Campos de Banco</CardTitle>
          <Database className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dbFindingsCount}</div>
          <p className="text-xs text-muted-foreground">Colunas que precisam alteração</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analysis.status === "completed" ? "100%" : "..."}</div>
          <p className="text-xs text-muted-foreground">Análise completa</p>
        </CardContent>
      </Card>
    </div>
  )
}
