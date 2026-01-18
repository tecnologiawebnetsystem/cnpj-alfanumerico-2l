"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, TrendingUp, Key, FileCode, Database, ArrowRight, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"

interface StatsData {
  totalDevs: number
  activeDevs: number
  totalTasks: number
  pendingTasks: number
  inProgressTasks: number
  completedTasks: number
  totalRepositories: number
  totalAnalyses: number
}

interface ClientOverviewTabProps {
  onChangeTab: (tab: string) => void
  userRole: string
}

export function ClientOverview({ onChangeTab, userRole }: ClientOverviewTabProps) {
  const router = useRouter()
  const [stats, setStats] = useState<StatsData>({
    totalDevs: 0,
    activeDevs: 0,
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    totalRepositories: 0,
    totalAnalyses: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const currentUser = getCurrentUser()
      if (!currentUser) return

      const response = await fetch(`/api/client/stats?user_id=${currentUser.id}`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const completionRate = Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Visao Geral</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe o progresso das analises e tarefas do seu projeto
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border hover:border-primary/20 transition-colors cursor-pointer" onClick={() => onChangeTab("devs")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Desenvolvedores</p>
                <p className="text-2xl font-semibold mt-1">{stats.totalDevs}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.activeDevs} ativos</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border hover:border-green-500/20 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluidas</p>
                <p className="text-2xl font-semibold mt-1 text-green-600">{stats.completedTasks}</p>
                <p className="text-xs text-muted-foreground mt-1">de {stats.totalTasks} tarefas</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border hover:border-amber-500/20 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Progresso</p>
                <p className="text-2xl font-semibold mt-1 text-amber-600">{stats.inProgressTasks}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.pendingTasks} pendentes</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border hover:border-primary/20 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusao</p>
                <p className="text-2xl font-semibold mt-1">{completionRate}%</p>
                <div className="mt-2 h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-foreground mb-4">Acoes Rapidas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="group border border-border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer" onClick={() => router.push("/integrations")}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Gerenciar Contas
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    Cadastre contas do GitHub, GitLab, Bitbucket ou Azure DevOps
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="group border border-border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer" onClick={() => router.push("/analyzer")}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileCode className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Analisar Repositorio
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    Envie um repositorio para identificar campos CNPJ
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="group border border-border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer sm:col-span-2 lg:col-span-1" onClick={() => router.push("/database-analyzer")}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Banco de Dados
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    Analisar tabelas e campos do banco de dados
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">Repositorios</h3>
              <Button variant="ghost" size="sm" className="text-primary h-8" onClick={() => onChangeTab("analise")}>
                Ver todos
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-3xl font-semibold">{stats.totalRepositories}</p>
                <p className="text-sm text-muted-foreground">repositorios cadastrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">Analises</h3>
              <Button variant="ghost" size="sm" className="text-primary h-8" onClick={() => onChangeTab("relatorios")}>
                Ver relatorios
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-3xl font-semibold">{stats.totalAnalyses}</p>
                <p className="text-sm text-muted-foreground">analises realizadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
