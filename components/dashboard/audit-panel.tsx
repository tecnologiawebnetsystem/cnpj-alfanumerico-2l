"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  History, Search, Filter, Eye, Download, User, Clock, 
  FileText, GitBranch, Settings, Shield, RefreshCw, ChevronLeft, ChevronRight
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AuditLog {
  id: string
  user_id: string
  user_name?: string
  user_email?: string
  action: string
  entity_type: string
  entity_id: string
  details: Record<string, any>
  ip_address?: string
  created_at: string
}

interface AuditPanelProps {
  clientId: string
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  create: { label: "Criacao", color: "bg-green-100 text-green-700" },
  update: { label: "Atualizacao", color: "bg-blue-100 text-blue-700" },
  delete: { label: "Exclusao", color: "bg-red-100 text-red-700" },
  analyze: { label: "Analise", color: "bg-purple-100 text-purple-700" },
  export: { label: "Exportacao", color: "bg-amber-100 text-amber-700" },
  export_work_items: { label: "Export Work Items", color: "bg-amber-100 text-amber-700" },
  login: { label: "Login", color: "bg-slate-100 text-slate-700" },
  logout: { label: "Logout", color: "bg-slate-100 text-slate-700" },
  assign: { label: "Atribuicao", color: "bg-cyan-100 text-cyan-700" },
  status_change: { label: "Mudanca Status", color: "bg-indigo-100 text-indigo-700" },
  settings_change: { label: "Config. Alterada", color: "bg-orange-100 text-orange-700" },
}

const ENTITY_ICONS: Record<string, any> = {
  task: FileText,
  repository: GitBranch,
  user: User,
  analysis: Search,
  settings: Settings,
  integration: Shield,
}

export function AuditPanel({ clientId }: AuditPanelProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [entityFilter, setEntityFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const { toast } = useToast()

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        client_id: clientId,
        page: page.toString(),
        limit: "20",
      })
      
      if (searchTerm) params.set("search", searchTerm)
      if (actionFilter !== "all") params.set("action", actionFilter)
      if (entityFilter !== "all") params.set("entity_type", entityFilter)

      const res = await fetch(`/api/admin-client/audit-logs?${params}`)
      const data = await res.json()

      if (data.success) {
        setLogs(data.logs)
        setTotalPages(data.totalPages || 1)
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [clientId, page, actionFilter, entityFilter])

  const handleSearch = () => {
    setPage(1)
    fetchLogs()
  }

  const exportLogs = async () => {
    try {
      const res = await fetch(`/api/admin-client/audit-logs/export?client_id=${clientId}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Exportacao concluida",
        description: "Arquivo CSV baixado com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro na exportacao",
        description: "Nao foi possivel exportar os logs",
        variant: "destructive",
      })
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getActionBadge = (action: string) => {
    const config = ACTION_LABELS[action] || { label: action, color: "bg-gray-100 text-gray-700" }
    return (
      <Badge className={`${config.color} font-medium`}>
        {config.label}
      </Badge>
    )
  }

  const getEntityIcon = (entityType: string) => {
    const Icon = ENTITY_ICONS[entityType] || FileText
    return <Icon className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <History className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <CardTitle>Auditoria e Historico</CardTitle>
              <CardDescription>Registro de todas as acoes realizadas no sistema</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="h-4 w-4 mr-1" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario, acao ou entidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Acao" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Acoes</SelectItem>
              <SelectItem value="create">Criacao</SelectItem>
              <SelectItem value="update">Atualizacao</SelectItem>
              <SelectItem value="delete">Exclusao</SelectItem>
              <SelectItem value="analyze">Analise</SelectItem>
              <SelectItem value="export">Exportacao</SelectItem>
              <SelectItem value="assign">Atribuicao</SelectItem>
              <SelectItem value="status_change">Mudanca Status</SelectItem>
            </SelectContent>
          </Select>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Entidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Entidades</SelectItem>
              <SelectItem value="task">Tarefas</SelectItem>
              <SelectItem value="repository">Repositorios</SelectItem>
              <SelectItem value="user">Usuarios</SelectItem>
              <SelectItem value="analysis">Analises</SelectItem>
              <SelectItem value="settings">Configuracoes</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-1" />
            Buscar
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Data/Hora</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Acao</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead className="w-[80px]">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Carregando logs...</p>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <History className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Nenhum registro encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {formatDate(log.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-3 w-3 text-blue-600" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">{log.user_name || "Sistema"}</p>
                          <p className="text-xs text-muted-foreground">{log.user_email || ""}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getEntityIcon(log.entity_type)}
                        <span className="text-sm capitalize">{log.entity_type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {log.details?.description || log.entity_id || "-"}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Registro</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Data/Hora</p>
                                <p className="text-sm">{formatDate(log.created_at)}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Usuario</p>
                                <p className="text-sm">{log.user_name || "Sistema"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Acao</p>
                                {getActionBadge(log.action)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Entidade</p>
                                <p className="text-sm capitalize">{log.entity_type}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">ID da Entidade</p>
                                <p className="text-sm font-mono">{log.entity_id || "-"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">IP</p>
                                <p className="text-sm font-mono">{log.ip_address || "-"}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">Detalhes</p>
                              <ScrollArea className="h-[200px] border rounded-lg p-3 bg-muted/30">
                                <pre className="text-xs font-mono whitespace-pre-wrap">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </ScrollArea>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Pagina {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Proximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
