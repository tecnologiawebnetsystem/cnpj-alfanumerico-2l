"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface BatchProgressModalProps {
  open: boolean // Changed from isOpen to open to match Dialog component
  onClose: () => void
  batchId: string | null // Allow null to handle initial state
  repositoryCount: number
}

interface TaskDistribution {
  pending: number
  in_progress: number
  completed: number
  total: number
}

export function BatchProgressModal({ open, onClose, batchId, repositoryCount }: BatchProgressModalProps) {
  const [distribution, setDistribution] = useState<TaskDistribution | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log(" BatchProgressModal - open:", open, "batchId:", batchId)
    if (open && batchId) {
      fetchDistribution()
    }
  }, [open, batchId])

  const fetchDistribution = async () => {
    setLoading(true)
    console.log(" Fetching distribution for batch:", batchId) // Debug log
    try {
      const response = await fetch(`/api/analyses/${batchId}/progress`)
      console.log(" Distribution API response status:", response.status) // Debug log
      const data = await response.json()
      console.log(" Distribution data:", data) // Debug log
      setDistribution(data.distribution)
    } catch (error) {
      console.error(" Error fetching distribution:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0
  }

  const pendingPercent = distribution ? getPercentage(distribution.pending, distribution.total) : 0
  const inProgressPercent = distribution ? getPercentage(distribution.in_progress, distribution.total) : 0
  const completedPercent = distribution ? getPercentage(distribution.completed, distribution.total) : 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Progresso da Análise</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : distribution ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Total de Tarefas</span>
                  <span className="text-2xl font-bold">{distribution.total}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Repositórios Analisados</span>
                  <span className="font-medium">{repositoryCount}</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Completed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Concluídas</span>
                    </div>
                    <span className="text-sm font-medium">{completedPercent}%</span>
                  </div>
                  <Progress value={completedPercent} className="h-2 bg-green-100" />
                  <p className="text-sm text-muted-foreground">
                    {distribution.completed} de {distribution.total} tarefas
                  </p>
                </div>

                {/* In Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Em Desenvolvimento</span>
                    </div>
                    <span className="text-sm font-medium">{inProgressPercent}%</span>
                  </div>
                  <Progress value={inProgressPercent} className="h-2 bg-blue-100" />
                  <p className="text-sm text-muted-foreground">
                    {distribution.in_progress} de {distribution.total} tarefas
                  </p>
                </div>

                {/* Pending */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <span className="font-medium">Pendentes</span>
                    </div>
                    <span className="text-sm font-medium">{pendingPercent}%</span>
                  </div>
                  <Progress value={pendingPercent} className="h-2 bg-amber-100" />
                  <p className="text-sm text-muted-foreground">
                    {distribution.pending} de {distribution.total} tarefas
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progresso Total</span>
                  <span className="text-lg font-bold">{completedPercent + inProgressPercent}%</span>
                </div>
                <Progress value={completedPercent + inProgressPercent} className="mt-2 h-3" />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Nenhum dado disponível para esta análise
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
