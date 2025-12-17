"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wand2, Copy, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AICodeFixerProps {
  finding: any
}

export function AICodeFixer({ finding }: AICodeFixerProps) {
  const [loading, setLoading] = useState(false)
  const [fixedCode, setFixedCode] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const generateFix = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/ai/fix-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finding }),
      })

      if (!response.ok) throw new Error("Failed to generate fix")

      const data = await response.json()
      setFixedCode(data)
      toast.success("Código corrigido gerado com sucesso!")
    } catch (error) {
      toast.error("Erro ao gerar correção automática")
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    if (fixedCode) {
      navigator.clipboard.writeText(fixedCode.fixed_code)
      setCopied(true)
      toast.success("Código copiado!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="border-[#0052CC]/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-[#0052CC]">
              <Wand2 className="h-5 w-5" />
              Correção Automática IA
            </CardTitle>
            <CardDescription>Gemini gera o código já corrigido para você</CardDescription>
          </div>
          <Button onClick={generateFix} disabled={loading} size="sm" className="bg-[#0052CC] hover:bg-[#0052CC]/90">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Gerar Fix
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {fixedCode && (
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-500/10 text-green-700">
              Confiança: {fixedCode.confidence}%
            </Badge>
            {fixedCode.backup_needed && (
              <Badge variant="outline" className="text-orange-600">
                Backup Recomendado
              </Badge>
            )}
          </div>

          <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-sans">Código Corrigido:</span>
              <Button variant="ghost" size="sm" onClick={copyCode}>
                {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <pre className="text-foreground whitespace-pre-wrap">{fixedCode.fixed_code}</pre>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-900 dark:text-blue-100">{fixedCode.explanation}</p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
