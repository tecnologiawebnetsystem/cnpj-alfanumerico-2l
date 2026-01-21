"use client"

import { WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30">
              <WifiOff className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              Sem Conexao
            </h1>
            <p className="text-slate-400 mb-6">
              Voce esta offline. Verifique sua conexao com a internet e tente novamente.
            </p>
            
            <Button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
        
        <p className="text-slate-500 text-sm">
          CNPJ Alfanumerico - ACT Digital
        </p>
      </div>
    </div>
  )
}
