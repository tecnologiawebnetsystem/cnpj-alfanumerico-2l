"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Copy, Check, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface CodeSuggestion {
  id: string
  finding_id: string
  original_code: string
  suggested_code: string
  explanation: string
  confidence: number
  language: string
}

interface CodeSuggestionPanelProps {
  findingId: string
  originalCode: string
  language: string
}

export function CodeSuggestionPanel({ findingId, originalCode, language }: CodeSuggestionPanelProps) {
  const [suggestion, setSuggestion] = useState<CodeSuggestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null)

  const generateSuggestion = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finding_id: findingId,
          original_code: originalCode,
          language,
        }),
      })

      const data = await response.json()
      setSuggestion(data)
    } catch (error) {
      console.error("Error generating suggestion:", error)
    } finally {
      setLoading(false)
    }
  }

  const copySuggestion = () => {
    if (suggestion) {
      navigator.clipboard.writeText(suggestion.suggested_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const submitFeedback = async (type: "up" | "down") => {
    if (!suggestion) return

    setFeedback(type)
    await fetch(`/api/ai/suggestions/${suggestion.id}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback: type }),
    })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold">Sugestão de Correção com IA</h3>
        </div>
        {!suggestion && (
          <Button onClick={generateSuggestion} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Sugestão
              </>
            )}
          </Button>
        )}
      </div>

      {suggestion && (
        <div className="space-y-4">
          {/* Confidence Badge */}
          <div className="flex items-center gap-2">
            <Badge variant={suggestion.confidence > 0.8 ? "default" : "secondary"}>
              {Math.round(suggestion.confidence * 100)}% de confiança
            </Badge>
          </div>

          {/* Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">{suggestion.explanation}</p>
          </div>

          {/* Code Comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-red-600">Código Original</h4>
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{ borderRadius: "0.5rem", fontSize: "0.875rem" }}
              >
                {suggestion.original_code}
              </SyntaxHighlighter>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 text-green-600">Código Sugerido</h4>
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{ borderRadius: "0.5rem", fontSize: "0.875rem" }}
              >
                {suggestion.suggested_code}
              </SyntaxHighlighter>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Esta sugestão foi útil?</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => submitFeedback("up")}
                className={feedback === "up" ? "text-green-600" : ""}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => submitFeedback("down")}
                className={feedback === "down" ? "text-red-600" : ""}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={copySuggestion} variant="outline">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Código
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
