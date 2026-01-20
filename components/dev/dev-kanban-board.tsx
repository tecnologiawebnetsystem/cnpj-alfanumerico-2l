"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  Brain,
  Lightbulb,
  Timer,
  Play,
  Copy,
  AlertCircle,
  X,
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
  line_number?: number
  source_code?: string
  suggested_code?: string
  code_before?: string
  code_after?: string
  ai_explanation?: string
  ai_suggestion?: string
  ai_confidence?: number
  estimated_hours?: number
  remaining_hours?: number
  completed_hours?: number
}

interface DevKanbanBoardProps {
  tasks: Task[]
  onTaskUpdate: (taskId: string, updates: any) => Promise<void>
}

function DroppableColumn({ 
  id, 
  children, 
  title, 
  count, 
  icon: Icon, 
  colorClass,
  bgColor
}: { 
  id: string
  children: React.ReactNode
  title: string
  count: number
  icon: React.ElementType
  colorClass: string
  bgColor: string
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  
  return (
    <div 
      ref={setNodeRef} 
      className={`flex flex-col rounded-lg transition-all ${
        isOver ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
    >
      {/* Column Header */}
      <div className={`${colorClass} rounded-t-lg px-3 py-2.5`}>
        <div className="flex items-center gap-2 text-white">
          <Icon className="h-4 w-4" />
          <h3 className="font-medium text-sm">{title}</h3>
          <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-0 text-xs px-2 py-0">
            {count}
          </Badge>
        </div>
      </div>
      
      {/* Column Content */}
      <div className={`flex-1 ${bgColor} rounded-b-lg p-2 min-h-[400px] border border-t-0 space-y-2`}>
        {children}
      </div>
    </div>
  )
}

export function DevKanbanBoard({ tasks, onTaskUpdate }: DevKanbanBoardProps) {
  const { toast } = useToast()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [completionData, setCompletionData] = useState({
    commit_hash: "",
    pr_number: "",
  })
  const [activeId, setActiveId] = useState<string | null>(null)
  
  // Hours editing state
  const [isEditingHours, setIsEditingHours] = useState(false)
  const [editedHours, setEditedHours] = useState({
    estimated_hours: 0,
    remaining_hours: 0,
    completed_hours: 0,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  )

  const pendingTasks = tasks.filter((t) => t.status === "pending")
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress")
  const completedTasks = tasks.filter((t) => t.status === "completed")

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const taskId = active.id as string
    const task = tasks.find((t) => t.id === taskId)

    if (!task) return

    const newStatus = over.id as string

    if (!["pending", "in_progress", "completed"].includes(newStatus)) return
    if (task.status === newStatus) return

    // Special handling for completed status
    if (newStatus === "completed") {
      setSelectedTask(task)
      setCompletionData({
        commit_hash: task.commit_hash || "",
        pr_number: task.pr_number || "",
      })
      setIsCompletionDialogOpen(true)
      return
    }

    try {
      await onTaskUpdate(taskId, { status: newStatus })
      toast({
        title: "Tarefa movida!",
        description: `A tarefa foi movida para ${newStatus === "pending" ? "Pendentes" : "Em Desenvolvimento"}`,
      })
    } catch (error) {
      toast({
        title: "Erro ao mover tarefa",
        description: "Nao foi possivel atualizar a tarefa",
        variant: "destructive",
      })
    }
  }

  const handleCardClick = (task: Task) => {
    setSelectedTask(task)
    setEditedHours({
      estimated_hours: task.estimated_hours || 0,
      remaining_hours: task.remaining_hours || 0,
      completed_hours: task.completed_hours || 0,
    })
    setIsDetailDialogOpen(true)
  }

  const handleSaveHours = async () => {
    if (!selectedTask) return
    try {
      await onTaskUpdate(selectedTask.id, editedHours)
      toast({
        title: "Horas atualizadas!",
        description: "O controle de horas foi salvo com sucesso.",
      })
      setIsEditingHours(false)
    } catch (error) {
      toast({
        title: "Erro ao salvar horas",
        description: "Nao foi possivel atualizar o controle de horas",
        variant: "destructive",
      })
    }
  }

  const handleCompleteTask = async () => {
    if (!selectedTask) return

    if (!completionData.commit_hash || !completionData.pr_number) {
      toast({
        title: "Campos obrigatorios",
        description: "Por favor, preencha o commit hash e o numero do PR",
        variant: "destructive",
      })
      return
    }

    try {
      await onTaskUpdate(selectedTask.id, {
        status: "completed",
        commit_hash: completionData.commit_hash,
        pr_number: completionData.pr_number,
        completed_at: new Date().toISOString(),
      })

      toast({
        title: "Tarefa finalizada!",
        description: "A tarefa foi marcada como concluida",
      })

      setIsCompletionDialogOpen(false)
      setSelectedTask(null)
      setCompletionData({ commit_hash: "", pr_number: "" })
    } catch (error) {
      toast({
        title: "Erro ao finalizar tarefa",
        description: "Nao foi possivel finalizar a tarefa",
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-l-red-500"
      case "high":
        return "border-l-orange-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-gray-400"
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
        <Card 
          className={`hover:shadow-md transition-all cursor-pointer border-l-4 ${getPriorityBorderColor(task.priority)} bg-white`}
          onClick={() => handleCardClick(task)}
        >
          <CardContent className="p-2.5">
            <div className="flex items-start gap-1.5">
              <div 
                {...attributes} 
                {...listeners} 
                className="mt-0.5 flex-shrink-0 touch-none cursor-grab active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-start justify-between gap-1.5">
                  <h4 className="font-medium text-xs leading-tight text-gray-900 line-clamp-2">
                    {task.title}
                  </h4>
                  <Badge variant="outline" className={`text-[9px] px-1 py-0 flex-shrink-0 ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </Badge>
                </div>
                
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                  {task.description}
                </p>

                {task.repository_name && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <GitBranch className="h-2.5 w-2.5 flex-shrink-0 text-blue-500" />
                    <span className="truncate">{task.repository_name}</span>
                  </div>
                )}

                {task.file_path && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-gray-50 rounded px-1.5 py-0.5">
                    <FileCode className="h-2.5 w-2.5 flex-shrink-0" />
                    <span className="truncate font-mono">{task.file_path}</span>
                  </div>
                )}

                {task.status === "completed" && task.commit_hash && task.pr_number && (
                  <div className="space-y-0.5 text-[10px] pt-1.5 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <GitCommit className="h-2.5 w-2.5 text-green-500" />
                      <span className="font-mono">{task.commit_hash}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <GitPullRequest className="h-2.5 w-2.5 text-purple-500" />
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

  const EmptyState = ({ icon: Icon, message }: { icon: React.ElementType; message: string }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mb-2">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <p className="text-xs text-muted-foreground">{message}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">Arraste tarefas para ca</p>
    </div>
  )

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Pendentes */}
          <DroppableColumn 
            id="pending" 
            title="Pendentes" 
            count={pendingTasks.length}
            icon={Clock}
            colorClass="bg-gradient-to-r from-orange-500 to-orange-600"
            bgColor="bg-orange-50/50 border-orange-200"
          >
            {pendingTasks.length === 0 ? (
              <EmptyState icon={Clock} message="Nenhuma tarefa pendente" />
            ) : (
              pendingTasks.map((task) => <SortableTaskCard key={task.id} task={task} />)
            )}
          </DroppableColumn>

          {/* Em Desenvolvimento */}
          <DroppableColumn 
            id="in_progress" 
            title="Em Desenvolvimento" 
            count={inProgressTasks.length}
            icon={PlayCircle}
            colorClass="bg-gradient-to-r from-blue-500 to-blue-600"
            bgColor="bg-blue-50/50 border-blue-200"
          >
            {inProgressTasks.length === 0 ? (
              <EmptyState icon={PlayCircle} message="Nenhuma tarefa em andamento" />
            ) : (
              inProgressTasks.map((task) => <SortableTaskCard key={task.id} task={task} />)
            )}
          </DroppableColumn>

          {/* Finalizadas */}
          <DroppableColumn 
            id="completed" 
            title="Finalizadas" 
            count={completedTasks.length}
            icon={CheckCircle2}
            colorClass="bg-gradient-to-r from-green-500 to-green-600"
            bgColor="bg-green-50/50 border-green-200"
          >
            {completedTasks.length === 0 ? (
              <EmptyState icon={CheckCircle2} message="Nenhuma tarefa finalizada" />
            ) : (
              completedTasks.map((task) => <SortableTaskCard key={task.id} task={task} />)
            )}
          </DroppableColumn>
        </div>

        <DragOverlay>
          {activeTask ? (
            <Card className={`rotate-2 shadow-2xl border-l-4 ${getPriorityBorderColor(activeTask.priority)} bg-white w-[250px]`}>
              <CardContent className="p-2.5">
                <div className="flex items-start gap-1.5">
                  <GripVertical className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-1.5 mb-1.5">
                      <h4 className="font-medium text-xs leading-tight">{activeTask.title}</h4>
                      <Badge variant="outline" className={`text-[9px] px-1 py-0 ${getPriorityColor(activeTask.priority)}`}>
                        {activeTask.priority}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">{activeTask.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileCode className="h-5 w-5" />
              Detalhes da Tarefa
            </DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              {/* Title and badges */}
              <div className="space-y-2">
                <h3 className="font-semibold text-base">{selectedTask.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={getPriorityColor(selectedTask.priority)}>
                    {selectedTask.priority}
                  </Badge>
                  <Badge variant="outline" className={
                    selectedTask.status === "pending" ? "bg-orange-100 text-orange-700" :
                    selectedTask.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                    "bg-green-100 text-green-700"
                  }>
                    {selectedTask.status === "pending" ? "Pendente" :
                     selectedTask.status === "in_progress" ? "Em Progresso" : "Concluida"}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
              </div>

              {/* File location */}
              {(selectedTask.repository_name || selectedTask.file_path) && (
                <div className="border rounded-lg p-3 space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-blue-500" />
                    Localizacao
                  </h4>
                  {selectedTask.repository_name && (
                    <p className="text-sm text-muted-foreground">
                      Repositorio: <code className="text-primary">{selectedTask.repository_name}</code>
                    </p>
                  )}
                  {selectedTask.file_path && (
                    <p className="text-sm text-muted-foreground">
                      Arquivo: <code className="text-primary font-mono text-xs">{selectedTask.file_path}</code>
                    </p>
                  )}
                  {selectedTask.line_number && (
                    <p className="text-sm text-muted-foreground">
                      Linha: <Badge variant="secondary">{selectedTask.line_number}</Badge>
                    </p>
                  )}
                </div>
              )}

              {/* Current Code (Problem) */}
              {selectedTask.source_code && (
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      Codigo Atual (Problema)
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedTask.source_code || "")
                        toast({ title: "Copiado!", description: "Codigo copiado para a area de transferencia" })
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <pre className="bg-red-50 border border-red-200 rounded p-2 text-xs overflow-x-auto">
                    <code className="text-red-800">
                      {selectedTask.code_before && <span className="text-muted-foreground">{selectedTask.code_before}{"\n"}</span>}
                      <span className="bg-red-200 px-1">{selectedTask.source_code}</span>
                      {selectedTask.code_after && <span className="text-muted-foreground">{"\n"}{selectedTask.code_after}</span>}
                    </code>
                  </pre>
                </div>
              )}

              {/* Suggested Code (Fix) */}
              {selectedTask.suggested_code && (
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-2 text-green-600">
                      <Play className="h-4 w-4" />
                      Codigo Sugerido (Correcao)
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedTask.suggested_code || "")
                        toast({ title: "Copiado!", description: "Codigo copiado para a area de transferencia" })
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <pre className="bg-green-50 border border-green-200 rounded p-2 text-xs overflow-x-auto">
                    <code className="text-green-800">
                      {selectedTask.code_before && <span className="text-muted-foreground">{selectedTask.code_before}{"\n"}</span>}
                      <span className="bg-green-200 px-1">{selectedTask.suggested_code}</span>
                      {selectedTask.code_after && <span className="text-muted-foreground">{"\n"}{selectedTask.code_after}</span>}
                    </code>
                  </pre>
                </div>
              )}

              {/* AI Analysis */}
              {selectedTask.ai_explanation && (
                <div className="border rounded-lg p-3 bg-primary/5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      Analise da IA
                    </h4>
                    {selectedTask.ai_confidence && (
                      <Badge className={
                        selectedTask.ai_confidence >= 0.8 ? "bg-green-100 text-green-700" :
                        selectedTask.ai_confidence >= 0.5 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }>
                        {Math.round(selectedTask.ai_confidence * 100)}% confianca
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedTask.ai_explanation}</p>
                </div>
              )}

              {/* AI Suggestion */}
              {selectedTask.ai_suggestion && (
                <div className="border rounded-lg p-3 bg-yellow-50">
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2 text-yellow-700">
                    <Lightbulb className="h-4 w-4" />
                    Sugestao da IA
                  </h4>
                  <p className="text-sm text-yellow-800 whitespace-pre-wrap">{selectedTask.ai_suggestion}</p>
                </div>
              )}

              {/* Hours Tracking */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Controle de Horas
                  </h4>
                  {!isEditingHours ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingHours(true)}>
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditingHours(false)}>
                        <X className="h-3 w-3" />
                      </Button>
                      <Button size="sm" onClick={handleSaveHours}>
                        Salvar
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px] font-medium">Estimado</span>
                    </div>
                    {isEditingHours ? (
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        value={editedHours.estimated_hours}
                        onChange={(e) => setEditedHours({...editedHours, estimated_hours: Number(e.target.value)})}
                        className="h-7 text-center text-sm font-bold"
                      />
                    ) : (
                      <p className="text-lg font-bold text-blue-700">{selectedTask.estimated_hours || 0}h</p>
                    )}
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                      <PlayCircle className="h-3 w-3" />
                      <span className="text-[10px] font-medium">Restante</span>
                    </div>
                    {isEditingHours ? (
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        value={editedHours.remaining_hours}
                        onChange={(e) => setEditedHours({...editedHours, remaining_hours: Number(e.target.value)})}
                        className="h-7 text-center text-sm font-bold"
                      />
                    ) : (
                      <p className="text-lg font-bold text-orange-700">{selectedTask.remaining_hours || 0}h</p>
                    )}
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span className="text-[10px] font-medium">Completado</span>
                    </div>
                    {isEditingHours ? (
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        value={editedHours.completed_hours}
                        onChange={(e) => setEditedHours({...editedHours, completed_hours: Number(e.target.value)})}
                        className="h-7 text-center text-sm font-bold"
                      />
                    ) : (
                      <p className="text-lg font-bold text-green-700">{selectedTask.completed_hours || 0}h</p>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                {(selectedTask.estimated_hours || 0) > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Progresso</span>
                      <span>{Math.round(((selectedTask.completed_hours || 0) / (selectedTask.estimated_hours || 1)) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${Math.min(((selectedTask.completed_hours || 0) / (selectedTask.estimated_hours || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Completed info */}
              {selectedTask.status === "completed" && selectedTask.commit_hash && (
                <div className="border rounded-lg p-3 bg-green-50">
                  <h4 className="text-sm font-medium mb-2 text-green-700">Informacoes de Conclusao</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <GitCommit className="h-3 w-3 text-green-600" />
                      <span>Commit: <code className="font-mono">{selectedTask.commit_hash}</code></span>
                    </div>
                    {selectedTask.pr_number && (
                      <div className="flex items-center gap-2">
                        <GitPullRequest className="h-3 w-3 text-purple-600" />
                        <span>PR: #{selectedTask.pr_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Fechar
            </Button>
            {selectedTask?.status === "pending" && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={async () => {
                  await onTaskUpdate(selectedTask.id, { status: "in_progress" })
                  toast({ title: "Tarefa iniciada!", description: "Status atualizado para Em Desenvolvimento" })
                  setIsDetailDialogOpen(false)
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Tarefa
              </Button>
            )}
            {selectedTask?.status === "in_progress" && (
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setIsDetailDialogOpen(false)
                  setIsCompletionDialogOpen(true)
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Finalizar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <div className="p-3 bg-gray-50 rounded-lg border">
              <h4 className="font-semibold text-sm mb-1">{selectedTask?.title}</h4>
              <p className="text-xs text-muted-foreground">{selectedTask?.description}</p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="commit_hash" className="flex items-center gap-2 text-sm">
                  <GitCommit className="h-4 w-4" />
                  Commit Hash *
                </Label>
                <Input
                  id="commit_hash"
                  placeholder="ex: a1b2c3d4e5f6"
                  value={completionData.commit_hash}
                  onChange={(e) => setCompletionData({ ...completionData, commit_hash: e.target.value })}
                  className="mt-1.5 font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="pr_number" className="flex items-center gap-2 text-sm">
                  <GitPullRequest className="h-4 w-4" />
                  Numero do PR *
                </Label>
                <Input
                  id="pr_number"
                  placeholder="ex: 123"
                  value={completionData.pr_number}
                  onChange={(e) => setCompletionData({ ...completionData, pr_number: e.target.value })}
                  className="mt-1.5 text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsCompletionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleCompleteTask} className="gap-2 bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Finalizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
