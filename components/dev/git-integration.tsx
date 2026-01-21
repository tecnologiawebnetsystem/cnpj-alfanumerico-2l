"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  GitBranch, 
  GitPullRequest, 
  GitCommit, 
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react"

interface GitInfo {
  branches: Array<{
    name: string
    isDefault: boolean
    lastCommit?: string
    lastCommitDate?: string
  }>
  pullRequests: Array<{
    id: string
    title: string
    status: "open" | "merged" | "closed"
    url: string
    createdAt: string
    author: string
  }>
  commits: Array<{
    sha: string
    message: string
    author: string
    date: string
    url: string
  }>
}

interface GitIntegrationProps {
  taskId: string
  repositoryUrl?: string
  branchName?: string
}

export function GitIntegration({ taskId, repositoryUrl, branchName }: GitIntegrationProps) {
  const [gitInfo, setGitInfo] = useState<GitInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGitInfo = async () => {
    if (!repositoryUrl) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/dev/git-info?task_id=${taskId}&repo_url=${encodeURIComponent(repositoryUrl)}&branch=${branchName || ""}`)
      if (!res.ok) throw new Error("Erro ao buscar informacoes do Git")
      const data = await res.json()
      setGitInfo(data)
    } catch (err: any) {
      setError(err.message)
      // Mock data for demonstration
      setGitInfo({
        branches: [
          { name: "main", isDefault: true, lastCommit: "fix: corrigir validacao CNPJ", lastCommitDate: new Date().toISOString() },
          { name: `feature/task-${taskId}`, isDefault: false, lastCommit: "wip: implementando correcao", lastCommitDate: new Date().toISOString() }
        ],
        pullRequests: [],
        commits: [
          { sha: "abc1234", message: "fix: corrigir campo CNPJ", author: "Dev", date: new Date().toISOString(), url: "#" }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGitInfo()
  }, [taskId, repositoryUrl])

  const getPRStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "merged":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "closed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPRStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-amber-100 text-amber-700">Aberto</Badge>
      case "merged":
        return <Badge className="bg-green-100 text-green-700">Merged</Badge>
      case "closed":
        return <Badge className="bg-red-100 text-red-700">Fechado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!repositoryUrl) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum repositorio vinculado a esta tarefa</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Integracao Git
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchGitInfo}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Branches */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Branches
          </h4>
          <div className="space-y-2">
            {gitInfo?.branches.map((branch) => (
              <div 
                key={branch.name}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <code className="text-sm bg-background px-2 py-1 rounded">
                    {branch.name}
                  </code>
                  {branch.isDefault && (
                    <Badge variant="outline" className="text-xs">default</Badge>
                  )}
                </div>
                {branch.lastCommit && (
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {branch.lastCommit}
                  </span>
                )}
              </div>
            ))}
            {(!gitInfo?.branches || gitInfo.branches.length === 0) && (
              <p className="text-sm text-muted-foreground">Nenhuma branch encontrada</p>
            )}
          </div>
        </div>

        {/* Pull Requests */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <GitPullRequest className="h-4 w-4" />
            Pull Requests
          </h4>
          <div className="space-y-2">
            {gitInfo?.pullRequests.map((pr) => (
              <div 
                key={pr.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  {getPRStatusIcon(pr.status)}
                  <div>
                    <p className="text-sm font-medium">{pr.title}</p>
                    <p className="text-xs text-muted-foreground">
                      por {pr.author} em {new Date(pr.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getPRStatusBadge(pr.status)}
                  <Button variant="ghost" size="sm" asChild>
                    <a href={pr.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
            {(!gitInfo?.pullRequests || gitInfo.pullRequests.length === 0) && (
              <p className="text-sm text-muted-foreground">Nenhum Pull Request encontrado</p>
            )}
          </div>
        </div>

        {/* Recent Commits */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <GitCommit className="h-4 w-4" />
            Commits Recentes
          </h4>
          <div className="space-y-2">
            {gitInfo?.commits.slice(0, 5).map((commit) => (
              <div 
                key={commit.sha}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <code className="text-xs bg-background px-2 py-1 rounded font-mono">
                    {commit.sha.substring(0, 7)}
                  </code>
                  <div>
                    <p className="text-sm truncate max-w-[300px]">{commit.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {commit.author} - {new Date(commit.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href={commit.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))}
            {(!gitInfo?.commits || gitInfo.commits.length === 0) && (
              <p className="text-sm text-muted-foreground">Nenhum commit encontrado</p>
            )}
          </div>
        </div>

        {error && (
          <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
            Nota: Usando dados de demonstracao. {error}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
