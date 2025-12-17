"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Edit, Github, Cloud, CheckCircle2, XCircle } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface Integration {
  id: string
  name: string
  organization?: string
  project?: string
  status: string
  created_at: string
  integration_providers: {
    display_name: string
    name: string
    icon_name: string
  }
}

export function IntegrationAccountManager() {
  const { toast } = useToast()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    provider_name: "azure-devops",
    organization: "",
    project: "",
    access_token: "",
    base_url: "",
  })

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      const response = await fetch("/api/integrations/accounts")
      if (response.ok) {
        const data = await response.json()
        setIntegrations(data.integrations || [])
      }
    } catch (error) {
      console.error("[v0] Error loading integrations:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as contas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingId
        ? `/api/integrations/accounts/${editingId}`
        : "/api/integrations/accounts"
      
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: editingId ? "Conta atualizada" : "Conta criada",
        })
        setShowDialog(false)
        resetForm()
        loadIntegrations()
      } else {
        const data = await response.json()
        toast({
          title: "Erro",
          description: data.error || "Não foi possível salvar a conta",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error saving integration:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar conta",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (integration: Integration) => {
    setEditingId(integration.id)
    setFormData({
      name: integration.name,
      provider_name: integration.integration_providers.name,
      organization: integration.organization || "",
      project: integration.project || "",
      access_token: "",
      base_url: "",
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta conta?")) return

    try {
      const response = await fetch(`/api/integrations/accounts/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Conta excluída",
        })
        loadIntegrations()
      } else {
        const data = await response.json()
        toast({
          title: "Erro",
          description: data.error || "Não foi possível excluir a conta",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error deleting integration:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir conta",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      name: "",
      provider_name: "azure-devops",
      organization: "",
      project: "",
      access_token: "",
      base_url: "",
    })
  }

  const getProviderIcon = (providerName: string) => {
    if (providerName.includes("github")) return <Github className="h-5 w-5" />
    if (providerName.includes("azure")) return <Cloud className="h-5 w-5" />
    return <Cloud className="h-5 w-5" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Contas de Integração</h2>
          <p className="text-sm text-muted-foreground">
            Configure múltiplas contas com diferentes organizações e projetos
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setShowDialog(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {loading ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </Card>
      ) : integrations.length === 0 ? (
        <Card className="p-12 text-center">
          <Cloud className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Nenhuma conta configurada</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Adicione uma conta para começar a integrar com Azure DevOps, GitHub, etc.
          </p>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeira Conta
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <Card key={integration.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {getProviderIcon(integration.integration_providers.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{integration.name}</h3>
                      <Badge variant={integration.status === "active" ? "default" : "secondary"}>
                        {integration.status === "active" ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inativo
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {integration.integration_providers.display_name}
                    </p>
                    {integration.organization && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Organização: {integration.organization}
                      </p>
                    )}
                    {integration.project && (
                      <p className="text-xs text-muted-foreground">
                        Projeto: {integration.project}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Criado em {new Date(integration.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(integration)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(integration.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Conta" : "Nova Conta"}</DialogTitle>
            <DialogDescription>
              Configure uma conta de integração com organização e projeto específicos
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provedor</Label>
              <Select
                value={formData.provider_name}
                onValueChange={(value) =>
                  setFormData({ ...formData, provider_name: value })
                }
                disabled={!!editingId}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="azure-devops">Azure DevOps</SelectItem>
                  <SelectItem value="github">GitHub Issues</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome da Conta</Label>
              <Input
                id="name"
                placeholder="Ex: Conta Principal, Projeto X"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organização</Label>
              <Input
                id="organization"
                placeholder="Ex: klebergoncalvesk"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Projeto</Label>
              <Input
                id="project"
                placeholder="Ex: Projetos"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="access_token">
                Token de Acesso {editingId && "(deixe em branco para manter)"}
              </Label>
              <Input
                id="access_token"
                type="password"
                placeholder="Token de acesso pessoal (PAT)"
                value={formData.access_token}
                onChange={(e) =>
                  setFormData({ ...formData, access_token: e.target.value })
                }
                required={!editingId}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">{editingId ? "Atualizar" : "Criar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
