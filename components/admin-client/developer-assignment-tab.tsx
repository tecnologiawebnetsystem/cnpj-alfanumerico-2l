"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Users, GitBranch } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Repository {
  id: string
  name: string
  full_name: string
  findings_count?: number
  assigned_developer_id?: string
  assigned_developer_name?: string
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

export function DeveloperAssignmentTab({ clientId }: DeveloperAssignmentTabProps) {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [clientId])

  const fetchData = async () => {
    try {
      const [reposRes, devsRes] = await Promise.all([
        fetch(`/api/repositories?client_id=${clientId}&include_stats=true`),
        fetch(`/api/developers?client_id=${clientId}`),
      ])

      const repos = await reposRes.json()
      const devs = await devsRes.json()

      setRepositories(repos)
      setDevelopers(devs)
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
    setAssigning(true)
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
          description: "Desenvolvedor atribuído ao repositório",
        })
        fetchData() // Refresh data
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
      setAssigning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Atribuição de Desenvolvedores</CardTitle>
          <CardDescription>Atribua desenvolvedores para cuidar de cada repositório</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repositório</TableHead>
                <TableHead>Problemas Encontrados</TableHead>
                <TableHead>Desenvolvedor Atribuído</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repositories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhum repositório com análise disponível
                  </TableCell>
                </TableRow>
              ) : (
                repositories.map((repo) => (
                  <TableRow key={repo.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{repo.name || repo.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {repo.findings_count !== undefined ? (
                        <Badge variant={repo.findings_count > 0 ? "destructive" : "outline"}>
                          {repo.findings_count} problema(s)
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Não analisado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {repo.assigned_developer_name ? (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{repo.assigned_developer_name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Não atribuído</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={repo.assigned_developer_id || ""}
                        onValueChange={(devId) => assignDeveloper(repo.id, devId)}
                        disabled={assigning}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Atribuir desenvolvedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {developers.map((dev) => (
                            <SelectItem key={dev.id} value={dev.id}>
                              <div className="flex items-center justify-between w-full gap-4">
                                <span>{dev.name}</span>
                                <Badge variant="outline" className="ml-2">
                                  {dev.tasks_count || 0} tarefas
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
      </Card>

      {/* Resumo de Atribuições */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Repositórios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{repositories.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Atribuídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {repositories.filter((r) => r.assigned_developer_id).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sem Atribuição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {repositories.filter((r) => !r.assigned_developer_id).length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
