"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, Copy, RefreshCw } from "lucide-react"
import { CNPJValidator } from "@/lib/cnpj-validator"

export function ValidatorSection() {
  const [cnpj, setCnpj] = useState("")
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    message: string
    formatted?: string
  } | null>(null)
  const [generatedCNPJs, setGeneratedCNPJs] = useState<string[]>([])

  const handleValidate = () => {
    const cleaned = cnpj.replace(/[.\-/]/g, "").toUpperCase()
    const isNumeric = /^\d+$/.test(cleaned)

    const result = isNumeric ? CNPJValidator.validateNumeric(cnpj) : CNPJValidator.validateAlphanumeric(cnpj)

    setValidationResult({
      ...result,
      formatted: result.valid ? CNPJValidator.format(cleaned) : undefined,
    })
  }

  const handleGenerate = () => {
    const newCNPJs = []
    for (let i = 0; i < 5; i++) {
      newCNPJs.push(CNPJValidator.generate())
    }
    setGeneratedCNPJs(newCNPJs)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <section id="validador" className="py-16 bg-gradient-to-b from-[#FF8C00] via-[#FF8C00]/80 to-[#FFD700]/60">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance text-white">Valide CNPJs em Tempo Real</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto text-balance">
            Teste o novo formato alfanumérico ou gere CNPJs válidos para desenvolvimento
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Validador */}
          <Card className="p-8 bg-white shadow-2xl border-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-[#0052CC]/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-[#0052CC]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Validar CNPJ</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="cnpj-input" className="text-base mb-2 text-gray-700">
                  Digite o CNPJ
                </Label>
                <Input
                  id="cnpj-input"
                  placeholder="12.ABC.345/0001-XY ou 12345678000195"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value.toUpperCase())}
                  className="font-mono text-lg h-12 bg-gray-50 border-gray-300"
                />
                <p className="text-sm text-gray-500 mt-2">Aceita formato numérico ou alfanumérico</p>
              </div>

              <Button
                onClick={handleValidate}
                disabled={!cnpj}
                className="w-full h-12 text-base bg-[#0052CC] hover:bg-[#0052CC]/90"
                size="lg"
              >
                Validar Agora
              </Button>

              {validationResult && (
                <div
                  className={`p-6 rounded-xl border-2 ${
                    validationResult.valid ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {validationResult.valid ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-lg mb-1">
                        {validationResult.valid ? "CNPJ Válido" : "CNPJ Inválido"}
                      </p>
                      <p className="text-sm mb-2">{validationResult.message}</p>
                      {validationResult.formatted && (
                        <p className="text-sm font-mono bg-white p-2 rounded border">{validationResult.formatted}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 p-6 bg-[#0052CC]/5 rounded-xl border border-[#0052CC]/20">
              <h4 className="font-bold mb-2 flex items-center gap-2 text-gray-900">
                <span className="px-2 py-1 bg-[#0052CC] text-white text-xs rounded font-semibold">API</span>
                Integração Disponível
              </h4>
              <p className="text-sm text-gray-600">Valide CNPJs alfanuméricos via API REST em seus sistemas</p>
              <div className="mt-4 p-4 bg-white rounded-lg font-mono text-xs border border-gray-200">
                <div className="text-gray-500 mb-2">POST /api/v1/validate-cnpj</div>
                <div className="text-gray-800">{'{ "cnpj": "12ABC3450001XY" }'}</div>
              </div>
            </div>
          </Card>

          {/* Gerador */}
          <Card className="p-8 bg-white shadow-2xl border-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-[#FF8C00]/10 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-[#FF8C00]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Gerar CNPJs</h3>
            </div>

            <Button
              onClick={handleGenerate}
              className="w-full h-12 text-base mb-6 bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white"
              size="lg"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Gerar 5 CNPJs Válidos
            </Button>

            {generatedCNPJs.length > 0 && (
              <div className="space-y-3">
                {generatedCNPJs.map((generated, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-[#FF8C00]/5 transition-colors border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-mono font-semibold text-gray-900">{CNPJValidator.format(generated)}</p>
                      <p className="font-mono text-xs text-gray-500">{generated}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(generated)}
                      title="Copiar"
                      className="hover:bg-[#FF8C00]/10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 p-4 bg-[#FFD700]/10 rounded-lg border border-[#FFD700]/30">
              <h4 className="font-semibold mb-2 text-sm text-gray-900">Sobre o Algoritmo</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Aceita 36 caracteres (0-9 e A-Z)</li>
                <li>• Mantém 14 posições do formato atual</li>
                <li>• Usa módulo 36 para cálculo do DV</li>
                <li>• Especificação oficial da Receita Federal</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
