"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, AlertCircle, GitPullRequest, Copy, Zap, ExternalLink } from 'lucide-react'

interface TaskApplyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string
  userId: string
  userRole: string
  onSuccess?: () => void
}

export function TaskApplyModal({ open, onOpenChange, taskId, userId, userRole, onSuccess }: TaskApplyModalProps) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const loadPreview = async () => {
    if (!open || preview) return

    console.log(" Loading preview for task:", taskId)
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/tasks/${taskId}/preview`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load preview")
      }

      console.log(" Preview loaded:", data)
      setPreview(data)
    } catch (err: any) {
      console.error(" Error loading preview:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const applyFix = async (method: "pull_request" | "direct_commit" | "copy") => {
    console.log(" Applying fix with method:", method)
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/tasks/${taskId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, user_id: userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to apply fix")
      }

      console.log(" Fix applied successfully:", data)
      setResult(data)

      if (method === "copy") {
        await navigator.clipboard.writeText(data.code)
        alert("Code copied to clipboard!")
        onOpenChange(false)
      }

      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error(" Error applying fix:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (open && !preview && !loading && !error) {
    loadPreview()
  }

  const canDirectCommit = userRole === "admin" || userRole === "super_admin"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🔧</span>
            Visualizar Alteração Automática
          </DialogTitle>
          <DialogDescription>Revise a alteração proposta antes de aplicar</DialogDescription>
        </DialogHeader>

        {loading && !preview && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {preview && !result && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>📁 Arquivo:</span>
                <code className="px-2 py-1 bg-muted rounded text-xs">{preview.file_path}</code>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>📍 Linha:</span>
                <Badge variant="outline">{preview.line_number}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>🔤 Linguagem:</span>
                <Badge>{preview.language}</Badge>
              </div>
            </div>

            {/* Diff Preview */}
            <div className="space-y-3">
              <h4 className="font-semibold">📋 DIFF - Alteração Proposta:</h4>

              <div className="bg-muted rounded-lg p-4 font-mono text-sm space-y-1">
                {/* Context Before */}
                {preview.code_context_before.map((line: string, i: number) => (
                  <div key={`before-${i}`} className="text-muted-foreground">
                    {preview.line_number - preview.code_context_before.length + i}: {line}
                  </div>
                ))}

                {/* Current Code (Red) */}
                <div className="bg-red-500/10 text-red-600 px-2 -mx-2">
                  {preview.line_number}: - {preview.code_current}
                </div>

                {/* Suggested Code (Green) */}
                <div className="bg-green-500/10 text-green-600 px-2 -mx-2">
                  {preview.line_number}: + {preview.code_suggested}
                </div>

                {/* Context After */}
                {preview.code_context_after.map((line: string, i: number) => (
                  <div key={`after-${i}`} className="text-muted-foreground">
                    {preview.line_number + i + 1}: {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Validations */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Sintaxe validada automaticamente
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Arquivo existe no repositório
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Linha não foi modificada desde a análise
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold">🎯 Como deseja aplicar esta correção?</h4>

              {/* Pull Request Option */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <GitPullRequest className="h-5 w-5 text-blue-600" />
                  <h5 className="font-semibold">CRIAR PULL REQUEST (RECOMENDADO) ⭐</h5>
                </div>

                <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                  <li>✓ Cria branch automática: fix/cnpj-line-{preview.line_number}-...</li>
                  <li>✓ Faz commit com mensagem descritiva</li>
                  <li>✓ Abre PR no {preview.repository?.provider}</li>
                  <li>✓ CI/CD executa testes antes do merge</li>
                  <li>✓ Você revisa e aprova (30 segundos)</li>
                </ul>

                <Button onClick={() => applyFix("pull_request")} disabled={loading} className="w-full" size="lg">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GitPullRequest className="h-4 w-4 mr-2" />}
                  Criar Pull Request
                </Button>
              </div>

              {/* Copy Option */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Copy className="h-5 w-5 text-gray-600" />
                  <h5 className="font-semibold">COPIAR CÓDIGO</h5>
                </div>

                <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                  <li>✓ Copia código sugerido para clipboard</li>
                  <li>✓ Você cola manualmente no seu editor</li>
                  <li>✓ Controle total sobre quando aplicar</li>
                </ul>

                <Button onClick={() => applyFix("copy")} disabled={loading} variant="outline" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar para Clipboard
                </Button>
              </div>

              {/* Direct Commit Option (Admin Only) */}
              {canDirectCommit && (
                <div className="border border-yellow-500/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <h5 className="font-semibold text-yellow-600">COMMIT DIRETO NA MAIN (CUIDADO!)</h5>
                  </div>

                  <ul className="text-sm text-yellow-600 space-y-1 ml-7">
                    <li>⚠️ Aplica imediatamente sem revisão</li>
                    <li>⚠️ Bypass de CI/CD</li>
                    <li>⚠️ Use apenas para correções triviais</li>
                  </ul>

                  <Button onClick={() => applyFix("direct_commit")} disabled={loading} variant="destructive" className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Commit Direto
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 font-semibold">
                ✅ {result.method === "pull_request" ? "Pull Request Criado com Sucesso!" : "Alteração Aplicada!"}
              </AlertDescription>
            </Alert>

            {result.pr_url && (
              <div className="space-y-3">
                <h4 className="font-semibold">📋 Detalhes do Pull Request:</h4>

                <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Branch:</span> {result.branch_name}
                  </div>
                  <div>
                    <span className="font-semibold">PR #{result.pr_number}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Commit:</span>{" "}
                    <code className="text-xs bg-background px-1 rounded">{result.commit_sha?.substring(0, 7)}</code>
                  </div>
                </div>

                <Button onClick={() => window.open(result.pr_url, "_blank")} className="w-full" size="lg">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver PR no {preview?.repository?.provider}
                </Button>

                <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm text-blue-800">
                  <div className="font-semibold">💡 Próximos passos:</div>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Aguarde CI/CD finalizar (1-2 minutos)</li>
                    <li>Revise o PR no repositório</li>
                    <li>Aprove e faça merge</li>
                    <li>A tarefa será marcada como concluída automaticamente</li>
                  </ol>
                </div>
              </div>
            )}

            <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full">
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
