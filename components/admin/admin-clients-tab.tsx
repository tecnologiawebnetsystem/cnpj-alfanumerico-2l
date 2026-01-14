"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function AdminClientsTab() {
  const [clients, setClients] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<any>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    email: "",
    status: "active",
  })

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    if (!isDialogOpen) {
      setFormData({
        name: "",
        cnpj: "",
        email: "",
        status: "active",
      })
      setEditingClient(null)
    } else if (editingClient) {
      setFormData({
        name: editingClient.name || "",
        cnpj: editingClient.cnpj || "",
        email: editingClient.email || "",
        status: editingClient.status || "active",
      })
    }
  }, [isDialogOpen, editingClient])

  const loadClients = async () => {
    try {
      const userStr = localStorage.getItem("user")
      const user = userStr ? JSON.parse(userStr) : null
      const userId = user?.id || ""

      console.log(" Loading clients for user:", userId)

      const response = await fetch(`/api/admin/clients?user_id=${userId}`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      } else {
        console.error(" Failed to load clients, status:", response.status)
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    }
  }

  const handleSave = async () => {
    console.log(" handleSave called with formData:", formData)
    console.log(" editingClient:", editingClient)

    try {
      const userStr = localStorage.getItem("user")
      const user = userStr ? JSON.parse(userStr) : null
      const userId = user?.id || ""

      const url = editingClient
        ? `/api/admin/clients/${editingClient.id}?user_id=${userId}`
        : `/api/admin/clients?user_id=${userId}`
      const method = editingClient ? "PUT" : "POST"

      console.log(" Sending request to:", url, "Method:", method)

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      console.log(" Response status:", response.status)

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro ao salvar cliente")
        } else {
          const errorText = await response.text()
          console.error(" Non-JSON error response:", errorText)
          throw new Error("Erro no servidor ao salvar cliente")
        }
      }

      const responseData = await response.json()
      console.log(" Response data:", responseData)

      toast({
        title: "Sucesso",
        description: editingClient ? "Cliente atualizado com sucesso" : "Cliente criado com sucesso",
      })
      setIsDialogOpen(false)
      loadClients()
    } catch (error: any) {
      console.error(" Error in handleSave:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o cliente",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const userStr = localStorage.getItem("user")
      const user = userStr ? JSON.parse(userStr) : null
      const userId = user?.id || ""

      const response = await fetch(`/api/admin/clients/${id}?user_id=${userId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Cliente excluído com sucesso",
        })
        loadClients()
        setDeleteConfirmOpen(false)
        setClientToDelete(null)
      } else {
        throw new Error("Erro ao excluir cliente")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente",
        variant: "destructive",
      })
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cnpj?.includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-slate-200"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-slate-900">{editingClient ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
              <DialogDescription className="text-slate-600">Preencha os dados do cliente</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">
                  Nome da Empresa
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white border-slate-200"
                  placeholder="Ex: Aegis Technology"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj" className="text-slate-700">
                  CNPJ
                </Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="bg-white border-slate-200"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white border-slate-200"
                  placeholder="contato@empresa.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-slate-700">
                  Status
                </Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-200">
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white border-slate-200 shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200">
              <TableHead className="text-slate-700 font-semibold">Empresa</TableHead>
              <TableHead className="text-slate-700 font-semibold">CNPJ</TableHead>
              <TableHead className="text-slate-700 font-semibold">E-mail</TableHead>
              <TableHead className="text-slate-700 font-semibold">Status</TableHead>
              <TableHead className="text-slate-700 font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-600">
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id} className="border-slate-100 hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">{client.name}</TableCell>
                  <TableCell className="text-slate-700">{client.cnpj}</TableCell>
                  <TableCell className="text-slate-700">{client.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={client.status === "active" ? "default" : "secondary"}
                      className={client.status === "active" ? "bg-green-100 text-green-700" : ""}
                    >
                      {client.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => {
                          setEditingClient(client)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setClientToDelete(client)
                          setDeleteConfirmOpen(true)
                        }}
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

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-white border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Tem certeza que deseja excluir o cliente <strong className="text-slate-900">{clientToDelete?.name}</strong>?
              <br />
              <br />
              Esta ação não pode ser desfeita e todos os dados do cliente serão permanentemente removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteConfirmOpen(false)
                setClientToDelete(null)
              }}
              className="border-slate-200"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(clientToDelete?.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir Cliente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
