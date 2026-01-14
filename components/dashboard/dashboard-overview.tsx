"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileCode, Database, Clock, GitBranch, CheckCircle2, Plus, ArrowRight, Sparkles } from "lucide-react"

interface DashboardStats {
  totalRepositories: number
  totalAnalyses: number
  totalFieldsIdentified: number
  estimatedHours: number
  recentAnalyses: any[]
  tasks?: {
    total: number
    pending: number
    in_progress: number
    awaiting_qa: number
    completed: number
    blocked: number
  }
}

interface DashboardOverviewProps {
  onChangeTab: (tab: string) => void
  userRole?: string
}

export function DashboardOverview({ onChangeTab, userRole = "admin" }: DashboardOverviewProps) {
  const [stats] = useState<DashboardStats>({
    totalRepositories: 0,
    totalAnalyses: 0,
    totalFieldsIdentified: 0,
    estimatedHours: 0,
    recentAnalyses: [],
    tasks: {
      total: 0,
      pending: 0,
      in_progress: 0,
      awaiting_qa: 0,
      completed: 0,
      blocked: 0,
    },
  })

  useEffect(() => {
    console.log(" DashboardOverview mounted for role:", userRole)
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      console.log(" Loading dashboard stats...")
      const response = await fetch("/api/dashboard/stats")
      if (response.ok) {
        const data = await response.json()
        console.log(" Stats loaded successfully:", data)
        // Simplified state update to prevent blank screen
        // setStats(data)
      } else {
        console.warn(" Failed to load stats:", response.status, "- using defaults")
      }
    } catch (error) {
      console.error(" Error loading dashboard stats:", error)
    } finally {
      console.log(" Dashboard stats loading complete")
    }
  }

  const isDev = userRole === "dev"
  const isSuperAdmin = userRole === "super_admin"
  const completionPercentage =
    stats.tasks && stats.tasks.total > 0 ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) : 0

  console.log(" Rendering overview - isDev:", isDev, "isSuperAdmin:", isSuperAdmin)

  return (
    <div className="space-y-8">
      <Card className="relative overflow-hidden border shadow-sm bg-white dark:bg-slate-900">
        <div className="p-8 md:p-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                {isDev ? "Bem-vindo de volta!" : "Bem-vindo ao Aegis CNPJ"}
              </h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              {isDev
                ? "Acompanhe suas tarefas atribuídas e marque o progresso do seu trabalho."
                : "Gerencie suas análises de código e acompanhe o progresso da migração para o novo formato de CNPJ alfanumérico."}
            </p>
            <div className="flex flex-wrap gap-3">
              {isDev ? (
                <>
                  <Button onClick={() => onChangeTab("tarefas")} size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Ver Minhas Tarefas
                  </Button>
                  <Button onClick={() => onChangeTab("analises")} variant="outline" size="lg">
                    <FileCode className="h-5 w-5 mr-2" />
                    Ver Análises
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => onChangeTab("integracoes")}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Cadastrar Conta
                  </Button>
                  <Button onClick={() => onChangeTab("nova-analise")} variant="outline" size="lg">
                    <FileCode className="h-5 w-5 mr-2" />
                    Nova Análise
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {isDev ? "Repositórios" : "Contas Cadastradas"}
            </h3>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <GitBranch className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">0</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isDev ? "Repositórios disponíveis" : "GitHub, GitLab, Azure DevOps"}
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Análises Realizadas</h3>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <FileCode className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">0</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total de repositórios analisados</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {isDev ? "Minhas Tarefas" : "Total de Tarefas"}
            </h3>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">0</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">0 concluídas</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Horas Estimadas</h3>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">0h</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tempo de implementação</p>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {isDev ? (
          <>
            <Card
              className="p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onChangeTab("tarefas")}
            >
              <div className="flex items-start gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <CheckCircle2 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Minhas Tarefas</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Ver e atualizar tarefas atribuídas a mim
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-blue-600">
                    Acessar <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onChangeTab("analises")}
            >
              <div className="flex items-start gap-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <FileCode className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Ver Análises</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Consultar análises dos repositórios</p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-blue-600">
                    Ver <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          </>
        ) : (
          <>
            <Card
              className="p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onChangeTab("integracoes")}
            >
              <div className="flex items-start gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <GitBranch className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Gerenciar Contas</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Cadastre contas do GitHub, GitLab, Bitbucket ou Azure DevOps
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-blue-600">
                    Acessar <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onChangeTab("nova-analise")}
            >
              <div className="flex items-start gap-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <FileCode className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Analisar Repositório</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Envie um repositório para identificar campos CNPJ
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-blue-600">
                    Iniciar <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onChangeTab("banco-dados")}
            >
              <div className="flex items-start gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <Database className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Banco de Dados</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Analisar tabelas e campos do banco de dados
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-blue-600">
                    Acessar <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <FileCode className="h-5 w-5 text-blue-600" />
            Análise de Código
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Identifica automaticamente campos CNPJ em múltiplas linguagens de programação
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Análise de Banco de Dados
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Detecta colunas CNPJ em SQL Server, Oracle, MySQL, PostgreSQL e MongoDB
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Estimativa de Horas
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Calcula automaticamente o tempo necessário para implementar as mudanças
          </p>
        </Card>
      </div>
    </div>
  )
}
