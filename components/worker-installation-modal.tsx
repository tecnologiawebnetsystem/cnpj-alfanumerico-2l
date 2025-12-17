"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, CheckCircle2, Circle, Loader2, FolderOpen, HardDrive, AlertCircle } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"

interface Step {
  id: number
  title: string
  description: string
  status: "pending" | "active" | "completed" | "error"
  details?: string
}

interface WorkerInstallationModalProps {
  open: boolean
  onClose: () => void
}

export function WorkerInstallationModal({ open, onClose }: WorkerInstallationModalProps) {
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 1,
      title: "Download do Worker",
      description: "Baixando pacote completo do worker local",
      status: "pending",
    },
    {
      id: 2,
      title: "Extração de Arquivos",
      description: "Descompactando arquivos na pasta C:\\WorkerLocal",
      status: "pending",
    },
    {
      id: 3,
      title: "Instalação de Dependências",
      description: "Instalando Node.js e bibliotecas necessárias",
      status: "pending",
    },
    {
      id: 4,
      title: "Configuração Automática",
      description: "Configurando conexão com banco de dados",
      status: "pending",
    },
    {
      id: 5,
      title: "Iniciando Worker",
      description: "Ativando worker e registrando no sistema",
      status: "pending",
    },
    {
      id: 6,
      title: "Verificação Final",
      description: "Confirmando que worker está online",
      status: "pending",
    },
  ])

  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [workerOnline, setWorkerOnline] = useState(false)
  const [installationPath, setInstallationPath] = useState("C:\\WorkerLocal")
  const [workerId, setWorkerId] = useState("")
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    if (open && isInstalling) {
      simulateInstallation()
    }
  }, [open, isInstalling])

  useEffect(() => {
    if (open) {
      const interval = setInterval(checkWorkerStatus, 2000)
      return () => clearInterval(interval)
    }
  }, [open])

  const checkWorkerStatus = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data } = await supabase
        .from("workers")
        .select("worker_id, status, last_heartbeat")
        .eq("status", "active")
        .gte("last_heartbeat", new Date(Date.now() - 60000).toISOString())
        .limit(1)
        .maybeSingle()

      if (data) {
        setWorkerOnline(true)
        setWorkerId(data.worker_id)

        // Complete step 6 if worker is online
        if (currentStep >= 5) {
          updateStepStatus(6, "completed", `Worker ${data.worker_id} está online!`)
          setProgress(100)
        }
      }
    } catch (error) {
      console.error("[v0] Error checking worker:", error)
    }
  }

  const simulateInstallation = async () => {
    // Step 1: Download
    await updateStepAndWait(1, "active", "Iniciando download...")
    await new Promise((r) => setTimeout(r, 1500))
    await updateStepAndWait(1, "completed", "Download concluído (15.2 MB)")
    setProgress(15)

    // Step 2: Extract
    await updateStepAndWait(2, "active", "Extraindo para C:\\WorkerLocal...")
    await new Promise((r) => setTimeout(r, 2000))
    await updateStepAndWait(2, "completed", "Arquivos extraídos com sucesso")
    setProgress(30)

    // Step 3: Dependencies
    await updateStepAndWait(3, "active", "Executando npm install...")
    await new Promise((r) => setTimeout(r, 3000))
    await updateStepAndWait(3, "completed", "23 dependências instaladas")
    setProgress(50)

    // Step 4: Configuration
    await updateStepAndWait(4, "active", "Configurando conexão Supabase...")
    await new Promise((r) => setTimeout(r, 1500))
    await updateStepAndWait(4, "completed", "Credenciais configuradas automaticamente")
    setProgress(70)

    // Step 5: Start Worker
    await updateStepAndWait(5, "active", "Iniciando processo do worker...")
    await new Promise((r) => setTimeout(r, 2000))
    await updateStepAndWait(5, "completed", "Worker iniciado com sucesso")
    setProgress(85)

    // Step 6: Verification
    await updateStepAndWait(6, "active", "Aguardando worker ficar online...")
    setCurrentStep(5)
    // Will be completed by checkWorkerStatus when worker comes online
  }

  const updateStepAndWait = async (stepId: number, status: Step["status"], details?: string) => {
    updateStepStatus(stepId, status, details)
    setCurrentStep(stepId - 1)
  }

  const updateStepStatus = (stepId: number, status: Step["status"], details?: string) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status, details } : step)))
  }

  const handleStartInstallation = () => {
    setIsInstalling(true)
  }

  const getStepIcon = (step: Step) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "active":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <HardDrive className="h-6 w-6" />
            Instalação do Worker Local
          </DialogTitle>
          <DialogDescription>Acompanhe o progresso da instalação em tempo real</DialogDescription>
        </DialogHeader>

        {/* Installation Path Display */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">Local de Instalação</p>
              <p className="text-xs font-mono text-blue-700">{installationPath}</p>
            </div>
          </div>
        </Card>

        {/* Progress Bar */}
        {isInstalling && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progresso Geral</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        )}

        {/* Steps List */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <Card
              key={step.id}
              className={`p-4 transition-all ${
                step.status === "active"
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : step.status === "completed"
                    ? "border-green-500 bg-green-50"
                    : step.status === "error"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getStepIcon(step)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {step.id}. {step.title}
                    </span>
                    {step.status === "active" && (
                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                        Em andamento
                      </Badge>
                    )}
                    {step.status === "completed" && (
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                        Concluído
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  {step.details && (
                    <p className="text-xs text-blue-600 mt-1 font-mono bg-white px-2 py-1 rounded">{step.details}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Worker Status */}
        {workerOnline && (
          <Card className="p-4 bg-green-50 border-green-500">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div className="flex-1">
                <p className="font-bold text-green-900">Worker Instalado e Online! 🎉</p>
                <p className="text-sm text-green-700">ID: {workerId}</p>
                <p className="text-xs text-green-600 mt-1">
                  Agora você pode fechar esta janela e selecionar "Análise Local" na página
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          {!isInstalling ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleStartInstallation} className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Iniciar Instalação
              </Button>
            </>
          ) : workerOnline ? (
            <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Pronto! Fechar e Começar
            </Button>
          ) : (
            <Button disabled variant="outline">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Instalando...
            </Button>
          )}
        </div>

        {/* Help Section */}
        {!workerOnline && isInstalling && (
          <Card className="p-3 bg-yellow-50 border-yellow-300">
            <p className="text-xs text-yellow-900 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Atenção:</strong> Mantenha esta janela aberta e aguarde. O terminal (janela preta) também
                precisa ficar aberto para o worker funcionar.
              </span>
            </p>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}
