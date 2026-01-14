"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, logout } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LogOut, Code, Clock, CheckCircle2, GitBranch, FileCode, AlertCircle, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

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

export default function TasksPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [viewingTask, setViewingTask] = useState<Task | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    console.log(" TasksPage mounted")
    const currentUser = getCurrentUser()
    console.log(" Current user:", currentUser)

    if (!currentUser) {
      console.log(" No user found, redirecting to login")
      router.push("/login")
      return
    }

    const userRole = currentUser.role.toUpperCase()
    if (userRole !== "DEV" && userRole !== "DEVELOPER") {
      console.log(" User is not dev, redirecting to dashboard")
      router.push("/dashboard")
      return
    }

    console.log(" User is dev, fetching tasks")
    setUser(currentUser)
    fetchTasks()
  }, [router])

  const fetchTasks = async () => {
    try {
      console.log(" Fetching tasks from API")
      const currentUser = getCurrentUser()
      if (!currentUser) {
        console.log(" No current user found")
        return
      }

      const response = await fetch(`/api/dev/tasks?user_id=${currentUser.id}&include_details=true`, {
        credentials: "include",
      })
      console.log(" Tasks API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log(" Tasks fetched:", data)
        setTasks(data)
      } else {
        const errorText = await response.text()
        console.log(" Tasks API error:", errorText)
      }
    } catch (error) {
      console.error(" Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskUpdate = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/dev/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      })

      if (response.ok) {
        toast({
          title: "Status atualizado!",
          description: `Tarefa movida para: ${newStatus === "pending" ? "Pendente" : newStatus === "in_progress" ? "Em Desenvolvimento" : "Concluído"}`,
        })
        await fetchTasks()
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a tarefa",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa",
        variant: "destructive",
      })
    }
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDrop = (newStatus: string) => {
    if (!draggedTask) return
    if (draggedTask.status === newStatus) return

    handleTaskUpdate(draggedTask.id, newStatus)
    setDraggedTask(null)
  }

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.repository_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const pendingTasks = filteredTasks.filter((t) => t.status === "pending")
  const inProgressTasks = filteredTasks.filter((t) => t.status === "in_progress")
  const completedTasks = filteredTasks.filter((t) => t.status === "completed")

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-l-red-500"
      case "medium":
        return "border-l-4 border-l-yellow-500"
      case "low":
        return "border-l-4 border-l-gray-400"
      default:
        return ""
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Code className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Kanban de Tarefas
                </h1>
                <p className="text-sm text-slate-600">Desenvolvedor: {user.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout} className="gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Input
            placeholder="Buscar por tarefa, repositório ou arquivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md bg-white shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna Pendente */}
          <Card
            className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 shadow-lg transition-all hover:shadow-xl"
            onDragOver={(e) => {
              e.preventDefault()
              e.currentTarget.classList.add("ring-4", "ring-yellow-400")
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("ring-4", "ring-yellow-400")
            }}
            onDrop={(e) => {
              e.currentTarget.classList.remove("ring-4", "ring-yellow-400")
              handleDrop("pending")
            }}
          >
            <CardHeader className="pb-3 bg-yellow-100/50 rounded-t-lg border-b-2 border-yellow-300">
              <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
                <Clock className="h-5 w-5 text-yellow-600" />
                Pendente
                <Badge className="ml-auto bg-yellow-600 text-white">{pendingTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {pendingTasks.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-8">Nenhuma tarefa pendente</p>
              ) : (
                pendingTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`cursor-move hover:shadow-lg hover:scale-[1.02] transition-all bg-white ${getPriorityColor(task.priority)}`}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-2">{task.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>

                      {task.repository_name && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 mb-2">
                          <GitBranch className="h-3 w-3" />
                          <span className="font-mono truncate">{task.repository_name}</span>
                        </div>
                      )}

                      {task.file_path && (
                        <div className="flex items-center gap-1 text-xs text-purple-600 mb-3">
                          <FileCode className="h-3 w-3" />
                          <span className="font-mono truncate">{task.file_path}</span>
                        </div>
                      )}

                      <div className="flex gap-2 justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                          {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleTaskUpdate(task.id, "in_progress")}
                          className="h-7 text-xs"
                        >
                          Iniciar
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Coluna Em Desenvolvimento */}
          <Card
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-lg transition-all hover:shadow-xl"
            onDragOver={(e) => {
              e.preventDefault()
              e.currentTarget.classList.add("ring-4", "ring-blue-400")
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("ring-4", "ring-blue-400")
            }}
            onDrop={(e) => {
              e.currentTarget.classList.remove("ring-4", "ring-blue-400")
              handleDrop("in_progress")
            }}
          >
            <CardHeader className="pb-3 bg-blue-100/50 rounded-t-lg border-b-2 border-blue-300">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Em Desenvolvimento
                <Badge className="ml-auto bg-blue-600 text-white">{inProgressTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {inProgressTasks.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-8">Nenhuma tarefa em desenvolvimento</p>
              ) : (
                inProgressTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`cursor-move hover:shadow-lg hover:scale-[1.02] transition-all bg-white ${getPriorityColor(task.priority)}`}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-2">{task.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>

                      {task.repository_name && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 mb-2">
                          <GitBranch className="h-3 w-3" />
                          <span className="font-mono truncate">{task.repository_name}</span>
                        </div>
                      )}

                      {task.file_path && (
                        <div className="flex items-center gap-1 text-xs text-purple-600 mb-3">
                          <FileCode className="h-3 w-3" />
                          <span className="font-mono truncate">{task.file_path}</span>
                        </div>
                      )}

                      <div className="flex gap-2 justify-between items-center">
                        <Badge className="bg-blue-600 text-xs">
                          {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleTaskUpdate(task.id, "completed")}
                          className="h-7 text-xs bg-green-600 hover:bg-green-700"
                        >
                          Concluir
                          <CheckCircle2 className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Coluna Concluído */}
          <Card
            className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg transition-all hover:shadow-xl"
            onDragOver={(e) => {
              e.preventDefault()
              e.currentTarget.classList.add("ring-4", "ring-green-400")
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("ring-4", "ring-green-400")
            }}
            onDrop={(e) => {
              e.currentTarget.classList.remove("ring-4", "ring-green-400")
              handleDrop("completed")
            }}
          >
            <CardHeader className="pb-3 bg-green-100/50 rounded-t-lg border-b-2 border-green-300">
              <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Concluído
                <Badge className="ml-auto bg-green-600 text-white">{completedTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {completedTasks.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-8">Nenhuma tarefa concluída</p>
              ) : (
                completedTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`opacity-75 bg-white hover:opacity-100 transition-opacity ${getPriorityColor(task.priority)}`}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-2 line-through">{task.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>

                      {task.repository_name && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 mb-2">
                          <GitBranch className="h-4 w-4 text-blue-500" />
                          <p className="text-sm font-mono">{task.repository_name || "N/A"}</p>
                        </div>
                      )}

                      <div className="mt-3">
                        <Badge className="bg-green-600 text-xs">Concluída ✓</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* View Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Tarefa</DialogTitle>
            </DialogHeader>
            {viewingTask && (
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Título</Label>
                  <p className="text-lg font-semibold">{viewingTask.title}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="text-sm whitespace-pre-wrap">{viewingTask.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Repositório</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <GitBranch className="h-4 w-4 text-blue-500" />
                      <p className="text-sm font-mono">{viewingTask.repository_name || "N/A"}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Arquivo</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <FileCode className="h-4 w-4 text-purple-500" />
                      <p className="text-xs font-mono">{viewingTask.file_path || "-"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Criada em</Label>
                  <p className="text-sm mt-1">{new Date(viewingTask.created_at).toLocaleString("pt-BR")}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
