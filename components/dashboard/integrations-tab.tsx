"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Settings, Trash2, TestTube, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { IntegrationFormModal } from "./integration-form-modal"
import { IntegrationSetupGuide } from "./integration-setup-guide"
import { Badge } from "@/components/ui/badge"
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

interface Integration {
  id: string
  name: string
  description: string
  status: string
  is_default: boolean
  last_tested_at: string | null
  last_error: string | null
  provider: {
    name: string
    display_name: string
    icon_name: string
    status: string
  }
}

export function IntegrationsTab() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [deleteIntegrationId, setDeleteIntegrationId] = useState<string | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      const response = await fetch("/api/integrations")
      const data = await response.json()
      setIntegrations(data.integrations || [])
    } catch (error) {
      console.error(" Error loading integrations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async (id: string) => {
    setTestingId(id)
    try {
      const response = await fetch(`/api/integrations/${id}/test`, {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        alert(`✅ ${data.message}`)
      } else {
        alert(`❌ ${data.message}${data.error ? `\n\nErro: ${data.error}` : ""}`)
      }

      await loadIntegrations()
    } catch (error) {
      console.error(" Error testing integration:", error)
      alert("Erro ao testar integração")
    } finally {
      setTestingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteIntegrationId) return

    try {
      const response = await fetch(`/api/integrations/${deleteIntegrationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadIntegrations()
        setDeleteIntegrationId(null)
      } else {
        alert("Erro ao deletar integração")
      }
    } catch (error) {
      console.error(" Error deleting integration:", error)
      alert("Erro ao deletar integração")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-500">
            Ativa
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Erro</Badge>
      case "inactive":
        return <Badge variant="secondary">Inativa</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
          <h2 className="text-2xl font-bold">Gerenciar Contas de Repositórios</h2>
          <p className="text-muted-foreground mt-1">
            Cadastre múltiplas contas do GitHub, GitLab ou Azure DevOps. Cada conta pode ter seus próprios repositórios.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowGuideModal(true)}>
            Como Configurar
          </Button>
          <Button
            onClick={() => {
              setSelectedIntegration(null)
              setShowFormModal(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* Lista de Integrações */}
      {integrations.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Settings className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Nenhuma conta cadastrada</h3>
              <p className="text-muted-foreground mt-1">Cadastre uma conta para começar a analisar repositórios</p>
              <p className="text-sm text-muted-foreground mt-2">
                Você pode ter múltiplas contas (ex: Conta Pessoal, Conta Empresa A, Conta Cliente B)
              </p>
            </div>
            <Button onClick={() => setShowFormModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeira Conta
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <Card key={integration.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {integration.provider.icon_name === "Github" && (
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{integration.name}</h3>
                    <p className="text-xs text-muted-foreground">{integration.provider.display_name}</p>
                  </div>
                </div>
                {getStatusIcon(integration.status)}
              </div>

              {integration.description && (
                <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
              )}

              <div className="flex items-center gap-2 mb-4">
                {getStatusBadge(integration.status)}
                {integration.is_default && <Badge variant="outline">Padrão</Badge>}
                {integration.provider.status === "development" && <Badge variant="secondary">Em Desenvolvimento</Badge>}
              </div>

              {integration.last_error && (
                <div className="text-xs text-red-500 mb-4 p-2 bg-red-50 rounded">{integration.last_error}</div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handleTest(integration.id)}
                  disabled={testingId === integration.id || integration.provider.status === "development"}
                >
                  {testingId === integration.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Testar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedIntegration(integration)
                    setShowFormModal(true)
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDeleteIntegrationId(integration.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Formulário */}
      <IntegrationFormModal
        open={showFormModal}
        onClose={() => {
          setShowFormModal(false)
          setSelectedIntegration(null)
        }}
        integration={selectedIntegration}
        onSuccess={() => {
          loadIntegrations()
          setShowFormModal(false)
          setSelectedIntegration(null)
        }}
      />

      {/* Modal de Guia */}
      <IntegrationSetupGuide open={showGuideModal} onClose={() => setShowGuideModal(false)} />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deleteIntegrationId} onOpenChange={() => setDeleteIntegrationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita e você perderá o acesso aos
              repositórios desta conta.
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
