"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react'

interface ComparisonProps {
  baseAnalysis: any
  compareAnalysis: any
  diffSummary: any
}

export function AnalysisComparison({
  baseAnalysis,
  compareAnalysis,
  diffSummary,
}: ComparisonProps) {
  const getDiffIcon = (value: number) => {
    if (value > 0) return <ArrowUpIcon className="h-4 w-4 text-red-500" />
    if (value < 0) return <ArrowDownIcon className="h-4 w-4 text-green-500" />
    return <MinusIcon className="h-4 w-4 text-gray-400" />
  }

  const getDiffColor = (value: number) => {
    if (value > 0) return "text-red-600"
    if (value < 0) return "text-green-600"
    return "text-gray-600"
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500">Análise Base</div>
          <div className="mt-2 text-2xl font-bold">
            {new Date(baseAnalysis.created_at).toLocaleDateString()}
          </div>
        </Card>

        <Card className="p-6 flex items-center justify-center">
          <div className="text-xl font-bold text-gray-400">VS</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500">
            Análise Comparada
          </div>
          <div className="mt-2 text-2xl font-bold">
            {new Date(compareAnalysis.created_at).toLocaleDateString()}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Diferenças Encontradas</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total de Findings</span>
            <div className="flex items-center gap-2">
              {getDiffIcon(diffSummary.findings_diff)}
              <span className={getDiffColor(diffSummary.findings_diff)}>
                {diffSummary.findings_diff > 0 ? "+" : ""}
                {diffSummary.findings_diff}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Alta Severidade</span>
            <div className="flex items-center gap-2">
              {getDiffIcon(diffSummary.high_severity_diff)}
              <span className={getDiffColor(diffSummary.high_severity_diff)}>
                {diffSummary.high_severity_diff > 0 ? "+" : ""}
                {diffSummary.high_severity_diff}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total de Tarefas</span>
            <div className="flex items-center gap-2">
              {getDiffIcon(diffSummary.tasks_diff)}
              <span className={getDiffColor(diffSummary.tasks_diff)}>
                {diffSummary.tasks_diff > 0 ? "+" : ""}
                {diffSummary.tasks_diff}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Arquivos com CNPJ</span>
            <div className="flex items-center gap-2">
              {getDiffIcon(diffSummary.cnpj_diff)}
              <span className={getDiffColor(diffSummary.cnpj_diff)}>
                {diffSummary.cnpj_diff > 0 ? "+" : ""}
                {diffSummary.cnpj_diff}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
