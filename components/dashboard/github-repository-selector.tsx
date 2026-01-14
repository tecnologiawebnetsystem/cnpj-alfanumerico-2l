"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Github, Loader2, AlertCircle, CheckCircle2, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  language: string | null
  stargazers_count: number
  updated_at: string
}

interface GitHubRepositorySelectorProps {
  onSelect: (repositories: GitHubRepository[]) => void
  onClose: () => void
}

export function GitHubRepositorySelector({ onSelect, onClose }: GitHubRepositorySelectorProps) {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [filteredRepositories, setFilteredRepositories] = useState<GitHubRepository[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [username, setUsername] = useState<string>("")

  useEffect(() => {
    fetchRepositories()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRepositories(repositories)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = repositories.filter(
        (repo) =>
          repo.name.toLowerCase().includes(query) ||
          repo.full_name.toLowerCase().includes(query) ||
          (repo.description && repo.description.toLowerCase().includes(query)),
      )
      setFilteredRepositories(filtered)
    }
  }, [searchQuery, repositories])

  const fetchRepositories = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/github/repositories")
      const data = await response.json()

      if (!response.ok) {
        if (data.needsAuth) {
          setNeedsAuth(true)
          setError("Você precisa cadastrar uma conta do GitHub primeiro")
        } else {
          setError(data.error || "Erro ao buscar repositórios")
        }
        return
      }

      setRepositories(data.repositories)
      setFilteredRepositories(data.repositories)
      setUsername(data.username)
    } catch (err: any) {
      console.error(" Error fetching repositories:", err)
      setError("Erro ao buscar repositórios do GitHub")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRepository = (id: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filteredRepositories.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredRepositories.map((r) => r.id)))
    }
  }

  const handleConfirm = () => {
    const selected = repositories.filter((r) => selectedIds.has(r.id))
    onSelect(selected)
  }

  if (needsAuth) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Cadastrar Conta do GitHub
            </DialogTitle>
            <DialogDescription>
              Para selecionar repositórios, você precisa primeiro cadastrar uma conta do GitHub na aba "Integrações".
              Você pode cadastrar múltiplas contas (ex: Conta Pessoal, Conta Empresa A, Conta Cliente B).
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Vá para a aba "Integrações" e cadastre uma nova conta.</span>
            </div>
            <div className="space-y-2 p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium">Você precisará:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Personal Access Token do GitHub</li>
                <li>Nome para identificar a conta</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
                Fechar
              </Button>
              <Button
                onClick={() => {
                  onClose()
                  // Trigger tab change to integrations
                  window.dispatchEvent(new CustomEvent("changeTab", { detail: "integracoes" }))
                }}
                className="flex-1"
              >
                <Settings className="mr-2 h-4 w-4" />
                Cadastrar Conta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Selecionar Repositórios do GitHub
          </DialogTitle>
          <DialogDescription>{username && `Repositórios de @${username}`}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Search and Select All */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar repositórios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={handleSelectAll} disabled={loading || filteredRepositories.length === 0}>
              {selectedIds.size === filteredRepositories.length && filteredRepositories.length > 0
                ? "Desmarcar Todos"
                : "Selecionar Todos"}
            </Button>
          </div>

          {/* Repository List */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 gap-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchRepositories}>
                  Tentar Novamente
                </Button>
              </div>
            ) : filteredRepositories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Nenhum repositório encontrado" : "Você não tem repositórios"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredRepositories.map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleToggleRepository(repo.id)}
                  >
                    <Checkbox
                      checked={selectedIds.has(repo.id)}
                      onCheckedChange={() => handleToggleRepository(repo.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{repo.name}</h4>
                        {repo.private && <span className="text-xs bg-muted px-2 py-0.5 rounded">Privado</span>}
                        {repo.language && <span className="text-xs text-muted-foreground">{repo.language}</span>}
                      </div>
                      {repo.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>⭐ {repo.stargazers_count}</span>
                        <span>Atualizado em {new Date(repo.updated_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedIds.size > 0 ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {selectedIds.size} repositório(s) selecionado(s)
                </span>
              ) : (
                <span>Nenhum repositório selecionado</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={selectedIds.size === 0}>
                Confirmar Seleção
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
