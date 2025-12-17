"use client"

import { Card } from "@/components/ui/card"
import { Activity, Clock, FileCode, Key } from "lucide-react"

export function UsageStatsSection() {
  // Mock data - will be replaced with real data from Supabase
  const stats = {
    totalAnalyses: 24,
    totalRequests: 1847,
    avgResponseTime: 245,
    activeKeys: 3,
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <FileCode className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total de Análises</p>
            <p className="text-2xl font-bold">{stats.totalAnalyses}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-accent/10">
            <Activity className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Requisições (30d)</p>
            <p className="text-2xl font-bold">{stats.totalRequests}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-500/10">
            <Clock className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tempo Médio</p>
            <p className="text-2xl font-bold">{stats.avgResponseTime}ms</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10">
            <Key className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">API Keys Ativas</p>
            <p className="text-2xl font-bold">{stats.activeKeys}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
