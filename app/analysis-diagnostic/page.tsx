"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, XCircle, AlertCircle, FileText, Database } from "lucide-react"

export const dynamic = "force-dynamic"

export default function AnalysisDiagnosticPage() {
  const [loading, setLoading] = useState(false)
  const [diagnostic, setDiagnostic] = useState<any>(null)

  async function runDiagnostic() {
    setLoading(true)
    try {
      // Busca a última análise via API route (sem acesso direto ao banco no browser)
      const analysesRes = await fetch("/api/analyses?limit=1&order=created_at.desc", {
        credentials: "include",
      })
      if (!analysesRes.ok) throw new Error("Falha ao buscar análises")
      const analysesData = await analysesRes.json()
      const analyses = analysesData.data ?? analysesData

      if (!analyses || analyses.length === 0) {
        setDiagnostic({ error: "Nenhuma análise encontrada" })
        setLoading(false)
        return
      }

      const analysis = analyses[0]

      // Buscar findings e tasks em paralelo via API routes
      const [findingsRes, tasksRes, settingsRes] = await Promise.all([
        fetch(`/api/analyses/${analysis.id}/findings`, { credentials: "include" }),
        fetch(`/api/tasks?analysis_id=${analysis.id}`, { credentials: "include" }),
        fetch(`/api/client/settings?keys=cnpj_field_names,file_extensions`, { credentials: "include" }),
      ])

      const findingsData = findingsRes.ok ? await findingsRes.json() : { data: [] }
      const tasksData = tasksRes.ok ? await tasksRes.json() : { data: [] }
      const settingsData = settingsRes.ok ? await settingsRes.json() : { data: [] }

      const findings: any[] = findingsData.data ?? findingsData ?? []
      const tasks: any[] = tasksData.data ?? tasksData ?? []
      const settings: any[] = settingsData.data ?? settingsData ?? []

      const cnpjFieldsRaw = settings?.find((s: any) => s.setting_key === "cnpj_field_names")?.setting_value
      const extensionsRaw = settings?.find((s: any) => s.setting_key === "file_extensions")?.setting_value

      let cnpjFields: string[] = []
      let extensions: string[] = []

      try {
        if (cnpjFieldsRaw) {
          const parsed = JSON.parse(cnpjFieldsRaw)
          cnpjFields = Array.isArray(parsed) ? parsed : parsed.split(",").map((s: string) => s.trim())
        }
      } catch { cnpjFields = [] }

      try {
        if (extensionsRaw) {
          const parsed = JSON.parse(extensionsRaw)
          extensions = Array.isArray(parsed) ? parsed : parsed.split(",").map((s: string) => s.trim())
        }
      } catch { extensions = [] }

      // Agrupar findings por arquivo
      const findingsByFile: Record<string, any[]> = {}
      findings.forEach((f) => {
        if (!findingsByFile[f.file_path]) findingsByFile[f.file_path] = []
        findingsByFile[f.file_path].push(f)
      })

      setDiagnostic({
        analysis: {
          id: analysis.id,
          repository: analysis.repository_name,
          status: analysis.status,
          created_at: analysis.created_at,
          completed_at: analysis.completed_at,
          total_files: analysis.results?.summary?.total_files ?? analysis.total_files,
          files_analyzed: analysis.results?.summary?.files_analyzed,
        },
        settings: { cnpj_fields: cnpjFields, file_extensions: extensions },
        results: {
          total_findings: findings.length,
          total_tasks: tasks.length,
          files_with_findings: Object.keys(findingsByFile).length,
          findings_by_file: findingsByFile,
        },
        sample_findings: findings.slice(0, 5),
      })
    } catch (error) {
      setDiagnostic({ error: error instanceof Error ? error.message : "Erro desconhecido" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { runDiagnostic() }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!diagnostic) return null

  if (diagnostic.error) {
    return (
      <div className="container mx-auto p-8">
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Erro no Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{diagnostic.error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { analysis, settings, results, sample_findings } = diagnostic

  return (
    <div className="container mx-auto space-y-6 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Diagnóstico da Análise</h1>
        <p className="text-muted-foreground">Relatório completo da última análise executada</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações da Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">ID da Análise</p>
              <p className="font-mono text-sm">{analysis.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Repositório</p>
              <p className="font-medium">{analysis.repository}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={analysis.status === "completed" ? "default" : "secondary"}>{analysis.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Arquivos Totais</p>
              <p className="text-2xl font-bold">{analysis.total_files || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configurações Aplicadas
          </CardTitle>
          <CardDescription>Termos CNPJ e extensões de arquivo usadas nesta análise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Termos CNPJ Cadastrados:</p>
            {settings.cnpj_fields.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {settings.cnpj_fields.map((field: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="font-mono">{field}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-destructive">Nenhum termo cadastrado!</p>
            )}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Extensões de Arquivo:</p>
            {settings.file_extensions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {settings.file_extensions.map((ext: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="font-mono">{ext}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma extensão configurada — analisando todos os arquivos</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Resultados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{results.total_findings}</p>
              <p className="text-sm text-muted-foreground">Ocorrências Encontradas</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">{results.files_with_findings}</p>
              <p className="text-sm text-muted-foreground">Arquivos com Ocorrências</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">{results.total_tasks}</p>
              <p className="text-sm text-muted-foreground">Tarefas Criadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.keys(results.findings_by_file).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ocorrências por Arquivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(results.findings_by_file).map(([file, findings]: [string, any]) => (
              <div key={file} className="flex items-center justify-between border-b pb-2">
                <p className="font-mono text-sm">{file}</p>
                <Badge>{findings.length} ocorrências</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {sample_findings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Primeiras 5 Ocorrências</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sample_findings.map((finding: any, idx: number) => (
              <div key={idx} className="space-y-2 rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">{finding.file_path}</p>
                    <p className="text-xs text-muted-foreground">Linha {finding.line_number}</p>
                  </div>
                  <Badge variant="outline">{finding.field_name}</Badge>
                </div>
                <div className="rounded bg-muted p-3">
                  <pre className="text-xs">{finding.context}</pre>
                </div>
                {finding.suggestion && (
                  <p className="text-sm text-green-600">Sugestao: {finding.suggestion}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <AlertCircle className="h-5 w-5" />
            Interpretacao dos Resultados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-blue-900">
          {results.total_findings === 0 && (
            <div className="space-y-2">
              <p className="font-medium">Nenhuma ocorrencia encontrada. Possiveis causas:</p>
              <ul className="ml-6 list-disc space-y-1 text-sm">
                <li>Os termos CNPJ cadastrados nao correspondem aos nomes usados no codigo</li>
                <li>As extensoes de arquivo estao muito restritivas</li>
                <li>O repositorio analisado nao contem os termos esperados</li>
              </ul>
            </div>
          )}
          {results.total_findings > 0 && results.total_findings < 100 && (
            <p className="text-sm">
              Poucas ocorrencias ({results.total_findings}). Considere adicionar mais variações de termos CNPJ nas Configurações.
            </p>
          )}
          {results.total_findings >= 100 && (
            <p className="text-sm">
              Analise bem-sucedida! {results.total_findings} ocorrencias em {results.files_with_findings} arquivos.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={runDiagnostic} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Atualizar Diagnostico
        </Button>
      </div>
    </div>
  )
}
