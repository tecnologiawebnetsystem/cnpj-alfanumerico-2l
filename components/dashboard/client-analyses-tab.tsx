"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { BatchProgressModal } from "@/components/modals/batch-progress-modal"
import { useToast } from "@/hooks/use-toast"
import {
  FileBarChart,
  Search,
  Eye,
  GitBranch,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Github,
  Gitlab,
  Box,
  Trash2,
  FileCode,
  BarChartBig as ChartBar,
} from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"

interface Analysis {
  id: string
  repository_count: number
  repository_name: string
  account_name: string
  provider: string
  status: string
  created_at: string
  completed_at: string | null
  progress: number
  results: any
  is_batch: boolean
  findings_count?: number
}

interface ClientAnalysesTabProps {
  clientId: string
}

export default function ClientAnalysesTab({ clientId }: ClientAnalysesTabProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [previousStatuses, setPreviousStatuses] = useState<Map<string, string>>(new Map())
  const [progressModalOpen, setProgressModalOpen] = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [selectedRepoCount, setSelectedRepoCount] = useState<number>(0)

  useEffect(() => {
    loadAnalyses()

    const interval = setInterval(() => {
      const hasInProgress = analyses.some(
        (a) => a.status === "pending" || a.status === "processing" || a.status === "in_progress",
      )
      if (hasInProgress) {
        loadAnalyses()
      }
    }, 2000) // Poll every 2 seconds instead of 5 for near real-time updates

    return () => clearInterval(interval)
  }, [clientId, analyses.length])

  const loadAnalyses = async () => {
    try {
      console.log("[v0] Loading analyses for client:", clientId)
      const supabase = getSupabaseClient()

      if (!supabase) {
        console.error("[v0] Supabase client not available")
        return
      }

      const { data: analysesData, error } = await supabase
        .from("analyses")
        .select("id, status, created_at, completed_at, progress, results, repository_id, batch_id, connection_id")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error loading analyses:", error)
        throw error
      }

      console.log("[v0] Loaded analyses:", analysesData?.length)

      const analysisGroups = new Map<string, any[]>()

      analysesData?.forEach((analysis: any) => {
        const key = analysis.batch_id || analysis.id
        if (!analysisGroups.has(key)) {
          analysisGroups.set(key, [])
        }
        analysisGroups.get(key)!.push(analysis)
      })

      const repositoryIds = Array.from(new Set(analysesData?.map((a: any) => a.repository_id).filter(Boolean) || []))

      const accountIds = Array.from(new Set(analysesData?.map((a: any) => a.connection_id).filter(Boolean) || []))

      let repoLookup = new Map()

      if (repositoryIds.length > 0) {
        const { data: reposData } = await supabase
          .from("repositories")
          .select("id, name, full_name")
          .in("id", repositoryIds)

        repoLookup = new Map(reposData?.map((repo: any) => [repo.id, repo]) || [])
      }

      let accountLookup = new Map()

      if (accountIds.length > 0) {
        console.log("[v0] Fetching account names for connection_ids:", accountIds)

        const { data: accountsData, error: accountsError } = await supabase
          .from("github_tokens")
          .select("id, account_name, provider")
          .in("id", accountIds)

        if (accountsError) {
          console.error("[v0] Error fetching accounts:", accountsError)
        } else {
          console.log("[v0] Found accounts:", accountsData)
        }

        accountLookup = new Map(
          accountsData?.map((account: any) => [
            account.id,
            {
              account_name: account.account_name || "Conta Desconhecida",
              provider: account.provider || "github",
            },
          ]) || [],
        )
      }

      const analysisIds = analysesData?.map((a: any) => a.id) || []
      const findingsCountMap = new Map<string, number>()

      if (analysisIds.length > 0) {
        const { data: findingsData } = await supabase
          .from("findings")
          .select("analysis_id")
          .in("analysis_id", analysisIds)

        if (findingsData) {
          findingsData.forEach((finding: any) => {
            const count = findingsCountMap.get(finding.analysis_id) || 0
            findingsCountMap.set(finding.analysis_id, count + 1)
          })
        }
      }

      const formattedAnalyses = Array.from(analysisGroups.entries()).map(([key, analyses]) => {
        const firstAnalysis = analyses[0]
        const repo = repoLookup.get(firstAnalysis.repository_id)

        const accountInfo = accountLookup.get(firstAnalysis.connection_id) || {
          account_name: "Conta Desconhecida",
          provider: "github",
        }

        let totalFindings = 0
        let totalFiles = 0
        let totalEstimatedHours = 0

        analyses.forEach((a) => {
          totalFindings += findingsCountMap.get(a.id) || 0

          // Sum files from results.summary
          if (a.results?.summary?.total_files) {
            totalFiles += a.results.summary.total_files
          }

          // Sum estimated hours
          if (a.results?.summary?.estimated_hours) {
            totalEstimatedHours += a.results.summary.estimated_hours
          }
        })

        // Create combined results object with summed values
        const combinedResults = {
          summary: {
            total_files: totalFiles,
            total_findings: totalFindings,
            estimated_hours: totalEstimatedHours,
          },
        }

        console.log(
          "[v0] Analysis",
          key,
          "- connection_id:",
          firstAnalysis.connection_id,
          "- account_name:",
          accountInfo.account_name,
          "- findings:",
          totalFindings,
          "- total_files:",
          totalFiles,
        )

        return {
          id: key,
          repository_count: analyses.length,
          repository_name: repo?.name || repo?.full_name || "Repositório sem nome",
          account_name: accountInfo.account_name,
          provider: accountInfo.provider,
          status: firstAnalysis.status,
          created_at: firstAnalysis.created_at,
          completed_at: firstAnalysis.completed_at,
          progress: firstAnalysis.progress || 0,
          results: combinedResults,
          is_batch: analyses.length > 1,
          findings_count: totalFindings,
        }
      })

      formattedAnalyses.forEach((analysis) => {
        const previousStatus = previousStatuses.get(analysis.id)
        const currentStatus = analysis.status

        if (
          previousStatus &&
          (previousStatus === "pending" || previousStatus === "processing" || previousStatus === "in_progress") &&
          currentStatus === "completed"
        ) {
          console.log("[v0] Analysis completed, showing notification:", analysis.id)
          toast({
            title: "Análise Concluída! 🎉",
            description: `A análise de ${analysis.repository_count} ${analysis.repository_count === 1 ? "repositório foi concluída" : "repositórios foi concluída"} com sucesso. Clique em "Exibir Detalhes" para ver os resultados.`,
            variant: "default",
          })
        }

        if (
          previousStatus &&
          (previousStatus === "pending" || previousStatus === "processing" || previousStatus === "in_progress") &&
          (currentStatus === "failed" || currentStatus === "error")
        ) {
          console.log("[v0] Analysis failed, showing error notification:", analysis.id)
          toast({
            title: "Erro na Análise",
            description: `A análise de ${analysis.repository_count} ${analysis.repository_count === 1 ? "repositório falhou" : "repositórios falhou"}. Verifique os logs para mais detalhes.`,
            variant: "destructive",
          })
        }
      })

      const newStatusesMap = new Map(formattedAnalyses.map((a) => [a.id, a.status]))
      setPreviousStatuses(newStatusesMap)

      setAnalyses(formattedAnalyses)
    } catch (error) {
      console.error("[v0] Failed to load analyses:", error)
    } finally {
      setLoading(false)
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "GitHub":
        return <Github className="h-4 w-4" />
      case "GitLab":
        return <Gitlab className="h-4 w-4" />
      case "Azure DevOps":
        return <Box className="h-4 w-4" />
      default:
        return <GitBranch className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string, progress: number, createdAt: string, analysisId: string) => {
    if (status === "completed" || progress >= 99) {
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Concluída
        </Badge>
      )
    }
    if (status === "failed" || status === "error") {
      return (
        <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
          <XCircle className="h-3 w-3 mr-1" />
          Erro
        </Badge>
      )
    }

    const createdDate = new Date(createdAt)
    const hoursStuck = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60)

    if (hoursStuck > 24 && (status === "pending" || status === "processing") && progress === 0) {
      return (
        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
          <XCircle className="h-3 w-3 mr-1" />
          Travada - Reinicie
        </Badge>
      )
    }

    return (
      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Em andamento ({progress}%)
      </Badge>
    )
  }

  const filteredAnalyses = analyses.filter(
    (analysis) =>
      analysis.repository_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.provider.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalAnalyses = analyses.length
  const completedAnalyses = analyses.filter((a) => a.status === "completed").length
  const inProgressAnalyses = analyses.filter((a) => a.status === "pending" || a.status === "in_progress").length

  const handleDeleteAnalysis = async (analysisId: string) => {
    console.log("[v0] Delete button clicked for analysis:", analysisId)
    setAnalysisToDelete(analysisId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!analysisToDelete) return

    try {
      console.log("[v0] Deleting analysis:", analysisToDelete)
      setDeleting(true)

      const response = await fetch(`/api/analyses/${analysisToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao excluir análise")
      }

      console.log("[v0] Analysis deleted successfully")
      setDeleteDialogOpen(false)
      setAnalysisToDelete(null)

      await loadAnalyses()
    } catch (error) {
      console.error("[v0] Error deleting analysis:", error)
      alert("Erro ao excluir análise. Tente novamente.")
    } finally {
      setDeleting(false)
    }
  }

  const handleShowProgress = (batchId: string, repoCount: number) => {
    console.log("[v0] handleShowProgress called - batchId:", batchId, "repoCount:", repoCount) // Debug log
    setSelectedBatchId(batchId)
    setSelectedRepoCount(repoCount)
    setProgressModalOpen(true)
    console.log("[v0] Modal state set to open") // Debug log
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border-pink-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Análises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-700 bg-clip-text text-transparent">
              {totalAnalyses}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              {completedAnalyses}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              {inProgressAnalyses}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5" />
                Histórico de Análises
              </CardTitle>
              <CardDescription>Visualize todas as análises realizadas</CardDescription>
            </div>
            <Button onClick={() => router.push("/analyzer")} className="gap-2">
              <GitBranch className="h-4 w-4" />
              Nova Análise
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por repositório, conta ou provedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredAnalyses.length === 0 ? (
            <div className="text-center py-12">
              <FileBarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhuma análise encontrada" : "Nenhuma análise realizada ainda"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quantidade de Repositórios</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Arquivos</TableHead>
                  <TableHead>Total Ocorrências</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalyses.map((analysis) => (
                  <TableRow key={analysis.id}>
                    <TableCell className="font-medium">
                      <button
                        onClick={() => handleShowProgress(analysis.id, analysis.repository_count)}
                        className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
                        title="Ver progresso das tarefas"
                      >
                        <ChartBar className="h-5 w-5 text-primary" />
                        {analysis.repository_count} {analysis.repository_count === 1 ? "repositório" : "repositórios"}
                      </button>
                    </TableCell>
                    <TableCell>{analysis.account_name}</TableCell>
                    <TableCell>
                      {getStatusBadge(analysis.status, analysis.progress, analysis.created_at, analysis.id)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {analysis.results?.summary?.total_files || analysis.results?.summary?.files_analyzed || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                        {analysis.findings_count || 0} {analysis.findings_count === 1 ? "ocorrência" : "ocorrências"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(analysis.created_at).toLocaleDateString("pt-BR")}
                        <Clock className="h-3 w-3 ml-2" />
                        {new Date(analysis.created_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/analysis/${analysis.id}`)}
                          disabled={
                            (analysis.status !== "completed" && analysis.progress < 99) || analysis.status === "pending"
                          }
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Exibir Detalhes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAnalysis(analysis.id)}
                          disabled={deleting || analysis.status === "processing"}
                          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                        >
                          {deleting && analysisToDelete === analysis.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedBatchId && (
        <BatchProgressModal
          open={progressModalOpen}
          onClose={() => setProgressModalOpen(false)}
          batchId={selectedBatchId}
          repositoryCount={selectedRepoCount}
        />
      )}

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
    </div>
  )
}

export { ClientAnalysesTab }
