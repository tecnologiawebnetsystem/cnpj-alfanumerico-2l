"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, AlertCircle, ExternalLink, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Provider {
  id: string
  name: string
  display_name: string
  status: string
}

interface IntegrationFormModalProps {
  open: boolean
  onClose: () => void
  integration?: any
  onSuccess: () => void
}

export function IntegrationFormModal({ open, onClose, integration, onSuccess }: IntegrationFormModalProps) {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    provider_id: "",
    name: "",
    description: "",
    access_token: "",
    base_url: "",
    organization: "",
    is_default: false,
  })
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)

  useEffect(() => {
    if (open) {
      loadProviders()
      if (integration) {
        setFormData({
          provider_id: integration.provider_id,
          name: integration.name,
          description: integration.description || "",
          access_token: "",
          base_url: integration.base_url || "",
          organization: integration.organization || "",
          is_default: integration.is_default,
        })
      }
    }
  }, [open, integration])

  const loadProviders = async () => {
    try {
      const response = await fetch("/api/integrations/providers")
      const data = await response.json()
      setProviders(data.providers || [])
    } catch (error) {
      console.error(" Error loading providers:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = integration ? `/api/integrations/${integration.id}` : "/api/integrations"

      const method = integration ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error(" Error saving integration:", error)
      alert("Erro ao salvar integração")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const provider = providers.find((p) => p.id === formData.provider_id)
    setSelectedProvider(provider || null)
  }, [formData.provider_id, providers])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{integration ? "Editar Conta" : "Cadastrar Nova Conta"}</DialogTitle>
          <DialogDescription>Configure a conexão com seu provedor de repositórios</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Provedor */}
          <div className="space-y-2">
            <Label htmlFor="provider">Provedor *</Label>
            <Select
              value={formData.provider_id}
              onValueChange={(value) => setFormData({ ...formData, provider_id: value })}
              disabled={!!integration}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um provedor" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.display_name}
                    {provider.status === "development" && " (Em Desenvolvimento)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alerta para provedores em desenvolvimento */}
          {selectedProvider?.status === "development" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Este provedor está em desenvolvimento e ainda não está disponível para uso.
              </AlertDescription>
            </Alert>
          )}

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold">
              Nome da Conta *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Conta Pessoal, Conta Empresa A, Conta Cliente B"
              required
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Dê um nome descritivo para identificar esta conta facilmente
            </p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Repositórios do cliente XYZ, Projetos pessoais, etc."
              rows={2}
            />
          </div>

          {/* Campos específicos do GitHub */}
          {selectedProvider?.name === "github" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="access_token">Personal Access Token *</Label>
                <Input
                  id="access_token"
                  type="password"
                  value={formData.access_token}
                  onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                  placeholder={integration ? "Deixe em branco para manter o atual" : "ghp_xxxxxxxxxxxxxxxxxxxx"}
                  required={!integration}
                />
                <p className="text-xs text-muted-foreground">
                  Token de acesso pessoal do GitHub com permissões de leitura de repositórios
                </p>
              </div>

              {/* Setup guide for GitHub */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Como obter seu Personal Access Token
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Acesse as configurações do GitHub</p>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => window.open("https://github.com/settings/tokens", "_blank")}
                      >
                        GitHub Settings → Tokens
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      2
                    </div>
                    <p>Clique em "Generate new token" → "Generate new token (classic)"</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      3
                    </div>
                    <div>
                      <p className="mb-1">Selecione os escopos necessários:</p>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>
                          • <code className="bg-background px-1 py-0.5 rounded">repo</code> - Acesso aos repositórios
                        </li>
                        <li>
                          • <code className="bg-background px-1 py-0.5 rounded">read:user</code> - Ler informações do
                          usuário
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      4
                    </div>
                    <p>Copie o token gerado e cole no campo acima</p>
                  </div>

                  <Alert className="mt-2">
                    <AlertCircle className="h-3 w-3" />
                    <AlertDescription className="text-xs">
                      O token só é exibido uma vez. Guarde-o em local seguro!
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </>
          )}

          {/* Integração padrão */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked as boolean })}
            />
            <Label htmlFor="is_default" className="cursor-pointer">
              Definir como conta padrão
            </Label>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || selectedProvider?.status === "development"}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {integration ? "Atualizar Conta" : "Cadastrar Conta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
