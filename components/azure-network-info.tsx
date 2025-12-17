import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Wifi, WifiOff } from "lucide-react"

export function AzureNetworkInfo() {
  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-sm text-blue-900">
        <div className="space-y-2">
          <p className="font-semibold">Azure DevOps On-Premise Detectado</p>

          <div className="flex items-start gap-2">
            <Wifi className="h-4 w-4 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-700">Dentro da Rede Corporativa:</p>
              <p className="text-xs">As requisições são feitas direto do seu navegador. Funciona normalmente!</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <WifiOff className="h-4 w-4 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-orange-700">Fora da Rede Corporativa:</p>
              <p className="text-xs">Conecte-se via VPN ou use o Worker Local para análises.</p>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
