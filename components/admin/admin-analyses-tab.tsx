"use client"

import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Calendar, Database, FileCode, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Analysis {
  id: string
  client_id: string
  client_name: string
  repository_id: string
  repository_name: string
  status: string
  started_at: string
  completed_at: string | null
  error_message: string | null
  total_findings: number
}

interface Finding {
  id: string
  file_path: string
  line_number: number
  field_name: string
  field_type: string
  context: string
  suggestion: string
}

export function AdminAnalysesTab() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null)
  const [findings, setFindings] = useState<Finding[]>([])
  const [loadingFindings, setLoadingFindings] = useState(false)

  useEffect(() => {
    loadAnalyses()
  }, [])

  useEffect(() => {
    const filtered = analyses.filter(
      (analysis) =>
        analysis.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.repository_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.status.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredAnalyses(filtered)
  }, [searchTerm, analyses])

  const loadAnalyses = async () => {
    try {
      const user = getCurrentUser()
      if (!user) return

      const response = await fetch(`/api/admin/analyses?user_id=${user.id}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Erro ao carregar análises: ${response.statusText}`)
      }

      const data = await response.json()
      setAnalyses(data)
      setFilteredAnalyses(data)
    } catch (error) {
      console.error(" Error loading analyses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const viewAnalysisDetails = async (analysis: Analysis) => {
    setSelectedAnalysis(analysis)
    setLoadingFindings(true)

    try {
      const user = getCurrentUser()
      if (!user) return

      const response = await fetch(`/api/admin/analyses/${analysis.id}/findings?user_id=${user.id}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Erro ao carregar findings: ${response.statusText}`)
      }

      const data = await response.json()
      setFindings(data)
    } catch (error) {
      console.error(" Error loading findings:", error)
    } finally {
      setLoadingFindings(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      completed: "default",
      running: "secondary",
      failed: "destructive",
      pending: "secondary",
    }

    const labels: Record<string, string> = {
      completed: "Concluída",
      running: "Em execução",
      failed: "Falhou",
      pending: "Pendente",
    }

    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>
  }

  if (isLoading) {
    return (
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-12 text-center">
          <p className="text-slate-600 dark:text-slate-300">Carregando análises...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-600 to-purple-600 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Análises de CNPJ</CardTitle>
          <CardDescription className="text-blue-100">
            Visualize todas as análises realizadas pelos clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200" />
            <Input
              placeholder="Buscar por cliente, repositório ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white/95 backdrop-blur shadow-xl border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-700">
                <TableHead className="text-slate-700 dark:text-slate-300">Cliente</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Repositório</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Data</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Findings</TableHead>
                <TableHead className="text-right text-slate-700 dark:text-slate-300">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnalyses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Database className="h-12 w-12 opacity-20" />
                      <p>Nenhuma análise encontrada</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnalyses.map((analysis) => (
                  <TableRow key={analysis.id} className="border-slate-200 dark:border-slate-700">
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      {analysis.client_name}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4" />
                        {analysis.repository_name}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(analysis.status)}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(analysis.started_at).toLocaleDateString("pt-BR")}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-900 dark:text-slate-100">
                      <Badge variant="outline" className="font-mono">
                        {analysis.total_findings}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewAnalysisDetails(analysis)}
                        className="gap-2 border-slate-300 dark:border-slate-600"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={!!selectedAnalysis} onOpenChange={() => setSelectedAnalysis(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalhes da Análise</DialogTitle>
            <DialogDescription>
              {selectedAnalysis?.client_name} - {selectedAnalysis?.repository_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Info da análise */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {selectedAnalysis && getStatusBadge(selectedAnalysis.status)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total de Findings</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {selectedAnalysis?.total_findings || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Data de Início</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {selectedAnalysis && new Date(selectedAnalysis.started_at).toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Data de Conclusão</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {selectedAnalysis?.completed_at
                    ? new Date(selectedAnalysis.completed_at).toLocaleString("pt-BR")
                    : "Em andamento"}
                </p>
              </div>
            </div>

            {/* Findings */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">Findings Encontrados</h3>
              {loadingFindings ? (
                <p className="text-slate-600 dark:text-slate-300">Carregando findings...</p>
              ) : findings.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <AlertCircle className="h-12 w-12 mx-auto opacity-20 mb-2" />
                  <p>Nenhum finding encontrado para esta análise</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {findings.map((finding) => (
                    <Card key={finding.id} className="border-slate-200 dark:border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-mono text-sm text-slate-600 dark:text-slate-400">
                              {finding.file_path}:{finding.line_number}
                            </p>
                            <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">
                              {finding.field_name} ({finding.field_type})
                            </p>
                          </div>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-sm font-mono text-slate-700 dark:text-slate-300 mb-2">
                          {finding.context}
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded text-sm text-slate-700 dark:text-slate-300">
                          <strong>Sugestão:</strong> {finding.suggestion}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
