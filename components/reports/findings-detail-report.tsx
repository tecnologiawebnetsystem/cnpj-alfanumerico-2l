"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  FileCode, 
  GitBranch, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Brain,
  ExternalLink,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Finding {
  id: string
  file_path: string
  line_number: number
  field_name: string
  code_current: string
  code_before: string
  code_after: string
  code_suggested: string
  ai_analysis: string | null
  ai_suggestion: string | null
  ai_confidence: number | null
  context: string
  suggestion: string
}

interface Repository {
  id: string
  name: string
  url: string
  findings: Finding[]
}

interface FindingsDetailReportProps {
  repositories: Repository[]
  analysisId?: string
  onCreateTask?: (finding: Finding, repositoryName: string) => void
}

export function FindingsDetailReport({ repositories, analysisId, onCreateTask }: FindingsDetailReportProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedRepos, setExpandedRepos] = useState<Set<string>>(new Set(repositories.map(r => r.id)))
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [filterConfidence, setFilterConfidence] = useState<string>("all")

  const toggleRepo = (repoId: string) => {
    const newExpanded = new Set(expandedRepos)
    if (newExpanded.has(repoId)) {
      newExpanded.delete(repoId)
    } else {
      newExpanded.add(repoId)
    }
    setExpandedRepos(newExpanded)
  }

  const toggleFinding = (findingId: string) => {
    const newExpanded = new Set(expandedFindings)
    if (newExpanded.has(findingId)) {
      newExpanded.delete(findingId)
    } else {
      newExpanded.add(findingId)
    }
    setExpandedFindings(newExpanded)
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getConfidenceBadge = (confidence: number | null) => {
    if (confidence === null) return null
    if (confidence >= 0.8) {
      return <Badge className="bg-green-100 text-green-700">Alta ({Math.round(confidence * 100)}%)</Badge>
    } else if (confidence >= 0.5) {
      return <Badge className="bg-amber-100 text-amber-700">Media ({Math.round(confidence * 100)}%)</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-700">Baixa ({Math.round(confidence * 100)}%)</Badge>
    }
  }

  const filteredRepositories = repositories.map(repo => ({
    ...repo,
    findings: repo.findings.filter(finding => {
      const matchesSearch = searchTerm === "" || 
        finding.file_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        finding.field_name?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesConfidence = filterConfidence === "all" ||
        (filterConfidence === "high" && (finding.ai_confidence ?? 0) >= 0.8) ||
        (filterConfidence === "medium" && (finding.ai_confidence ?? 0) >= 0.5 && (finding.ai_confidence ?? 0) < 0.8) ||
        (filterConfidence === "low" && (finding.ai_confidence ?? 0) < 0.5)
      
      return matchesSearch && matchesConfidence
    })
  })).filter(repo => repo.findings.length > 0)

  const totalFindings = filteredRepositories.reduce((acc, repo) => acc + repo.findings.length, 0)

  return (
    <div className="space-y-6">
      {/* Header e Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Relatorio Detalhado de Findings</h2>
          <p className="text-sm text-muted-foreground">
            {totalFindings} ocorrencia(s) encontrada(s) em {filteredRepositories.length} repositorio(s)
          </p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar arquivo ou campo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <select
            value={filterConfidence}
            onChange={(e) => setFilterConfidence(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">Todas</option>
            <option value="high">Alta confianca</option>
            <option value="medium">Media confianca</option>
            <option value="low">Baixa confianca</option>
          </select>
        </div>
      </div>

      {/* Lista de Repositorios */}
      <div className="space-y-4">
        {filteredRepositories.map((repo) => (
          <Card key={repo.id} className="border">
            {/* Header do Repositorio */}
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors py-4"
              onClick={() => toggleRepo(repo.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expandedRepos.has(repo.id) ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                  <GitBranch className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">{repo.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{repo.url}</p>
                  </div>
                </div>
                <Badge variant="secondary">{repo.findings.length} finding(s)</Badge>
              </div>
            </CardHeader>

            {/* Findings do Repositorio */}
            {expandedRepos.has(repo.id) && (
              <CardContent className="pt-0 space-y-3">
                {repo.findings.map((finding, index) => (
                  <div 
                    key={finding.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    {/* Header do Finding */}
                    <div 
                      className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleFinding(finding.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {expandedFindings.has(finding.id) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <FileCode className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{finding.file_path}</p>
                          <p className="text-xs text-muted-foreground">
                            Linha {finding.line_number} | Campo: {finding.field_name || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {finding.ai_analysis && (
                          <Badge variant="outline" className="gap-1">
                            <Brain className="h-3 w-3" />
                            IA
                          </Badge>
                        )}
                        {getConfidenceBadge(finding.ai_confidence)}
                      </div>
                    </div>

                    {/* Detalhes do Finding */}
                    {expandedFindings.has(finding.id) && (
                      <div className="p-4 space-y-4 border-t">
                        {/* Codigo Atual */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                              Codigo Atual (Linha {finding.line_number})
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(finding.code_current || "", `current-${finding.id}`)}
                            >
                              {copiedId === `current-${finding.id}` ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <pre className="bg-red-50 border border-red-200 rounded-md p-3 text-sm overflow-x-auto">
                            <code className="text-red-800">
                              {finding.code_before && (
                                <span className="text-muted-foreground">{finding.code_before}\n</span>
                              )}
                              <span className="bg-red-200 px-1">{finding.code_current}</span>
                              {finding.code_after && (
                                <span className="text-muted-foreground">\n{finding.code_after}</span>
                              )}
                            </code>
                          </pre>
                        </div>

                        {/* Sugestao de Correcao */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              Sugestao de Correcao
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(finding.code_suggested || finding.ai_suggestion || "", `suggested-${finding.id}`)}
                            >
                              {copiedId === `suggested-${finding.id}` ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <pre className="bg-green-50 border border-green-200 rounded-md p-3 text-sm overflow-x-auto">
                            <code className="text-green-800">
                              {finding.code_before && (
                                <span className="text-muted-foreground">{finding.code_before}\n</span>
                              )}
                              <span className="bg-green-200 px-1">{finding.code_suggested || finding.ai_suggestion}</span>
                              {finding.code_after && (
                                <span className="text-muted-foreground">\n{finding.code_after}</span>
                              )}
                            </code>
                          </pre>
                        </div>

                        {/* Analise da IA */}
                        {finding.ai_analysis && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                              <Brain className="h-4 w-4 text-primary" />
                              Analise da IA
                            </h4>
                            <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-sm">
                              <p className="whitespace-pre-wrap">{finding.ai_analysis}</p>
                            </div>
                          </div>
                        )}

                        {/* Sugestao Basica (se nao houver IA) */}
                        {!finding.ai_analysis && finding.suggestion && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Sugestao</h4>
                            <p className="text-sm text-muted-foreground">{finding.suggestion}</p>
                          </div>
                        )}

                        {/* Acoes */}
                        {onCreateTask && (
                          <div className="flex justify-end pt-2 border-t">
                            <Button
                              size="sm"
                              onClick={() => onCreateTask(finding, repo.name)}
                            >
                              Criar Tarefa para Desenvolvedor
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}

        {filteredRepositories.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">Nenhum finding encontrado</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tente ajustar os filtros ou realizar uma nova analise
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export { type Finding, type Repository }
