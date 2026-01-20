"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ListTodo, 
  Loader2, 
  Play, 
  CheckCircle2, 
  Clock, 
  Search, 
  GitBranch, 
  FileCode, 
  ChevronRight,
  AlertTriangle,
  Target
} from "lucide-react"
import { DevTaskDetail } from "@/components/dev/dev-task-detail"
import { DevHeader } from "@/components/dev/dev-header"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  repository_name: string
  file_path: string
  created_at: string
  completed_at: string | null
}

const Loading = () => null

export default function DevTasksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [repositoryFilter, setRepositoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/login")
      return
    }

    if (currentUser.role !== "dev") {
      router.push("/dashboard")
      return
    }

    setUser(currentUser)
    fetchTasks(currentUser.id)
  }, [router])

  const fetchTasks = async (userId: string) => {
    try {
      const res = await fetch(`/api/dev/tasks?user_id=${userId}&include_details=true`)
      const data = await res.json()
      setTasks(data || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  // Get unique repositories for filter dropdown
  const uniqueRepositories = [...new Set(tasks.map(t => t.repository_name).filter(Boolean))]

  const applyFilters = (taskList: Task[]) => {
    let filtered = taskList

    // Apply repository filter
    if (repositoryFilter !== "all") {
      filtered = filtered.filter(t => t.repository_name === repositoryFilter)
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.repository_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.file_path?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  const filterTasks = (status: string) => {
    let filtered = tasks.filter((t) => t.status === status)
    return applyFilters(filtered)
  }

  const getAllFilteredTasks = () => {
    let filtered = tasks
    
    // Apply status filter if not "all"
    if (statusFilter !== "all") {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    return applyFilters(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-orange-100 text-orange-700 border border-orange-200 text-[10px] px-1.5 py-0">
            <Clock className="h-2.5 w-2.5 mr-1" />
            Pendente
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-700 border border-blue-200 text-[10px] px-1.5 py-0">
            <Play className="h-2.5 w-2.5 mr-1" />
            Em Progresso
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 border border-green-200 text-[10px] px-1.5 py-0">
            <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
            Concluida
          </Badge>
        )
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-100 text-red-700 border-red-200",
      high: "bg-orange-100 text-orange-700 border-orange-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      low: "bg-green-100 text-green-700 border-green-200",
    }
    return (
      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colors[priority] || "bg-gray-100 text-gray-700"}`}>
        {priority}
      </Badge>
    )
  }

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/dev/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        if (user) {
          fetchTasks(user.id)
        }
        setSelectedTask(null)
      }
    } catch (error) {
      console.error("Error updating task status:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando suas tarefas...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const TaskCard = ({ task }: { task: Task }) => (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-sm border-l-4 ${
        selectedTask?.id === task.id 
          ? "ring-2 ring-primary border-l-primary bg-primary/5" 
          : "border-l-transparent hover:border-l-primary/50"
      }`}
      onClick={() => setSelectedTask(task)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
            </div>
            <h3 className="font-medium text-sm text-foreground line-clamp-1">
              {task.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
              {task.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-muted-foreground">
              {task.repository_name && (
                <div className="flex items-center gap-1">
                  <GitBranch className="h-2.5 w-2.5 text-blue-500" />
                  <span className="truncate max-w-[120px]">{task.repository_name}</span>
                </div>
              )}
              {task.file_path && (
                <div className="flex items-center gap-1">
                  <FileCode className="h-2.5 w-2.5" />
                  <span className="font-mono truncate max-w-[120px]">{task.file_path}</span>
                </div>
              )}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  )

  const criticalTasks = tasks.filter(t => t.priority === "critical" && t.status !== "completed")
  const completionRate = tasks.length > 0 
    ? Math.round((filterTasks("completed").length / tasks.length) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-muted/30">
      <DevHeader user={user} activeView="tasks" />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Minhas Tarefas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie e acompanhe suas tarefas atribuidas
          </p>
        </div>

        {/* Stats Cards - Compact and Consistent */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card className="bg-card border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Total</p>
                  <p className="text-xl font-bold mt-1">{tasks.length}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <ListTodo className="h-4 w-4 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-orange-600 uppercase tracking-wide font-medium">Pendentes</p>
                  <p className="text-xl font-bold text-orange-600 mt-1">{filterTasks("pending").length}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-blue-600 uppercase tracking-wide font-medium">Em Progresso</p>
                  <p className="text-xl font-bold text-blue-600 mt-1">{filterTasks("in_progress").length}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Play className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-green-600 uppercase tracking-wide font-medium">Concluidas</p>
                  <p className="text-xl font-bold text-green-600 mt-1">{filterTasks("completed").length}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-primary uppercase tracking-wide font-medium">Progresso</p>
                  <p className="text-xl font-bold text-primary mt-1">{completionRate}%</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert for critical tasks */}
        {criticalTasks.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-700">
                  Voce tem {criticalTasks.length} tarefa(s) critica(s) pendente(s)
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3 px-4 pt-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ListTodo className="h-4 w-4" />
                      Tarefas
                    </CardTitle>
                  </div>
                  
                  {/* Search and Filters - Same Row */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1 sm:max-w-[200px]">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 h-8 text-sm"
                      />
                    </div>
                    <Select value={repositoryFilter} onValueChange={setRepositoryFilter}>
                      <SelectTrigger className="h-8 text-sm w-full sm:w-[180px]">
                        <GitBranch className="h-3.5 w-3.5 mr-2 text-muted-foreground flex-shrink-0" />
                        <SelectValue placeholder="Repositorio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos repositorios</SelectItem>
                        {uniqueRepositories.map((repo) => (
                          <SelectItem key={repo} value={repo}>{repo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-8 text-sm w-full sm:w-[160px]">
                        <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground flex-shrink-0" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos status</SelectItem>
                        <SelectItem value="pending">Pendentes</SelectItem>
                        <SelectItem value="in_progress">Em Progresso</SelectItem>
                        <SelectItem value="completed">Concluidas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Suspense fallback={<Loading />}>
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 h-8">
                      <TabsTrigger value="all" className="text-xs">
                        Todas ({getAllFilteredTasks().length})
                      </TabsTrigger>
                      <TabsTrigger value="pending" className="text-xs">
                        Pendentes ({filterTasks("pending").length})
                      </TabsTrigger>
                      <TabsTrigger value="in_progress" className="text-xs">
                        Progresso ({filterTasks("in_progress").length})
                      </TabsTrigger>
                      <TabsTrigger value="completed" className="text-xs">
                        Concluidas ({filterTasks("completed").length})
                      </TabsTrigger>
                    </TabsList>

                    {["all", "pending", "in_progress", "completed"].map((tabValue) => (
                      <TabsContent key={tabValue} value={tabValue} className="mt-3 space-y-2">
                        {(tabValue === "all" ? getAllFilteredTasks() : filterTasks(tabValue)).length === 0 ? (
                          <div className="text-center py-10">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                              <ListTodo className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">Nenhuma tarefa encontrada</p>
                          </div>
                        ) : (
                          (tabValue === "all" ? getAllFilteredTasks() : filterTasks(tabValue)).map((task) => (
                            <TaskCard key={task.id} task={task} />
                          ))
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* Task Detail */}
          <div className="lg:col-span-1">
            {selectedTask ? (
              <DevTaskDetail task={selectedTask} onUpdateStatus={handleUpdateStatus} />
            ) : (
              <Card className="h-[350px] flex items-center justify-center bg-muted/30 border-dashed">
                <CardContent className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <ListTodo className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Selecione uma tarefa</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Clique em uma tarefa para ver os detalhes
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
