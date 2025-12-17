"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AzureOnPremiseWarning() {
  return (
    <Alert className="border-yellow-500 bg-yellow-50">
      <AlertTriangle className="h-5 w-5 text-yellow-600" />
      <AlertTitle className="text-yellow-900 font-semibold">Azure DevOps On-Premise Detectado</AlertTitle>
      <AlertDescription className="text-yellow-800 space-y-3">
        <p>
          Seu servidor Azure DevOps está em uma rede privada/interna e <strong>bloqueia requisições externas</strong>.
        </p>
        <p className="font-medium">Para analisar repositórios on-premise, você DEVE usar o Worker Local:</p>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>Baixe o Worker Local clicando no botão abaixo</li>
          <li>Execute o Worker na mesma rede do seu Azure DevOps</li>
          <li>
            Selecione <strong>"Análise Local"</strong> ao criar a análise
          </li>
        </ol>
        <Button
          className="mt-3 bg-yellow-600 hover:bg-yellow-700"
          onClick={() => {
            window.location.href = "/api/worker/download"
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Baixar Worker Local
        </Button>
      </AlertDescription>
    </Alert>
  )
}
