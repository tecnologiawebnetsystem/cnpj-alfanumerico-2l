"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ListTodo, Loader2, Play, CheckCircle2, Clock } from "lucide-react"
import { DevTaskDetail } from "@/components/dev/dev-task-detail"
import Image from "next/image"

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

export default function DevTasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

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
      setTasks(data)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterTasks = (status: string) => {
    return tasks.filter((t) => t.status === status)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Play className="h-3 w-3 mr-1" />
            Em Progresso
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Concluída
          </Badge>
        )
      default:
        return null
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-slate-50">
      <div className="bg-gradient-to-r from-primary to-primary/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Image
                src="/images/act-logo-square.jfif"
                alt="ACT Digital"
                width={48}
                height={48}
                className="rounded-xl shadow-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">Minhas Tarefas</h1>
                <p className="text-primary-foreground/80">{user?.name}</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/dev/board")}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Ver Board Kanban
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5" />
                  Lista de Tarefas ({tasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">Todas ({tasks.length})</TabsTrigger>
                    <TabsTrigger value="pending">Pendentes ({filterTasks("pending").length})</TabsTrigger>
                    <TabsTrigger value="in_progress">Em Progresso ({filterTasks("in_progress").length})</TabsTrigger>
                    <TabsTrigger value="completed">Concluídas ({filterTasks("completed").length})</TabsTrigger>
                  </TabsList>

                  {["all", "pending", "in_progress", "completed"].map((tabValue) => (
                    <TabsContent key={tabValue} value={tabValue} className="mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tarefa</TableHead>
                            <TableHead>Repositório</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(tabValue === "all" ? tasks : filterTasks(tabValue)).map((task) => (
                            <TableRow key={task.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{task.title}</div>
                                  <div className="text-sm text-muted-foreground truncate max-w-md">
                                    {task.description}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <code className="text-sm">{task.repository_name}</code>
                              </TableCell>
                              <TableCell>{getStatusBadge(task.status)}</TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm" onClick={() => setSelectedTask(task)}>
                                  Ver Detalhes
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {(tabValue === "all" ? tasks : filterTasks(tabValue)).length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                Nenhuma tarefa encontrada
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div>
            {selectedTask ? (
              <DevTaskDetail task={selectedTask} onUpdateStatus={handleUpdateStatus} />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <ListTodo className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Selecione uma tarefa para ver os detalhes</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
