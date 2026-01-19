"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Users, GitBranch, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Repository {
  id: string
  name: string
  full_name: string
  findings_count?: number
  assigned_developer_id?: string
  assigned_developer_name?: string
  status?: string // "pendente" | "desenvolvimento" | "finalizado"
}

interface Developer {
  id: string
  name: string
  email: string
  tasks_count?: number
}

interface DeveloperAssignmentTabProps {
  clientId: string
}

const ITEMS_PER_PAGE = 10

export function DeveloperAssignmentTab({ clientId }: DeveloperAssignmentTabProps) {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState<string | null>(null)
  const { toast } = useToast()

  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDeveloper, setFilterDeveloper] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Paginacao
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchData()
  }, [clientId])

  // Reset para pagina 1 quando filtros mudam
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterDeveloper, filterStatus])

  const fetchData = async () => {
    try {
      const [reposRes, devsRes] = await Promise.all([
        fetch(`/api/repositories?client_id=${clientId}&include_stats=true`),
        fetch(`/api/developers?client_id=${clientId}`),
      ])

      const repos = await reposRes.json()
      const devs = await devsRes.json()

      // Adiciona status default se nao existir
      const reposWithStatus = (repos || []).map((repo: Repository) => ({
        ...repo,
        status: repo.status || "pendente",
      }))

      setRepositories(reposWithStatus)
      setDevelopers(devs || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const assignDeveloper = async (repositoryId: string, developerId: string) => {
    setAssigning(repositoryId)
    try {
      const res = await fetch("/api/admin-client/assign-repository", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repository_id: repositoryId,
          developer_id: developerId,
          client_id: clientId,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: "Sucesso",
          description: "Desenvolvedor atribuido ao repositorio",
        })
        fetchData()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atribuir desenvolvedor",
        variant: "destructive",
      })
    } finally {
      setAssigning(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "desenvolvimento":
        return <Badge className="bg-blue-100 text-blue-700">Em Desenvolvimento</Badge>
      case "finalizado":
        return <Badge className="bg-green-100 text-green-700">Finalizado</Badge>
      default:
        return <Badge variant="secondary">Pendente</Badge>
    }
  }

  // Filtrar repositorios
  const filteredRepositories = repositories.filter((repo) => {
    const matchesSearch =
      searchTerm === "" ||
      repo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDeveloper =
      filterDeveloper === "all" ||
      (filterDeveloper === "unassigned" && !repo.assigned_developer_id) ||
      repo.assigned_developer_id === filterDeveloper

    const matchesStatus = filterStatus === "all" || repo.status === filterStatus

    return matchesSearch && matchesDeveloper && matchesStatus
  })

  // Paginacao
  const totalPages = Math.ceil(filteredRepositories.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedRepositories = filteredRepositories.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com titulo */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Atribuicao de Desenvolvedores</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Atribua desenvolvedores para cuidar de cada repositorio
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-semibold">{repositories.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atribuidos</p>
                <p className="text-2xl font-semibold text-green-600">
                  {repositories.filter((r) => r.assigned_developer_id).length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sem Atribuicao</p>
                <p className="text-2xl font-semibold text-amber-600">
                  {repositories.filter((r) => !r.assigned_developer_id).length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar repositorio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filtro por Desenvolvedor */}
            <Select value={filterDeveloper} onValueChange={setFilterDeveloper}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Desenvolvedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Desenvolvedores</SelectItem>
                <SelectItem value="unassigned">Sem Atribuicao</SelectItem>
                {developers.map((dev) => (
                  <SelectItem key={dev.id} value={dev.id}>
                    {dev.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por Status */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="desenvolvimento">Em Desenvolvimento</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className="border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Repositorio</TableHead>
                <TableHead>Problemas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Desenvolvedor</TableHead>
                <TableHead className="text-right pr-4">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRepositories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {filteredRepositories.length === 0 && repositories.length > 0
                      ? "Nenhum repositorio encontrado com os filtros aplicados"
                      : "Nenhum repositorio com analise disponivel"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRepositories.map((repo) => (
                  <TableRow key={repo.id}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate max-w-[200px]">
                          {repo.name || repo.full_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {repo.findings_count !== undefined ? (
                        <Badge variant={repo.findings_count > 0 ? "destructive" : "outline"}>
                          {repo.findings_count}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(repo.status || "pendente")}</TableCell>
                    <TableCell>
                      {repo.assigned_developer_name ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                            <Users className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="text-sm">{repo.assigned_developer_name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Nao atribuido</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <Select
                        value={repo.assigned_developer_id || ""}
                        onValueChange={(devId) => assignDeveloper(repo.id, devId)}
                        disabled={assigning === repo.id}
                      >
                        <SelectTrigger className="w-[180px]">
                          {assigning === repo.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <SelectValue placeholder="Atribuir" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {developers.map((dev) => (
                            <SelectItem key={dev.id} value={dev.id}>
                              <div className="flex items-center gap-2">
                                <span>{dev.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {dev.tasks_count || 0}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Paginacao */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredRepositories.length)} de{" "}
              {filteredRepositories.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Mostra primeira, ultima, atual e adjacentes
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    )
                  })
                  .map((page, index, array) => {
                    // Adiciona ellipsis se houver gap
                    const prevPage = array[index - 1]
                    const showEllipsis = prevPage && page - prevPage > 1

                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8"
                        >
                          {page}
                        </Button>
                      </div>
                    )
                  })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
