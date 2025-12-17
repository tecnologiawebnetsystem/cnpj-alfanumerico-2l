"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Copy, RefreshCw } from "lucide-react"
import { CNPJValidator } from "@/lib/cnpj-validator"

export function CNPJValidatorTab() {
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
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <h1 className="text-3xl font-bold mb-4">Validador de CNPJ Alfanumérico</h1>
        <p className="text-lg text-muted-foreground">
          Valide CNPJs no novo formato alfanumérico ou gere CNPJs válidos para testes. Implementa o algoritmo oficial de
          dígito verificador da Receita Federal.
        </p>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Validar CNPJ</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="cnpj-input">CNPJ (Numérico ou Alfanumérico)</Label>
              <Input
                id="cnpj-input"
                placeholder="Ex: 12.ABC.345/0001-XY ou 12345678000195"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value.toUpperCase())}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">Aceita formatação com pontos, traços e barra</p>
            </div>

            <Button onClick={handleValidate} disabled={!cnpj} className="w-full">
              Validar CNPJ
            </Button>

            {validationResult && (
              <div
                className={`p-4 rounded-lg border-2 ${
                  validationResult.valid
                    ? "bg-green-50 border-green-500 dark:bg-green-950"
                    : "bg-red-50 border-red-500 dark:bg-red-950"
                }`}
              >
                <div className="flex items-start gap-3">
                  {validationResult.valid ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold mb-1">{validationResult.valid ? "CNPJ Válido" : "CNPJ Inválido"}</p>
                    <p className="text-sm">{validationResult.message}</p>
                    {validationResult.formatted && (
                      <p className="text-sm mt-2 font-mono">
                        Formatado: <strong>{validationResult.formatted}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Sobre o Algoritmo</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Aceita caracteres de 0-9 e A-Z (36 caracteres)</li>
              <li>• Mantém 14 posições (12 base + 2 dígitos verificadores)</li>
              <li>• Usa módulo 36 para cálculo do DV</li>
              <li>• Compatível com especificação da Receita Federal</li>
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Gerar CNPJs para Teste</h2>

          <Button onClick={handleGenerate} className="w-full mb-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Gerar 5 CNPJs Válidos
          </Button>

          {generatedCNPJs.length > 0 && (
            <div className="space-y-2">
              {generatedCNPJs.map((generated, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-mono text-sm">{CNPJValidator.format(generated)}</p>
                    <p className="font-mono text-xs text-muted-foreground">{generated}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generated)} title="Copiar">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Badge variant="secondary">Diferencial</Badge>
              API de Validação
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Integre a validação de CNPJ alfanumérico em seus sistemas via API REST
            </p>
            <div className="bg-background p-3 rounded font-mono text-xs overflow-x-auto">
              <div className="text-muted-foreground mb-1">POST /api/v1/validate-cnpj</div>
              <div>{'{ "cnpj": "12ABC3450001XY" }'}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
