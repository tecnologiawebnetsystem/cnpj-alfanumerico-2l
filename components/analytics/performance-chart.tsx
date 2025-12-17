"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface PerformanceChartProps {
  period: string
}

export function PerformanceChart({ period }: PerformanceChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/performance?period=${period}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error fetching performance data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Performance do Sistema</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="avg_completion_time" stroke="#3b82f6" name="Tempo Médio (h)" />
          <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#10b981" name="Throughput (tarefas/dia)" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
