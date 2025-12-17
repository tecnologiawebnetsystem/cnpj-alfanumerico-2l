"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, Clock } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import Link from "next/link"

interface Analysis {
  id: string
  repository_name: string
  language: string
  created_at: string
  estimated_hours: number
  status: string
}

export function RecentAnalyses() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalyses() {
      const supabase = getSupabaseBrowserClient()

      if (!supabase) {
        setAnalyses([
          {
            id: "1",
            repository_name: "sistema-contabil-demo",
            language: "Java",
            created_at: new Date().toISOString(),
            estimated_hours: 24,
            status: "completed",
          },
          {
            id: "2",
            repository_name: "erp-seguros",
            language: "C#",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            estimated_hours: 48,
            status: "completed",
          },
          {
            id: "3",
            repository_name: "portal-cliente",
            language: "JavaScript",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            estimated_hours: 16,
            status: "completed",
          },
        ])
        setLoading(false)
        return
      }

      const { data } = await supabase.from("analyses").select("*").order("created_at", { ascending: false }).limit(5)

      setAnalyses(data || [])
      setLoading(false)
    }

    fetchAnalyses()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análises Recentes</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análises Recentes</CardTitle>
        <CardDescription>Histórico das análises realizadas no sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-lg mb-2">Nenhuma análise ainda</h3>
            <p className="text-sm text-muted-foreground mb-4">Faça upload de um repositório para começar a análise</p>
          </div>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{analysis.repository_name}</h4>
                    <Badge variant="secondary">{analysis.language}</Badge>
                    <Badge variant={analysis.status === "completed" ? "default" : "outline"}>{analysis.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(analysis.created_at).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {analysis.estimated_hours}h estimadas
                    </span>
                  </div>
                </div>
                <Link href={`/analysis/${analysis.id}`}>
                  <Button variant="outline" size="sm">
                    Ver Relatório
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
