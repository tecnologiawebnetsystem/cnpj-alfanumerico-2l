"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, TrendingUp } from "lucide-react"
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
      console.log(" === ClientOverview loadStats START ===")
      const currentUser = getCurrentUser()
      console.log(" CurrentUser from localStorage:", currentUser)

      if (!currentUser) {
        console.log(" No user found in loadStats")
        return
      }

      console.log(" Fetching stats for user:", currentUser.id)
      const statsUrl = `/api/client/stats?user_id=${currentUser.id}`
      console.log(" Stats URL:", statsUrl)

      const response = await fetch(statsUrl, {
        credentials: "include",
      })

      console.log(" Stats API response status:", response.status)
      console.log(" Stats API response ok:", response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log(" Stats data received:", data)
        setStats(data)
      } else {
        const errorText = await response.text()
        console.error(" Stats API error:", errorText)
      }
      console.log(" === ClientOverview loadStats END ===")
    } catch (error) {
      console.error(" Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total de Desenvolvedores",
      value: stats.totalDevs,
      subtitle: `${stats.activeDevs} ativos`,
      icon: Users,
      gradient: "from-blue-500 to-purple-600",
      bgGradient: "from-blue-50 to-purple-50",
      onClick: () => onChangeTab("devs"),
    },
    {
      title: "Tarefas Concluídas",
      value: stats.completedTasks,
      subtitle: `${stats.totalTasks} total`,
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      onClick: () => onChangeTab("tarefas"),
    },
    {
      title: "Visão Geral",
      value: Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100) + "%",
      subtitle: "Taxa de conclusão",
      icon: BarChart3,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
      onClick: () => {
        alert(
          `Visão Geral Detalhada:\n\n` +
            `Total de Tarefas: ${stats.totalTasks}\n` +
            `Pendentes: ${stats.pendingTasks}\n` +
            `Em Progresso: ${stats.inProgressTasks}\n` +
            `Concluídas: ${stats.completedTasks}\n\n` +
            `Taxa de Conclusão: ${Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100)}%`,
        )
      },
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6 md:mb-8">
        <Card className="cursor-pointer hover:shadow-lg transition-all border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-sm md:text-base font-medium text-gray-700 flex items-center gap-2">
              <div className="p-2 md:p-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <span className="text-sm md:text-base font-semibold">Gerenciar Contas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
              Cadastre contas do GitHub, GitLab, Bitbucket ou Azure DevOps
            </p>
            <Button
              variant="ghost"
              className="inline-flex items-center text-xs md:text-sm font-medium text-blue-600 hover:text-blue-700 p-0 h-auto"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push("/integrations")
              }}
            >
              Acessar
              <svg className="ml-1 h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all border-0 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-sm md:text-base font-medium text-gray-700 flex items-center gap-2">
              <div className="p-2 md:p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-sm md:text-base font-semibold">Analisar Repositório</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
              Envie um repositório para identificar campos CNPJ
            </p>
            <Button
              variant="ghost"
              className="inline-flex items-center text-xs md:text-sm font-medium text-purple-600 hover:text-purple-700 p-0 h-auto"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push("/analyzer")
              }}
            >
              Iniciar
              <svg className="ml-1 h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all border-0 bg-gradient-to-br from-teal-50 to-green-50 md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-sm md:text-base font-medium text-gray-700 flex items-center gap-2">
              <div className="p-2 md:p-3 rounded-lg bg-gradient-to-br from-teal-500 to-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                  />
                </svg>
              </div>
              <span className="text-sm md:text-base font-semibold">Banco de Dados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">Analisar tabelas e campos do banco de dados</p>
            <Button
              variant="ghost"
              className="inline-flex items-center text-xs md:text-sm font-medium text-teal-600 hover:text-teal-700 p-0 h-auto"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push("/database-analyzer")
              }}
            >
              Acessar
              <svg className="ml-1 h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className={`cursor-pointer hover:shadow-lg transition-all border-0 bg-gradient-to-br ${stat.bgGradient}`}
              onClick={stat.onClick}
            >
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-sm md:text-base font-medium text-gray-700 flex items-center gap-2">
                  <div className={`p-2 md:p-2.5 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                    <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <span className="text-sm md:text-base">{stat.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl md:text-3xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </div>
                <p className="text-xs md:text-sm text-gray-600 mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
