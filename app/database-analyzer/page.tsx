"use client"

import type React from "react"

import { useState } from "react"
import { LogoIcon } from "@/components/landing/logo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Database, Loader2, CheckCircle } from 'lucide-react'
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { NotificationDialog } from "@/components/ui/notification-dialog"

export default function DatabaseAnalyzerPage() {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dbType, setDbType] = useState("")
  const [connectionString, setConnectionString] = useState("")
  const [sqlScript, setSqlScript] = useState("")
  const [analysisMethod, setAnalysisMethod] = useState<"connection" | "script">("connection")
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationConfig, setNotificationConfig] = useState<{
    title: string
    description: string
    type: "success" | "error" | "warning" | "info"
  }>({
    title: "",
    description: "",
    type: "info",
  })

  const handleAnalysis = async (e: React.FormEvent) => {
    e.preventDefault()

    if (analysisMethod === "connection" && (!dbType || !connectionString)) {
      showNotification({
        title: "Campos Obrigatórios",
        description: "Por favor, preencha todos os campos",
        type: "warning",
      })
      return
    }

    if (analysisMethod === "script" && !sqlScript) {
      showNotification({
        title: "Script Obrigatório",
        description: "Por favor, cole o script SQL",
        type: "warning",
      })
      return
    }

    setIsAnalyzing(true)

    // Simulate analysis
    setTimeout(() => {
      const mockId = Math.random().toString(36).substring(7)
      router.push(`/analysis/${mockId}`)
    }, 3000)
  }

  const showNotification = (config: typeof notificationConfig) => {
    setNotificationConfig(config)
    setNotificationOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoIcon className="h-10 w-10" />
              <div>
                <h1 className="text-base font-bold leading-none">CNPJ Alfanumérico</h1>
                <p className="text-xs text-muted-foreground">Análise de Banco de Dados</p>
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
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mb-4">
              <Database className="h-8 w-8 text-teal-600" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Análise de Banco de Dados</h2>
            <p className="text-muted-foreground">
              Conecte seu banco de dados ou forneça um script SQL para identificar campos CNPJ que precisam ser migrados
            </p>
          </div>

          <Card className="p-6">
            <div className="space-y-6">
              {/* Method Selection */}
              <div className="space-y-2">
                <Label>Método de Análise</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={analysisMethod === "connection" ? "default" : "outline"}
                    onClick={() => setAnalysisMethod("connection")}
                    className="h-auto py-4"
                  >
                    <div className="text-left">
                      <div className="font-semibold">Conexão Direta</div>
                      <div className="text-xs opacity-80">Conecte ao banco de dados</div>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant={analysisMethod === "script" ? "default" : "outline"}
                    onClick={() => setAnalysisMethod("script")}
                    className="h-auto py-4"
                  >
                    <div className="text-left">
                      <div className="font-semibold">Script SQL</div>
                      <div className="text-xs opacity-80">Cole o script de criação</div>
                    </div>
                  </Button>
                </div>
              </div>

              <form onSubmit={handleAnalysis} className="space-y-6">
                {analysisMethod === "connection" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="db-type">Tipo de Banco de Dados</Label>
                      <Select value={dbType} onValueChange={setDbType}>
                        <SelectTrigger id="db-type" className="bg-white text-gray-900">
                          <SelectValue placeholder="Selecione o tipo de banco" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-gray-900">
                          <SelectItem value="postgresql">PostgreSQL</SelectItem>
                          <SelectItem value="mysql">MySQL</SelectItem>
                          <SelectItem value="sqlserver">SQL Server</SelectItem>
                          <SelectItem value="oracle">Oracle</SelectItem>
                          <SelectItem value="mongodb">MongoDB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="connection-string">String de Conexão</Label>
                      <Input
                        id="connection-string"
                        type="text"
                        placeholder="postgresql://user:password@host:5432/database"
                        value={connectionString}
                        onChange={(e) => setConnectionString(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Seus dados de conexão são criptografados e nunca são armazenados
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="sql-script">Script SQL (CREATE TABLE)</Label>
                    <Textarea
                      id="sql-script"
                      placeholder="Cole aqui o script de criação das tabelas&#10;&#10;Exemplo:&#10;CREATE TABLE clientes (&#10;  id INT PRIMARY KEY,&#10;  cnpj VARCHAR(14),&#10;  ...&#10;);"
                      value={sqlScript}
                      onChange={(e) => setSqlScript(e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analisando Banco de Dados...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Iniciar Análise
                    </>
                  )}
                </Button>
              </form>
            </div>
          </Card>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <Card className="p-4 bg-gradient-to-br from-teal-50 to-green-50 border-0">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Detecção Inteligente</h3>
                  <p className="text-xs text-gray-600">Identifica campos CNPJ em todas as tabelas automaticamente</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Segurança Garantida</h3>
                  <p className="text-xs text-gray-600">Conexões criptografadas e dados não armazenados</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-0">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Scripts de Migração</h3>
                  <p className="text-xs text-gray-600">Gera ALTER TABLE automaticamente para você</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Notification Dialog */}
      <NotificationDialog
        open={notificationOpen}
        onOpenChange={setNotificationOpen}
        {...notificationConfig}
      />
    </div>
  )
}
