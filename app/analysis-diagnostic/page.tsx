"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
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
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get last analysis
      const { data: analyses } = await supabase
        .from("analyses")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)

      if (!analyses || analyses.length === 0) {
        setDiagnostic({ error: "Nenhuma análise encontrada" })
        setLoading(false)
        return
      }

      const analysis = analyses[0]

      // Get client settings
      const { data: settings } = await supabase
        .from("client_settings")
        .select("*")
        .eq("client_id", analysis.client_id)
        .in("setting_key", ["cnpj_field_names", "file_extensions"])

      const cnpjFieldsRaw = settings?.find((s) => s.setting_key === "cnpj_field_names")?.setting_value
      const extensionsRaw = settings?.find((s) => s.setting_key === "file_extensions")?.setting_value

      let cnpjFields: string[] = []
      let extensions: string[] = []

      try {
        if (cnpjFieldsRaw) {
          const parsed = JSON.parse(cnpjFieldsRaw)
          cnpjFields = Array.isArray(parsed) ? parsed : parsed.split(",").map((s: string) => s.trim())
        }
      } catch {
        cnpjFields = []
      }

      try {
        if (extensionsRaw) {
          const parsed = JSON.parse(extensionsRaw)
          extensions = Array.isArray(parsed) ? parsed : parsed.split(",").map((s: string) => s.trim())
        }
      } catch {
        extensions = []
      }

      // Get findings
      const { data: findings } = await supabase.from("findings").select("*").eq("analysis_id", analysis.id)

      // Get tasks
      const { data: tasks } = await supabase.from("tasks").select("*").eq("analysis_id", analysis.id)

      // Group findings by file
      const findingsByFile: Record<string, any[]> = {}
      findings?.forEach((f) => {
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
          total_files: analysis.results?.summary?.total_files || analysis.total_files,
          files_analyzed: analysis.results?.summary?.files_analyzed,
        },
        settings: {
          cnpj_fields: cnpjFields,
          file_extensions: extensions,
        },
        results: {
          total_findings: findings?.length || 0,
          total_tasks: tasks?.length || 0,
          files_with_findings: Object.keys(findingsByFile).length,
          findings_by_file: findingsByFile,
        },
        sample_findings: findings?.slice(0, 5) || [],
      })
    } catch (error) {
      console.error("Diagnostic error:", error)
      setDiagnostic({ error: error instanceof Error ? error.message : "Erro desconhecido" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

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
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <XCircle className="h-5 w-5" />
              Erro no Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-800">{diagnostic.error}</p>
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

      {/* Analysis Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações da Análise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
            <div>
              <p className="text-sm text-muted-foreground">Arquivos Analisados</p>
              <p className="text-2xl font-bold">{analysis.files_analyzed || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
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
                  <Badge key={idx} variant="outline" className="font-mono">
                    {field}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-red-600">❌ Nenhum termo cadastrado!</p>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Extensões de Arquivo:</p>
            {settings.file_extensions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {settings.file_extensions.map((ext: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="font-mono">
                    {ext}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-yellow-600">⚠️ Nenhuma extensão configurada - analisando TODOS os arquivos</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
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
              <p className="text-4xl font-bold text-purple-600">{results.files_with_findings}</p>
              <p className="text-sm text-muted-foreground">Arquivos com Ocorrências</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">{results.total_tasks}</p>
              <p className="text-sm text-muted-foreground">Tarefas Criadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Findings by File */}
      {Object.keys(results.findings_by_file).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ocorrências por Arquivo</CardTitle>
            <CardDescription>Arquivos onde foram encontrados termos CNPJ</CardDescription>
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

      {/* Sample Findings */}
      {sample_findings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Exemplo de Ocorrências (primeiras 5)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sample_findings.map((finding: any, idx: number) => (
              <div key={idx} className="space-y-2 rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-mono text-sm text-muted-foreground">{finding.file_path}</p>
                    <p className="text-xs text-muted-foreground">Linha {finding.line_number}</p>
                  </div>
                  <Badge variant="outline">{finding.field_name}</Badge>
                </div>
                <div className="rounded bg-gray-50 p-3">
                  <pre className="text-xs">{finding.context}</pre>
                </div>
                {finding.suggestion && <p className="text-sm text-green-600">✅ Sugestão: {finding.suggestion}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Diagnostic Actions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <AlertCircle className="h-5 w-5" />
            Interpretação dos Resultados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-blue-900">
          {results.total_findings === 0 && (
            <div className="space-y-2">
              <p className="font-medium">❌ Nenhuma ocorrência encontrada. Possíveis causas:</p>
              <ul className="ml-6 list-disc space-y-1 text-sm">
                <li>Os termos CNPJ cadastrados não correspondem aos nomes usados no código</li>
                <li>As extensões de arquivo estão muito restritivas</li>
                <li>O repositório analisado não contém os termos esperados</li>
              </ul>
              <p className="mt-4 text-sm">
                <strong>Recomendação:</strong> Verifique a página de Configurações e adicione TODAS as variações de
                nomes de campo CNPJ que você sabe que existem no código (ex: nr_cnpj, NR_CNPJ, nrCnpj, documentNumber,
                cpfCnpj, etc.)
              </p>
            </div>
          )}

          {results.total_findings > 0 && results.total_findings < 100 && (
            <div className="space-y-2">
              <p className="font-medium">⚠️ Poucas ocorrências encontradas ({results.total_findings}).</p>
              <p className="text-sm">
                Se você esperava mais resultados, considere adicionar mais termos na página de Configurações incluindo
                variações como: CNPJ, nr_cnpj, nrCnpj, documentNumber, taxId, registrationNumber, etc.
              </p>
            </div>
          )}

          {results.total_findings >= 100 && (
            <div className="space-y-2">
              <p className="font-medium">✅ Análise bem-sucedida!</p>
              <p className="text-sm">
                Foram encontradas {results.total_findings} ocorrências em {results.files_with_findings} arquivos.
                {results.total_tasks} tarefas foram criadas para rastrear as alterações necessárias.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={runDiagnostic} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Atualizar Diagnóstico
        </Button>
      </div>
    </div>
  )
}
