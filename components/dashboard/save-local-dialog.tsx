"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, Download, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

interface SaveLocalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folderName: string | null
  repositoryName: string
  onConfirm: () => Promise<void>
  onSkip: () => void
}

export function SaveLocalDialog({
  open,
  onOpenChange,
  folderName,
  repositoryName,
  onConfirm,
  onSkip,
}: SaveLocalDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [savedCount, setSavedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleConfirm = async () => {
    setIsSaving(true)
    setStatus("saving")
    setProgress(0)
    
    try {
      await onConfirm()
      setStatus("success")
    } catch (error: any) {
      setStatus("error")
      setErrorMessage(error.message || "Erro ao salvar arquivos")
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      setStatus("idle")
      setProgress(0)
      setSavedCount(0)
      setTotalCount(0)
      setErrorMessage(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-600" />
            Salvar Repositorio Localmente
          </DialogTitle>
          <DialogDescription>
            Deseja salvar os arquivos do repositorio na pasta configurada?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Repository info */}
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Repositorio:</span>
              <Badge variant="secondary">{repositoryName}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pasta destino:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {folderName || "Nao configurada"}
              </Badge>
            </div>
          </div>

          {/* Progress */}
          {status === "saving" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Baixando arquivos...</span>
                <span className="font-mono text-xs">
                  {savedCount}/{totalCount}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Arquivos salvos com sucesso!</p>
                <p className="text-xs text-green-700 mt-1">
                  {savedCount} arquivos foram salvos em {folderName}/{repositoryName}
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Erro ao salvar arquivos</p>
                <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {status === "idle" && (
            <>
              <Button variant="outline" onClick={onSkip} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Pular
              </Button>
              <Button onClick={handleConfirm} disabled={isSaving || !folderName}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Salvar Localmente
                  </>
                )}
              </Button>
            </>
          )}
          
          {(status === "success" || status === "error") && (
            <Button onClick={handleClose}>
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Export a function to update progress from outside
export type SaveLocalProgressCallback = (current: number, total: number) => void
