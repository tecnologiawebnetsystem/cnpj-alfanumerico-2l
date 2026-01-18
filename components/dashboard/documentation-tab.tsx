"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  Copy, 
  CheckCircle2,
  Code,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  Zap,
  Database,
  Users,
  FileText,
  Settings,
  GitBranch,
  Brain,
  BarChart3
} from "lucide-react"

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  description: string
  auth: boolean
  category: string
  parameters?: {
    name: string
    type: string
    required: boolean
    description: string
  }[]
  body?: {
    name: string
    type: string
    required: boolean
    description: string
  }[]
  response?: string
  example?: string
}

const endpoints: Endpoint[] = [
  // Autenticacao
  {
    method: "POST",
    path: "/api/auth/login",
    description: "Autenticar usuario e obter token de sessao",
    auth: false,
    category: "Autenticacao",
    body: [
      { name: "email", type: "string", required: true, description: "Email do usuario" },
      { name: "password", type: "string", required: true, description: "Senha do usuario" }
    ],
    response: "{ success: boolean, user: User, sessionToken: string }",
    example: `fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@email.com', password: '***' })
})`
  },
  {
    method: "GET",
    path: "/api/auth/me",
    description: "Obter dados do usuario autenticado",
    auth: true,
    category: "Autenticacao",
    response: "{ user: User }",
    example: `fetch('/api/auth/me', { credentials: 'include' })`
  },

  // Analise
  {
    method: "POST",
    path: "/api/admin-client/analyze-sequential",
    description: "Iniciar analise sequencial de repositorios (clone, analise com IA, limpeza)",
    auth: true,
    category: "Analise",
    body: [
      { name: "repository_ids", type: "string[]", required: true, description: "IDs dos repositorios" },
      { name: "client_id", type: "string", required: true, description: "ID do cliente" },
      { name: "use_ai", type: "boolean", required: false, description: "Usar IA para analise (padrao: true)" }
    ],
    response: "{ success: boolean, batch_id: string, message: string }",
    example: `fetch('/api/admin-client/analyze-sequential', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    repository_ids: ['repo-1', 'repo-2'],
    client_id: 'client-123',
    use_ai: true
  })
})`
  },
  {
    method: "GET",
    path: "/api/analyses/[id]/progress",
    description: "Obter progresso de uma analise em andamento",
    auth: true,
    category: "Analise",
    parameters: [
      { name: "id", type: "string", required: true, description: "ID da analise" }
    ],
    response: "{ progress: number, status: string, findings_count: number }",
    example: `fetch('/api/analyses/abc123/progress')`
  },

  // Repositorios
  {
    method: "GET",
    path: "/api/repositories",
    description: "Listar repositorios do cliente",
    auth: true,
    category: "Repositorios",
    parameters: [
      { name: "client_id", type: "string", required: true, description: "ID do cliente" },
      { name: "include_stats", type: "boolean", required: false, description: "Incluir estatisticas" }
    ],
    response: "{ repositories: Repository[] }",
    example: `fetch('/api/repositories?client_id=123&include_stats=true')`
  },
  {
    method: "POST",
    path: "/api/admin-client/assign-repository",
    description: "Atribuir desenvolvedor a um repositorio",
    auth: true,
    category: "Repositorios",
    body: [
      { name: "repository_id", type: "string", required: true, description: "ID do repositorio" },
      { name: "developer_id", type: "string", required: true, description: "ID do desenvolvedor" },
      { name: "client_id", type: "string", required: true, description: "ID do cliente" }
    ],
    response: "{ success: boolean, tasks_created: number }",
    example: `fetch('/api/admin-client/assign-repository', {
  method: 'POST',
  body: JSON.stringify({ repository_id: 'repo-1', developer_id: 'dev-1', client_id: 'client-1' })
})`
  },

  // Desenvolvedores
  {
    method: "GET",
    path: "/api/developers",
    description: "Listar desenvolvedores do cliente",
    auth: true,
    category: "Desenvolvedores",
    parameters: [
      { name: "client_id", type: "string", required: true, description: "ID do cliente" }
    ],
    response: "{ developers: Developer[] }",
    example: `fetch('/api/developers?client_id=123')`
  },
  {
    method: "GET",
    path: "/api/client/devs",
    description: "Listar desenvolvedores com detalhes",
    auth: true,
    category: "Desenvolvedores",
    parameters: [
      { name: "client_id", type: "string", required: true, description: "ID do cliente" }
    ],
    response: "{ devs: Developer[], total: number }",
    example: `fetch('/api/client/devs?client_id=123')`
  },
  {
    method: "POST",
    path: "/api/client/devs",
    description: "Cadastrar novo desenvolvedor",
    auth: true,
    category: "Desenvolvedores",
    body: [
      { name: "name", type: "string", required: true, description: "Nome do desenvolvedor" },
      { name: "email", type: "string", required: true, description: "Email do desenvolvedor" },
      { name: "password", type: "string", required: true, description: "Senha inicial" },
      { name: "client_id", type: "string", required: true, description: "ID do cliente" }
    ],
    response: "{ success: boolean, developer: Developer }",
    example: `fetch('/api/client/devs', {
  method: 'POST',
  body: JSON.stringify({ name: 'Joao', email: 'joao@email.com', password: '***', client_id: '123' })
})`
  },

  // Tarefas
  {
    method: "GET",
    path: "/api/tasks",
    description: "Listar tarefas",
    auth: true,
    category: "Tarefas",
    parameters: [
      { name: "client_id", type: "string", required: false, description: "Filtrar por cliente" },
      { name: "developer_id", type: "string", required: false, description: "Filtrar por desenvolvedor" },
      { name: "status", type: "string", required: false, description: "Filtrar por status" }
    ],
    response: "{ tasks: Task[] }",
    example: `fetch('/api/tasks?client_id=123&status=pending')`
  },
  {
    method: "GET",
    path: "/api/dev/tasks",
    description: "Listar tarefas do desenvolvedor autenticado",
    auth: true,
    category: "Tarefas",
    response: "{ tasks: Task[] }",
    example: `fetch('/api/dev/tasks', { credentials: 'include' })`
  },
  {
    method: "PATCH",
    path: "/api/dev/tasks/[id]",
    description: "Atualizar status de uma tarefa",
    auth: true,
    category: "Tarefas",
    parameters: [
      { name: "id", type: "string", required: true, description: "ID da tarefa" }
    ],
    body: [
      { name: "status", type: "string", required: true, description: "Novo status (pending, in_progress, completed)" }
    ],
    response: "{ success: boolean, task: Task }",
    example: `fetch('/api/dev/tasks/task-123', {
  method: 'PATCH',
  body: JSON.stringify({ status: 'completed' })
})`
  },
  {
    method: "POST",
    path: "/api/tasks/create-from-finding",
    description: "Criar tarefa a partir de um finding",
    auth: true,
    category: "Tarefas",
    body: [
      { name: "finding_id", type: "string", required: true, description: "ID do finding" },
      { name: "developer_id", type: "string", required: true, description: "ID do desenvolvedor" },
      { name: "client_id", type: "string", required: true, description: "ID do cliente" }
    ],
    response: "{ success: boolean, task: Task }",
    example: `fetch('/api/tasks/create-from-finding', {
  method: 'POST',
  body: JSON.stringify({ finding_id: 'find-1', developer_id: 'dev-1', client_id: 'client-1' })
})`
  },

  // Relatorios
  {
    method: "GET",
    path: "/api/reports/[analysisId]/pdf",
    description: "Gerar relatorio em PDF de uma analise",
    auth: true,
    category: "Relatorios",
    parameters: [
      { name: "analysisId", type: "string", required: true, description: "ID da analise" }
    ],
    response: "PDF file (application/pdf)",
    example: `fetch('/api/reports/analysis-123/pdf')`
  },
  {
    method: "GET",
    path: "/api/reports/[analysisId]/csv",
    description: "Exportar findings em CSV",
    auth: true,
    category: "Relatorios",
    parameters: [
      { name: "analysisId", type: "string", required: true, description: "ID da analise" }
    ],
    response: "CSV file (text/csv)",
    example: `fetch('/api/reports/analysis-123/csv')`
  },
  {
    method: "GET",
    path: "/api/reports/analytics",
    description: "Obter dados analiticos para dashboard",
    auth: true,
    category: "Relatorios",
    parameters: [
      { name: "client_id", type: "string", required: true, description: "ID do cliente" },
      { name: "period", type: "string", required: false, description: "Periodo (7d, 30d, 90d)" }
    ],
    response: "{ analytics: AnalyticsData }",
    example: `fetch('/api/reports/analytics?client_id=123&period=30d')`
  },

  // Configuracoes
  {
    method: "GET",
    path: "/api/client/settings",
    description: "Obter configuracoes do cliente",
    auth: true,
    category: "Configuracoes",
    parameters: [
      { name: "client_id", type: "string", required: true, description: "ID do cliente" }
    ],
    response: "{ settings: ClientSettings }",
    example: `fetch('/api/client/settings?client_id=123')`
  },
  {
    method: "POST",
    path: "/api/client/settings",
    description: "Salvar configuracoes do cliente",
    auth: true,
    category: "Configuracoes",
    body: [
      { name: "client_id", type: "string", required: true, description: "ID do cliente" },
      { name: "cnpj_field_names", type: "string[]", required: false, description: "Nomes de campos CNPJ" },
      { name: "file_extensions", type: "string[]", required: false, description: "Extensoes de arquivo" }
    ],
    response: "{ success: boolean }",
    example: `fetch('/api/client/settings', {
  method: 'POST',
  body: JSON.stringify({ client_id: '123', cnpj_field_names: ['cnpj', 'cpf_cnpj'] })
})`
  },
  {
    method: "GET",
    path: "/api/client/ai-settings",
    description: "Obter configuracoes de IA do cliente",
    auth: true,
    category: "Configuracoes",
    parameters: [
      { name: "client_id", type: "string", required: true, description: "ID do cliente" }
    ],
    response: "{ provider: string, model_name: string, is_active: boolean, has_api_key: boolean }",
    example: `fetch('/api/client/ai-settings?client_id=123')`
  },
  {
    method: "POST",
    path: "/api/client/ai-settings",
    description: "Salvar configuracoes de IA",
    auth: true,
    category: "Configuracoes",
    body: [
      { name: "client_id", type: "string", required: true, description: "ID do cliente" },
      { name: "api_key", type: "string", required: false, description: "Chave da API Gemini" },
      { name: "model_name", type: "string", required: false, description: "Modelo (gemini-1.5-flash)" },
      { name: "temperature", type: "number", required: false, description: "Temperatura (0-1)" },
      { name: "is_active", type: "boolean", required: false, description: "Ativar analise com IA" }
    ],
    response: "{ success: boolean, settings: AISettings }",
    example: `fetch('/api/client/ai-settings', {
  method: 'POST',
  body: JSON.stringify({ client_id: '123', api_key: 'AIza...', is_active: true })
})`
  },

  // Estatisticas
  {
    method: "GET",
    path: "/api/client/stats",
    description: "Obter estatisticas do cliente",
    auth: true,
    category: "Estatisticas",
    parameters: [
      { name: "user_id", type: "string", required: true, description: "ID do usuario" }
    ],
    response: "{ totalDevs, activeDevs, totalTasks, completedTasks, totalRepositories, totalAnalyses }",
    example: `fetch('/api/client/stats?user_id=user-123')`
  },

  // Integracoes Git
  {
    method: "GET",
    path: "/api/integrations/accounts",
    description: "Listar contas Git integradas",
    auth: true,
    category: "Integracoes",
    parameters: [
      { name: "client_id", type: "string", required: true, description: "ID do cliente" }
    ],
    response: "{ accounts: GitAccount[] }",
    example: `fetch('/api/integrations/accounts?client_id=123')`
  },
  {
    method: "POST",
    path: "/api/integrations/accounts",
    description: "Adicionar conta Git",
    auth: true,
    category: "Integracoes",
    body: [
      { name: "provider", type: "string", required: true, description: "github, gitlab, bitbucket, azure" },
      { name: "token", type: "string", required: true, description: "Token de acesso" },
      { name: "client_id", type: "string", required: true, description: "ID do cliente" }
    ],
    response: "{ success: boolean, account: GitAccount }",
    example: `fetch('/api/integrations/accounts', {
  method: 'POST',
  body: JSON.stringify({ provider: 'github', token: 'ghp_xxx', client_id: '123' })
})`
  },
  {
    method: "POST",
    path: "/api/github/repositories",
    description: "Listar repositorios do GitHub",
    auth: true,
    category: "Integracoes",
    body: [
      { name: "token", type: "string", required: true, description: "Token do GitHub" }
    ],
    response: "{ repositories: Repository[] }",
    example: `fetch('/api/github/repositories', {
  method: 'POST',
  body: JSON.stringify({ token: 'ghp_xxx' })
})`
  }
]

const categories = [
  { id: "Autenticacao", icon: Lock, color: "text-amber-600" },
  { id: "Analise", icon: Brain, color: "text-purple-600" },
  { id: "Repositorios", icon: GitBranch, color: "text-blue-600" },
  { id: "Desenvolvedores", icon: Users, color: "text-green-600" },
  { id: "Tarefas", icon: FileText, color: "text-orange-600" },
  { id: "Relatorios", icon: BarChart3, color: "text-pink-600" },
  { id: "Configuracoes", icon: Settings, color: "text-slate-600" },
  { id: "Estatisticas", icon: Zap, color: "text-cyan-600" },
  { id: "Integracoes", icon: Database, color: "text-indigo-600" }
]

const methodColors: Record<string, string> = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  PATCH: "bg-purple-100 text-purple-700",
  DELETE: "bg-red-100 text-red-700"
}

export function DocumentationTab() {
  const [search, setSearch] = useState("")
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Autenticacao")
  const [copiedPath, setCopiedPath] = useState<string | null>(null)

  const filteredEndpoints = endpoints.filter(ep => 
    ep.path.toLowerCase().includes(search.toLowerCase()) ||
    ep.description.toLowerCase().includes(search.toLowerCase()) ||
    ep.category.toLowerCase().includes(search.toLowerCase())
  )

  const groupedEndpoints = categories.map(cat => ({
    ...cat,
    endpoints: filteredEndpoints.filter(ep => ep.category === cat.id)
  })).filter(cat => cat.endpoints.length > 0)

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedPath(text)
    setTimeout(() => setCopiedPath(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Documentacao da API</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Referencia completa de todos os endpoints disponiveis
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar endpoints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="flex gap-4 flex-wrap">
        <Badge variant="secondary" className="gap-1">
          <Code className="h-3 w-3" />
          {endpoints.length} endpoints
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <Lock className="h-3 w-3" />
          {endpoints.filter(e => e.auth).length} autenticados
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <Unlock className="h-3 w-3" />
          {endpoints.filter(e => !e.auth).length} publicos
        </Badge>
      </div>

      {/* Endpoints by Category */}
      <div className="space-y-4">
        {groupedEndpoints.map((category) => {
          const CategoryIcon = category.icon
          const isExpanded = expandedCategory === category.id

          return (
            <Card key={category.id}>
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CategoryIcon className={`h-5 w-5 ${category.color}`} />
                    <div>
                      <CardTitle className="text-base">{category.id}</CardTitle>
                      <CardDescription>{category.endpoints.length} endpoints</CardDescription>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 space-y-4">
                  {category.endpoints.map((endpoint, idx) => (
                    <div 
                      key={idx} 
                      className="border rounded-lg p-4 space-y-3"
                    >
                      {/* Method + Path */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={methodColors[endpoint.method]}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                          {endpoint.auth ? (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <Lock className="h-3 w-3" /> Auth
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-xs text-green-600">
                              <Unlock className="h-3 w-3" /> Public
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(endpoint.path)}
                        >
                          {copiedPath === endpoint.path ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground">
                        {endpoint.description}
                      </p>

                      {/* Parameters */}
                      {endpoint.parameters && endpoint.parameters.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                            Query Parameters
                          </h4>
                          <div className="bg-muted/50 rounded-md p-3 space-y-2">
                            {endpoint.parameters.map((param, pIdx) => (
                              <div key={pIdx} className="flex items-start gap-2 text-sm">
                                <code className="text-primary">{param.name}</code>
                                <Badge variant="outline" className="text-xs">{param.type}</Badge>
                                {param.required && (
                                  <Badge className="bg-red-100 text-red-700 text-xs">obrigatorio</Badge>
                                )}
                                <span className="text-muted-foreground">- {param.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Body */}
                      {endpoint.body && endpoint.body.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                            Request Body
                          </h4>
                          <div className="bg-muted/50 rounded-md p-3 space-y-2">
                            {endpoint.body.map((field, fIdx) => (
                              <div key={fIdx} className="flex items-start gap-2 text-sm">
                                <code className="text-primary">{field.name}</code>
                                <Badge variant="outline" className="text-xs">{field.type}</Badge>
                                {field.required && (
                                  <Badge className="bg-red-100 text-red-700 text-xs">obrigatorio</Badge>
                                )}
                                <span className="text-muted-foreground">- {field.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Response */}
                      {endpoint.response && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                            Response
                          </h4>
                          <code className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded block">
                            {endpoint.response}
                          </code>
                        </div>
                      )}

                      {/* Example */}
                      {endpoint.example && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                            Exemplo
                          </h4>
                          <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-md overflow-x-auto">
                            <code>{endpoint.example}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
