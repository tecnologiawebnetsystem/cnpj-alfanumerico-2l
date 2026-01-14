"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { GitBranch, ExternalLink, Calendar } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"

interface Repository {
  id: string
  name: string
  full_name: string
  description: string
  language: string
  url: string
  is_private: boolean
  stars_count: number
  last_analyzed_at: string
  created_at: string
  provider?: string
}

interface ClientRepositoriesTabProps {
  clientId: string
}

export function ClientRepositoriesTab({ clientId }: ClientRepositoriesTabProps) {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRepositories()
  }, [clientId])

  const fetchRepositories = async () => {
    try {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        console.error(" No current user found")
        return
      }

      console.log(" Fetching repositories for client:", clientId)
      const response = await fetch(
        `/api/client/repositories?client_id=${clientId}&user_id=${currentUser.id}&include_provider=true`,
        {
          credentials: "include",
        },
      )

      console.log(" Repositories API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log(" Repositories loaded:", data.length)
        setRepositories(data)
      }
    } catch (error) {
      console.error(" Error fetching repositories:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Repositórios
            </CardTitle>
            <CardDescription>Repositórios conectados e analisados</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando repositórios...</div>
        ) : repositories.length === 0 ? (
          <div className="text-center py-12">
            <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Nenhum repositório conectado</p>
            <p className="text-sm text-muted-foreground">
              Conecte repositórios do GitHub, GitLab ou Azure DevOps na página de Integrações
            </p>
            <Button className="mt-4" asChild>
              <a href="/integrations">Ir para Integrações</a>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repositório</TableHead>
                <TableHead>Provedor</TableHead>
                <TableHead>Linguagem</TableHead>
                <TableHead>Última Análise</TableHead>
                <TableHead>Visibilidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repositories.map((repo) => (
                <TableRow key={repo.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{repo.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {repo.description || "Sem descrição"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {repo.provider === "github" && <span>🐙 GitHub</span>}
                      {repo.provider === "gitlab" && <span>🦊 GitLab</span>}
                      {repo.provider === "azure" && <span>☁️ Azure DevOps</span>}
                      {!repo.provider && <span>N/A</span>}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{repo.language || "N/A"}</Badge>
                  </TableCell>
                  <TableCell>
                    {repo.last_analyzed_at ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(repo.last_analyzed_at).toLocaleDateString("pt-BR")}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Nunca analisado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={repo.is_private ? "secondary" : "default"}>
                      {repo.is_private ? "Privado" : "Público"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" asChild>
                      <a href={repo.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
