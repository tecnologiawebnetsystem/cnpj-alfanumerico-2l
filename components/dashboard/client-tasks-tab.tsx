"use client"

import { TooltipContent } from "@/components/ui/tooltip"

// VERSION: 3.0.0 - Admin Assignment Features
// Last updated: 2025-01-19
// Features: Developer assignment dropdown, developer filter, simplified interface

import type React from "react"
import { TaskApplyModal } from "@/components/dashboard/task-apply-modal"
import { AzureAccountSelector } from "@/components/integrations/azure-account-selector"
import { TaskDetailsModal } from "@/components/admin/task-details-modal"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Plus,
  ListTodo,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit,
  GitCommit,
  GitPullRequest,
  GitBranch,
  Eye,
  Trash2,
  FileCode,
  CheckSquare,
  UserPlus,
  Filter,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser } from "@/lib/auth"
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  assigned_to: string
  assigned_to_name: string
  created_at: string
  completed_at: string | null
  commit_hash: string | null
  pr_number: string | null
  updated_at: string
  repository_name?: string
  file_path?: string
  analysis_id?: string
  azure_devops_id?: string
  code_suggested?: boolean
  code_current?: boolean
  line_number?: number
}

interface Dev {
  id: string
  name: string
}

interface ClientTasksTabProps {
  clientId: string
}

export function ClientTasksTab({ clientId }: ClientTasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [devs, setDevs] = useState<Dev[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewingTask, setViewingTask] = useState<Task | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [taskDetailsModalOpen, setTaskDetailsModalOpen] = useState(false)
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<Task | null>(null)

  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [isBulkAssignDialogOpen, setIsBulkAssignDialogOpen] = useState(false)
  const [bulkAssignDev, setBulkAssignDev] = useState<string>("")
  const [isFilterAssignDialogOpen, setIsFilterAssignDialogOpen] = useState(false)
  const [filterAssignDev, setFilterAssignDev] = useState<string>("")

  const [filters, setFilters] = useState({
    repository: "",
    status: "",
    developer: "",
  })

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    assigned_to: "none",
  })

  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [selectedTaskForApply, setSelectedTaskForApply] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [syncing, setSyncing] = useState(false)
  const { toast } = useToast()
  const [showingAzureSelector, setShowingAzureSelector] = useState<string | null>(null)
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false)
  const [isDeleteAllSuccessDialogOpen, setIsDeleteAllSuccessDialogOpen] = useState(false)
  const [deleteAllResult, setDeleteAllResult] = useState<any>(null)

  useEffect(() => {
    console.log("[v0] === CLIENT TASKS TAB MOUNTED ===")
    console.log("[v0] Client ID:", clientId)
    console.log("[v0] Timestamp:", new Date().toISOString())
    fetchTasks()
    fetchDevs()
    const user = getCurrentUser()
    console.log("[v0] Setting current user:", user ? { id: user.id, email: user.email, role: user.role } : "NOT FOUND")
    setCurrentUser(user)
  }, [clientId])

  useEffect(() => {
    if (!clientId) return

    const interval = setInterval(() => {
      console.log("[v0] Auto-refreshing tasks...")
      fetchTasks()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [clientId])

  const fetchTasks = async () => {
    try {
      console.log("[v0] === FETCH TASKS START ===")
      console.log("[v0] Getting current user...")

      const currentUser = getCurrentUser()

      console.log(
        "[v0] Current user:",
        currentUser
          ? {
              id: currentUser.id,
              email: currentUser.email,
              role: currentUser.role,
            }
          : "NOT FOUND",
      )

      if (!currentUser) {
        console.error("[v0] ❌ No current user found - ABORTING")
        setLoading(false)
        return
      }

      const url = `/api/client/tasks?client_id=${clientId}&user_id=${currentUser.id}&include_repo=true`
      console.log("[v0] Fetching tasks from:", url)
      console.log("[v0] Request starting at:", new Date().toISOString())

      const response = await fetch(url)

      console.log("[v0] Response received at:", new Date().toISOString())
      console.log("[v0] Tasks API response status:", response.status)
      console.log("[v0] Response OK:", response.ok)

      if (response.ok) {
        console.log("[v0] Parsing JSON response...")
        const data = await response.json()
        console.log("[v0] ✅ Tasks loaded:", data.length, "records")
        console.log(
          "[v0] Task IDs:",
          data.map((t: Task) => t.id).slice(0, 5),
          data.length > 5 ? `... and ${data.length - 5} more` : "",
        )
        setTasks(data)
      } else {
        const errorText = await response.text()
        console.error("[v0] ❌ API error response:", errorText)
      }
    } catch (error: any) {
      console.error("[v0] === FETCH TASKS ERROR ===")
      console.error("[v0] Error fetching tasks:", error)
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    } finally {
      console.log("[v0] === FETCH TASKS END ===")
      console.log("[v0] Setting loading to false")
      setLoading(false)
    }
  }

  const fetchDevs = async () => {
    try {
      console.log("[v0] === FETCH DEVS (for dropdown) START ===")

      const currentUser = getCurrentUser()

      if (!currentUser) {
        console.error("[v0] ❌ No current user found for devs dropdown")
        return
      }

      const url = `/api/client/developers?client_id=${clientId}&user_id=${currentUser.id}`
      console.log("[v0] Fetching developers from:", url)

      const response = await fetch(url)

      console.log("[v0] Developers API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        const activeDevs = data.filter((d: Dev & { status: string }) => d.status === "active")
        console.log("[v0] ✅ Developers loaded for dropdown:", activeDevs.length, "active")
        setDevs(activeDevs)
      } else {
        const errorText = await response.text()
        console.error("[v0] ❌ Devs dropdown API error:", errorText)
      }
    } catch (error: any) {
      console.error("[v0] === FETCH DEVS (dropdown) ERROR ===")
      console.error("[v0] Error fetching devs:", error)
      console.error("[v0] Error message:", error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const currentUser = getCurrentUser()
    if (!currentUser) {
      console.error("[v0] No current user found")
      return
    }

    const assignedTo = formData.assigned_to === "none" ? null : formData.assigned_to

    const url = editingTask
      ? `/api/client/tasks/${editingTask.id}?user_id=${currentUser.id}`
      : `/api/client/tasks?user_id=${currentUser.id}`
    const method = editingTask ? "PUT" : "POST"

    console.log("[v0] Submitting task:", { url, method, assignedTo, editingTask: !!editingTask })

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          assigned_to: assignedTo,
          client_id: clientId,
          status: editingTask?.status || "pending",
        }),
      })

      console.log("[v0] Task save response status:", response.status)

      if (response.ok) {
        console.log("[v0] Task saved successfully")
        setIsDialogOpen(false)
        resetForm()
        await fetchTasks()
      } else {
        const errorData = await response.json()
        console.error("[v0] Error saving task:", errorData)
        alert("Erro ao salvar tarefa. Veja o console para detalhes.")
      }
    } catch (error) {
      console.error("[v0] Error saving task:", error)
      alert("Erro ao salvar tarefa. Tente novamente.")
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assigned_to: task.assigned_to || "none", // Updated default value to "none"
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingTask(null)
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      assigned_to: "none", // Updated default value to "none"
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Em Desenvolvimento
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Concluída
          </Badge>
        )
      case "todo":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
            <Clock className="h-3 w-3 mr-1" />A Fazer
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-gray-100",
      medium: "bg-yellow-100",
      high: "bg-red-100",
    }
    return (
      <Badge variant="outline" className={colors[priority as keyof typeof colors] || ""}>
        {priority === "low" ? "Baixa" : priority === "medium" ? "Média" : "Alta"}
      </Badge>
    )
  }

  const handleDelete = async () => {
    if (!deletingTask) return

    try {
      const currentUser = getCurrentUser()
      if (!currentUser) return

      const response = await fetch(`/api/client/tasks/${deletingTask.id}?user_id=${currentUser.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setIsDeleteDialogOpen(false)
        setDeletingTask(null)
        fetchTasks()
      }
    } catch (error) {
      console.error("[v0] Error deleting task:", error)
    }
  }

  const handleViewDetails = (task: Task) => {
    setViewingTask(task)
    setIsViewDialogOpen(true)
    setSelectedTaskForDetails(task)
    setTaskDetailsModalOpen(true)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredTasks.map((t) => t.id))
      setSelectedTasks(allIds)
    } else {
      setSelectedTasks(new Set())
    }
  }

  const handleSelectTask = (taskId: string, checked: boolean) => {
    const newSelected = new Set(selectedTasks)
    if (checked) {
      newSelected.add(taskId)
    } else {
      newSelected.delete(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const handleBulkAssign = async () => {
    if (!bulkAssignDev || selectedTasks.size === 0) return

    try {
      const currentUser = getCurrentUser()
      if (!currentUser) return

      const response = await fetch(`/api/tasks/bulk-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_ids: Array.from(selectedTasks),
          assigned_to: bulkAssignDev === "none" ? null : bulkAssignDev,
          user_id: currentUser.id,
        }),
      })

      if (response.ok) {
        setIsBulkAssignDialogOpen(false)
        setBulkAssignDev("")
        setSelectedTasks(new Set())
        await fetchTasks()
      } else {
        alert("Erro ao atribuir tarefas em massa")
      }
    } catch (error) {
      console.error("[v0] Error bulk assigning:", error)
      alert("Erro ao atribuir tarefas em massa")
    }
  }

  const handleFilterAssign = async () => {
    if (!filterAssignDev) return

    try {
      const currentUser = getCurrentUser()
      if (!currentUser) return

      const tasksToAssign = filteredTasks.map((t) => t.id)

      const response = await fetch(`/api/tasks/bulk-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_ids: tasksToAssign,
          assigned_to: filterAssignDev === "none" ? null : filterAssignDev,
          user_id: currentUser.id,
        }),
      })

      if (response.ok) {
        setIsFilterAssignDialogOpen(false)
        setFilterAssignDev("")
        await fetchTasks()
      } else {
        alert("Erro ao atribuir tarefas filtradas")
      }
    } catch (error) {
      console.error("[v0] Error filter assigning:", error)
      alert("Erro ao atribuir tarefas filtradas")
    }
  }

  const handleApplyFix = (taskId: string) => {
    console.log("[v0] Opening apply fix modal for task:", taskId)
    setSelectedTaskForApply(taskId)
    setApplyModalOpen(true)
  }

  const handleSyncToExternal = async (taskId: string, provider: string) => {
    if (provider === "azure-boards") {
      setShowingAzureSelector(taskId)
      return
    }

    try {
      setSyncing(true)
      const response = await fetch("/api/tasks/sync-external", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId, provider }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Tarefa sincronizada!",
          description: `Tarefa criada no ${provider}: ${data.task_key}`,
        })
        await fetchTasks()
      } else {
        const error = await response.json()
        toast({
          title: "Erro ao sincronizar",
          description: error.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível sincronizar a tarefa",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleQuickAssign = async (taskId: string, developerId: string) => {
    try {
      const currentUser = getCurrentUser()
      if (!currentUser) return

      console.log("[v0] Quick assigning task:", { taskId, developerId })

      const response = await fetch(`/api/client/tasks/${taskId}?user_id=${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_to: developerId === "none" ? null : developerId,
          status: "pending", // Always set to pending when admin assigns
        }),
      })

      if (response.ok) {
        console.log("[v0] Task assigned successfully")
        const devName = devs.find((d) => d.id === developerId)?.name || "Nenhum"
        toast({
          title: "Tarefa atribuída!",
          description: `Tarefa atribuída para: ${devName}`,
        })
        await fetchTasks()
      } else {
        toast({
          title: "Erro ao atribuir tarefa",
          description: "Não foi possível atribuir a tarefa",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error assigning task:", error)
      toast({
        title: "Erro",
        description: "Erro ao atribuir tarefa",
        variant: "destructive",
      })
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.repository_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assigned_to_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRepo = !filters.repository || task.repository_name === filters.repository
    const matchesStatus = !filters.status || task.status === filters.status

    const matchesDeveloper =
      !filters.developer ||
      (filters.developer === "unassigned"
        ? !task.assigned_to || task.assigned_to === ""
        : task.assigned_to === filters.developer)

    return matchesSearch && matchesRepo && matchesStatus && matchesDeveloper
  })

  const uniqueRepositories = Array.from(new Set(tasks.map((t) => t.repository_name).filter(Boolean)))

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const currentUser = getCurrentUser()
      if (!currentUser) return

      console.log("[v0] Changing task status:", { taskId, newStatus })

      const response = await fetch(`/api/client/tasks/${taskId}?user_id=${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        console.log("[v0] Task status updated successfully")
        toast({
          title: "Status atualizado!",
          description: `Tarefa alterada para: ${newStatus === "in_progress" ? "Em Desenvolvimento" : newStatus === "completed" ? "Concluída" : "Pendente"}`,
        })
        await fetchTasks()
      } else {
        toast({
          title: "Erro ao atualizar status",
          description: "Não foi possível alterar o status da tarefa",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error changing status:", error)
      toast({
        title: "Erro",
        description: "Erro ao alterar status da tarefa",
        variant: "destructive",
      })
    }
  }

  const handleAssignToMe = async (taskId: string) => {
    try {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        })
        return
      }

      console.log("[v0] Assigning task to current user:", { taskId, userId: currentUser.id })

      const response = await fetch(`/api/client/tasks/${taskId}?user_id=${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_to: currentUser.id,
          status: "in_progress",
        }),
      })

      if (response.ok) {
        console.log("[v0] Task assigned to current user successfully")
        toast({
          title: "Tarefa atribuída!",
          description: "Você pegou esta tarefa e ela foi movida para 'Em Desenvolvimento'",
        })
        await fetchTasks()
      } else {
        toast({
          title: "Erro ao atribuir tarefa",
          description: "Não foi possível atribuir a tarefa",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error assigning task:", error)
      toast({
        title: "Erro",
        description: "Erro ao atribuir tarefa",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAllTasks = async () => {
    try {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        })
        return
      }

      console.log("[v0] Deleting all tasks for client:", clientId)

      const response = await fetch(`/api/admin/cleanup-client-tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ client_id: clientId }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] All tasks deleted successfully:", result)
        setDeleteAllResult(result)
        setIsDeleteAllDialogOpen(false)
        setIsDeleteAllSuccessDialogOpen(true)
        await fetchTasks()
      } else {
        const error = await response.json()
        toast({
          title: "Erro ao excluir tarefas",
          description: error.error || "Não foi possível excluir as tarefas",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error deleting all tasks:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir todas as tarefas",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              Gerenciamento de Tarefas
            </CardTitle>
            <CardDescription>
              Visualize e gerencie todas as tarefas. Use o combo para atribuir tarefas aos desenvolvedores
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingTask ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
                  <DialogDescription>
                    {editingTask ? "Atualize os dados da tarefa" : "Crie uma nova tarefa e atribua a um desenvolvedor"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título da Tarefa</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Ex: Implementar autenticação JWT"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição Detalhada</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={5}
                      placeholder="Descreva a tarefa em detalhes, incluindo requisitos e critérios de aceitação..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger className="bg-white text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-gray-900">
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assigned_to">Atribuir para DEV (opcional)</Label>
                      <Select
                        value={formData.assigned_to}
                        onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                      >
                        <SelectTrigger className="bg-white text-gray-900">
                          <SelectValue placeholder="Selecione um DEV (opcional)" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-gray-900">
                          <SelectItem value="none">Nenhum (sem atribuição)</SelectItem>
                          {devs.map((dev) => (
                            <SelectItem key={dev.id} value={dev.id}>
                              {dev.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    {editingTask ? "Salvar Alterações" : "Criar Tarefa"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 mb-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar por tarefa, repositório, arquivo ou desenvolvedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select
              value={filters.repository || "all"}
              onValueChange={(value) => setFilters({ ...filters, repository: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Repositório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Repositórios</SelectItem>
                {uniqueRepositories
                  .filter((repo) => repo && repo.trim() !== "")
                  .map((repo) => (
                    <SelectItem key={repo} value={repo}>
                      {repo}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status || "all"}
              onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_progress">Em Desenvolvimento</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.developer || "all"}
              onValueChange={(value) => setFilters({ ...filters, developer: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Desenvolvedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Desenvolvedores</SelectItem>
                <SelectItem value="unassigned">Não Atribuído</SelectItem>
                {devs.map((dev) => (
                  <SelectItem key={dev.id} value={dev.id}>
                    {dev.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedTasks.size > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckSquare className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">{selectedTasks.size} tarefa(s) selecionada(s)</span>
              <div className="flex-1" />
              <Button size="sm" variant="outline" onClick={() => setIsBulkAssignDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Atribuir Selecionadas
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedTasks(new Set())}>
                Limpar Seleção
              </Button>
            </div>
          )}

          {/* Filter-based assign button */}
          {filteredTasks.length > 0 && (filters.repository || filters.status || filters.developer) && (
            <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <Filter className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">{filteredTasks.length} tarefa(s) filtrada(s)</span>
              <div className="flex-1" />
              <Button size="sm" variant="outline" onClick={() => setIsFilterAssignDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Atribuir Todas Filtradas
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando tarefas...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {searchTerm ? "Nenhuma tarefa encontrada" : "Nenhuma tarefa criada"}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "Tente outro termo de busca" : 'Clique em "Nova Tarefa" para começar'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedTasks.size === filteredTasks.length && filteredTasks.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold">Tarefa</TableHead>
                  <TableHead className="font-semibold">Repositório</TableHead>
                  <TableHead className="font-semibold">Arquivo</TableHead>
                  <TableHead className="font-semibold">Atribuir para</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold min-w-[200px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-muted/30">
                    <TableCell>
                      <Checkbox
                        checked={selectedTasks.has(task.id)}
                        onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-mono">{task.repository_name || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {task.file_path ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <FileCode className="h-4 w-4 text-purple-500" />
                            <span className="text-xs font-mono truncate">{task.file_path}</span>
                          </div>
                          {(task as any).line_number && (
                            <span className="text-xs text-muted-foreground ml-6">
                              Linha: {(task as any).line_number}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={task.assigned_to || "none"}
                        onValueChange={(value) => handleQuickAssign(task.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue>{task.assigned_to_name || "Não atribuído"}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Não atribuído</SelectItem>
                          {devs.map((dev) => (
                            <SelectItem key={dev.id} value={dev.id}>
                              {dev.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-pointer hover:opacity-80 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <div className="cursor-pointer">{getStatusBadge(task.status)}</div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleStatusChange(task.id, "pending")}>
                                    <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                                    Pendente
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(task.id, "in_progress")}>
                                    <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                                    Em Desenvolvimento
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(task.id, "completed")}>
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                    Concluída
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Clique para mudar o status</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <TooltipProvider>
                          {(task as any).code_suggested && (task as any).code_current && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApplyFix(task.id)}
                              className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white font-medium"
                            >
                              <FileCode className="h-4 w-4 mr-1" />
                              Aplicar Correção
                            </Button>
                          )}

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewDetails(task)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver Detalhes</TooltipContent>
                          </Tooltip>

                          {currentUser?.role !== "DEV" && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEdit(task)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setDeletingTask(task)
                                      setIsDeleteDialogOpen(true)
                                    }}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Excluir</TooltipContent>
                              </Tooltip>
                            </>
                          )}
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Desenvolvedor</Label>
                    <p className="text-sm font-medium mt-1">{viewingTask.assigned_to_name || "Não atribuído"}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">{getStatusBadge(viewingTask.status)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Criada em</Label>
                    <p className="text-sm mt-1">{new Date(viewingTask.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                </div>

                {viewingTask.status === "completed" && viewingTask.commit_hash && (
                  <div>
                    <Label className="text-muted-foreground">Informações de Conclusão</Label>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <GitCommit className="h-4 w-4" />
                        <span className="text-xs font-mono">{viewingTask.commit_hash}</span>
                      </div>
                      {viewingTask.pr_number && (
                        <div className="flex items-center gap-2">
                          <GitPullRequest className="h-4 w-4" />
                          <span className="text-xs">PR #{viewingTask.pr_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDelete}
          title="Excluir Tarefa"
          description={`Tem certeza que deseja excluir a tarefa "${deletingTask?.title}"? Esta ação não pode ser desfeita.`}
        />

        <Dialog open={isBulkAssignDialogOpen} onOpenChange={setIsBulkAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atribuir Tarefas Selecionadas</DialogTitle>
              <DialogDescription>Atribuir {selectedTasks.size} tarefa(s) para um desenvolvedor</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Selecionar Desenvolvedor</Label>
                <Select value={bulkAssignDev} onValueChange={setBulkAssignDev}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um desenvolvedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Remover Atribuição</SelectItem>
                    {devs.map((dev) => (
                      <SelectItem key={dev.id} value={dev.id}>
                        {dev.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleBulkAssign} disabled={!bulkAssignDev} className="flex-1">
                  Atribuir
                </Button>
                <Button variant="outline" onClick={() => setIsBulkAssignDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isFilterAssignDialogOpen} onOpenChange={setIsFilterAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atribuir Tarefas Filtradas</DialogTitle>
              <DialogDescription>
                Atribuir {filteredTasks.length} tarefa(s) filtrada(s) para um desenvolvedor
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Selecionar Desenvolvedor</Label>
                <Select value={filterAssignDev} onValueChange={setFilterAssignDev}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um desenvolvedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Remover Atribuição</SelectItem>
                    {devs.map((dev) => (
                      <SelectItem key={dev.id} value={dev.id}>
                        {dev.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleFilterAssign} disabled={!filterAssignDev} className="flex-1">
                  Atribuir
                </Button>
                <Button variant="outline" onClick={() => setIsFilterAssignDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Apply Fix Modal */}
        {selectedTaskForApply && currentUser && (
          <TaskApplyModal
            open={applyModalOpen}
            onOpenChange={setApplyModalOpen}
            taskId={selectedTaskForApply}
            userId={currentUser.id}
            userRole={currentUser.role}
            onSuccess={() => {
              fetchTasks()
              setApplyModalOpen(false)
              setSelectedTaskForApply(null)
            }}
          />
        )}

        <Dialog open={!!showingAzureSelector} onOpenChange={(open) => !open && setShowingAzureSelector(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Selecionar Conta Azure DevOps</DialogTitle>
              <DialogDescription>
                Escolha qual organização e projeto do Azure DevOps usar para esta tarefa
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <AzureAccountSelector
                repositoryId={tasks.find((t) => t.id === showingAzureSelector)?.repository_name}
                showAddButton={true}
                onAccountChange={async (accountId) => {
                  if (showingAzureSelector) {
                    // Sync to Azure with selected account
                    try {
                      setSyncing(true)
                      const response = await fetch("/api/tasks/sync-external", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          task_id: showingAzureSelector,
                          provider: "azure-boards",
                          account_id: accountId,
                        }),
                      })

                      if (response.ok) {
                        const data = await response.json()
                        toast({
                          title: "Tarefa sincronizada!",
                          description: `Work Item criado no Azure DevOps: ${data.task_key}`,
                        })
                        await fetchTasks()
                        setShowingAzureSelector(null)
                      } else {
                        const error = await response.json()
                        toast({
                          title: "Erro ao sincronizar",
                          description: error.error,
                          variant: "destructive",
                        })
                      }
                    } catch (error) {
                      toast({
                        title: "Erro",
                        description: "Não foi possível sincronizar a tarefa",
                        variant: "destructive",
                      })
                    } finally {
                      setSyncing(false)
                    }
                  }
                }}
              />
              <Button variant="outline" onClick={() => setShowingAzureSelector(null)} className="w-full">
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir TODAS as Tarefas do Cliente?</AlertDialogTitle>
              {/* CHANGE: Removed AlertDialogDescription to avoid p > ul nesting error */}
              <div className="text-sm text-muted-foreground space-y-4 mt-2">
                <div className="text-base">
                  Esta ação irá excluir <strong>TODAS as {tasks.length} tarefas</strong> deste cliente permanentemente.
                </div>
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <div className="font-medium text-destructive mb-2">⚠️ ATENÇÃO:</div>
                  <ul className="text-sm space-y-1 text-destructive/90">
                    <li>• Todas as tarefas de todos os desenvolvedores serão excluídas</li>
                    <li>• Todos os repositórios e análises perderão suas tarefas</li>
                    <li>• Histórico, progresso e comentários serão removidos</li>
                    <li>• Esta ação NÃO pode ser desfeita!</li>
                  </ul>
                </div>
                <div className="text-sm font-medium">
                  Digite <span className="font-mono bg-muted px-2 py-1 rounded">CONFIRMAR EXCLUSÃO</span> para
                  prosseguir:
                </div>
                <Input id="confirm-delete-all" placeholder="Digite: CONFIRMAR EXCLUIR" className="font-mono" />
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  const input = document.getElementById("confirm-delete-all") as HTMLInputElement
                  if (input && input.value === "CONFIRMAR EXCLUSÃO") {
                    handleDeleteAllTasks()
                  } else {
                    toast({
                      title: "Confirmação incorreta",
                      description: "Digite exatamente 'CONFIRMAR EXCLUSÃO' para prosseguir",
                      variant: "destructive",
                    })
                  }
                }}
                className="bg-destructive hover:bg-destructive/90"
              >
                Sim, Excluir TODAS as Tarefas
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isDeleteAllSuccessDialogOpen} onOpenChange={setIsDeleteAllSuccessDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-green-600">✓ Todas as Tarefas Foram Excluídas!</AlertDialogTitle>
              {/* CHANGE: Removed AlertDialogDescription to fix p > ul HTML nesting error */}
              <div className="text-sm text-muted-foreground">
                A limpeza completa foi realizada com sucesso.
                {deleteAllResult && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg space-y-2">
                    <div className="font-medium text-green-900">Resumo da exclusão:</div>
                    <ul className="text-sm space-y-1 text-green-800">
                      <li>✓ {deleteAllResult.deleted_tasks || 0} tarefas excluídas</li>
                      <li>✓ {deleteAllResult.deleted_progress || 0} registros de progresso removidos</li>
                      <li>✓ {deleteAllResult.deleted_history || 0} registros de histórico removidos</li>
                      <li>✓ {deleteAllResult.deleted_comments || 0} comentários removidos</li>
                    </ul>
                    <p className="mt-3 text-xs text-green-700">
                      O sistema foi completamente limpo e está pronto para novas tarefas.
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => {
                  setIsDeleteAllSuccessDialogOpen(false)
                  setDeleteAllResult(null)
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                OK, Entendi
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <TaskDetailsModal
          task={selectedTaskForDetails}
          open={taskDetailsModalOpen}
          onOpenChange={setTaskDetailsModalOpen}
        />
      </CardContent>
    </Card>
  )
}
