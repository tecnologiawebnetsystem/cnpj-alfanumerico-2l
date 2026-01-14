"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Database, Trash2, TestTube, CheckCircle, XCircle, Loader2, Eye, EyeOff } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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

interface DatabaseConnection {
  id: string
  name: string
  description: string
  database_type: string
  host: string
  port: number
  database_name: string
  username: string
  status: string
  last_tested_at: string | null
  last_error: string | null
  created_at: string
}

export function DatabaseConnectionsTab() {
  const [connections, setConnections] = useState<DatabaseConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [showFormModal, setShowFormModal] = useState(false)
  const [deleteConnectionId, setDeleteConnectionId] = useState<string | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    database_type: "postgresql",
    host: "",
    port: 5432,
    database_name: "",
    username: "",
    password: "",
    ssl_enabled: false,
  })

  useEffect(() => {
    loadConnections()
  }, [])

  const loadConnections = async () => {
    try {
      console.log(" Loading database connections...")
      const response = await fetch("/api/database-connections")

      console.log(" Response status:", response.status)
      console.log(" Response content-type:", response.headers.get("content-type"))

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error(" Response is not JSON:", text)
        throw new Error("Resposta inválida do servidor")
      }

      const data = await response.json()
      console.log(" Connections loaded:", data.connections?.length || 0)

      setConnections(data.connections || [])
    } catch (error) {
      console.error(" Error loading database connections:", error)
      setConnections([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/database-connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadConnections()
        setShowFormModal(false)
        resetForm()
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error(" Error creating connection:", error)
      alert("Erro ao criar conexão")
    }
  }

  const handleTest = async (id: string) => {
    setTestingId(id)
    try {
      const response = await fetch(`/api/database-connections/${id}/test`, {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        alert(`✅ ${data.message}`)
      } else {
        alert(`❌ ${data.message}${data.error ? `\n\nErro: ${data.error}` : ""}`)
      }

      await loadConnections()
    } catch (error) {
      console.error(" Error testing connection:", error)
      alert("Erro ao testar conexão")
    } finally {
      setTestingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteConnectionId) return

    try {
      const response = await fetch(`/api/database-connections/${deleteConnectionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadConnections()
        setDeleteConnectionId(null)
      } else {
        alert("Erro ao deletar conexão")
      }
    } catch (error) {
      console.error(" Error deleting connection:", error)
      alert("Erro ao deletar conexão")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      database_type: "postgresql",
      host: "",
      port: 5432,
      database_name: "",
      username: "",
      password: "",
      ssl_enabled: false,
    })
  }

  const getDatabaseIcon = (type: string) => {
    return <Database className="h-6 w-6" />
  }

  const getDatabaseLabel = (type: string) => {
    const labels: Record<string, string> = {
      postgresql: "PostgreSQL",
      mysql: "MySQL",
      oracle: "Oracle",
      sqlserver: "SQL Server",
      mongodb: "MongoDB",
    }
    return labels[type] || type
  }

  const getDefaultPort = (type: string) => {
    const ports: Record<string, number> = {
      postgresql: 5432,
      mysql: 3306,
      oracle: 1521,
      sqlserver: 1433,
      mongodb: 27017,
    }
    return ports[type] || 5432
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conexões de Banco de Dados</h2>
          <p className="text-muted-foreground mt-1">
            Cadastre conexões para analisar tabelas, campos, procedures e identificar campos CNPJ automaticamente
          </p>
        </div>
        <Button onClick={() => setShowFormModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conexão
        </Button>
      </div>

      {/* Lista de Conexões */}
      {connections.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Database className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Nenhuma conexão cadastrada</h3>
              <p className="text-muted-foreground mt-1">
                Cadastre uma conexão de banco de dados para começar a análise
              </p>
            </div>
            <Button onClick={() => setShowFormModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeira Conexão
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((connection) => (
            <Card key={connection.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">{getDatabaseIcon(connection.database_type)}</div>
                  <div>
                    <h3 className="font-semibold text-base">{connection.name}</h3>
                    <p className="text-xs text-muted-foreground">{getDatabaseLabel(connection.database_type)}</p>
                  </div>
                </div>
                {connection.status === "active" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>

              {connection.description && <p className="text-sm text-muted-foreground mb-4">{connection.description}</p>}

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Host:</span>
                  <span className="font-mono">{connection.host}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Porta:</span>
                  <span className="font-mono">{connection.port}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Database:</span>
                  <span className="font-mono">{connection.database_name}</span>
                </div>
              </div>

              {connection.last_error && (
                <div className="text-xs text-red-500 mb-4 p-2 bg-red-50 rounded">{connection.last_error}</div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handleTest(connection.id)}
                  disabled={testingId === connection.id}
                >
                  {testingId === connection.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Testar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDeleteConnectionId(connection.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Formulário */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Conexão de Banco de Dados</DialogTitle>
            <DialogDescription>
              Preencha os dados de conexão. A senha será criptografada e armazenada com segurança.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nome da Conexão *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Banco Produção"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional"
                  rows={2}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="database_type">Tipo de Banco de Dados *</Label>
                <Select
                  value={formData.database_type}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      database_type: value,
                      port: getDefaultPort(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="oracle">Oracle</SelectItem>
                    <SelectItem value="sqlserver">SQL Server</SelectItem>
                    <SelectItem value="mongodb">MongoDB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="host">Host *</Label>
                <Input
                  id="host"
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  placeholder="localhost ou IP"
                  required
                />
              </div>

              <div>
                <Label htmlFor="port">Porta *</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: Number.parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="database_name">Nome do Banco *</Label>
                <Input
                  id="database_name"
                  value={formData.database_name}
                  onChange={(e) => setFormData({ ...formData, database_name: e.target.value })}
                  placeholder="Nome do database"
                  required
                />
              </div>

              <div>
                <Label htmlFor="username">Usuário *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Usuário do banco"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Senha do banco"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowFormModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Conexão</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deleteConnectionId} onOpenChange={() => setDeleteConnectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta conexão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
