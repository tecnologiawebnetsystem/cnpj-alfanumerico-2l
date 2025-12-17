"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LogoIcon } from "@/components/landing/logo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Github, Gitlab, Trash2, Plus, Key, CheckCircle2, AlertCircle, Info, Cloud } from "lucide-react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { NotificationDialog } from "@/components/ui/notification-dialog"
import { Loader2 } from "lucide-react"
import { Check } from "lucide-react"

interface GitHubToken {
  id: string
  provider: string
  access_token: string
  created_at: string
  organization?: string
  gitlab_username?: string
  account_name?: string
  project?: string
}

export default function IntegrationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tokens, setTokens] = useState<GitHubToken[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingToken, setEditingToken] = useState<GitHubToken | null>(null)
  const [newToken, setNewToken] = useState("")
  const [accountName, setAccountName] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<"github" | "azure" | "gitlab">("github")
  const [organization, setOrganization] = useState("")
  const [pat, setPat] = useState("")
  const [userRole, setUserRole] = useState<string>("")
  const [canManageTokens, setCanManageTokens] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationConfig, setNotificationConfig] = useState<{
    title: string
    description: string
    type: "success" | "error" | "warning" | "info"
    showCancel?: boolean
    onConfirm?: () => void | Promise<void>
  }>({
    title: "",
    description: "",
    type: "info",
  })

  const showNotification = (config: typeof notificationConfig) => {
    setNotificationConfig(config)
    setNotificationOpen(true)
  }

  useEffect(() => {
    loadTokens()
  }, [])

  const loadTokens = async () => {
    try {
      console.log("[v0] loadTokens - Start")
      const user = await getCurrentUser()
      if (!user) {
        console.log("[v0] No user found, redirecting to login")
        router.push("/login")
        return
      }

      console.log("[v0] User found:", user.email, "ID:", user.id)

      const role = user.role?.toLowerCase() || ""
      setUserRole(role)
      const canManage = role === "admin" || role === "super_admin" || role === "admin_client"
      setCanManageTokens(canManage)
      console.log("[v0] User role:", role, "Can manage tokens:", canManage)

      console.log("[v0] Fetching accounts from /api/accounts?user_id=" + user.id)
      const response = await fetch(`/api/accounts?user_id=${user.id}`)
      console.log("[v0] Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Received", data.accounts?.length || 0, "accounts")
        const mappedTokens =
          data.accounts?.map((acc: any) => ({
            id: acc.id,
            provider: acc.provider,
            account_name: acc.account_name,
            organization: acc.organization,
            created_at: acc.created_at,
            updated_at: acc.updated_at,
          })) || []
        setTokens(mappedTokens)
      } else {
        const errorData = await response.json()
        console.error("[v0] Error response:", errorData)
        setError(errorData.error || "Erro ao carregar contas")
      }
    } catch (error) {
      console.error("[v0] Error loading tokens:", error)
      setError("Erro ao carregar contas")
    } finally {
      setLoading(false)
      console.log("[v0] loadTokens - End")
    }
  }

  const handleAddToken = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newToken.trim()) {
      setError("Por favor, insira um token válido")
      return
    }

    if (!accountName.trim()) {
      setError("Por favor, insira um nome para a conta")
      return
    }

    if (selectedProvider === "azure") {
      if (!organization.trim()) {
        setError("Por favor, insira a URL completa da organização do Azure DevOps")
        return
      }

      let orgName = organization.trim()
      if (orgName.includes("dev.azure.com/")) {
        const match = orgName.match(/dev\.azure\.com\/([^/]+)/)
        if (match) {
          orgName = match[1]
        }
      } else if (orgName.includes("://") && orgName.includes(".visualstudio.com")) {
        const match = orgName.match(/https?:\/\/([^.]+)\.visualstudio\.com/)
        if (match) {
          orgName = match[1]
        }
      } else if (orgName.includes(".visualstudio.com")) {
        const match = orgName.match(/([^.]+)\.visualstudio\.com/)
        if (match) {
          orgName = match[1]
        }
      } else if (!orgName.includes("://") && !orgName.includes("/")) {
        setError("Por favor, insira a URL completa da organização (ex: https://dev.azure.com/webnet-systems)")
        return
      }

      setOrganization(orgName)
    }

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/github/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          access_token: newToken,
          provider: selectedProvider,
          organization: selectedProvider === "azure" ? organization : undefined,
          account_name: accountName,
        }),
      })

      if (response.ok) {
        const providerName =
          selectedProvider === "github" ? "GitHub" : selectedProvider === "azure" ? "Azure DevOps" : "GitLab"
        setSuccess(`Token do ${providerName} adicionado com sucesso!`)
        setNewToken("")
        setAccountName("")
        setOrganization("")
        setPat("")
        setShowAddForm(false)
        loadTokens()
      } else {
        const data = await response.json()
        setError(data.error || "Erro ao adicionar token")
      }
    } catch (error) {
      setError("Erro ao adicionar token. Tente novamente.")
      console.error("[v0] Error adding token:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleEditToken = (token: GitHubToken) => {
    setEditingToken(token)
    setAccountName(token.account_name || "")
    setNewToken("")
    setOrganization(token.organization || "")
    setPat("")
    setSelectedProvider(token.provider as "github" | "azure" | "gitlab")
    setShowAddForm(false)
  }

  const handleUpdateToken = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] handleUpdateToken - Start")

    if (!editingToken) {
      console.log("[v0] No editing token found")
      return
    }

    console.log("[v0] Editing token:", editingToken.id)
    console.log("[v0] Account name:", accountName)
    console.log("[v0] New token provided:", newToken ? "Yes" : "No")

    if (!accountName.trim()) {
      console.log("[v0] Account name is empty")
      setError("Por favor, insira um nome para a conta")
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const user = await getCurrentUser()
      if (!user) {
        console.log("[v0] No user found, redirecting to login")
        router.push("/login")
        return
      }

      console.log("[v0] Current user:", user.email, "ID:", user.id)

      const updateData: any = {
        user_id: user.id,
        account_name: accountName,
        organization: organization.trim() || undefined,
      }

      if (newToken.trim()) {
        updateData.access_token = newToken
        console.log("[v0] Including new token in update")
      } else {
        console.log("[v0] No new token provided, keeping existing")
      }

      console.log("[v0] Calling PUT /api/accounts/" + editingToken.id)
      console.log("[v0] Update data:", {
        ...updateData,
        access_token: updateData.access_token ? "[REDACTED]" : undefined,
        user_id: user.id,
      })

      const response = await fetch(`/api/accounts/${editingToken.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      console.log("[v0] API response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Account updated successfully:", result)

        setEditingToken(null)
        setNewToken("")
        setAccountName("")
        setOrganization("")
        setPat("")
        setSuccess("Conta atualizada com sucesso!")

        setLoading(true)
        await loadTokens()

        setTimeout(() => {
          setSuccess("")
        }, 3000)
      } else {
        const data = await response.json()
        console.log("[v0] API error:", data)
        setError(data.error || "Erro ao atualizar conta")
      }
    } catch (error) {
      console.error("[v0] Error updating token:", error)
      setError("Erro ao atualizar conta. Tente novamente.")
    } finally {
      setSaving(false)
      console.log("[v0] handleUpdateToken - End")
    }
  }

  const handleCancelEdit = () => {
    setEditingToken(null)
    setNewToken("")
    setAccountName("")
    setOrganization("")
    setPat("")
  }

  const handleDeleteToken = async (tokenId: string) => {
    if (!confirm("Tem certeza que deseja remover este token?")) return

    try {
      const user = await getCurrentUser()
      if (!user) return

      const response = await fetch(`/api/github/tokens?token_id=${tokenId}&user_id=${user.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Token removido com sucesso!")
        loadTokens()
      } else {
        setError("Erro ao remover token")
      }
    } catch (error) {
      setError("Erro ao remover token")
      console.error("[v0] Error deleting token:", error)
    }
  }

  const handleRemoveToken = (accountId: string) => {
    showNotification({
      title: "Remover Token",
      description: "Tem certeza que deseja remover este token?",
      type: "warning",
      showCancel: true,
      onConfirm: async () => {
        try {
          const user = await getCurrentUser()
          if (!user) {
            router.push("/login")
            return
          }

          const response = await fetch(`/api/accounts/${accountId}?user_id=${user.id}`, {
            method: "DELETE",
          })

          if (response.ok) {
            setSuccess("Token removido com sucesso!")
            setTimeout(() => setSuccess(""), 3000)
            setLoading(true)
            await loadTokens()
          } else {
            const data = await response.json()
            setError(data.error || "Erro ao remover token")
          }
        } catch (error) {
          console.error("Error removing token:", error)
          setError("Erro ao remover token. Tente novamente.")
        }
      },
    })
  }

  const handleConnect = async () => {
    if (!organization.trim()) {
      setError("Por favor, insira a URL completa da organização do Azure DevOps")
      return
    }

    if (!pat.trim()) {
      setError("Por favor, insira um token de acesso válido")
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/github/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          access_token: pat,
          provider: selectedProvider,
          organization: organization.trim(),
          account_name: accountName,
        }),
      })

      if (response.ok) {
        setSuccess("Conexão com Azure DevOps estabelecida com sucesso!")
        setNewToken("")
        setAccountName("")
        setOrganization("")
        setPat("")
        setShowAddForm(false)
        loadTokens()
      } else {
        const data = await response.json()
        setError(data.error || "Erro ao conectar Azure DevOps")
      }
    } catch (error) {
      setError("Erro ao conectar Azure DevOps. Tente novamente.")
      console.error("[v0] Error connecting Azure DevOps:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoIcon className="h-10 w-10" />
              <div>
                <h1 className="text-base font-bold leading-none">CNPJ Alfanumérico</h1>
                <p className="text-xs text-muted-foreground">Gerenciar Contas</p>
              </div>
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
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
              <Key className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Gerenciar Contas</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conecte suas contas do GitHub, GitLab, Bitbucket ou Azure DevOps para analisar repositórios privados
            </p>
          </div>

          {/* Info Alert */}
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Como funciona:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Repositórios públicos não precisam de credenciais</li>
                  <li>Para repositórios privados, adicione um Personal Access Token (PAT)</li>
                  <li>Seus tokens são criptografados e armazenados com segurança</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Success/Error Messages */}
          {success && (
            <Card className="p-4 mb-6 bg-green-50 border-green-200">
              <div className="flex gap-3 items-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-900">{success}</p>
              </div>
            </Card>
          )}

          {error && (
            <Card className="p-4 mb-6 bg-red-50 border-red-200">
              <div className="flex gap-3 items-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-900">{error}</p>
              </div>
            </Card>
          )}

          {/* Connected Accounts */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Contas Conectadas</h3>
              {!showAddForm && !editingToken && canManageTokens && (
                <Button onClick={() => setShowAddForm(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Token
                </Button>
              )}
            </div>

            {!canManageTokens && (
              <Card className="p-4 mb-4 bg-amber-50 border-amber-200">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <p className="font-medium mb-1">Permissão Necessária</p>
                    <p className="text-amber-800">
                      Apenas usuários com perfil <strong>Admin</strong> podem adicionar, editar ou remover tokens de
                      acesso. Você pode visualizar as contas conectadas, mas não pode modificá-las.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : tokens.length === 0 && !showAddForm && !editingToken ? (
              <div className="text-center py-8">
                <Github className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">Nenhuma conta conectada ainda</p>
                {canManageTokens && (
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeira Conta
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {tokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {token.provider === "github" ? (
                          <Github className="h-5 w-5 text-primary" />
                        ) : token.provider === "gitlab" ? (
                          <Gitlab className="h-5 w-5 text-orange-600" />
                        ) : (
                          <Cloud className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {token.account_name ||
                              (token.provider === "github"
                                ? "GitHub"
                                : token.provider === "gitlab"
                                  ? "GitLab"
                                  : "Azure DevOps")}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Conectado
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {token.provider === "github" && "GitHub"}
                          {token.provider === "gitlab" && "GitLab"}
                          {token.provider === "azure" && "Azure DevOps"}
                          {token.account_name &&
                            token.provider === "azure" &&
                            token.project &&
                            ` • ${token.organization}/${token.project}`}
                          {token.account_name &&
                            token.provider === "azure" &&
                            !token.project &&
                            ` • Organização: ${token.organization}`}
                          {token.account_name &&
                            token.provider !== "azure" &&
                            token.organization &&
                            ` • Organização: ${token.organization}`}
                          {token.gitlab_username && ` • Usuário: ${token.gitlab_username}`}
                          {" • Adicionado em " + new Date(token.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    {canManageTokens && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditToken(token)}>
                          <Key className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveToken(token.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {editingToken && canManageTokens && (
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Editar Conta</h3>

              <form onSubmit={handleUpdateToken} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editAccountName">Nome da Conta *</Label>
                  <Input
                    id="editAccountName"
                    type="text"
                    placeholder="Ex: Minha Conta Pessoal, Conta da Empresa, etc."
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    disabled={saving}
                  />
                </div>

                {editingToken.provider === "azure" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="editOrganization">URL da Organização do Azure DevOps *</Label>
                      <Input
                        id="editOrganization"
                        type="text"
                        placeholder="https://dev.azure.com/webnet-systems"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        disabled={saving}
                      />
                      <p className="text-xs text-muted-foreground">
                        Cole a URL completa da organização. O sistema extrairá o nome automaticamente.
                      </p>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="editPat">Personal Access Token (PAT)</Label>
                  <Input
                    id="editPat"
                    type="password"
                    placeholder="Cole seu token de acesso aqui"
                    value={pat}
                    onChange={(e) => setPat(e.target.value)}
                    disabled={saving}
                  />
                  <p className="text-xs text-muted-foreground">
                    Token de acesso com permissão de leitura de repositórios
                  </p>
                </div>

                <Button
                  onClick={() => handleUpdateToken(null)}
                  disabled={saving || !organization || !pat}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Atualizar Conexão
                    </>
                  )}
                </Button>
              </form>
            </Card>
          )}

          {showAddForm && canManageTokens && (
            <Card className="p-6">
              <div className="mb-6">
                <Label className="mb-2 block">Selecione o Provedor</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    type="button"
                    variant={selectedProvider === "github" ? "default" : "outline"}
                    onClick={() => setSelectedProvider("github")}
                    className="justify-start"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </Button>
                  <Button
                    type="button"
                    variant={selectedProvider === "gitlab" ? "default" : "outline"}
                    onClick={() => setSelectedProvider("gitlab")}
                    className="justify-start"
                  >
                    <Gitlab className="h-4 w-4 mr-2" />
                    GitLab
                  </Button>
                  <Button
                    type="button"
                    variant={selectedProvider === "azure" ? "default" : "outline"}
                    onClick={() => setSelectedProvider("azure")}
                    className="justify-start"
                  >
                    <Cloud className="h-4 w-4 mr-2" />
                    Azure DevOps
                  </Button>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4">
                Adicionar Token{" "}
                {selectedProvider === "github" ? "GitHub" : selectedProvider === "gitlab" ? "GitLab" : "Azure DevOps"}
              </h3>

              <form onSubmit={handleAddToken} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountName">Nome da Conta *</Label>
                  <Input
                    id="accountName"
                    type="text"
                    placeholder="Ex: Minha Conta Pessoal, Conta da Empresa, etc."
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    disabled={saving}
                  />
                  <p className="text-xs text-muted-foreground">
                    Dê um nome descritivo para identificar facilmente esta conta
                  </p>
                </div>

                {selectedProvider === "azure" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="organization">URL da Organização do Azure DevOps *</Label>
                      <Input
                        id="organization"
                        type="text"
                        placeholder="https://dev.azure.com/webnet-systems ou https://devops.bs2.com/BS2Tech/"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        disabled={saving}
                      />
                      <p className="text-xs text-muted-foreground">
                        Cole a URL completa da organização. Exemplos:
                        <br />•{" "}
                        <code className="px-1 py-0.5 bg-muted rounded">https://dev.azure.com/webnet-systems</code>
                        <br />• <code className="px-1 py-0.5 bg-muted rounded">https://devops.bs2.com/BS2Tech/</code>
                      </p>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="pat">Personal Access Token (PAT) *</Label>
                  <Input
                    id="pat"
                    type="password"
                    placeholder="Cole seu token de acesso aqui"
                    value={pat}
                    onChange={(e) => setPat(e.target.value)}
                    disabled={saving}
                  />
                  <p className="text-xs text-muted-foreground">
                    {selectedProvider === "github"
                      ? "O token deve ter permissão repo para acessar repositórios privados"
                      : selectedProvider === "gitlab"
                        ? "O token deve ter permissão read_api e read_repository para acessar repositórios"
                        : "O token deve ter permissão Code (Read) para acessar repositórios"}
                  </p>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-900">
                    ℹ️ <strong>Configurações de Análise:</strong> Campos CNPJ e extensões de arquivo devem ser
                    configurados na página <strong>Configurações</strong> no Dashboard.
                  </p>
                </div>

                <Button onClick={handleConnect} disabled={saving || !organization || !pat} className="w-full">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Conectar Azure DevOps
                    </>
                  )}
                </Button>
              </form>
            </Card>
          )}

          {/* Available Integrations */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Integrações Disponíveis</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4">
                <Github className="h-8 w-8 mb-3 text-primary" />
                <h4 className="font-semibold mb-1">GitHub</h4>
                <Badge className="mb-2">Disponível</Badge>
                <p className="text-xs text-muted-foreground">Conecte repositórios públicos e privados</p>
              </Card>

              <Card className="p-4">
                <Gitlab className="h-8 w-8 mb-3 text-orange-600" />
                <h4 className="font-semibold mb-1">GitLab</h4>
                <Badge className="mb-2 bg-orange-600 text-white">Disponível</Badge>
                <p className="text-xs text-muted-foreground">Conecte repositórios do GitLab com PAT</p>
              </Card>

              <Card className="p-4">
                <Cloud className="h-8 w-8 mb-3 text-blue-600" />
                <h4 className="font-semibold mb-1">Azure DevOps</h4>
                <Badge className="mb-2 bg-blue-600 text-white">Disponível</Badge>
                <p className="text-xs text-muted-foreground">Conecte repositórios do Azure DevOps com PAT</p>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <NotificationDialog open={notificationOpen} onOpenChange={setNotificationOpen} {...notificationConfig} />
    </div>
  )
}
