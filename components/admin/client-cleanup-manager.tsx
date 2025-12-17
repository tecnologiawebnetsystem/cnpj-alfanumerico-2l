"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { Loader2, Trash2, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface Client {
  id: string
  name: string
  email: string
  status: string
}

interface CleanupPreview {
  analyses_count: number
  tasks_count: number
  findings_count: number
  repositories_count: number
  users_count: number
  reports_count: number
}

export default function ClientCleanupManager({ clients }: { clients: Client[] }) {
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [preview, setPreview] = useState<CleanupPreview | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const { toast } = useToast()

  const selectedClient = clients.find((c) => c.id === selectedClientId)

  const loadPreview = async (clientId: string) => {
    setLoadingPreview(true)
    try {
      const response = await fetch(`/api/admin/cleanup-client?client_id=${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setPreview(data.preview)
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível carregar preview",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading preview:", error)
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId)
    setPreview(null)
    setConfirmText("")
    if (clientId) {
      loadPreview(clientId)
    }
  }

  const handleCleanup = async () => {
    if (!selectedClientId || confirmText !== "CONFIRMAR EXCLUSÃO") {
      return
    }

    setCleaning(true)
    try {
      const response = await fetch("/api/admin/cleanup-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: selectedClientId }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Limpeza concluída",
          description: data.message,
        })
        setSelectedClientId("")
        setPreview(null)
        setConfirmText("")
        setShowConfirmDialog(false)
      } else {
        const error = await response.json()
        toast({
          title: "Erro na limpeza",
          description: error.error || "Erro desconhecido",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Cleanup error:", error)
      toast({
        title: "Erro",
        description: "Erro ao executar limpeza",
        variant: "destructive",
      })
    } finally {
      setCleaning(false)
    }
  }

  const totalItems =
    (preview?.analyses_count || 0) +
    (preview?.tasks_count || 0) +
    (preview?.findings_count || 0) +
    (preview?.repositories_count || 0) +
    (preview?.users_count || 0) +
    (preview?.reports_count || 0)

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <Trash2 className="h-5 w-5" />
          Limpeza Completa de Base
        </CardTitle>
        <CardDescription>
          Remove TODOS os dados de um cliente específico: análises, tarefas, repositórios, usuários, relatórios, etc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>ATENÇÃO:</strong> Esta ação é IRREVERSÍVEL e remove PERMANENTEMENTE todos os dados do cliente
            selecionado. Use com extremo cuidado!
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Selecione o Cliente</label>
            <Select value={selectedClientId} onValueChange={handleClientSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} - {client.email} ({client.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loadingPreview && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando preview...
            </div>
          )}

          {preview && selectedClient && (
            <Alert className="border-orange-200 bg-orange-50">
              <Info className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <div className="font-semibold mb-2 text-orange-900">
                  Preview da Exclusão - Cliente: {selectedClient.name}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-orange-800">
                  <div>Análises: {preview.analyses_count}</div>
                  <div>Tarefas: {preview.tasks_count}</div>
                  <div>Findings: {preview.findings_count}</div>
                  <div>Repositórios: {preview.repositories_count}</div>
                  <div>Usuários: {preview.users_count}</div>
                  <div>Relatórios: {preview.reports_count}</div>
                </div>
                <div className="mt-2 font-bold text-orange-900">Total de itens: {totalItems}</div>
              </AlertDescription>
            </Alert>
          )}

          {preview && (
            <Button
              variant="destructive"
              size="lg"
              className="w-full"
              onClick={() => setShowConfirmDialog(true)}
              disabled={totalItems === 0}
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Executar Limpeza Completa
            </Button>
          )}
        </div>

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">Confirmar Exclusão Permanente</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>
                  Você está prestes a EXCLUIR PERMANENTEMENTE todos os dados do cliente:{" "}
                  <strong>{selectedClient?.name}</strong>
                </p>
                <p>Isso inclui:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>{preview?.analyses_count} análises</li>
                  <li>{preview?.tasks_count} tarefas</li>
                  <li>{preview?.findings_count} findings</li>
                  <li>{preview?.repositories_count} repositórios</li>
                  <li>{preview?.users_count} usuários</li>
                  <li>{preview?.reports_count} relatórios</li>
                  <li>Todos os logs, atividades, comentários e dados relacionados</li>
                </ul>
                <p className="font-bold text-red-600">Esta ação NÃO PODE ser desfeita!</p>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Digite <strong>CONFIRMAR EXCLUSÃO</strong> para continuar:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="CONFIRMAR EXCLUSÃO"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={cleaning}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCleanup}
                disabled={cleaning || confirmText !== "CONFIRMAR EXCLUSÃO"}
                className="bg-red-600 hover:bg-red-700"
              >
                {cleaning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Confirmar Exclusão"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
