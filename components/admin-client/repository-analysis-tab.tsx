"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Database, FileText, Loader2, GitBranch, AlertCircle, Play, FolderOpen, Download, CheckCircle2, Clock, Sparkles, ListChecks, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { useLocalFolder } from "@/hooks/use-local-folder"

interface Repository {
  id: string
  name: string
  full_name: string
  provider: "github" | "gitlab" | "azure"
  default_branch: string
  last_analyzed_at?: string | null
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
  
  // Local folder integration
  const { folderPath, isSupported: isFolderSupported, selectFolder, saveFiles, error: folderError } = useLocalFolder()
  const hasFolderHandle = !!folderPath // folderPath only exists when handle is active
  const [saveToLocal, setSaveToLocal] = useState(false)
  const [savedFolderName, setSavedFolderName] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number; repo: string } | null>(null)
  
  // Analysis progress modal
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState({
    currentRepo: 0,
    totalRepos: 0,
    currentRepoName: "",
    phase: "idle" as "idle" | "downloading" | "analyzing" | "generating_tasks" | "completed",
    phaseProgress: 0,
    logs: [] as { time: string; message: string; type: "info" | "success" | "error" }[],
  })
  
  // Load saved folder name
  useEffect(() => {
    const saved = localStorage.getItem(`local_folder_${clientId}`)
    if (saved) {
      setSavedFolderName(saved)
    }
  }, [clientId])

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

  // Download and save repository files locally
  const downloadRepoFiles = async (repoId: string, repoName: string) => {
    try {
      setDownloadProgress({ current: 0, total: 0, repo: repoName })
      
      // Fetch files from API
      const res = await fetch(`/api/repositories/${repoId}/files?client_id=${clientId}`)
      if (!res.ok) throw new Error("Erro ao buscar arquivos do repositorio")
      
      const data = await res.json()
      const files = data.files || []
      
      if (files.length === 0) {
        toast({
          title: "Aviso",
          description: `Nenhum arquivo encontrado em ${repoName}`,
          variant: "destructive",
        })
        return
      }
      
      setDownloadProgress({ current: 0, total: files.length, repo: repoName })
      
      // Save files locally
      const result = await saveFiles(
        files.map((f: any) => ({
          path: `${repoName}/${f.path}`,
          content: f.content,
        })),
        (current, total) => {
          setDownloadProgress({ current, total, repo: repoName })
        }
      )
      
      toast({
        title: "Download Concluido",
        description: `${result.success} arquivos salvos em ${savedFolderName || folderPath}/${repoName}`,
      })
    } catch (error: any) {
      toast({
        title: "Erro no Download",
        description: error.message || "Erro ao baixar arquivos",
        variant: "destructive",
      })
    } finally {
      setDownloadProgress(null)
    }
  }

  // Helper to add log entry
  const addLog = (message: string, type: "info" | "success" | "error" = "info") => {
    const time = new Date().toLocaleTimeString("pt-BR")
    setAnalysisProgress(prev => ({
      ...prev,
      logs: [...prev.logs, { time, message, type }]
    }))
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

    // If save to local is enabled, check if folder handle is active
    if (saveToLocal && !hasFolderHandle) {
      toast({
        title: "Selecione a pasta de destino",
        description: savedFolderName 
          ? `Reautorize o acesso a pasta "${savedFolderName}" para continuar`
          : "Selecione uma pasta para salvar os arquivos",
      })
      const handle = await selectFolder()
      if (!handle) {
        toast({
          title: "Pasta nao selecionada",
          description: "Selecione uma pasta para salvar os arquivos ou desative a opcao",
          variant: "destructive",
        })
        return
      }
    }

    // Initialize progress modal
    const repoIds = Array.from(selectedRepos)
    setAnalysisProgress({
      currentRepo: 0,
      totalRepos: repoIds.length,
      currentRepoName: "",
      phase: "idle",
      phaseProgress: 0,
      logs: [],
    })
    setShowAnalysisModal(true)
    setLoading(true)

    let batchId: string | null = null

    try {
      // Create batch analysis first
      addLog("Iniciando processo de analise...", "info")
      
      const createBatchRes = await fetch("/api/admin-client/create-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repository_ids: repoIds,
          report_type: reportType,
          analysis_type: analysisType,
          client_id: clientId,
        }),
      })
      
      const batchData = await createBatchRes.json()
      if (!batchData.success) throw new Error(batchData.error || "Erro ao criar batch")
      
      batchId = batchData.batch_id
      addLog(`Batch criado: ${batchId}`, "success")

      // Process each repository sequentially
      for (let i = 0; i < repoIds.length; i++) {
        const repoId = repoIds[i]
        const repo = repositories.find(r => r.id === repoId)
        const repoName = repo?.name || repo?.full_name || repoId

        setAnalysisProgress(prev => ({
          ...prev,
          currentRepo: i + 1,
          currentRepoName: repoName,
          phase: "downloading",
          phaseProgress: 0,
        }))

        addLog(`[${i + 1}/${repoIds.length}] Processando: ${repoName}`, "info")

        // Phase 1: Download files locally (if enabled)
        if (saveToLocal && hasFolderHandle) {
          setAnalysisProgress(prev => ({ ...prev, phase: "downloading", phaseProgress: 0 }))
          addLog(`Baixando arquivos de ${repoName}...`, "info")
          
          try {
            await downloadRepoFiles(repoId, repoName)
            addLog(`Arquivos de ${repoName} salvos localmente`, "success")
          } catch (err: any) {
            addLog(`Erro ao baixar ${repoName}: ${err.message}`, "error")
          }
        }

        // Phase 2: Analyze repository
        setAnalysisProgress(prev => ({ ...prev, phase: "analyzing", phaseProgress: 33 }))
        addLog(`Analisando codigo de ${repoName}...`, "info")

        const analyzeRes = await fetch("/api/admin-client/analyze-single-repo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repository_id: repoId,
            batch_id: batchId,
            client_id: clientId,
            report_type: reportType,
          }),
        })

        const analyzeData = await analyzeRes.json()
        
        if (analyzeData.success) {
          addLog(`${repoName}: ${analyzeData.findings_count || 0} ocorrencias encontradas`, "success")
          
          // Phase 3: Generate tasks
          setAnalysisProgress(prev => ({ ...prev, phase: "generating_tasks", phaseProgress: 66 }))
          addLog(`Gerando tarefas para ${repoName}...`, "info")

          if (analyzeData.findings_count > 0) {
            const tasksRes = await fetch("/api/admin-client/generate-tasks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                analysis_id: analyzeData.analysis_id,
                client_id: clientId,
              }),
            })
            
            const tasksData = await tasksRes.json()
            if (tasksData.success) {
              addLog(`${tasksData.tasks_created || 0} tarefas criadas para ${repoName}`, "success")
            }
          } else {
            addLog(`Nenhuma tarefa necessaria para ${repoName}`, "info")
          }
        } else {
          addLog(`Erro ao analisar ${repoName}: ${analyzeData.error}`, "error")
        }

        setAnalysisProgress(prev => ({ ...prev, phaseProgress: 100 }))
      }

      // Complete
      setAnalysisProgress(prev => ({ ...prev, phase: "completed", phaseProgress: 100 }))
      addLog("Analise concluida com sucesso!", "success")
      
      // Wait 2 seconds then redirect
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (batchId) {
        window.location.href = `/analysis/${batchId}`
      }

    } catch (error: any) {
      addLog(`Erro: ${error.message}`, "error")
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
          
          {/* Opção de salvar localmente */}
          {isFolderSupported && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FolderOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Salvar repositorios localmente</p>
                    <p className="text-sm text-muted-foreground">
                      {savedFolderName || folderPath 
                        ? `Pasta: ${savedFolderName || folderPath}`
                        : "Baixa os arquivos para sua maquina antes da analise"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {hasFolderHandle ? (
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Pasta ativa
                    </Badge>
                  ) : savedFolderName ? (
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Requer autorizacao
                    </Badge>
                  ) : null}
                  <Switch
                    checked={saveToLocal}
                    onCheckedChange={setSaveToLocal}
                  />
                </div>
              </div>
              
              {saveToLocal && !hasFolderHandle && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm text-amber-800">
                    {savedFolderName 
                      ? `A pasta "${savedFolderName}" precisa ser reautorizada. Ao clicar em Analisar, o navegador pedira permissao novamente.`
                      : "Nenhuma pasta configurada. Configure em Configuracoes ou selecione ao iniciar a analise."
                    }
                  </p>
                </div>
              )}
              
              {downloadProgress && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Download className="h-4 w-4 animate-pulse" />
                      Baixando {downloadProgress.repo}...
                    </span>
                    <span className="font-mono text-xs">
                      {downloadProgress.current}/{downloadProgress.total}
                    </span>
                  </div>
                  <Progress value={(downloadProgress.current / downloadProgress.total) * 100} className="h-2" />
                </div>
              )}
            </div>
          )}

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
                    <TableHead>Repositorio</TableHead>
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
                    repositories.map((repo) => {
                      const wasAnalyzed = !!repo.last_analyzed_at
                      return (
                        <TableRow key={repo.id} className={wasAnalyzed ? "bg-red-50/50" : ""}>
                          <TableCell>
                            <Checkbox
                              checked={selectedRepos.has(repo.id)}
                              onCheckedChange={() => toggleRepository(repo.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${wasAnalyzed ? "text-red-600" : ""}`}>
                                {repo.name || repo.full_name}
                              </span>
                              {wasAnalyzed && (
                                <Badge variant="outline" className="text-red-600 border-red-300 text-xs">
                                  Ja analisado
                                </Badge>
                              )}
                            </div>
                            {wasAnalyzed && (
                              <p className="text-xs text-red-500 mt-0.5">
                                Ultima analise: {new Date(repo.last_analyzed_at!).toLocaleDateString("pt-BR")}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{repo.provider}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{repo.default_branch}</TableCell>
                        </TableRow>
                      )
                    })
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

      {/* Modal de Progresso da Analise */}
      <Dialog open={showAnalysisModal} onOpenChange={(open) => {
        // Only allow closing if completed or not loading
        if (!loading || analysisProgress.phase === "completed") {
          setShowAnalysisModal(open)
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {analysisProgress.phase === "completed" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
              {analysisProgress.phase === "completed" 
                ? "Analise Concluida!" 
                : `Analisando ${analysisProgress.currentRepo}/${analysisProgress.totalRepos} repositorios...`
              }
            </DialogTitle>
            <DialogDescription>
              {analysisProgress.phase === "completed" 
                ? "Todos os repositorios foram analisados. Redirecionando para o relatorio..."
                : `Processando: ${analysisProgress.currentRepoName || "Iniciando..."}`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Progress geral */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso Geral</span>
                <span className="font-mono">
                  {analysisProgress.currentRepo}/{analysisProgress.totalRepos}
                </span>
              </div>
              <Progress 
                value={(analysisProgress.currentRepo / Math.max(analysisProgress.totalRepos, 1)) * 100} 
                className="h-3"
              />
            </div>

            {/* Fases do repositorio atual */}
            {analysisProgress.phase !== "completed" && analysisProgress.phase !== "idle" && (
              <div className="grid grid-cols-3 gap-2">
                <div className={`p-3 rounded-lg border ${
                  analysisProgress.phase === "downloading" 
                    ? "bg-blue-50 border-blue-200" 
                    : analysisProgress.phaseProgress > 0 
                      ? "bg-green-50 border-green-200" 
                      : "bg-muted/50"
                }`}>
                  <div className="flex items-center gap-2">
                    {analysisProgress.phase === "downloading" ? (
                      <Download className="h-4 w-4 text-blue-600 animate-pulse" />
                    ) : analysisProgress.phaseProgress > 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-xs font-medium">Clone/Download</span>
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg border ${
                  analysisProgress.phase === "analyzing" 
                    ? "bg-blue-50 border-blue-200" 
                    : analysisProgress.phaseProgress > 33 
                      ? "bg-green-50 border-green-200" 
                      : "bg-muted/50"
                }`}>
                  <div className="flex items-center gap-2">
                    {analysisProgress.phase === "analyzing" ? (
                      <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
                    ) : analysisProgress.phaseProgress > 33 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-xs font-medium">Analise</span>
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg border ${
                  analysisProgress.phase === "generating_tasks" 
                    ? "bg-blue-50 border-blue-200" 
                    : analysisProgress.phaseProgress > 66 
                      ? "bg-green-50 border-green-200" 
                      : "bg-muted/50"
                }`}>
                  <div className="flex items-center gap-2">
                    {analysisProgress.phase === "generating_tasks" ? (
                      <ListChecks className="h-4 w-4 text-blue-600 animate-pulse" />
                    ) : analysisProgress.phaseProgress > 66 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-xs font-medium">Tarefas</span>
                  </div>
                </div>
              </div>
            )}

            {/* Logs */}
            <div className="border rounded-lg">
              <div className="px-3 py-2 border-b bg-muted/50">
                <span className="text-xs font-medium">Log de Execucao</span>
              </div>
              <ScrollArea className="h-48">
                <div className="p-3 space-y-1 font-mono text-xs">
                  {analysisProgress.logs.map((log, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">[{log.time}]</span>
                      <span className={
                        log.type === "success" ? "text-green-600" :
                        log.type === "error" ? "text-red-600" :
                        "text-foreground"
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  {analysisProgress.logs.length === 0 && (
                    <span className="text-muted-foreground">Aguardando...</span>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Botao de fechar quando completo */}
            {analysisProgress.phase === "completed" && (
              <div className="flex justify-end">
                <Button onClick={() => setShowAnalysisModal(false)}>
                  Fechar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
