"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users, Code, Eraser } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser } from "@/lib/auth"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { NotificationDialog } from "@/components/ui/notification-dialog"

interface Dev {
  id: string
  name: string
  email: string
  status: string
  created_at: string
  tasks_count?: number
  completed_tasks?: number
}

interface ClientDevsTabProps {
  clientId: string
}

export function ClientDevsTab({ clientId }: ClientDevsTabProps) {
  const [devs, setDevs] = useState<Dev[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDev, setEditingDev] = useState<Dev | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    status: "active",
  })
  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false)
  const [cleanupDevId, setCleanupDevId] = useState<string | null>(null)
  const [cleanupPreview, setCleanupPreview] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteDevId, setDeleteDevId] = useState<string | null>(null)
  const [isCleanupSuccessDialogOpen, setIsCleanupSuccessDialogOpen] = useState(false)
  const [cleanupSuccessData, setCleanupSuccessData] = useState<any>(null)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationConfig, setNotificationConfig] = useState<{
    title: string
    description: string
    type: "success" | "error" | "warning" | "info"
    showCancel?: boolean
    onConfirm?: () => void | Promise<void>
  }>({
    title: "",
    description: "",
    type: "info",
  })

  const userId = getCurrentUser()?.id || ""

  useEffect(() => {
    console.log("[v0] === CLIENT DEVS TAB MOUNTED ===")
    console.log("[v0] Client ID:", clientId)
    console.log("[v0] Timestamp:", new Date().toISOString())
    fetchDevs()
  }, [clientId])

  const fetchDevs = async () => {
    try {
      console.log("[v0] === FETCH DEVS START ===")
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

      const url = `/api/client/devs?client_id=${clientId}&user_id=${currentUser.id}`
      console.log("[v0] Fetching developers from:", url)
      console.log("[v0] Request starting at:", new Date().toISOString())

      const response = await fetch(url, {
        credentials: "include",
      })

      console.log("[v0] Response received at:", new Date().toISOString())
      console.log("[v0] Developers API response status:", response.status)
      console.log("[v0] Response OK:", response.ok)

      if (response.ok) {
        console.log("[v0] Parsing JSON response...")
        const data = await response.json()
        console.log("[v0] ✅ Developers loaded:", data.length, "records")
        console.log(
          "[v0] Developer IDs:",
          data.map((d: Dev) => d.id),
        )
        setDevs(data)
      } else {
        const errorText = await response.text()
        console.error("[v0] ❌ API error response:", errorText)
      }
    } catch (error: any) {
      console.error("[v0] === FETCH DEVS ERROR ===")
      console.error("[v0] Error fetching devs:", error)
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    } finally {
      console.log("[v0] === FETCH DEVS END ===")
      console.log("[v0] Setting loading to false")
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] === DEV FORM SUBMIT START ===")
    console.log("[v0] Editing dev:", editingDev)
    console.log("[v0] Form data:", formData)

    const currentUser = getCurrentUser()
    if (!currentUser) {
      console.error("[v0] No current user found")
      showNotification({
        title: "Erro de Autenticação",
        description: "Usuário não encontrado. Faça login novamente.",
        type: "error",
      })
      return
    }

    console.log("[v0] Current user:", currentUser.email, "Role:", currentUser.role)

    const url = editingDev
      ? `/api/client/devs/${editingDev.id}?user_id=${currentUser.id}`
      : `/api/client/devs?user_id=${currentUser.id}`
    const method = editingDev ? "PUT" : "POST"

    console.log("[v0] Request URL:", url)
    console.log("[v0] Request method:", method)

    try {
      console.log("[v0] Sending request...")
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          client_id: clientId,
          role: "DEV",
        }),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response OK:", response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Response data:", data)

        showNotification({
          title: "Sucesso!",
          description: editingDev ? "Desenvolvedor atualizado com sucesso!" : "Desenvolvedor cadastrado com sucesso!",
          type: "success",
        })

        setIsDialogOpen(false)
        resetForm()
        await fetchDevs()
      } else {
        const errorData = await response.json()
        console.error("[v0] Error response:", errorData)

        showNotification({
          title: "Erro ao Salvar",
          description: errorData.error || "Erro ao salvar desenvolvedor. Tente novamente.",
          type: "error",
        })
      }
    } catch (error) {
      console.error("[v0] Exception in handleSubmit:", error)
      showNotification({
        title: "Erro de Conexão",
        description: "Erro ao conectar com o servidor. Tente novamente.",
        type: "error",
      })
    }

    console.log("[v0] === DEV FORM SUBMIT END ===")
  }

  const handleEdit = (dev: Dev) => {
    setEditingDev(dev)
    setFormData({
      name: dev.name,
      email: dev.email,
      password: "",
      status: dev.status,
    })
    setIsDialogOpen(true)
  }

  const handleCleanupTasks = async (devId: string) => {
    setCleanupDevId(devId)

    try {
      const response = await fetch("/api/admin/cleanup-developer-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ developer_id: devId, preview_only: true }),
      })

      if (response.ok) {
        const data = await response.json()
        setCleanupPreview(data.preview)
        setIsCleanupDialogOpen(true)
      }
    } catch (error) {
      console.error("Error getting cleanup preview:", error)
    }
  }

  const confirmCleanupTasks = async () => {
    if (!cleanupDevId) return

    try {
      const response = await fetch("/api/admin/cleanup-developer-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ developer_id: cleanupDevId }),
      })

      if (response.ok) {
        const result = await response.json()
        setCleanupSuccessData(result)
        setIsCleanupDialogOpen(false)
        setCleanupDevId(null)
        setCleanupPreview(null)
        setIsCleanupSuccessDialogOpen(true)
        fetchDevs()
      }
    } catch (error) {
      console.error("Error cleaning up tasks:", error)
    }
  }

  const handleDelete = (id: string) => {
    console.log("[v0] handleDelete called for dev id:", id)
    setDeleteDevId(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteDevId) return

    console.log("[v0] confirmDelete - Deleting developer:", deleteDevId)
    try {
      const response = await fetch(`/api/client/devs/${deleteDevId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      })

      console.log("[v0] Delete response status:", response.status)
      const data = await response.json()

      if (!response.ok) {
        console.log("[v0] Error deleting developer:", data)
        showNotification({
          title: "Erro ao Excluir",
          description: `Erro ao excluir desenvolvedor: ${data.error}`,
          type: "error",
        })
        return
      }

      showNotification({
        title: "Sucesso!",
        description: "Desenvolvedor excluído com sucesso!",
        type: "success",
      })
      await fetchDevs()
    } catch (error) {
      console.error("[v0] Exception deleting developer:", error)
      showNotification({
        title: "Erro ao Excluir",
        description: "Erro ao excluir desenvolvedor. Tente novamente.",
        type: "error",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteDevId(null)
    }
  }

  const resetForm = () => {
    setEditingDev(null)
    setFormData({
      name: "",
      email: "",
      password: "",
      status: "active",
    })
  }

  const showNotification = (config: typeof notificationConfig) => {
    setNotificationConfig(config)
    setNotificationOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Desenvolvedores
              </CardTitle>
              <CardDescription>Gerencie os desenvolvedores do seu time</CardDescription>
            </div>
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
                  Novo DEV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingDev ? "Editar Desenvolvedor" : "Novo Desenvolvedor"}</DialogTitle>
                  <DialogDescription>Preencha os dados do desenvolvedor</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="João Silva"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="joao@empresa.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {editingDev ? "Nova Senha (deixe em branco para não alterar)" : "Senha"}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingDev}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full">
                    {editingDev ? "Salvar Alterações" : "Cadastrar DEV"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando desenvolvedores...</div>
          ) : devs.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Nenhum desenvolvedor cadastrado</p>
              <p className="text-sm text-muted-foreground">Clique em "Novo DEV" para começar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Tarefas</TableHead>
                  <TableHead>Concluídas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devs.map((dev) => (
                  <TableRow key={dev.id}>
                    <TableCell className="font-medium">{dev.name}</TableCell>
                    <TableCell>{dev.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{dev.tasks_count || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50">
                        {dev.completed_tasks || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={dev.status === "active" ? "default" : "secondary"}>
                        {dev.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCleanupTasks(dev.id)}
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                          title="Limpar tarefas deste desenvolvedor"
                        >
                          <Eraser className="h-4 w-4 mr-1" />
                          Limpar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(dev)} title="Editar desenvolvedor">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(dev.id)}
                          className="text-destructive"
                          title="Excluir desenvolvedor"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isCleanupDialogOpen} onOpenChange={setIsCleanupDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Todas as Tarefas?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá excluir permanentemente todas as tarefas atribuídas a este desenvolvedor.
              {cleanupPreview && (
                <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                  <div className="font-medium">Será excluído:</div>
                  <ul className="text-sm space-y-1">
                    <li>Total de tarefas: {cleanupPreview.tasks_count || 0}</li>
                    <li>Concluídas: {cleanupPreview.completed_count || 0}</li>
                    <li>Em progresso: {cleanupPreview.in_progress_count || 0}</li>
                    <li>Pendentes: {cleanupPreview.pending_count || 0}</li>
                  </ul>
                </div>
              )}
              <strong className="mt-4 text-destructive font-medium block">Esta ação não pode ser desfeita!</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCleanupTasks} className="bg-destructive hover:bg-destructive/90">
              Sim, Excluir Tarefas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Desenvolvedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá excluir permanentemente este desenvolvedor do sistema.
              <strong className="mt-4 text-destructive font-medium block">Esta ação não pode ser desfeita!</strong>
              <span className="mt-2 text-sm block">
                Nota: As tarefas atribuídas a este desenvolvedor não serão excluídas. Use o botão de limpeza de tarefas
                antes se desejar removê-las.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Sim, Excluir Desenvolvedor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success dialog after cleanup */}
      <AlertDialog open={isCleanupSuccessDialogOpen} onOpenChange={setIsCleanupSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-600">✓ Tarefas Excluídas com Sucesso!</AlertDialogTitle>
            <div className="text-sm text-muted-foreground">
              Todas as tarefas do desenvolvedor foram removidas do sistema.
              {cleanupSuccessData && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg space-y-2">
                  <div className="font-medium text-green-900">Resumo da exclusão:</div>
                  <ul className="text-sm space-y-1 text-green-800">
                    <li>✓ {cleanupSuccessData.deleted_tasks || 0} tarefas excluídas</li>
                    <li>✓ {cleanupSuccessData.deleted_progress || 0} registros de progresso removidos</li>
                    <li>✓ {cleanupSuccessData.deleted_history || 0} registros de histórico removidos</li>
                    <li>✓ {cleanupSuccessData.deleted_comments || 0} comentários removidos</li>
                  </ul>
                </div>
              )}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setIsCleanupSuccessDialogOpen(false)
                setCleanupSuccessData(null)
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              OK, Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notification Dialog */}
      <NotificationDialog open={notificationOpen} onOpenChange={setNotificationOpen} {...notificationConfig} />
    </>
  )
}
