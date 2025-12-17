"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GitBranch, FileCode, Clock, User, Calendar } from "lucide-react"

interface TaskDetailsModalProps {
  task: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailsModal({ task, open, onOpenChange }: TaskDetailsModalProps) {
  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status e Prioridade */}
          <div className="flex items-center gap-3">
            <Badge variant={task.status === "pending" ? "outline" : "default"} className="text-sm">
              {task.status === "pending" ? "Pendente" : task.status === "in_progress" ? "Em Andamento" : "Concluída"}
            </Badge>
            <Badge variant={task.priority === "high" ? "destructive" : "outline"} className="text-sm">
              {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
            </Badge>
          </div>

          <Separator />

          {/* Descrição */}
          <div>
            <Label className="text-base font-semibold">Descrição</Label>
            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
              {task.description || "Sem descrição"}
            </p>
          </div>

          <Separator />

          {/* Detalhes do Código */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <GitBranch className="h-4 w-4 text-blue-500" />
                Repositório
              </Label>
              <p className="text-sm font-mono bg-slate-100 p-2 rounded">{task.repository_name || "N/A"}</p>
            </div>

            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <FileCode className="h-4 w-4 text-purple-500" />
                Arquivo
              </Label>
              <p className="text-xs font-mono bg-slate-100 p-2 rounded break-all">{task.file_path || "N/A"}</p>
            </div>
          </div>

          {task.line_number && (
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <FileCode className="h-4 w-4 text-green-500" />
                Linha do Código
              </Label>
              <p className="text-sm font-mono bg-slate-100 p-2 rounded">Linha {task.line_number}</p>
            </div>
          )}

          <Separator />

          {/* Informações de Atribuição */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-orange-500" />
                Atribuído Para
              </Label>
              <p className="text-sm">{task.assigned_to_name || "Não atribuído"}</p>
            </div>

            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-pink-500" />
                Criado Em
              </Label>
              <p className="text-sm">{new Date(task.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>

          {task.completed_at && (
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-green-500" />
                Concluído Em
              </Label>
              <p className="text-sm">{new Date(task.completed_at).toLocaleDateString("pt-BR")}</p>
            </div>
          )}

          {/* Git Info */}
          {(task.commit_hash || task.pr_number) && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-6">
                {task.commit_hash && (
                  <div>
                    <Label className="text-sm font-semibold">Commit Hash</Label>
                    <p className="text-xs font-mono bg-slate-100 p-2 rounded mt-2">{task.commit_hash}</p>
                  </div>
                )}

                {task.pr_number && (
                  <div>
                    <Label className="text-sm font-semibold">Pull Request</Label>
                    <p className="text-sm font-mono bg-slate-100 p-2 rounded mt-2">#{task.pr_number}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
