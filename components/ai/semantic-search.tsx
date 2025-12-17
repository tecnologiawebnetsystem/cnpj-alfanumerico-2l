"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Sparkles, FileCode, Database, CheckCircle2 } from "lucide-react"

interface SearchResult {
  id: string
  type: "analysis" | "task" | "finding"
  title: string
  description: string
  relevance: number
  metadata: Record<string, any>
}

export function SemanticSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()
      setResults(data.results)
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "analysis":
        return <FileCode className="h-5 w-5 text-blue-500" />
      case "task":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "finding":
        return <Database className="h-5 w-5 text-orange-500" />
      default:
        return <Search className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold">Busca Semântica com IA</h3>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busque usando linguagem natural... Ex: 'análises com muitos erros de CNPJ'"
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-2">
          Use linguagem natural para encontrar análises, tarefas e findings relevantes
        </p>
      </Card>

      {results.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold">Resultados ({results.length})</h4>
          {results.map((result) => (
            <Card key={result.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-lg">{getIcon(result.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-semibold truncate">{result.title}</h5>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(result.relevance * 100)}% relevante
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{result.description}</p>
                  {result.metadata && (
                    <div className="flex gap-2 mt-2">
                      {Object.entries(result.metadata)
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
