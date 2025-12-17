"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Clock,
  PlayCircle,
  CheckCircle2,
  GitCommit,
  GitPullRequest,
  GripVertical,
  GitBranch,
  FileCode,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  created_at: string
  completed_at: string | null
  commit_hash: string | null
  pr_number: string | null
  repository_name?: string
  file_path?: string
  assigned_to_name?: string
}

interface DevKanbanBoardProps {
  tasks: Task[]
  onTaskUpdate: (taskId: string, updates: any) => Promise<void>
}

function DroppableColumn({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  )
}

export function DevKanbanBoard({ tasks, onTaskUpdate }: DevKanbanBoardProps) {
  const { toast } = useToast()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false)
  const [completionData, setCompletionData] = useState({
    commit_hash: "",
    pr_number: "",
  })
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  console.log("[v0] DevKanbanBoard rendering with tasks:", tasks)

  const pendingTasks = tasks.filter((t) => t.status === "pending")
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress")
  const completedTasks = tasks.filter((t) => t.status === "completed")

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    console.log("[v0] Drag started for task:", event.active.id)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) {
      console.log("[v0] Drag ended with no drop target")
      return
    }

    const taskId = active.id as string
    const task = tasks.find((t) => t.id === taskId)

    if (!task) {
      console.log("[v0] Task not found:", taskId)
      return
    }

    const newStatus = over.id as string

    console.log("[v0] Drag ended - Task:", taskId, "Current status:", task.status, "New status:", newStatus)

    if (!["pending", "in_progress", "completed"].includes(newStatus)) {
      console.log("[v0] Invalid drop target, ignoring")
      return
    }

    // Don't update if dropped in same column
    if (task.status === newStatus) {
      console.log("[v0] Task dropped in same column, no update needed")
      return
    }

    // Special handling for completed status - require commit hash and PR
    if (newStatus === "completed") {
      console.log("[v0] Moving to completed, opening dialog")
      setSelectedTask(task)
      setCompletionData({
        commit_hash: task.commit_hash || "",
        pr_number: task.pr_number || "",
      })
      setIsCompletionDialogOpen(true)
      return
    }

    // Update task status immediately for pending and in_progress
    try {
      console.log("[v0] Updating task status from", task.status, "to:", newStatus)
      await onTaskUpdate(taskId, { status: newStatus })
      toast({
        title: "Tarefa movida!",
        description: `A tarefa foi movida para ${newStatus === "pending" ? "Pendentes" : "Em Desenvolvimento"}`,
      })
    } catch (error) {
      console.error("[v0] Error updating task:", error)
      toast({
        title: "Erro ao mover tarefa",
        description: "Não foi possível atualizar a tarefa",
        variant: "destructive",
      })
    }
  }

  const handleCompleteTask = async () => {
    if (!selectedTask) return

    if (!completionData.commit_hash || !completionData.pr_number) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o commit hash e o número do PR",
        variant: "destructive",
      })
      return
    }

    await onTaskUpdate(selectedTask.id, {
      status: "completed",
      commit_hash: completionData.commit_hash,
      pr_number: completionData.pr_number,
      completed_at: new Date().toISOString(),
    })

    toast({
      title: "Tarefa finalizada!",
      description: "A tarefa foi marcada como concluída",
    })

    setIsCompletionDialogOpen(false)
    setSelectedTask(null)
    setCompletionData({ commit_hash: "", pr_number: "" })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const SortableTaskCard = ({ task }: { task: Task }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: task.id,
      data: { status: task.status },
    })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    return (
      <div ref={setNodeRef} style={style}>
        <Card className="mb-3 hover:shadow-lg transition-all cursor-move border-l-4 border-l-blue-500 bg-white">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
                <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-sm leading-tight flex-1">{task.title}</h4>
                  <Badge variant="outline" className={`text-xs ml-2 ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>

                {task.repository_name && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <GitBranch className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{task.repository_name}</span>
                  </div>
                )}

                {task.file_path && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileCode className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate font-mono text-[10px]">{task.file_path}</span>
                  </div>
                )}

                {task.status === "completed" && task.commit_hash && task.pr_number && (
                  <div className="space-y-1 text-xs pt-2 border-t">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GitCommit className="h-3 w-3" />
                      <span className="font-mono">{task.commit_hash}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GitPullRequest className="h-3 w-3" />
                      <span>PR #{task.pr_number}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeTask = tasks.find((t) => t.id === activeId)

  const allTaskIds = tasks.map((t) => t.id)

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid md:grid-cols-3 gap-6">
          {/* Pendentes Column */}
          <DroppableColumn id="pending">
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Pendentes ({pendingTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 min-h-[600px] bg-orange-50/30">
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">Nenhuma tarefa pendente</p>
                    <p className="text-xs mt-2">Arraste tarefas aqui</p>
                  </div>
                ) : (
                  pendingTasks.map((task) => <SortableTaskCard key={task.id} task={task} />)
                )}
              </CardContent>
            </Card>
          </DroppableColumn>

          {/* Em Desenvolvimento Column */}
          <DroppableColumn id="in_progress">
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PlayCircle className="h-5 w-5" />
                  Em Desenvolvimento ({inProgressTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 min-h-[600px] bg-blue-50/30">
                {inProgressTasks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <PlayCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">Nenhuma tarefa em desenvolvimento</p>
                    <p className="text-xs mt-2">Arraste tarefas aqui</p>
                  </div>
                ) : (
                  inProgressTasks.map((task) => <SortableTaskCard key={task.id} task={task} />)
                )}
              </CardContent>
            </Card>
          </DroppableColumn>

          {/* Finalizadas Column */}
          <DroppableColumn id="completed">
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5" />
                  Finalizadas ({completedTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 min-h-[600px] bg-green-50/30">
                {completedTasks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">Nenhuma tarefa finalizada</p>
                    <p className="text-xs mt-2">Arraste tarefas aqui</p>
                  </div>
                ) : (
                  completedTasks.map((task) => <SortableTaskCard key={task.id} task={task} />)
                )}
              </CardContent>
            </Card>
          </DroppableColumn>
        </div>

        <DragOverlay>
          {activeTask ? (
            <Card className="rotate-3 shadow-2xl border-l-4 border-l-blue-500 bg-white opacity-90">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <GripVertical className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm leading-tight flex-1">{activeTask.title}</h4>
                      <Badge variant="outline" className={`text-xs ml-2 ${getPriorityColor(activeTask.priority)}`}>
                        {activeTask.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{activeTask.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Completion Dialog */}
      <Dialog open={isCompletionDialogOpen} onOpenChange={setIsCompletionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Finalizar Tarefa
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-sm mb-1">{selectedTask?.title}</h4>
              <p className="text-xs text-muted-foreground">{selectedTask?.description}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="commit_hash" className="flex items-center gap-2">
                  <GitCommit className="h-4 w-4" />
                  Commit Hash *
                </Label>
                <Input
                  id="commit_hash"
                  placeholder="ex: a1b2c3d4e5f6"
                  value={completionData.commit_hash}
                  onChange={(e) => setCompletionData({ ...completionData, commit_hash: e.target.value })}
                  className="mt-2 font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">O hash do commit que resolve esta tarefa</p>
              </div>

              <div>
                <Label htmlFor="pr_number" className="flex items-center gap-2">
                  <GitPullRequest className="h-4 w-4" />
                  Número do PR *
                </Label>
                <Input
                  id="pr_number"
                  placeholder="ex: 123"
                  value={completionData.pr_number}
                  onChange={(e) => setCompletionData({ ...completionData, pr_number: e.target.value })}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">O número do Pull Request no repositório</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompletionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCompleteTask} className="gap-2 bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Finalizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
