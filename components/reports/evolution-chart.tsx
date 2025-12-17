"use client"

import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface EvolutionChartProps {
  data: any[]
}

export function EvolutionChart({ data }: EvolutionChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.analysis_date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    }),
    findings: item.avg_findings,
    highSeverity: item.avg_high_severity,
    cnpjFiles: item.total_cnpj_files,
  }))

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Evolução ao Longo do Tempo</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="findings"
            stroke="#8884d8"
            name="Findings"
          />
          <Line
            type="monotone"
            dataKey="highSeverity"
            stroke="#ff0000"
            name="Alta Severidade"
          />
          <Line
            type="monotone"
            dataKey="cnpjFiles"
            stroke="#00ff00"
            name="Arquivos CNPJ"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
