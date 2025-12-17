"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Trash2, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export function AdminUsersTab() {
  const [users, setUsers] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false)
  const [userToCleanup, setUserToCleanup] = useState<any>(null)
  const [cleanupPreview, setCleanupPreview] = useState<any>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "dev",
    client_id: "none",
    status: "active",
  })

  useEffect(() => {
    loadUsers()
    loadClients()
  }, [])

  const loadUsers = async () => {
    try {
      console.log("[v0] Loading users...")
      const user = await getCurrentUser()
      if (!user) {
        console.log("[v0] No current user found")
        return
      }

      console.log("[v0] Current user ID:", user.id)
      const response = await fetch(`/api/admin/users?user_id=${user.id}`, {
        credentials: "include",
      })

      console.log("[v0] Users API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Users loaded:", data.length, "users")
        setUsers(data)
      } else {
        console.error("[v0] Error loading users, status:", response.status)
      }
    } catch (error) {
      console.error("[v0] Error loading users:", error)
    }
  }

  const loadClients = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const response = await fetch(`/api/admin/clients?user_id=${user.id}`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    }
  }

  const handleNewUser = () => {
    setEditingUser(null)
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "dev",
      client_id: "none",
      status: "active",
    })
    setIsDialogOpen(true)
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      client_id: user.client_id || "none",
      status: user.status,
    })
    setIsDialogOpen(true)
  }

  const handleSaveUser = async () => {
    try {
      if (!formData.name || !formData.email || (!editingUser && !formData.password)) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos obrigatórios",
          variant: "destructive",
        })
        return
      }

      const user = await getCurrentUser()
      if (!user) return

      const url = editingUser
        ? `/api/admin/users/${editingUser.id}?user_id=${user.id}`
        : `/api/admin/users?user_id=${user.id}`
      const method = editingUser ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: editingUser ? "Usuário atualizado" : "Usuário criado",
          description: editingUser
            ? `${formData.name} foi atualizado com sucesso`
            : `${formData.name} foi criado com sucesso`,
        })
        setIsDialogOpen(false)
        loadUsers()
      } else {
        const error = await response.json()
        toast({
          title: "Erro ao salvar usuário",
          description: error.error || "Ocorreu um erro ao processar sua solicitação",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao salvar usuário:", error)
      toast({
        title: "Erro ao salvar usuário",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return

    try {
      const user = await getCurrentUser()
      if (!user) return

      const response = await fetch(`/api/admin/users/${userId}?user_id=${user.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        toast({
          title: "Usuário excluído",
          description: "O usuário foi removido com sucesso",
        })
        loadUsers()
      } else {
        const error = await response.json()
        toast({
          title: "Erro ao excluir usuário",
          description: error.error || "Ocorreu um erro ao processar sua solicitação",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao excluir usuário:", error)
      toast({
        title: "Erro ao excluir usuário",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive",
      })
    }
  }

  const handleOpenCleanupDialog = async (user: any) => {
    setUserToCleanup(user)
    
    try {
      const response = await fetch("/api/admin/cleanup-developer-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ developer_id: user.id, preview: true }),
      })

      if (response.ok) {
        const data = await response.json()
        setCleanupPreview(data.preview)
      }
    } catch (error) {
      console.error("Erro ao buscar preview:", error)
    }
    
    setCleanupDialogOpen(true)
  }

  const handleCleanupTasks = async () => {
    if (!userToCleanup) return

    try {
      const response = await fetch("/api/admin/cleanup-developer-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ developer_id: userToCleanup.id }),
      })

      if (response.ok) {
        toast({
          title: "Tarefas excluídas",
          description: `Todas as tarefas de ${userToCleanup.name} foram removidas`,
        })
        setCleanupDialogOpen(false)
        setUserToCleanup(null)
        setCleanupPreview(null)
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível excluir as tarefas",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao limpar tarefas:", error)
      toast({
        title: "Erro",
        description: "Erro ao processar a solicitação",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-lg shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-white">Usuários do Sistema</h2>
          <p className="text-indigo-100">Gerencie todos os usuários cadastrados</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-200" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-indigo-200"
            />
          </div>
          <Button onClick={handleNewUser} className="gap-2 bg-white text-indigo-600 hover:bg-indigo-50">
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </div>

      <Card className="bg-white/95 backdrop-blur shadow-xl border-0">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200">
              <TableHead className="text-slate-900">Nome</TableHead>
              <TableHead className="text-slate-900">E-mail</TableHead>
              <TableHead className="text-slate-900">Cliente</TableHead>
              <TableHead className="text-slate-900">Perfil</TableHead>
              <TableHead className="text-slate-900">Status</TableHead>
              <TableHead className="text-slate-900">Último Acesso</TableHead>
              <TableHead className="text-slate-900">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-600 py-8">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-slate-200">
                  <TableCell className="font-medium text-slate-900">{user.name}</TableCell>
                  <TableCell className="text-slate-700">{user.email}</TableCell>
                  <TableCell className="text-slate-700">{user.client_name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-300">
                      {user.role === "ADMIN_CLIENT" || user.role === "admin"
                        ? "Admin"
                        : user.role === "DEV" || user.role === "dev"
                          ? "Desenvolvedor"
                          : user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString("pt-BR") : "Nunca"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {(user.role === "DEV" || user.role === "dev") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenCleanupDialog(user)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          title="Limpar todas as tarefas"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={cleanupDialogOpen} onOpenChange={setCleanupDialogOpen}>
        <AlertDialogContent className="bg-white border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">Excluir todas as tarefas?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Você está prestes a excluir TODAS as tarefas atribuídas a{" "}
              <span className="font-semibold text-slate-900">{userToCleanup?.name}</span>.
              {cleanupPreview && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded text-sm">
                  <p className="font-medium text-orange-900 mb-2">Serão excluídas:</p>
                  <ul className="space-y-1 text-orange-800">
                    <li>{cleanupPreview.tasks_count || 0} tarefas</li>
                    <li>{cleanupPreview.activities_count || 0} atividades</li>
                    <li>{cleanupPreview.edits_count || 0} edições de código</li>
                  </ul>
                </div>
              )}
              <span className="block mt-3 text-red-600 font-medium">Esta ação não pode ser desfeita!</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300 text-slate-900">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCleanupTasks}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">{editingUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
            <DialogDescription className="text-slate-600">
              {editingUser ? "Atualize as informações do usuário" : "Preencha os dados do novo usuário"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-slate-900">
                Nome
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-slate-900">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-900">
                Senha {editingUser && "(deixe em branco para não alterar)"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <Label htmlFor="client" className="text-slate-900">
                Cliente (Opcional)
              </Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
              >
                <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                  <SelectValue placeholder="Nenhum cliente" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="none" className="text-slate-900">
                    Nenhum cliente
                  </SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id} className="text-slate-900">
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="role" className="text-slate-900">
                Perfil
              </Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="ADMIN_CLIENT" className="text-slate-900">
                    Admin
                  </SelectItem>
                  <SelectItem value="DEV" className="text-slate-900">
                    Desenvolvedor
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status" className="text-slate-900">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="active" className="text-slate-900">
                    Ativo
                  </SelectItem>
                  <SelectItem value="inactive" className="text-slate-900">
                    Inativo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-slate-300 text-slate-900"
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveUser} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
