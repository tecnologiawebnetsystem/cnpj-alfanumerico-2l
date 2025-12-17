"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Code2, Download, ExternalLink, BookOpen, Copy, Check } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function SwaggerStandalonePage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEndpoint(text)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">CNPJ Detector - REST API</h1>
              <p className="text-lg text-muted-foreground">
                Documentação Swagger/OpenAPI Standalone para Integração Backend
              </p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Badge variant="secondary" className="text-sm">
              REST API v1.0
            </Badge>
            <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
              OpenAPI 3.0
            </Badge>
            <Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
              JSON/XML
            </Badge>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Base URL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded flex-1">https://cnpj-alfa-phi.vercel.app/api</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard("https://cnpj-alfa-phi.vercel.app/api")}
                >
                  {copiedEndpoint === "https://cnpj-alfa-phi.vercel.app/api" ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Autenticação</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="text-xs bg-muted px-2 py-1 rounded">Bearer Token (JWT)</code>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Content-Type</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="text-xs bg-muted px-2 py-1 rounded">application/json</code>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Rate Limit</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="text-xs bg-muted px-2 py-1 rounded">100 req/min</code>
            </CardContent>
          </Card>
        </div>

        {/* Venda do Backend */}
        <Card className="border-2 border-primary mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Integração Backend Completa</CardTitle>
                <CardDescription>
                  API REST completa para integração com seu sistema existente. Não precisa do frontend!
                </CardDescription>
              </div>
              <Badge variant="default" className="text-lg px-4 py-2">
                Backend Standalone
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">O que você recebe:</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                  <span className="text-sm">API REST completa com todos os endpoints documentados</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                  <span className="text-sm">Autenticação JWT segura e escalável</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                  <span className="text-sm">Análise de repositórios Git (Azure DevOps, GitHub)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                  <span className="text-sm">Detecção automática de campos CNPJ em código e banco</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                  <span className="text-sm">Geração de relatórios em PDF, Excel/CSV e JSON</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                  <span className="text-sm">Sistema de tarefas com tracking de progresso</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                  <span className="text-sm">Webhooks para notificações em tempo real</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                  <span className="text-sm">Documentação Swagger/OpenAPI completa</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Casos de Uso:</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Integrar com seu ERP/CRM existente</li>
                <li>• Criar seu próprio frontend customizado</li>
                <li>• Automatizar análises via scripts ou CI/CD</li>
                <li>• Conectar com ferramentas de BI (Power BI, Tableau)</li>
                <li>• Criar apps mobile nativos (iOS/Android)</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button size="lg" className="gap-2">
                <Download className="h-4 w-4" />
                Baixar Especificação OpenAPI
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-transparent" asChild>
                <Link href="mailto:contato@exemplo.com">
                  <ExternalLink className="h-4 w-4" />
                  Solicitar Acesso
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints Documentation */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Endpoints Disponíveis</h2>

          {/* Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Autenticação
              </CardTitle>
              <CardDescription>Endpoints para autenticação e gerenciamento de sessão</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Badge>POST</Badge>
                  <code className="text-sm font-mono">/api/auth/login</code>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Autenticar usuário e obter token JWT</p>
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium mb-2">Ver exemplo de request/response</summary>
                  <div className="space-y-3 mt-3">
                    <div>
                      <p className="text-xs font-semibold mb-1">Request Body:</p>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                        {`{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}`}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-1">Response (200 OK):</p>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                        {`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "role": "admin",
    "client_id": "uuid"
  }
}`}
                      </pre>
                    </div>
                  </div>
                </details>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="secondary">POST</Badge>
                  <code className="text-sm font-mono">/api/auth/logout</code>
                </div>
                <p className="text-sm text-muted-foreground">Fazer logout e invalidar token</p>
              </div>
            </CardContent>
          </Card>

          {/* Analyses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Análises
              </CardTitle>
              <CardDescription>Endpoints para gerenciar análises de repositórios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Badge>POST</Badge>
                  <code className="text-sm font-mono">/api/analyze</code>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Iniciar nova análise de repositórios</p>
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium mb-2">Ver exemplo de request/response</summary>
                  <div className="space-y-3 mt-3">
                    <div>
                      <p className="text-xs font-semibold mb-1">Request Body:</p>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                        {`{
  "repositories": ["repo1", "repo2", "repo3"],
  "account": "organizacao",
  "provider": "azure",
  "project": "MeuProjeto"
}`}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-1">Response (202 Accepted):</p>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                        {`{
  "id": "uuid",
  "status": "processing",
  "repositories_count": 3,
  "progress": 0,
  "created_at": "2025-11-22T10:30:00Z"
}`}
                      </pre>
                    </div>
                  </div>
                </details>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="secondary">GET</Badge>
                  <code className="text-sm font-mono">/api/analyses/:id</code>
                </div>
                <p className="text-sm text-muted-foreground">Obter detalhes de uma análise específica</p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="secondary">GET</Badge>
                  <code className="text-sm font-mono">/api/analyses/:id/progress</code>
                </div>
                <p className="text-sm text-muted-foreground">Obter progresso de análise em andamento</p>
              </div>
            </CardContent>
          </Card>

          {/* Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Relatórios
              </CardTitle>
              <CardDescription>Endpoints para gerar e baixar relatórios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="secondary">GET</Badge>
                  <code className="text-sm font-mono">/api/reports/:id?format=zip</code>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Baixar relatório completo (PDF + CSV + JSON) em ZIP
                </p>
                <div className="text-xs space-y-1">
                  <p>
                    <strong>Query Params:</strong> format = zip | pdf | csv | json
                  </p>
                  <p>
                    <strong>Response:</strong> Blob (arquivo binário)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Tarefas
              </CardTitle>
              <CardDescription>Endpoints para gerenciar tarefas de desenvolvimento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="secondary">GET</Badge>
                  <code className="text-sm font-mono">/api/tasks</code>
                </div>
                <p className="text-sm text-muted-foreground">Listar todas as tarefas</p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Badge>POST</Badge>
                  <code className="text-sm font-mono">/api/tasks</code>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Criar nova tarefa</p>
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium mb-2">Ver exemplo de request/response</summary>
                  <div className="space-y-3 mt-3">
                    <div>
                      <p className="text-xs font-semibold mb-1">Request Body:</p>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                        {`{
  "title": "Converter campo CNPJ em tabela clientes",
  "description": "Alterar coluna cnpj de VARCHAR(14) para VARCHAR(18)",
  "status": "pending",
  "assigned_to": "dev-uuid",
  "priority": "high"
}`}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-1">Response (201 Created):</p>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                        {`{
  "id": "uuid",
  "title": "Converter campo CNPJ em tabela clientes",
  "status": "pending",
  "assigned_to": "dev-uuid",
  "created_at": "2025-11-22T10:30:00Z"
}`}
                      </pre>
                    </div>
                  </div>
                </details>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="outline">PATCH</Badge>
                  <code className="text-sm font-mono">/api/tasks/:id</code>
                </div>
                <p className="text-sm text-muted-foreground">Atualizar status de uma tarefa</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <Card className="mt-8 border-2">
          <CardHeader>
            <CardTitle>Pronto para Integrar?</CardTitle>
            <CardDescription>Entre em contato para obter acesso à API ou tire suas dúvidas</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button asChild variant="default" size="lg">
              <Link href="mailto:contato@exemplo.com">
                <ExternalLink className="h-4 w-4 mr-2" />
                Solicitar Acesso à API
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/wiki">
                <BookOpen className="h-4 w-4 mr-2" />
                Ver Documentação Completa
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
