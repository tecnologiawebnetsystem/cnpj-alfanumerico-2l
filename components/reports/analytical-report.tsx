"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileCode, Download, AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react"
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"

interface Finding {
  id: string
  repository_name: string
  file_path: string
  line_number: number
  severity: "critical" | "high" | "medium" | "low"
  issue_type: string
  description: string
  current_code: string
  suggested_code: string
  ai_explanation: string
}

interface AnalyticalReportProps {
  batchId: string
  findings: Finding[]
  onExportPDF: () => void
}

export function AnalyticalReport({ batchId, findings, onExportPDF }: AnalyticalReportProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "default"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "critical":
        return "Crítico"
      case "high":
        return "Alto"
      case "medium":
        return "Médio"
      case "low":
        return "Baixo"
      default:
        return severity
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Relatório Analítico - Detalhado</CardTitle>
            <Button onClick={onExportPDF} variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Total de problemas encontrados: <span className="font-bold text-foreground">{findings.length}</span>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Repositório</TableHead>
                  <TableHead>Arquivo</TableHead>
                  <TableHead className="text-center">Linha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {findings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2" />
                      <p className="text-muted-foreground">Nenhum problema encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  findings.map((finding) => (
                    <>
                      <TableRow key={finding.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRow(finding.id)}
                                className="p-0 h-8 w-8"
                              >
                                {expandedRows.has(finding.id) ? "▼" : "▶"}
                              </Button>
                            </CollapsibleTrigger>
                          </Collapsible>
                        </TableCell>
                        <TableCell className="font-medium">{finding.repository_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileCode className="h-4 w-4 text-muted-foreground" />
                            <code className="text-sm">{finding.file_path}</code>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{finding.line_number}</Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{finding.issue_type}</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(finding.severity)}>
                            {getSeverityLabel(finding.severity)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">{finding.description}</TableCell>
                      </TableRow>

                      {expandedRows.has(finding.id) && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/30">
                            <div className="p-4 space-y-4">
                              {/* Código Atual */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                                  <h4 className="font-semibold">Código Atual (Problema)</h4>
                                </div>
                                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                                  <code>{finding.current_code}</code>
                                </pre>
                              </div>

                              {/* Código Sugerido */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <h4 className="font-semibold">Código Sugerido (Solução)</h4>
                                </div>
                                <pre className="bg-green-900/20 text-green-900 dark:text-green-100 p-4 rounded-lg overflow-x-auto border-2 border-green-500">
                                  <code>{finding.suggested_code}</code>
                                </pre>
                              </div>

                              {/* Explicação da IA */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                                  <h4 className="font-semibold">Explicação da IA</h4>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <p className="text-sm text-blue-900">{finding.ai_explanation}</p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
