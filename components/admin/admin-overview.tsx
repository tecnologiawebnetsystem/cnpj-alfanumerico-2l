"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/lib/auth"

export function AdminOverview() {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    expiredLicenses: 0,
    totalUsers: 0,
    totalRepositories: 0,
    totalAnalyses: 0,
    activeSubscriptions: 0,
    pendingTasks: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const user = getCurrentUser()
      if (!user) return

      const response = await fetch(`/api/admin/stats?user_id=${user.id}`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none shadow-lg bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Total de Clientes</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalClients}</div>
            <p className="text-xs text-primary/70">{stats.activeClients} ativos</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-primary/15 to-primary/10 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Usuários</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
            <p className="text-xs text-primary/70">Cadastrados no sistema</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-lg bg-gradient-to-br from-primary/10 to-slate-50 hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle className="text-primary">Permissões do Super Admin</CardTitle>
          <CardDescription className="text-slate-600">
            Você tem acesso total a todas as funcionalidades do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-white">✓</Badge>
              <span className="text-sm text-slate-700">Gerenciar todos os clientes</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-white">✓</Badge>
              <span className="text-sm text-slate-700">Criar e gerenciar usuários</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
