"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import {
  Clock,
  GitBranch,
  FileCode,
  AlertTriangle,
  Lightbulb,
  Timer,
  CheckCircle2,
  Play,
  Save,
  X,
} from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  repository_name?: string
  file_path?: string
  ai_suggestion?: string
  estimated_hours?: number
  remaining_hours?: number
  completed_hours?: number
  created_at?: string
  updated_at?: string
}

interface TaskDetailModalProps {
  task: Task | null
  open: boolean
  onClose: () => void
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => Promise<void>
}

export function TaskDetailModal({ task, open, onClose, onUpdateTask }: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [estimatedHours, setEstimatedHours] = useState(task?.estimated_hours || 0)
  const [remainingHours, setRemainingHours] = useState(task?.remaining_hours || 0)
  const [completedHours, setCompletedHours] = useState(task?.completed_hours || 0)
  const [isSaving, setIsSaving] = useState(false)

  if (!task) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Pendente</Badge>
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Em Progresso</Badge>
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Concluida</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-700">Alta</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-700">Media</Badge>
      case "low":
        return <Badge className="bg-gray-100 text-gray-700">Baixa</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const handleSaveHours = async () => {
    if (!onUpdateTask) return
    setIsSaving(true)
    try {
      await onUpdateTask(task.id, {
        estimated_hours: estimatedHours,
        remaining_hours: remainingHours,
        completed_hours: completedHours,
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving hours:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const progressPercentage = estimatedHours > 0 
    ? Math.round((completedHours / estimatedHours) * 100) 
    : 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold leading-tight">
                {task.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(task.status)}
                {getPriorityBadge(task.priority)}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Description */}
          {task.description && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Descricao</h4>
              <p className="text-sm">{task.description}</p>
            </div>
          )}

          {/* Repository and File */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {task.repository_name && (
              <div className="flex items-center gap-2 text-sm">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Repositorio:</span>
                <span className="font-medium">{task.repository_name}</span>
              </div>
            )}
            {task.file_path && (
              <div className="flex items-center gap-2 text-sm">
                <FileCode className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Arquivo:</span>
                <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{task.file_path}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Hours Tracking - Azure DevOps Style */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Controle de Horas
              </h4>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="h-3 w-3 mr-1" />
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveHours} disabled={isSaving}>
                    <Save className="h-3 w-3 mr-1" />
                    {isSaving ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium">Estimado</span>
                  </div>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(Number(e.target.value))}
                      className="h-8 text-lg font-bold"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-blue-700">{task.estimated_hours || 0}h</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-orange-600 mb-1">
                    <Play className="h-4 w-4" />
                    <span className="text-xs font-medium">Restante</span>
                  </div>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={remainingHours}
                      onChange={(e) => setRemainingHours(Number(e.target.value))}
                      className="h-8 text-lg font-bold"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-orange-700">{task.remaining_hours || 0}h</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-medium">Completado</span>
                  </div>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={completedHours}
                      onChange={(e) => setCompletedHours(Number(e.target.value))}
                      className="h-8 text-lg font-bold"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-green-700">{task.completed_hours || 0}h</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Progress Bar */}
            {(task.estimated_hours || 0) > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progresso</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* AI Suggestion */}
          {task.ai_suggestion && (
            <div>
              <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Sugestao da IA
              </h4>
              <Card className="bg-yellow-50/50 border-yellow-200">
                <CardContent className="p-3">
                  <p className="text-sm text-yellow-800 whitespace-pre-wrap">{task.ai_suggestion}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* If no AI suggestion, show a placeholder */}
          {!task.ai_suggestion && (
            <div>
              <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
                Sugestao da IA
              </h4>
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="p-3">
                  <p className="text-sm text-muted-foreground italic">
                    Nenhuma sugestao da IA disponivel para esta tarefa.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {task.created_at && (
              <span>Criado em: {new Date(task.created_at).toLocaleDateString("pt-BR")}</span>
            )}
            {task.updated_at && (
              <span>Atualizado em: {new Date(task.updated_at).toLocaleDateString("pt-BR")}</span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
