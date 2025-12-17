"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { DevDashboardClean } from "@/components/dev/dev-dashboard-clean"

interface DashboardData {
  dashboard: any
  delayedTasks: any[]
  alerts: any[]
  weeklyMetrics: any[]
}

export default function DevDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchDashboard, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dev/dashboard")
      const data = await res.json()
      setData(data)
    } catch (error) {
      console.error("Error fetching dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Carregando dashboard...</div>
  }

  if (!data) {
    return <div className="p-8">Erro ao carregar dashboard</div>
  }

  const { dashboard, delayedTasks, alerts, weeklyMetrics } = data

  // Calculate percentages
  const completionRate =
    dashboard.total_tasks > 0 ? Math.round((dashboard.tasks_completed / dashboard.total_tasks) * 100) : 0
  const delayRate = dashboard.total_tasks > 0 ? Math.round((dashboard.delayed_tasks / dashboard.total_tasks) * 100) : 0

  // Performance score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "warning":
        return "default"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-slate-50">
      <div className="bg-gradient-to-r from-primary to-primary/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Image
                src="/images/act-logo-square.jfif"
                alt="ACT Digital"
                width={48}
                height={48}
                className="rounded-xl shadow-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard do Desenvolvedor</h1>
                <p className="text-primary-foreground/80">Suas tarefas e performance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DevDashboardClean
        stats={{
          total: dashboard.total_tasks,
          completed: dashboard.tasks_completed,
          inProgress: dashboard.tasks_in_progress || 0,
          delayed: dashboard.delayed_tasks,
          performanceScore: Math.round(dashboard.performance_score_7d || 0),
        }}
        tasks={delayedTasks}
      />
    </div>
  )
}
