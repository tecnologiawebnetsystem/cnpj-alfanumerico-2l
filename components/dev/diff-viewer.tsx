"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Check, ArrowLeftRight, Code2, FileCode } from "lucide-react"

interface DiffViewerProps {
  currentCode: string
  suggestedCode: string
  fileName?: string
  language?: string
}

export function DiffViewer({ currentCode, suggestedCode, fileName, language = "typescript" }: DiffViewerProps) {
  const [copied, setCopied] = useState<"current" | "suggested" | null>(null)
  const [viewMode, setViewMode] = useState<"side-by-side" | "inline">("side-by-side")

  const copyToClipboard = async (code: string, type: "current" | "suggested") => {
    await navigator.clipboard.writeText(code)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  // Simple diff calculation - highlight changed lines
  const currentLines = currentCode.split("\n")
  const suggestedLines = suggestedCode.split("\n")

  const getDiffClass = (line: string, isOriginal: boolean) => {
    if (isOriginal) {
      // Check if this line exists in suggested
      if (!suggestedLines.includes(line) && line.trim() !== "") {
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
      }
    } else {
      // Check if this line exists in original
      if (!currentLines.includes(line) && line.trim() !== "") {
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
      }
    }
    return ""
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Comparacao de Codigo</CardTitle>
            {fileName && (
              <Badge variant="outline" className="font-mono text-xs">
                {fileName}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "side-by-side" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("side-by-side")}
            >
              <ArrowLeftRight className="h-4 w-4 mr-1" />
              Lado a Lado
            </Button>
            <Button
              variant={viewMode === "inline" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("inline")}
            >
              <Code2 className="h-4 w-4 mr-1" />
              Inline
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "side-by-side" ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Current Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Codigo Atual
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(currentCode, "current")}
                >
                  {copied === "current" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <ScrollArea className="h-[300px] rounded-md border bg-slate-950">
                <pre className="p-4 text-sm">
                  {currentLines.map((line, i) => (
                    <div
                      key={i}
                      className={`flex ${getDiffClass(line, true)}`}
                    >
                      <span className="w-10 text-right pr-4 text-slate-500 select-none">
                        {i + 1}
                      </span>
                      <code className="text-slate-200 flex-1">{line || " "}</code>
                    </div>
                  ))}
                </pre>
              </ScrollArea>
            </div>

            {/* Suggested Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Codigo Sugerido
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(suggestedCode, "suggested")}
                >
                  {copied === "suggested" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <ScrollArea className="h-[300px] rounded-md border bg-slate-950">
                <pre className="p-4 text-sm">
                  {suggestedLines.map((line, i) => (
                    <div
                      key={i}
                      className={`flex ${getDiffClass(line, false)}`}
                    >
                      <span className="w-10 text-right pr-4 text-slate-500 select-none">
                        {i + 1}
                      </span>
                      <code className="text-slate-200 flex-1">{line || " "}</code>
                    </div>
                  ))}
                </pre>
              </ScrollArea>
            </div>
          </div>
        ) : (
          /* Inline View */
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-red-200" /> Removido
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-green-200" /> Adicionado
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(suggestedCode, "suggested")}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copiar Sugerido
              </Button>
            </div>
            <ScrollArea className="h-[400px] rounded-md border bg-slate-950">
              <pre className="p-4 text-sm">
                {/* Show removed lines first, then added */}
                {currentLines.map((line, i) => {
                  const isRemoved = !suggestedLines.includes(line) && line.trim() !== ""
                  if (isRemoved) {
                    return (
                      <div key={`old-${i}`} className="flex bg-red-900/30">
                        <span className="w-10 text-right pr-4 text-red-400 select-none">-</span>
                        <code className="text-red-300 flex-1">{line || " "}</code>
                      </div>
                    )
                  }
                  return null
                })}
                {suggestedLines.map((line, i) => {
                  const isAdded = !currentLines.includes(line) && line.trim() !== ""
                  return (
                    <div
                      key={`new-${i}`}
                      className={`flex ${isAdded ? "bg-green-900/30" : ""}`}
                    >
                      <span className={`w-10 text-right pr-4 select-none ${isAdded ? "text-green-400" : "text-slate-500"}`}>
                        {isAdded ? "+" : (i + 1)}
                      </span>
                      <code className={`flex-1 ${isAdded ? "text-green-300" : "text-slate-200"}`}>
                        {line || " "}
                      </code>
                    </div>
                  )
                })}
              </pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
