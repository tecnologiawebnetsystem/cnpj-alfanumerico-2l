"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileCode, 
  Copy, 
  CheckCircle2, 
  AlertTriangle,
  Brain,
  Clock,
  User,
  GitBranch,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  file_path: string | null
  line_number: number | null
  source_code: string | null
  suggested_code: string | null
  code_before: string | null
  code_after: string | null
  ai_explanation: string | null
  ai_confidence: number | null
  repository_name: string | null
  assigned_to: string | null
  assigned_user?: { name: string; email: string } | null
  created_at: string
}

interface TaskDetailCardProps {
  task: Task
  onStatusChange?: (taskId: string, newStatus: string) => void
  isExpanded?: boolean
}

export function TaskDetailCard({ task, onStatusChange, isExpanded: initialExpanded = false }: TaskDetailCardProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700">Concluida</Badge>
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-700">Em Progresso</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700">Pendente</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Alta</Badge>
      case "medium":
        return <Badge className="bg-amber-100 text-amber-700">Media</Badge>
      case "low":
        return <Badge variant="secondary">Baixa</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const getConfidenceBadge = (confidence: number | null) => {
    if (confidence === null) return null
    if (confidence >= 0.8) {
      return <Badge className="bg-green-100 text-green-700 gap-1"><Brain className="h-3 w-3" /> Alta</Badge>
    } else if (confidence >= 0.5) {
      return <Badge className="bg-amber-100 text-amber-700 gap-1"><Brain className="h-3 w-3" /> Media</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-700 gap-1"><Brain className="h-3 w-3" /> Baixa</Badge>
    }
  }

  return (
    <Card className="border hover:shadow-sm transition-shadow">
      {/* Header */}
      <CardHeader 
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
              {getConfidenceBadge(task.ai_confidence)}
            </div>
            <CardTitle className="text-base line-clamp-2">{task.title}</CardTitle>
            {task.file_path && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <FileCode className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{task.file_path}</span>
                {task.line_number && (
                  <span className="text-xs bg-muted px-1.5 py-0.5 rounded">L{task.line_number}</span>
                )}
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {/* Content Expandido */}
      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Descricao */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Descricao</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
          </div>

          {/* Codigo Atual */}
          {task.source_code && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Codigo Atual
                  {task.line_number && <span className="text-xs text-muted-foreground">(Linha {task.line_number})</span>}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(task.source_code || "", `source-${task.id}`)
                  }}
                >
                  {copiedId === `source-${task.id}` ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <pre className="bg-red-50 border border-red-200 rounded-md p-3 text-sm overflow-x-auto">
                <code className="text-red-800">
                  {task.code_before && (
                    <span className="text-muted-foreground">{task.code_before}{"\n"}</span>
                  )}
                  <span className="bg-red-200 px-1">{task.source_code}</span>
                  {task.code_after && (
                    <span className="text-muted-foreground">{"\n"}{task.code_after}</span>
                  )}
                </code>
              </pre>
            </div>
          )}

          {/* Codigo Sugerido */}
          {task.suggested_code && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Codigo Sugerido
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(task.suggested_code || "", `suggested-${task.id}`)
                  }}
                >
                  {copiedId === `suggested-${task.id}` ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <pre className="bg-green-50 border border-green-200 rounded-md p-3 text-sm overflow-x-auto">
                <code className="text-green-800">
                  {task.code_before && (
                    <span className="text-muted-foreground">{task.code_before}{"\n"}</span>
                  )}
                  <span className="bg-green-200 px-1">{task.suggested_code}</span>
                  {task.code_after && (
                    <span className="text-muted-foreground">{"\n"}{task.code_after}</span>
                  )}
                </code>
              </pre>
            </div>
          )}

          {/* Explicacao da IA */}
          {task.ai_explanation && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Analise da IA
              </h4>
              <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-sm">
                <p className="whitespace-pre-wrap">{task.ai_explanation}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
            {task.repository_name && (
              <div className="flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                {task.repository_name}
              </div>
            )}
            {task.assigned_user && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {task.assigned_user.name}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(task.created_at).toLocaleDateString("pt-BR")}
            </div>
          </div>

          {/* Acoes */}
          {onStatusChange && task.status !== "completed" && (
            <div className="flex gap-2 pt-2">
              {task.status === "pending" && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    onStatusChange(task.id, "in_progress")
                  }}
                >
                  Iniciar
                </Button>
              )}
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onStatusChange(task.id, "completed")
                }}
              >
                Marcar como Concluida
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export { type Task }
