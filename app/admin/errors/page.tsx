"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Search, Eye, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export default function ErrorLogsPage() {
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [selectedError, setSelectedError] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchErrors()
  }, [statusFilter, severityFilter])

  const fetchErrors = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (severityFilter !== "all") params.set("severity", severityFilter)

      const response = await fetch(`/api/errors?${params}`)
      const data = await response.json()
      setErrors(data.errors || [])
    } catch (error) {
      toast({
        title: "Erro ao carregar logs",
        description: "Não foi possível carregar os logs de erro.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsResolved = async (id: string) => {
    try {
      await fetch(`/api/errors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      })
      toast({ title: "Erro marcado como resolvido" })
      fetchErrors()
    } catch (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" })
    }
  }

  const deleteError = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este log?")) return
    try {
      await fetch(`/api/errors/${id}`, { method: "DELETE" })
      toast({ title: "Log deletado com sucesso" })
      fetchErrors()
    } catch (error) {
      toast({ title: "Erro ao deletar", variant: "destructive" })
    }
  }

  const filteredErrors = errors.filter(
    (error: any) =>
      error.error_message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.page_url?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logs de Erros do Sistema</h1>
        <p className="text-muted-foreground">Monitore e resolva erros reportados automaticamente</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por mensagem ou URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="new">Novos</SelectItem>
            <SelectItem value="in_progress">Em Progresso</SelectItem>
            <SelectItem value="resolved">Resolvidos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Severidades</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
            <SelectItem value="high">Alto</SelectItem>
            <SelectItem value="medium">Médio</SelectItem>
            <SelectItem value="low">Baixo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : filteredErrors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum erro encontrado</h3>
            <p className="text-muted-foreground">O sistema está funcionando perfeitamente!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredErrors.map((error: any) => (
            <Card key={error.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{error.error_message}</CardTitle>
                      <Badge variant={getSeverityColor(error.severity)}>{error.severity}</Badge>
                      <Badge variant="outline">{error.error_type}</Badge>
                    </div>
                    <CardDescription>
                      {error.page_url} • {new Date(error.created_at).toLocaleString("pt-BR")}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedError(error)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {error.status !== "resolved" && (
                      <Button size="sm" variant="outline" onClick={() => markAsResolved(error.id)}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => deleteError(error.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {error.component_name && (
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Componente: <code className="bg-muted px-2 py-1 rounded">{error.component_name}</code>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedError} onOpenChange={() => setSelectedError(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Erro</DialogTitle>
          </DialogHeader>
          {selectedError && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Mensagem</h4>
                <p className="text-sm bg-muted p-3 rounded">{selectedError.error_message}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Stack Trace</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">{selectedError.stack_trace}</pre>
              </div>
              {selectedError.context && (
                <div>
                  <h4 className="font-semibold mb-2">Contexto</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedError.context, null, 2)}
                  </pre>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Browser</h4>
                  <p className="text-sm">{selectedError.browser_info?.userAgent || "N/A"}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Usuário</h4>
                  <p className="text-sm">{selectedError.user_id || "Anônimo"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
