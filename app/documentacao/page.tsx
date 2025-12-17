"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileJson, Code, Shield, Zap } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

export default function DocumentacaoPage() {
  const [spec, setSpec] = useState<any>(null)

  useEffect(() => {
    fetch("/api-spec.json")
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch((err) => console.error("Erro ao carregar spec:", err))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Badge variant="outline" className="mb-2">
              OpenAPI 3.0
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Documentação da API
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Documentação completa e profissional de todos os endpoints da API CNPJ Alfanumérico
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button asChild>
                <a href="/api-spec.json" download className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Baixar Spec OpenAPI
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/login" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Acessar Sistema
                </a>
              </Button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <FileJson className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>OpenAPI 3.0</CardTitle>
                <CardDescription>Especificação completa e compatível com todas as ferramentas</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Code className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>124+ Endpoints</CardTitle>
                <CardDescription>Cobertura completa de todas as funcionalidades do sistema</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Por Perfil</CardTitle>
                <CardDescription>Organizado por Super Admin, Admin Cliente e Desenvolvedor</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Main Documentation */}
          {spec && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="h-5 w-5" />
                  {spec.info?.title || "API CNPJ Alfanumérico"}
                </CardTitle>
                <CardDescription>
                  Versão {spec.info?.version || "1.0.0"} - {spec.info?.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* API Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Base URL</h3>
                    <code className="bg-muted px-3 py-2 rounded text-sm block">
                      {spec.servers?.[0]?.url || window.location.origin}
                    </code>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Autenticação</h3>
                    <div className="bg-muted p-4 rounded space-y-2">
                      <p className="text-sm">
                        <strong>Tipo:</strong> Bearer Token (JWT)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Adicione o token JWT no header: <code>Authorization: Bearer SEU_TOKEN</code>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Endpoints by Tag */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Endpoints</h3>
                  
                  {spec.tags?.map((tag: any) => (
                    <div key={tag.name} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{tag.name}</Badge>
                        <h4 className="text-lg font-semibold">{tag.description}</h4>
                      </div>

                      <div className="space-y-2 pl-4">
                        {Object.entries(spec.paths || {}).map(([path, methods]: [string, any]) => {
                          return Object.entries(methods).map(([method, endpoint]: [string, any]) => {
                            if (endpoint.tags?.includes(tag.name)) {
                              const methodColors: any = {
                                get: "bg-blue-500",
                                post: "bg-green-500",
                                put: "bg-yellow-500",
                                delete: "bg-red-500",
                                patch: "bg-purple-500"
                              }

                              return (
                                <div key={`${method}-${path}`} className="border rounded-lg p-4 space-y-2">
                                  <div className="flex items-center gap-3">
                                    <Badge className={`${methodColors[method]} text-white uppercase`}>
                                      {method}
                                    </Badge>
                                    <code className="text-sm font-mono">{path}</code>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{endpoint.summary}</p>
                                  {endpoint.description && (
                                    <p className="text-xs text-muted-foreground">{endpoint.description}</p>
                                  )}
                                </div>
                              )
                            }
                            return null
                          })
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Schemas */}
                {spec.components?.schemas && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Schemas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(spec.components.schemas).slice(0, 6).map((schemaName) => (
                        <div key={schemaName} className="border rounded-lg p-3">
                          <code className="text-sm font-semibold">{schemaName}</code>
                          <p className="text-xs text-muted-foreground mt-1">
                            {spec.components.schemas[schemaName].description || "Schema de dados"}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      E mais {Object.keys(spec.components.schemas).length - 6} schemas disponíveis...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tools Section */}
          <Card>
            <CardHeader>
              <CardTitle>Ferramentas Recomendadas</CardTitle>
              <CardDescription>Visualize e teste a documentação com estas ferramentas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="https://editor.swagger.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border rounded-lg p-4 hover:bg-muted transition-colors"
                >
                  <h4 className="font-semibold mb-1">Swagger Editor</h4>
                  <p className="text-sm text-muted-foreground">Edite e visualize a spec online</p>
                </a>

                <a
                  href="https://www.postman.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border rounded-lg p-4 hover:bg-muted transition-colors"
                >
                  <h4 className="font-semibold mb-1">Postman</h4>
                  <p className="text-sm text-muted-foreground">Importe e teste os endpoints</p>
                </a>

                <a
                  href="https://redocly.github.io/redoc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border rounded-lg p-4 hover:bg-muted transition-colors"
                >
                  <h4 className="font-semibold mb-1">Redoc</h4>
                  <p className="text-sm text-muted-foreground">Documentação bonita e responsiva</p>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
