"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  FileCode,
  GitBranch,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Filter,
} from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DashboardMetrics {
  totalAnalyses: number
  totalFindings: number
  totalProjects: number
  totalRepositories: number
  avgDuration: number
  trend: {
    analyses: number
    findings: number
  }
  findingsByProject: Array<{ project: string; count: number }>
  findingsByRepository: Array<{ repository: string; count: number; project: string }>
  analysisTimeline: Array<{ date: string; count: number; findings: number }>
  topProblematicRepos: Array<{
    project: string
    repository: string
    findings: number
    files: number
  }>
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1"]

export function AnalysisMetricsDashboard({ clientId }: { clientId: string }) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [projects, setProjects] = useState<string[]>([])

  useEffect(() => {
    loadMetrics()
  }, [clientId, timeRange, projectFilter])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()

      // Calculate date range
      const now = new Date()
      let startDate = new Date()
      switch (timeRange) {
        case "7d":
          startDate.setDate(now.getDate() - 7)
          break
        case "30d":
          startDate.setDate(now.getDate() - 30)
          break
        case "90d":
          startDate.setDate(now.getDate() - 90)
          break
        case "all":
          startDate = new Date("2020-01-01")
          break
      }

      // Fetch analyses with findings
      const analysesQuery = supabase
        .from("analyses")
        .select(`
          id,
          created_at,
          completed_at,
          status
        `)
        .eq("client_id", clientId)
        .eq("status", "completed")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })

      const { data: analyses } = await analysesQuery

      if (!analyses || analyses.length === 0) {
        setMetrics({
          totalAnalyses: 0,
          totalFindings: 0,
          totalProjects: 0,
          totalRepositories: 0,
          avgDuration: 0,
          trend: { analyses: 0, findings: 0 },
          findingsByProject: [],
          findingsByRepository: [],
          analysisTimeline: [],
          topProblematicRepos: [],
        })
        setLoading(false)
        return
      }

      const analysisIds = analyses.map((a) => a.id)

      // Fetch findings
      let findingsQuery = supabase
        .from("findings")
        .select("id, analysis_id, project, repository, file_path")
        .in("analysis_id", analysisIds)

      if (projectFilter !== "all") {
        findingsQuery = findingsQuery.eq("project", projectFilter)
      }

      const { data: findings } = await findingsQuery

      // Calculate metrics
      const uniqueProjects = new Set(findings?.map((f) => f.project).filter(Boolean))
      const uniqueRepositories = new Set(findings?.map((f) => f.repository).filter(Boolean))

      // Findings by project
      const projectCounts = new Map<string, number>()
      findings?.forEach((f) => {
        if (f.project) {
          projectCounts.set(f.project, (projectCounts.get(f.project) || 0) + 1)
        }
      })

      const findingsByProject = Array.from(projectCounts.entries())
        .map(([project, count]) => ({ project, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Findings by repository
      const repoCounts = new Map<string, { count: number; project: string }>()
      findings?.forEach((f) => {
        if (f.repository) {
          const existing = repoCounts.get(f.repository) || { count: 0, project: f.project || "Unknown" }
          repoCounts.set(f.repository, { count: existing.count + 1, project: existing.project })
        }
      })

      const findingsByRepository = Array.from(repoCounts.entries())
        .map(([repository, data]) => ({ repository, count: data.count, project: data.project }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Timeline
      const timelineMap = new Map<string, { count: number; findings: number }>()
      analyses.forEach((a) => {
        const date = new Date(a.created_at).toLocaleDateString("pt-BR")
        const existing = timelineMap.get(date) || { count: 0, findings: 0 }
        const analysisFindings = findings?.filter((f) => f.analysis_id === a.id).length || 0
        timelineMap.set(date, {
          count: existing.count + 1,
          findings: existing.findings + analysisFindings,
        })
      })

      const analysisTimeline = Array.from(timelineMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort(
          (a, b) =>
            new Date(a.date.split("/").reverse().join("-")).getTime() -
            new Date(b.date.split("/").reverse().join("-")).getTime(),
        )

      // Top problematic repos (from view)
      const { data: topRepos } = await supabase
        .from("top_problematic_repositories")
        .select("*")
        .eq("client_id", clientId)
        .limit(10)

      const topProblematicRepos =
        topRepos?.map((r) => ({
          project: r.project || "N/A",
          repository: r.repository,
          findings: r.total_findings,
          files: r.affected_files,
        })) || []

      // Calculate average duration
      const durations = analyses
        .filter((a) => a.completed_at && a.created_at)
        .map((a) => {
          const start = new Date(a.created_at).getTime()
          const end = new Date(a.completed_at!).getTime()
          return (end - start) / 1000 // seconds
        })
      const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0

      // Calculate trends (compare with previous period)
      const midDate = new Date(startDate.getTime() + (now.getTime() - startDate.getTime()) / 2)
      const recentAnalyses = analyses.filter((a) => new Date(a.created_at) >= midDate).length
      const olderAnalyses = analyses.filter((a) => new Date(a.created_at) < midDate).length
      const analysesTrend = olderAnalyses > 0 ? ((recentAnalyses - olderAnalyses) / olderAnalyses) * 100 : 0

      const recentFindings =
        findings?.filter((f) => {
          const analysis = analyses.find((a) => a.id === f.analysis_id)
          return analysis && new Date(analysis.created_at) >= midDate
        }).length || 0
      const olderFindings =
        findings?.filter((f) => {
          const analysis = analyses.find((a) => a.id === f.analysis_id)
          return analysis && new Date(analysis.created_at) < midDate
        }).length || 0
      const findingsTrend = olderFindings > 0 ? ((recentFindings - olderFindings) / olderFindings) * 100 : 0

      // Get unique projects for filter
      setProjects(Array.from(uniqueProjects) as string[])

      setMetrics({
        totalAnalyses: analyses.length,
        totalFindings: findings?.length || 0,
        totalProjects: uniqueProjects.size,
        totalRepositories: uniqueRepositories.size,
        avgDuration,
        trend: {
          analyses: analysesTrend,
          findings: findingsTrend,
        },
        findingsByProject,
        findingsByRepository,
        analysisTimeline,
        topProblematicRepos,
      })
    } catch (error) {
      console.error(" Error loading metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !metrics) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted" />
            <CardContent className="h-64 bg-muted/50" />
          </Card>
        ))}
      </div>
    )
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}min`
    return `${(seconds / 3600).toFixed(1)}h`
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="all">Todo período</SelectItem>
          </SelectContent>
        </Select>

        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os projetos</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project} value={project}>
                {project}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Total de Análises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalAnalyses}</div>
            <div className="flex items-center gap-1 text-sm mt-1">
              {metrics.trend.analyses >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={metrics.trend.analyses >= 0 ? "text-green-600" : "text-red-600"}>
                {Math.abs(Math.round(metrics.trend.analyses))}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Total de Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalFindings}</div>
            <div className="flex items-center gap-1 text-sm mt-1">
              {metrics.trend.findings <= 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">{Math.abs(Math.round(metrics.trend.findings))}% menos</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">{Math.round(metrics.trend.findings)}% mais</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Projetos / Repositórios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {metrics.totalProjects} / {metrics.totalRepositories}
            </div>
            <p className="text-xs text-muted-foreground mt-1">projetos e repositórios analisados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tempo Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatDuration(metrics.avgDuration)}</div>
            <p className="text-xs text-muted-foreground mt-1">por análise</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Timeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Evolução Temporal
            </CardTitle>
            <CardDescription>Análises e findings ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.analysisTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Análises" strokeWidth={2} />
                <Line type="monotone" dataKey="findings" stroke="#ec4899" name="Findings" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Findings by Project */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Findings por Projeto
            </CardTitle>
            <CardDescription>Top 10 projetos com mais ocorrências</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.findingsByProject}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="project" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" name="Findings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Problematic Repositories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Repositórios Mais Problemáticos
          </CardTitle>
          <CardDescription>Repositórios que precisam de mais atenção</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topProblematicRepos.map((repo, index) => (
              <div
                key={`${repo.project}-${repo.repository}`}
                className="flex items-center justify-between p-4 rounded-lg border bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{repo.repository}</div>
                    <div className="text-sm text-muted-foreground">{repo.project}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">{repo.findings}</div>
                    <div className="text-xs text-muted-foreground">findings</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{repo.files}</div>
                    <div className="text-xs text-muted-foreground">arquivos</div>
                  </div>
                </div>
              </div>
            ))}
            {metrics.topProblematicRepos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
                <p>Nenhum repositório problemático encontrado!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
