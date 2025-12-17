"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Copy, Check, ExternalLink, Code2, BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ApiDocsPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({})

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEndpoint(endpoint)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  const testEndpoint = async (endpoint: string, method: string, body?: any) => {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = await response.json()
      setTestResults((prev) => ({ ...prev, [endpoint]: { status: response.status, data } }))
    } catch (error: any) {
      setTestResults((prev) => ({ ...prev, [endpoint]: { error: error.message } }))
    }
  }

  const endpoints = [
    {
      category: "Autenticação",
      items: [
        {
          method: "POST",
          path: "/api/auth/login",
          description: "Autenticar usuário e obter token JWT",
          body: { email: "usuario@exemplo.com", password: "senha123" },
          response: {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            user: { id: "uuid", email: "usuario@exemplo.com", role: "admin" },
          },
        },
        {
          method: "POST",
          path: "/api/auth/logout",
          description: "Fazer logout e invalidar token",
          body: {},
          response: { message: "Logout realizado com sucesso" },
        },
      ],
    },
    {
      category: "Análises",
      items: [
        {
          method: "POST",
          path: "/api/analyze",
          description: "Iniciar nova análise de repositórios",
          body: {
            repositories: ["repo1", "repo2"],
            account: "organizacao",
            provider: "azure",
          },
          response: { id: "uuid", status: "processing", repositories_count: 2 },
        },
        {
          method: "GET",
          path: "/api/analyses/[id]",
          description: "Obter detalhes de uma análise específica",
          response: { id: "uuid", status: "completed", findings_count: 45, repositories_count: 2 },
        },
        {
          method: "GET",
          path: "/api/analyses/[id]/progress",
          description: "Obter progresso de análise em andamento",
          response: { progress: 75, status: "processing", completed: 15, total: 20 },
        },
      ],
    },
    {
      category: "Tarefas",
      items: [
        {
          method: "GET",
          path: "/api/tasks",
          description: "Listar todas as tarefas",
          response: [
            { id: "uuid", title: "Tarefa 1", status: "pending", assigned_to: "dev-uuid" },
            { id: "uuid", title: "Tarefa 2", status: "in_progress", assigned_to: "dev-uuid" },
          ],
        },
        {
          method: "POST",
          path: "/api/tasks",
          description: "Criar nova tarefa",
          body: {
            title: "Nova tarefa",
            description: "Descrição da tarefa",
            status: "pending",
            assigned_to: "dev-uuid",
          },
          response: { id: "uuid", title: "Nova tarefa", status: "pending" },
        },
        {
          method: "PATCH",
          path: "/api/tasks/[id]",
          description: "Atualizar status de uma tarefa",
          body: { status: "completed" },
          response: { id: "uuid", status: "completed" },
        },
      ],
    },
    {
      category: "Relatórios",
      items: [
        {
          method: "GET",
          path: "/api/reports/[id]?format=zip",
          description: "Baixar relatório completo (PDF, CSV, JSON) em ZIP",
          response: "Blob (arquivo ZIP)",
        },
        {
          method: "GET",
          path: "/api/reports/[id]?format=pdf",
          description: "Baixar relatório em PDF",
          response: "Blob (arquivo PDF)",
        },
        {
          method: "GET",
          path: "/api/reports/[id]?format=json",
          description: "Obter relatório em formato JSON",
          response: { analysis_id: "uuid", findings: [], repositories: 5 },
        },
      ],
    },
    {
      category: "Desenvolvedores",
      items: [
        {
          method: "GET",
          path: "/api/client/devs",
          description: "Listar todos os desenvolvedores do cliente",
          response: [
            { id: "uuid", name: "Dev 1", email: "dev1@exemplo.com", tasks_count: 5, completed_tasks: 3 },
            { id: "uuid", name: "Dev 2", email: "dev2@exemplo.com", tasks_count: 3, completed_tasks: 1 },
          ],
        },
        {
          method: "POST",
          path: "/api/client/devs",
          description: "Criar novo desenvolvedor",
          body: { name: "Novo Dev", email: "novodev@exemplo.com", password: "senha123" },
          response: { id: "uuid", name: "Novo Dev", email: "novodev@exemplo.com" },
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">API Documentation</h1>
            <Badge variant="secondary">REST API</Badge>
            <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
              Swagger/OpenAPI
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            Documentação completa da API REST do CNPJ Detector. Teste os endpoints diretamente nesta página.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Base URL</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="text-xs bg-muted px-2 py-1 rounded">https://cnpj-alfa-phi.vercel.app/api</code>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Autenticação</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="text-xs bg-muted px-2 py-1 rounded">Bearer Token (JWT)</code>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Formato</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="text-xs bg-muted px-2 py-1 rounded">application/json</code>
            </CardContent>
          </Card>
        </div>

        {/* Endpoints */}
        <div className="space-y-6">
          {endpoints.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {category.items.map((endpoint, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-4">
                    {/* Method and Path */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge
                        variant={
                          endpoint.method === "GET" ? "secondary" : endpoint.method === "POST" ? "default" : "outline"
                        }
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono flex-1">{endpoint.path}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(endpoint.path, endpoint.path)}>
                        {copiedEndpoint === endpoint.path ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground">{endpoint.description}</p>

                    {/* Body (if exists) */}
                    {endpoint.body && (
                      <div>
                        <Label className="text-xs font-semibold mb-2 block">Request Body (JSON)</Label>
                        <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                          {JSON.stringify(endpoint.body, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Response */}
                    <div>
                      <Label className="text-xs font-semibold mb-2 block">Response (JSON)</Label>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                        {typeof endpoint.response === "string"
                          ? endpoint.response
                          : JSON.stringify(endpoint.response, null, 2)}
                      </pre>
                    </div>

                    {/* Test Button */}
                    <Button
                      onClick={() => testEndpoint(endpoint.path, endpoint.method, endpoint.body)}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      Testar Endpoint
                    </Button>

                    {/* Test Results */}
                    {testResults[endpoint.path] && (
                      <div className="mt-4 p-3 bg-slate-900 text-slate-100 rounded">
                        <Label className="text-xs font-semibold mb-2 block text-slate-300">Resultado do Teste</Label>
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(testResults[endpoint.path], null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Precisa de Ajuda?</CardTitle>
            <CardDescription>Entre em contato com nossa equipe de suporte técnico</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/wiki">
                <BookOpen className="h-4 w-4 mr-2" />
                Acessar Wiki
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/solucao">
                <ExternalLink className="h-4 w-4 mr-2" />
                Sobre a Solução
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
