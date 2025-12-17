"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Github,
  Cloud,
  Loader2,
  Search,
  CheckCircle2,
  FolderGit2,
  AlertCircle,
  Gitlab,
  Play,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

interface GitHubToken {
  id: string
  provider: string
  organization?: string
  account_name?: string
  token?: string // Added for on-premise Azure
}

interface Repository {
  id: string
  name: string
  full_name: string
  description: string
  language: string
  is_private: boolean
  url: string
  project?: string // Added for on-premise Azure
}

export default function AnalyzerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<GitHubToken[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState("")
  const analysisMethod = "cloud" // Removed state for analysisMethod and hardcoded to "cloud"
  const [showInstallModal, setShowInstallModal] = useState(false) // Add state for installation modal

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push("/login")
        return
      }

      const response = await fetch(`/api/github/tokens?user_id=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.tokens || [])
      }
    } catch (error) {
      console.error("[v0] Error loading accounts:", error)
      setError("Erro ao carregar contas conectadas")
    } finally {
      setLoading(false)
    }
  }

  const loadRepositories = async (accountId: string) => {
    setLoadingRepos(true)
    setError("")
    setRepositories([])
    setSelectedRepos(new Set())
    setSelectAll(false)

    try {
      const user = await getCurrentUser()
      if (!user) return

      const account = accounts.find((a) => a.id === accountId)
      if (!account) return

      console.log(`[v0] Loading repositories for ${account.provider}`)

      if (account.provider === "azure_devops") {
        console.log("[v0] Syncing Azure DevOps repositories to database...")
        const syncResponse = await fetch("/api/azure-devops/sync-repositories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token_id: accountId,
            user_id: user.id,
          }),
        })

        if (!syncResponse.ok) {
          const syncError = await syncResponse.json()
          console.error("[v0] Sync failed:", syncError)
          throw new Error(syncError.error || "Failed to sync repositories")
        }

        const syncData = await syncResponse.json()
        console.log("[v0] Synced", syncData.synced, "repositories")
      }

      const response = await fetch(
        `/api/github/repositories?token_id=${accountId}&user_id=${user.id}&provider=${account.provider}`,
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao carregar repositórios")
      }

      console.log(`[v0] Loaded ${data.repositories?.length || 0} repositories`)
      setRepositories(data.repositories || [])
    } catch (error: any) {
      console.error("[v0] Error loading repositories:", error)
      setError(error.message || "Erro ao carregar repositórios")
    } finally {
      setLoadingRepos(false)
    }
  }

  // Removed loadRepositoriesClientSide function

  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(accountId)
    if (accountId) {
      loadRepositories(accountId)
    } else {
      setRepositories([])
      setSelectedRepos(new Set())
    }
  }

  const handleRepoToggle = (repoId: string) => {
    const newSelected = new Set(selectedRepos)
    if (newSelected.has(repoId)) {
      newSelected.delete(repoId)
    } else {
      newSelected.add(repoId)
    }
    setSelectedRepos(newSelected)
    setSelectAll(newSelected.size === filteredRepos.length)
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedRepos(new Set(filteredRepos.map((r) => r.id)))
    } else {
      setSelectedRepos(new Set())
    }
  }

  const handleAnalyze = async () => {
    const selectedAccountData = accounts.find((a) => a.id === selectedAccount)
    if (!selectedAccountData || selectedRepos.size === 0) {
      setError("Selecione pelo menos um repositório para analisar")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      console.log("[v0] Starting analysis...")
      console.log("[v0] Selected account:", selectedAccountData.account_name)
      console.log("[v0] Repository IDs:", Array.from(selectedRepos))
      console.log("[v0] Analysis method:", analysisMethod)

      const user = await getCurrentUser()
      if (!user) {
        throw new Error("User not found")
      }

      const sessionToken = localStorage.getItem("sessionToken")
      if (!sessionToken) {
        throw new Error("Session token not found. Please login again.")
      }

      const apiEndpoint = "/api/analyze"

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          repositoryIds: Array.from(selectedRepos),
          accountName: selectedAccountData.account_name || selectedAccountData.organization || "Default",
          analysisMethod: analysisMethod,
        }),
      })

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro ao iniciar análise")
        } else {
          const errorText = await response.text()
          throw new Error(`Erro do servidor: ${errorText.substring(0, 100)}`)
        }
      }

      const data = await response.json()
      console.log(`[v0] Analysis started: ${data.batchId}`)

      window.location.href = "/dashboard"
    } catch (error: any) {
      console.error("[v0] Error starting analysis:", error.message)
      setError(error.message || "Erro ao iniciar análise")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const filteredRepos = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectedAccountData = accounts.find((a) => a.id === selectedAccount)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/images/image.png"
                alt="CNPJ Detector by ACT Digital"
                width={200}
                height={60}
                className="h-auto w-auto max-h-[40px]"
                priority
              />
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
              <FolderGit2 className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Analisar Repositório</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Selecione uma conta conectada e escolha quais repositórios deseja analisar para identificar campos CNPJ
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Card className="p-4 mb-6 bg-red-50 border-red-200">
              <div className="flex gap-3 items-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-900">{error}</p>
              </div>
            </Card>
          )}

          {/* No Accounts Warning */}
          {!loading && accounts.length === 0 && (
            <Card className="p-8 text-center">
              <Github className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma conta conectada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Conecte uma conta do GitHub, GitLab ou Azure DevOps para começar a analisar repositórios
              </p>
              <Link href="/integrations">
                <Button>Conectar Conta</Button>
              </Link>
            </Card>
          )}

          {/* Main Form */}
          {!loading && accounts.length > 0 && (
            <div className="space-y-6">
              {/* Step 1: Select Account */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    1
                  </div>
                  <h3 className="text-lg font-semibold">Selecione a Conta</h3>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="account">Conta Conectada</Label>
                  <Select value={selectedAccount} onValueChange={handleAccountChange}>
                    <SelectTrigger id="account" className="bg-white">
                      <SelectValue placeholder="Escolha uma conta..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            {account.provider === "github" ? (
                              <Github className="h-4 w-4" />
                            ) : account.provider === "gitlab" ? (
                              <Gitlab className="h-4 w-4 text-orange-600" />
                            ) : (
                              <Cloud className="h-4 w-4 text-blue-600" />
                            )}
                            <span>
                              {account.account_name ||
                                (account.provider === "github"
                                  ? "GitHub"
                                  : account.provider === "gitlab"
                                    ? "GitLab"
                                    : "Azure DevOps")}
                              {account.organization && ` - ${account.organization}`}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedAccountData && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Conta conectada e pronta para uso</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Removed Step 2: Select Analysis Method */}

              {/* Step 3: Select Repositories */}
              {selectedAccount && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      2
                    </div>
                    <h3 className="text-lg font-semibold">Selecione os Repositórios</h3>
                  </div>

                  {loadingRepos ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Carregando repositórios...</p>
                    </div>
                  ) : repositories.length === 0 ? (
                    <div className="text-center py-8">
                      <FolderGit2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Nenhum repositório encontrado nesta conta</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Search and Select All */}
                      <div className="flex gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar repositórios..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white"
                          />
                        </div>
                        <div className="flex items-center gap-2 px-4 border border-border rounded-lg bg-white">
                          <Checkbox id="select-all" checked={selectAll} onCheckedChange={handleSelectAll} />
                          <Label htmlFor="select-all" className="cursor-pointer">
                            Selecionar Todos
                          </Label>
                        </div>
                      </div>

                      {/* Repository List */}
                      <div className="border border-border rounded-lg divide-y divide-border max-h-96 overflow-y-auto bg-white">
                        {filteredRepos.map((repo) => (
                          <div
                            key={repo.id}
                            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => handleRepoToggle(repo.id)}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={selectedRepos.has(repo.id)}
                                onCheckedChange={() => handleRepoToggle(repo.id)}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-sm truncate">{repo.name}</p>
                                  {repo.is_private && (
                                    <Badge variant="outline" className="text-xs">
                                      Privado
                                    </Badge>
                                  )}
                                  {repo.language && (
                                    <Badge variant="secondary" className="text-xs">
                                      {repo.language}
                                    </Badge>
                                  )}
                                </div>
                                {repo.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">{repo.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {selectedRepos.size} de {repositories.length} repositório(s) selecionado(s)
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Step 4: Start Analysis */}
              {selectedAccount && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      3
                    </div>
                    <h3 className="text-lg font-semibold">Iniciar Análise</h3>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      A análise identificará automaticamente todos os campos CNPJ no código-fonte e banco de dados dos
                      repositórios selecionados.
                    </p>

                    <Button
                      onClick={handleAnalyze}
                      disabled={selectedRepos.size === 0 || isAnalyzing || !selectedAccount}
                      size="lg"
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analisando {selectedRepos.size} repositório(s)...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-5 w-5" /> {/* Changed icon to Play */}
                          Analisar {selectedRepos.size} Repositório(s) (Cloud) {/* Updated text */}
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
