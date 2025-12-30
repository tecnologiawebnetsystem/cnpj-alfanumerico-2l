"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Database, FileText, Loader2, GitBranch, AlertCircle, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Repository {
  id: string
  name: string
  full_name: string
  provider: "github" | "gitlab" | "azure"
  default_branch: string
}

interface RepositoryAnalysisTabProps {
  clientId: string
}

export function RepositoryAnalysisTab({ clientId }: RepositoryAnalysisTabProps) {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set())
  const [reportType, setReportType] = useState<"analitico" | "sintetico">("analitico")
  const [analysisType, setAnalysisType] = useState<"codigo" | "database">("codigo")
  const [loading, setLoading] = useState(false)
  const [loadingRepos, setLoadingRepos] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchRepositories()
  }, [clientId])

  const fetchRepositories = async () => {
    try {
      const res = await fetch(`/api/repositories?client_id=${clientId}`)
      const data = await res.json()
      setRepositories(data)
    } catch (error) {
      console.error("Error fetching repositories:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar repositórios",
        variant: "destructive",
      })
    } finally {
      setLoadingRepos(false)
    }
  }

  const toggleRepository = (repoId: string) => {
    const newSelected = new Set(selectedRepos)
    if (newSelected.has(repoId)) {
      newSelected.delete(repoId)
    } else {
      newSelected.add(repoId)
    }
    setSelectedRepos(newSelected)
  }

  const selectAll = () => {
    if (selectedRepos.size === repositories.length) {
      setSelectedRepos(new Set())
    } else {
      setSelectedRepos(new Set(repositories.map((r) => r.id)))
    }
  }

  const startAnalysis = async () => {
    if (selectedRepos.size === 0) {
      toast({
        title: "Atenção",
        description: "Selecione pelo menos um repositório",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin-client/start-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repository_ids: Array.from(selectedRepos),
          report_type: reportType,
          analysis_type: analysisType,
          client_id: clientId,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: "Análise Iniciada",
          description: `Analisando ${selectedRepos.size} repositório(s). Você será notificado quando concluir.`,
        })

        // Redirect to analysis details
        if (data.batch_id) {
          window.location.href = `/analysis/${data.batch_id}`
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao iniciar análise",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingRepos) {
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
          <CardTitle>Análise de Repositórios</CardTitle>
          <CardDescription>Selecione os repositórios e configure o tipo de análise e relatório</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo de Análise */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Análise</label>
              <Select value={analysisType} onValueChange={(v: any) => setAnalysisType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="codigo">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Análise de Código (Git)
                    </div>
                  </SelectItem>
                  <SelectItem value="database">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Análise de Banco de Dados (SQL/Oracle)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Relatório</label>
              <Select value={reportType} onValueChange={(v: any) => setReportType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analitico">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Analítico (Detalhado)
                    </div>
                  </SelectItem>
                  <SelectItem value="sintetico">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Sintético (Resumido)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Info sobre o tipo de relatório */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              {reportType === "analitico" ? "Relatório Analítico" : "Relatório Sintético"}
            </h4>
            <p className="text-sm text-blue-800">
              {reportType === "analitico"
                ? "Mostra linha por linha: repositório, arquivo, linha do erro e solução sugerida pela IA"
                : "Apresenta um resumo geral com estatísticas e principais problemas encontrados"}
            </p>
          </div>

          {/* Seleção de Repositórios */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium">Repositórios ({repositories.length})</label>
              <Button variant="outline" size="sm" onClick={selectAll}>
                {selectedRepos.size === repositories.length ? "Desmarcar Todos" : "Selecionar Todos"}
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Branch</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repositories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum repositório conectado. Configure as conexões primeiro.
                      </TableCell>
                    </TableRow>
                  ) : (
                    repositories.map((repo) => (
                      <TableRow key={repo.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRepos.has(repo.id)}
                            onCheckedChange={() => toggleRepository(repo.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{repo.name || repo.full_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{repo.provider}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{repo.default_branch}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Botão de Análise */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedRepos(new Set())}>
              Limpar Seleção
            </Button>
            <Button onClick={startAnalysis} disabled={loading || selectedRepos.size === 0} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Iniciar Análise ({selectedRepos.size})
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
