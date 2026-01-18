"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertCircle, CheckCircle2, Play, Check, FileCode, Brain, Copy, GitBranch } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  created_at: string
  completed_at: string | null
  // Novos campos para detalhes do codigo
  file_path?: string
  line_number?: number
  source_code?: string
  suggested_code?: string
  code_before?: string
  code_after?: string
  ai_explanation?: string
  ai_confidence?: number
  repository_name?: string
}

interface DevTaskDetailProps {
  task: Task
  onUpdateStatus: (taskId: string, status: string) => void
}

export function DevTaskDetail({ task, onUpdateStatus }: DevTaskDetailProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getConfidenceBadge = (confidence: number | undefined) => {
    if (!confidence) return null
    if (confidence >= 0.8) {
      return <Badge className="bg-green-100 text-green-700 gap-1"><Brain className="h-3 w-3" /> Alta ({Math.round(confidence * 100)}%)</Badge>
    } else if (confidence >= 0.5) {
      return <Badge className="bg-amber-100 text-amber-700 gap-1"><Brain className="h-3 w-3" /> Media ({Math.round(confidence * 100)}%)</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-700 gap-1"><Brain className="h-3 w-3" /> Baixa ({Math.round(confidence * 100)}%)</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Em Progresso
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Concluída
          </Badge>
        )
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800 border-gray-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-red-100 text-red-800 border-red-200",
    }
    return (
      <Badge className={colors[priority as keyof typeof colors] || ""}>
        Prioridade: {priority === "low" ? "Baixa" : priority === "medium" ? "Média" : "Alta"}
      </Badge>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-xl">{task.title}</CardTitle>
          {getStatusBadge(task.status)}
        </div>
        <CardDescription className="flex items-center gap-2">{getPriorityBadge(task.priority)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Descricao</h3>
          <p className="text-slate-600 whitespace-pre-wrap">{task.description}</p>
        </div>

        {/* Informacoes do Arquivo */}
        {task.file_path && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Localizacao
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              {task.repository_name && (
                <div className="flex items-center gap-2 text-sm">
                  <GitBranch className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Repositorio:</span>
                  <code className="text-primary">{task.repository_name}</code>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <FileCode className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Arquivo:</span>
                <code className="text-primary break-all">{task.file_path}</code>
              </div>
              {task.line_number && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground ml-5">Linha:</span>
                  <Badge variant="secondary">{task.line_number}</Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Codigo Atual */}
        {task.source_code && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Codigo Atual (Problema)
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(task.source_code || "", "source")}
              >
                {copiedId === "source" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <pre className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm overflow-x-auto">
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
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Codigo Sugerido (Correcao)
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(task.suggested_code || "", "suggested")}
              >
                {copiedId === "suggested" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <pre className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm overflow-x-auto">
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
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Analise da IA
              </h3>
              {getConfidenceBadge(task.ai_confidence)}
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
              <p className="whitespace-pre-wrap text-slate-600">{task.ai_explanation}</p>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Atualizar Status</h3>
          <div className="space-y-2">
            {task.status === "pending" && (
              <Button
                onClick={() => onUpdateStatus(task.id, "in_progress")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Tarefa
              </Button>
            )}

            {task.status === "in_progress" && (
              <Button
                onClick={() => onUpdateStatus(task.id, "completed")}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Marcar como Concluída
              </Button>
            )}

            {task.status === "completed" && (
              <div className="text-center py-4">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Tarefa concluída em{" "}
                  {task.completed_at ? new Date(task.completed_at).toLocaleDateString("pt-BR") : "Data não disponível"}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4 text-sm text-muted-foreground">
          <p>
            Criada em:{" "}
            {new Date(task.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
