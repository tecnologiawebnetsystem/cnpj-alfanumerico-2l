"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react"

export function ValidationSection() {
  const [cnpj, setCnpj] = useState("")
  const [validating, setValidating] = useState(false)
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null)

  const handleValidate = async () => {
    setValidating(true)
    setResult(null)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock validation logic
    const isValid = cnpj.length === 14 && /^[0-9A-Z]+$/.test(cnpj.toUpperCase())

    setResult({
      valid: isValid,
      message: isValid
        ? "CNPJ Alfanumérico válido de acordo com as especificações da Receita Federal!"
        : "CNPJ inválido. Verifique o formato (14 caracteres alfanuméricos).",
    })
    setValidating(false)
  }

  return (
    <section className="py-24 border-b border-border bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 gap-2">
              <Sparkles className="h-3 w-3" />
              Exclusivo WebNetSystems
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Validação de CNPJ Alfanumérico
            </h2>
            <p className="text-lg text-muted-foreground text-balance">
              Integração com APIs terceiras para validar se o CNPJ Alfanumérico é válido de acordo com a especificação
              da Receita Federal
            </p>
          </div>

          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Teste a Validação em Tempo Real</CardTitle>
              <CardDescription>
                Digite um CNPJ alfanumérico (14 caracteres com letras e números) para validar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Ex: 12ABC34567890D"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value.toUpperCase())}
                  maxLength={14}
                  className="flex-1 font-mono text-lg"
                />
                <Button onClick={handleValidate} disabled={validating || cnpj.length !== 14} className="gap-2">
                  {validating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Validando...
                    </>
                  ) : (
                    "Validar CNPJ"
                  )}
                </Button>
              </div>

              {result && (
                <div
                  className={`mt-6 p-4 rounded-lg border-2 flex items-start gap-3 ${
                    result.valid
                      ? "bg-green-50 dark:bg-green-950/20 border-green-500/50"
                      : "bg-red-50 dark:bg-red-950/20 border-red-500/50"
                  }`}
                >
                  {result.valid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  )}
                  <p
                    className={`text-sm font-medium ${
                      result.valid ? "text-green-900 dark:text-green-100" : "text-red-900 dark:text-red-100"
                    }`}
                  >
                    {result.message}
                  </p>
                </div>
              )}

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2 text-sm">Recursos da API de Validação:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    Validação de formato alfanumérico (Base 36)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    Verificação de dígitos verificadores
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    Compatibilidade com CNPJs numéricos antigos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    Integração via REST API
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
