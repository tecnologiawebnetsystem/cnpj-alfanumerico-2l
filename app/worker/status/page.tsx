"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HardDrive,
  Clock,
  Download,
  RefreshCw,
  Terminal,
  FolderOpen,
  Play,
  Settings,
} from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"

interface WorkerInfo {
  worker_id: string
  status: string
  last_heartbeat: string
  machine_name: string
  version: string
  jobs_processed: number
  jobs_failed: number
}

export default function WorkerStatusPage() {
  const [workers, setWorkers] = useState<WorkerInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date>(new Date())

  useEffect(() => {
    checkWorkers()
    const interval = setInterval(() => {
      checkWorkers()
    }, 5000) // Atualiza a cada 5 segundos
    return () => clearInterval(interval)
  }, [])

  const checkWorkers = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("workers").select("*").order("last_heartbeat", { ascending: false })

      if (!error && data) {
        setWorkers(data)
      }
      setLastCheck(new Date())
    } catch (error) {
      console.error("[v0] Error checking workers:", error)
    } finally {
      setLoading(false)
    }
  }

  const isWorkerOnline = (lastHeartbeat: string) => {
    const diff = Date.now() - new Date(lastHeartbeat).getTime()
    return diff < 60000 // Online se heartbeat < 1 minuto
  }

  const activeWorkers = workers.filter((w) => isWorkerOnline(w.last_heartbeat))
  const offlineWorkers = workers.filter((w) => !isWorkerOnline(w.last_heartbeat))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Status do Worker Local</h1>
            <p className="text-slate-600 mt-1">Monitoramento em tempo real do worker de análise</p>
          </div>
          <Button onClick={checkWorkers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Status Geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Workers Online</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-600">{activeWorkers.length}</span>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Workers Offline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-red-600">{offlineWorkers.length}</span>
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Última Verificação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-slate-700">{lastCheck.toLocaleTimeString("pt-BR")}</span>
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas */}
        {activeWorkers.length === 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Nenhum Worker Ativo</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Não há workers rodando no momento. Para análises locais funcionarem:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Baixe e instale o worker usando o botão abaixo</li>
                <li>Configure as credenciais no arquivo .env</li>
                <li>Inicie o worker usando o atalho da área de trabalho</li>
                <li>Aguarde o status mudar para "Online" (máx. 30 segundos)</li>
              </ol>
              <Button className="mt-4" asChild>
                <a href="/downloads/INSTALAR-WORKER-AUTOMATICO.bat" download>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Instalador Automático
                </a>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Workers Ativos */}
        {activeWorkers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Workers Ativos ({activeWorkers.length})
              </CardTitle>
              <CardDescription>Workers processando análises neste momento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeWorkers.map((worker) => (
                <div key={worker.worker_id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-600">
                          <HardDrive className="h-3 w-3 mr-1" />
                          Online
                        </Badge>
                        <span className="font-mono text-sm text-slate-600">{worker.worker_id}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Máquina:</span>{" "}
                          <span className="font-medium">{worker.machine_name || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Versão:</span>{" "}
                          <span className="font-medium">{worker.version || "1.0.0"}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Jobs Processados:</span>{" "}
                          <span className="font-medium text-green-600">{worker.jobs_processed || 0}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Jobs com Erro:</span>{" "}
                          <span className="font-medium text-red-600">{worker.jobs_failed || 0}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-600">Último Heartbeat:</span>{" "}
                          <span className="font-medium">{new Date(worker.last_heartbeat).toLocaleString("pt-BR")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Workers Offline */}
        {offlineWorkers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Workers Offline ({offlineWorkers.length})
              </CardTitle>
              <CardDescription>Workers que pararam de responder</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {offlineWorkers.map((worker) => (
                <div key={worker.worker_id} className="border rounded-lg p-4 bg-red-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Offline
                    </Badge>
                    <span className="font-mono text-sm text-slate-600">{worker.worker_id}</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    Último heartbeat: {new Date(worker.last_heartbeat).toLocaleString("pt-BR")}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Guia de Instalação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Como Instalar e Verificar o Worker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Baixar Instalador</h4>
                  <p className="text-sm text-slate-600 mb-2">
                    Clique no botão abaixo para baixar o instalador automático
                  </p>
                  <Button asChild size="sm">
                    <a href="/downloads/INSTALAR-WORKER-AUTOMATICO.bat" download>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Instalador
                    </a>
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Executar como Administrador</h4>
                  <p className="text-sm text-slate-600">
                    Clique com botão direito no arquivo baixado e selecione "Executar como administrador"
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Aguardar Instalação</h4>
                  <p className="text-sm text-slate-600 mb-2">
                    O instalador vai criar pastas, baixar dependências e configurar tudo automaticamente
                  </p>
                  <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Verificar se instalou corretamente:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>
                          Pasta <code className="bg-slate-100 px-1 rounded">C:\WorkerLocal</code> foi criada
                        </li>
                        <li>
                          Pasta <code className="bg-slate-100 px-1 rounded">C:\Projetos</code> foi criada
                        </li>
                        <li>
                          Arquivo <code className="bg-slate-100 px-1 rounded">C:\WorkerLocal\logs\instalacao.log</code>{" "}
                          existe
                        </li>
                        <li>Nenhuma mensagem de erro apareceu na tela</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <Separator />

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Configurar Credenciais</h4>
                  <p className="text-sm text-slate-600 mb-2">
                    O instalador vai abrir automaticamente o arquivo .env para você configurar
                  </p>
                  <Alert>
                    <FolderOpen className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Ou edite manualmente:</strong>
                      <br />
                      Abra <code className="bg-slate-100 px-1 rounded">C:\WorkerLocal\.env</code> e preencha:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>SUPABASE_URL</li>
                        <li>SUPABASE_SERVICE_ROLE_KEY</li>
                        <li>AZURE_DEVOPS_PAT (opcional)</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <Separator />

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Iniciar Worker</h4>
                  <p className="text-sm text-slate-600 mb-2">Use o atalho criado na área de trabalho</p>
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Worker Local.bat
                  </Button>
                  <Alert className="mt-3">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Como saber se está rodando:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Uma janela preta (terminal) vai abrir e ficar aberta</li>
                        <li>Você verá mensagens "[Worker] Iniciando..." na tela</li>
                        <li>Esta página mostrará o worker como "Online" em até 30 segundos</li>
                        <li>O indicador no canto superior direito ficará VERDE</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Solução de Problemas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h5 className="font-semibold mb-2">Worker não aparece como Online?</h5>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Verifique se a janela do terminal está aberta e rodando</li>
                <li>Confirme se as credenciais no arquivo .env estão corretas</li>
                <li>Aguarde até 60 segundos para o heartbeat inicial</li>
                <li>
                  Verifique o log de erros em: <code className="bg-white px-1 rounded">C:\WorkerLocal\logs\</code>
                </li>
              </ul>
            </div>
            <Separator />
            <div>
              <h5 className="font-semibold mb-2">Erro na instalação?</h5>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>
                  Verifique o log: <code className="bg-white px-1 rounded">C:\WorkerLocal\logs\instalacao.log</code>
                </li>
                <li>Certifique-se que tem permissões de administrador</li>
                <li>Verifique se Node.js está instalado: abra CMD e digite "node --version"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
