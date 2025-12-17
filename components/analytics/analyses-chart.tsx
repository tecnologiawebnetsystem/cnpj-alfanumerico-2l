"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface AnalysesChartProps {
  period: string
  detailed?: boolean
}

export function AnalysesChart({ period, detailed = false }: AnalysesChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/analyses?period=${period}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error fetching analyses data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Análises por Período</h3>
      <ResponsiveContainer width="100%" height={detailed ? 400 : 300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="completed" fill="#10b981" name="Concluídas" />
          <Bar dataKey="processing" fill="#3b82f6" name="Em Processamento" />
          <Bar dataKey="failed" fill="#ef4444" name="Com Erro" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
