"use client"

import { use, useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Download,
  FileCode,
  Database,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  XCircle,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { NotificationDialog } from "@/components/ui/notification-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AnalysisPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter()
  const resolvedParams = params && typeof params === "object" && "then" in params ? use(params) : params
  const { id } = resolvedParams
  const [analysis, setAnalysis] = useState<any>(null)
  const [codeFindings, setCodeFindings] = useState<any[]>([])
  const [dbFindings, setDbFindings] = useState<any[]>([])
  const [findingsByFile, setFindingsByFile] = useState<Map<string, any[]>>(new Map())
  const [codePage, setCodePage] = useState(1)
  const [dbPage, setDbPage] = useState(1)
  const CODE_PER_PAGE = 20
  const DB_PER_PAGE = 20
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("Iniciando análise...")
  const [analysisLogs, setAnalysisLogs] = useState<Array<{ time: string; message: string }>>([])
  const [totalFiles, setTotalFiles] = useState(0)
  const [processedFiles, setProcessedFiles] = useState(0)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationConfig, setNotificationConfig] = useState<{
    title: string
    description: string
    type: "success" | "error" | "warning" | "info"
    showCancel?: boolean
    onConfirm?: () => void | Promise<void>
  }>({
    title: "",
    description: "",
    type: "info",
  })

  const [accountName, setAccountName] = useState<string>("N/A")
  const [repositoryName, setRepositoryName] = useState<string>("N/A")
  const [totalEstimatedHours, setTotalEstimatedHours] = useState<number>(0)

  const showNotification = (config: typeof notificationConfig) => {
    setNotificationConfig(config)
    setNotificationOpen(true)
  }

  useEffect(() => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      console.log(" Invalid UUID format:", id, "- redirecting to /analyzer")
      window.location.href = "/analyzer"
      return
    }

    loadAnalysisData()
  }, [id])

  useEffect(() => {
    // Only start polling if status is processing/pending or if analysis hasn't loaded yet
    if (!analysis || ((analysis.status === "processing" || analysis.status === "pending") && analysis.progress < 100)) {
      console.log(
        " Starting progress polling - status:",
        analysis?.status || "loading",
        "progress:",
        analysis?.progress || 0,
      )

      let pollCount = 0
      const MAX_POLLS = 1800 // 1 hora (2 segundos cada)

      const progressInterval = setInterval(async () => {
        try {
          pollCount++

          // Add security timeout
          if (pollCount > MAX_POLLS) {
            console.log(" Polling timeout reached, stopping...")
            clearInterval(progressInterval)
            setError("Tempo limite de análise excedido. Por favor, tente novamente.")
            return
          }

          console.log(" Polling progress for analysis:", id, `(attempt ${pollCount}/${MAX_POLLS})`)
          const response = await fetch(`/api/analyses/${id}/progress`)
          if (response.ok) {
            const data = await response.json()
            console.log(" Progress update:", data)

            setProgress(data.progress || 0)
            setCurrentStep(data.current_step || "Processando...")
            setTotalFiles(data.total_steps || 100)

            if (data.current_step && data.current_step !== currentStep) {
              const timestamp = new Date().toLocaleTimeString("pt-BR")
              setAnalysisLogs((prev) => [
                ...prev,
                {
                  time: timestamp,
                  message: data.current_step,
                },
              ])
            }

            // Correct stop condition for 100%
            if (data.status === "completed" || data.progress >= 100) {
              console.log(" Analysis completed (status or progress >= 100), reloading full data...")
              clearInterval(progressInterval)
              setTimeout(() => {
                loadAnalysisData()
              }, 1000)
            }

            // Add handling for stuck analyses
            if (data.status === "failed") {
              console.log(" Analysis failed, stopping polling")
              clearInterval(progressInterval)
              setError(data.error_message || "Análise falhou")
              loadAnalysisData()
            }
          } else {
            console.log(" Progress API returned non-OK status:", response.status)
            // After 3 consecutive errors, stop polling
            if (pollCount % 3 === 0) {
              console.warn(" Multiple progress fetch failures, reloading data...")
              loadAnalysisData()
            }
          }
        } catch (error) {
          console.error(" Error fetching progress:", error)
        }
      }, 2000)

      return () => {
        console.log(" Clearing progress polling interval")
        clearInterval(progressInterval)
      }
    } else {
      console.log(" Not starting polling - status:", analysis?.status, "progress:", analysis?.progress)
    }
  }, [id, analysis]) // Updated dependency to include analysis

  const loadAnalysisData = async () => {
    try {
      const supabase = getSupabaseClient()

      console.log(" Loading analysis:", id)
      console.log(" Loading findings for analysis:", id)

      const [singleAnalysisResult, findingsResult, dbFindingsResult] = await Promise.all([
        supabase.from("analyses").select("*").eq("id", id).maybeSingle(),
        supabase.from("findings").select("*").eq("analysis_id", id).order("file_path", { ascending: true }),
        supabase.from("database_findings").select("*").eq("analysis_id", id).order("table_name", { ascending: true }),
      ])

      if (!singleAnalysisResult.data) {
        console.log(" No analysis found with id:", id, "- checking if this is a batch_id")

        // Check if this is a batch analysis
        const { data: batchData } = await supabase.from("batch_analyses").select("*").eq("id", id).maybeSingle()

        if (batchData) {
          console.log(" This is a batch_id, fetching individual analyses")

          // Get all analyses for this batch
          const { data: batchAnalyses } = await supabase
            .from("analyses")
            .select("*")
            .eq("batch_id", id)
            .order("created_at", { ascending: false })

          if (batchAnalyses && batchAnalyses.length > 0) {
            // Use the first (most recent) analysis
            const firstAnalysis = batchAnalyses[0]
            console.log(" Using first analysis from batch:", firstAnalysis.id)

            // Redirect to the correct analysis page
            window.location.href = `/analysis/${firstAnalysis.id}`
            return
          }
        }

        console.log(" No analysis or batch found, redirecting to /analyzer")
        window.location.href = "/analyzer"
        return
      }

      if (singleAnalysisResult.data) {
        setAnalysis(singleAnalysisResult.data)
        console.log(" Single analysis loaded:", singleAnalysisResult.data)
        console.log(
          " Analysis status:",
          singleAnalysisResult.data.status,
          "progress:",
          singleAnalysisResult.data.progress,
        )

        if (singleAnalysisResult.data.batch_id) {
          const { data: batchData } = await supabase
            .from("batch_analyses")
            .select("account_name, estimated_hours")
            .eq("id", singleAnalysisResult.data.batch_id)
            .maybeSingle()

          if (batchData) {
            if (batchData.account_name) {
              setAccountName(batchData.account_name)
            }
            if (batchData.estimated_hours) {
              setTotalEstimatedHours(Number.parseFloat(batchData.estimated_hours))
            }
          }
        }

        if (singleAnalysisResult.data.repository_id) {
          const { data: repoData } = await supabase
            .from("repositories")
            .select("name")
            .eq("id", singleAnalysisResult.data.repository_id)
            .maybeSingle()

          if (repoData) {
            setRepositoryName(repoData.name || "N/A")
          }
        } else if (singleAnalysisResult.data.repository_name) {
          setRepositoryName(singleAnalysisResult.data.repository_name)
        }

        if (findingsResult.data) {
          console.log(" Code findings loaded:", findingsResult.data.length)
          setCodeFindings(findingsResult.data)

          if (!totalEstimatedHours) {
            const totalHours = findingsResult.data.reduce((sum: number, f: any) => sum + (f.estimated_hours || 4), 0)
            setTotalEstimatedHours(totalHours)
          }

          const grouped = new Map<string, any[]>()
          findingsResult.data.forEach((finding: any) => {
            const filePath = finding.file_path
            if (!grouped.has(filePath)) {
              grouped.set(filePath, [])
            }
            grouped.get(filePath)!.push(finding)
          })
          setFindingsByFile(grouped)
          console.log(" Grouped findings into", grouped.size, "files")
        } else {
          console.log(" No code findings found")
        }

        if (dbFindingsResult.data) {
          console.log(" DB findings loaded:", dbFindingsResult.data.length)
          setDbFindings(dbFindingsResult.data)
        } else {
          console.log(" No DB findings found")
        }

        setLoading(false)
        return
      }

      const { data: batchAnalyses, error: batchError } = await supabase
        .from("analyses")
        .select("*")
        .eq("batch_id", id)
        .order("created_at", { ascending: true })

      if (batchError || !batchAnalyses || batchAnalyses.length === 0) {
        console.error(" Error loading batch analysis:", batchError)
        setError("Análise não encontrada")
        setLoading(false)
        return
      }

      console.log(" Batch analysis loaded with", batchAnalyses.length, "repositories")

      const totalFindings = batchAnalyses.reduce((sum, a) => sum + (a.total_findings || 0), 0)
      const totalHours = batchAnalyses.reduce((sum, a) => sum + (a.estimated_hours || 0), 0)
      const totalFiles = batchAnalyses.reduce((sum, a) => sum + (a.total_files || 0), 0)

      const languageBreakdown: Record<string, number> = {}
      batchAnalyses.forEach((a) => {
        if (a.results?.language_breakdown) {
          Object.entries(a.results.language_breakdown).forEach(([lang, count]) => {
            languageBreakdown[lang] = (languageBreakdown[lang] || 0) + (count as number)
          })
        }
      })

      const aggregatedAnalysis = {
        id: id,
        batch_id: id,
        repository_name: `${batchAnalyses.length} Repositórios`,
        status: batchAnalyses.every((a) => a.status === "completed")
          ? "completed"
          : batchAnalyses.some((a) => a.status === "processing" || a.status === "pending")
            ? "processing"
            : "failed",
        estimated_hours: totalHours,
        total_files: totalFiles,
        total_findings: totalFindings,
        language: batchAnalyses
          .map((a) => a.language)
          .filter(Boolean)
          .join(", "),
        results: {
          summary: {
            total_repositories: batchAnalyses.length,
            estimated_hours: totalHours,
            total_files: totalFiles,
            total_findings: totalFindings,
          },
          language_breakdown: languageBreakdown,
          state: {
            current: "Campos CNPJ no formato atual (14 caracteres numéricos) em múltiplos repositórios",
            future: "Campos CNPJ atualizados para formato alfanumérico (18 caracteres) em todos os repositórios",
          },
        },
      }

      setAnalysis(aggregatedAnalysis)

      const { data: allFindings } = await supabase
        .from("findings")
        .select("*")
        .in(
          "analysis_id",
          batchAnalyses.map((a) => a.id),
        )
        .order("file_path", { ascending: true })

      if (allFindings) {
        setCodeFindings(allFindings)
        const grouped = new Map<string, any[]>()
        allFindings.forEach((finding: any) => {
          const filePath = finding.file_path
          if (!grouped.has(filePath)) {
            grouped.set(filePath, [])
          }
          grouped.get(filePath)!.push(finding)
        })
        setFindingsByFile(grouped)
        console.log(" Grouped findings into", grouped.size, "files")
      }

      const { data: allDbFindings } = await supabase
        .from("database_findings")
        .select("*")
        .in(
          "analysis_id",
          batchAnalyses.map((a) => a.id),
        )
        .order("table_name", { ascending: true })

      if (allDbFindings) setDbFindings(allDbFindings)

      setLoading(false)
    } catch (err) {
      console.error(" Error loading analysis data:", err)
      setError(err instanceof Error ? err.message : "Erro ao carregar análise")
      setLoading(false)
    }
  }

  const getComplexityBadge = (complexity: string) => {
    const config = {
      low: { variant: "default" as const, label: "Baixa", color: "text-green-600" },
      medium: { variant: "secondary" as const, label: "Média", color: "text-yellow-600" },
      high: { variant: "destructive" as const, label: "Alta", color: "text-red-600" },
    }
    return config[complexity as keyof typeof config] || config.medium
  }

  const downloadReport = async (format: string) => {
    try {
      if (!id) {
        console.error(" Analysis ID is undefined")
        setErrorMessage("ID da análise não encontrado. Por favor, recarregue a página.")
        setShowErrorModal(true)
        return
      }

      console.log(" Starting download for analysis ID:", id, "format:", format)

      const userStr = localStorage.getItem("user")
      console.log(" User from localStorage:", userStr ? "exists" : "null")

      if (!userStr) {
        setErrorMessage("Você precisa estar autenticado para baixar relatórios.")
        setShowErrorModal(true)
        return
      }

      const user = JSON.parse(userStr)
      console.log(" Parsed user:", { email: user.email, id: user.id })

      const authToken = btoa(
        JSON.stringify({
          email: user.email,
          id: user.id,
          client_id: user.client_id, // Added client_id to token
          timestamp: Date.now(),
        }),
      )
      console.log(" Generated auth token (first 20 chars):", authToken.substring(0, 20))

      const apiUrl = `/api/reports/${id}?format=${format}`
      console.log(" Requesting:", apiUrl)

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      console.log(" Download response status:", response.status)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        let fileExtension = format
        if (format === "excel") {
          fileExtension = "csv"
        } else if (format === "pdf") {
          fileExtension = "pdf"
        } else if (format === "json") {
          fileExtension = "json"
        } else if (format === "zip") {
          fileExtension = "zip"
        }

        const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "")
        a.download = `relatorio-cnpj-${id}-${timestamp}.${fileExtension}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const contentType = response.headers.get("content-type")
        let errorMessage = "Erro ao gerar relatório"

        if (contentType?.includes("application/json")) {
          try {
            const errorData = await response.json()
            console.error(" Error response (JSON):", errorData)
            errorMessage = errorData.error || errorData.message || errorMessage
          } catch (e) {
            console.error(" Failed to parse error JSON:", e)
          }
        } else {
          // Response is not JSON (HTML error page, plain text, etc.)
          const errorText = await response.text()
          console.error(" Error response (text):", errorText.substring(0, 200))
          errorMessage = "Erro ao gerar relatório. Por favor, tente novamente."
        }

        setErrorMessage(errorMessage)
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error(" Download error:", error)
      setErrorMessage(error instanceof Error ? error.message : "Erro ao gerar relatório")
      setShowErrorModal(true)
    }
  }

  const handleDelete = async () => {
    showNotification({
      title: "Excluir Análise",
      description: "Tem certeza que deseja excluir esta análise? Esta ação não pode ser desfeita.",
      type: "warning",
      showCancel: true,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/analyses/${id}`, {
            method: "DELETE",
          })

          if (response.ok) {
            router.push("/dashboard?tab=analises")
          } else {
            showNotification({
              title: "Erro ao Excluir",
              description: "Erro ao excluir análise. Tente novamente.",
              type: "error",
            })
          }
        } catch (error) {
          console.error(" Error deleting analysis:", error)
          showNotification({
            title: "Erro ao Excluir",
            description: "Erro ao excluir análise. Tente novamente.",
            type: "error",
          })
        }
      },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Carregando análise...</p>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-4">{error || "Análise não encontrada"}</p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (analysis.status === "processing" || analysis.status === "pending") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3">Análise em Progresso</h2>
            <p className="text-muted-foreground text-lg">Estamos analisando o repositório {analysis.repository_name}</p>
          </div>

          <Card className="p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileCode className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Processamento</h3>
              </div>
              <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {progress}%
              </span>
            </div>

            <div className="mb-3">
              <span className="text-sm text-muted-foreground">{currentStep}</span>
            </div>

            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </Card>

          {progress >= 30 && progress < 95 && currentStep.includes("Analisando:") && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 mb-6">
              <Loader2 className="h-5 w-5 text-yellow-600 animate-spin flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">Processando arquivo...</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 font-mono truncate">
                  {currentStep.replace("Analisando: ", "")}
                </p>
              </div>
            </div>
          )}

          {progress >= 85 && progress < 100 && !currentStep.includes("Analisando:") && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 mb-6">
              <Loader2 className="h-5 w-5 text-yellow-600 animate-spin flex-shrink-0" />
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Finalizando análise e criando tarefas...
              </p>
            </div>
          )}

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-center">
              <strong>Dica:</strong> Após a conclusão, você pode acessar esta análise a qualquer momento através da aba
              "Análises" no dashboard.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (analysis.status === "failed") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Análise Falhou</h2>
          <p className="text-muted-foreground mb-4">Ocorreu um erro ao processar o repositório.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Dashboard
              </Button>
            </Link>
            <Link href="/analyzer">
              <Button>Tentar Novamente</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (analysis.status === "completed" && codeFindings.length === 0 && dbFindings.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/act-logo-square.jfif"
                  alt="ACT Digital"
                  width={40}
                  height={40}
                  className="rounded-md"
                />
                <div>
                  <h1 className="text-base font-bold leading-none">CNPJ Detector</h1>
                  <p className="text-xs text-muted-foreground">Resultado da Análise</p>
                </div>
              </div>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Nenhuma Ocorrência Encontrada</h2>
              <p className="text-muted-foreground text-lg mb-2">
                Não foram encontradas ocorrências de CNPJ que precisam ser atualizadas neste repositório.
              </p>
              <p className="text-sm text-muted-foreground">
                Analisamos <strong>{analysis.total_files || 0} arquivos</strong> em busca dos termos configurados.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Possíveis causas:</h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                  <span>Os termos CNPJ configurados não existem nos arquivos analisados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                  <span>As extensões de arquivo filtradas podem estar excluindo arquivos importantes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                  <span>O repositório já está atualizado com o novo formato de CNPJ</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 flex gap-3 justify-center">
              <Link href="/dashboard?tab=configuracoes">
                <Button variant="outline">Revisar Configurações</Button>
              </Link>
              <Link href="/analyzer">
                <Button>Nova Análise</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const paginatedCodeFindings = codeFindings.slice((codePage - 1) * CODE_PER_PAGE, codePage * CODE_PER_PAGE)
  const totalCodePages = Math.ceil(codeFindings.length / CODE_PER_PAGE)

  const paginatedDbFindings = dbFindings.slice((dbPage - 1) * DB_PER_PAGE, dbPage * DB_PER_PAGE)
  const totalDbPages = Math.ceil(dbFindings.length / DB_PER_PAGE)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/images/act-logo-square.jfif"
                alt="ACT Digital"
                width={40}
                height={40}
                className="rounded-md"
              />
              <div>
                <h1 className="text-base font-bold leading-none">CNPJ Detector</h1>
                <p className="text-xs text-muted-foreground">Resultado da Análise</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => downloadReport("zip")} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Baixar Relatório
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Conta/Organização</div>
                <div className="text-lg font-semibold">{accountName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Repositório</div>
                <div className="text-lg font-semibold">{repositoryName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total de Ocorrências</div>
                <div className="text-lg font-semibold">{codeFindings.length}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Estimativa Total</div>
                <div className="text-lg font-semibold text-primary">{totalEstimatedHours}h</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {analysis.repository_name}
              </h2>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Análise Concluída
                </Badge>
                {analysis.language && <Badge variant="outline">{analysis.language}</Badge>}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Total de Arquivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  {analysis.results?.summary?.total_files || analysis.total_files || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Arquivos analisados</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border-pink-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Ocorrências no Código
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-700 bg-clip-text text-transparent">
                  {analysis.results?.summary?.total_findings || codeFindings.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Campos CNPJ encontrados</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Campos de Banco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {dbFindings.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Colunas para alterar</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Estimativa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                  {totalEstimatedHours}h
                </div>
                <p className="text-xs text-muted-foreground mt-1">Esforço estimado</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {findingsByFile.size > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Ocorrências Encontradas</h3>
            <div className="space-y-4">
              {Array.from(findingsByFile.entries()).map(([filePath, findings]) => (
                <Card key={filePath} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          <FileCode className="h-5 w-5 text-primary" />
                          {filePath.split("/").pop()}
                        </CardTitle>
                        <CardDescription className="font-mono text-xs mt-1">{filePath}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-4">
                        {findings.length} {findings.length === 1 ? "ocorrência" : "ocorrências"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {findings.map((finding, idx) => (
                        <div key={idx} className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold text-muted-foreground">Linha {finding.line_number}</span>
                                <span className="text-muted-foreground">•</span>
                                <span className="font-mono text-primary font-semibold">{finding.field_name}</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {finding.field_type}
                            </Badge>
                          </div>

                          <div className="bg-muted rounded-lg p-4 space-y-2">
                            <div className="text-muted-foreground mb-2 text-xs font-semibold">Código atual:</div>
                            <pre className="text-sm overflow-x-auto">
                              <code className="language-csharp">
                                {finding.code_current || finding.context || `Campo CNPJ em API de investimentos`}
                              </code>
                            </pre>
                          </div>

                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 space-y-2">
                                <div className="font-semibold text-green-900 dark:text-green-100">
                                  Solução Sugerida por IA:
                                </div>
                                {finding.code_suggested ? (
                                  <pre className="text-sm overflow-x-auto bg-green-100/50 dark:bg-green-900/30 p-3 rounded">
                                    <code className="language-csharp text-green-900 dark:text-green-100">
                                      {finding.code_suggested}
                                    </code>
                                  </pre>
                                ) : (
                                  <p className="text-sm text-green-800 dark:text-green-200">{finding.suggestion}</p>
                                )}
                                {finding.estimated_hours && (
                                  <Badge variant="outline" className="mt-2">
                                    ⏱️ {finding.estimated_hours}h estimadas
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {idx < findings.length - 1 && <div className="border-t border-border" />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {dbFindings.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Campos de Banco de Dados</h3>
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tabela</TableHead>
                      <TableHead>Coluna</TableHead>
                      <TableHead>Tipo Atual</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Solução</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dbFindings.map((finding, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono font-semibold">{finding.table_name}</TableCell>
                        <TableCell className="font-mono text-primary">{finding.column_name}</TableCell>
                        <TableCell className="font-mono text-sm">{finding.column_type}</TableCell>
                        <TableCell className="font-mono text-sm">{finding.column_length}</TableCell>
                        <TableCell className="text-sm">{finding.suggestion}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <DialogTitle>Erro ao Gerar Relatório</DialogTitle>
            </div>
            <DialogDescription className="pt-4">
              {errorMessage}
              <br />
              <br />
              Se o problema persistir, entre em contato com o suporte técnico.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowErrorModal(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NotificationDialog open={notificationOpen} onOpenChange={setNotificationOpen} {...notificationConfig} />
    </div>
  )
}
