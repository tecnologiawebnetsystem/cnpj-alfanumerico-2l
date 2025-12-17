"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileCodeIcon, CopyIcon, CheckIcon } from 'lucide-react'

interface FilePreviewDialogProps {
  finding: {
    file_path: string
    line_number: number
    code_snippet: string
    description: string
  }
  isOpen: boolean
  onClose: () => void
}

export function FilePreviewDialog({
  finding,
  isOpen,
  onClose,
}: FilePreviewDialogProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(finding.code_snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCodeIcon className="h-5 w-5" />
            {finding.file_path}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-500 mb-2">
              Linha {finding.line_number}
            </div>
            <div className="bg-gray-900 rounded-lg p-4 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-white hover:bg-gray-800"
                onClick={handleCopy}
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <CopyIcon className="h-4 w-4" />
                )}
              </Button>
              <pre className="text-sm text-gray-100 overflow-x-auto">
                <code>{finding.code_snippet}</code>
              </pre>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Descrição</div>
            <p className="text-sm text-gray-600">{finding.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
