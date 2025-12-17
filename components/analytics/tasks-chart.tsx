"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts"

interface TasksChartProps {
  period: string
  detailed?: boolean
}

export function TasksChart({ period, detailed = false }: TasksChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/tasks?period=${period}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error fetching tasks data:", error)
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
      <h3 className="text-lg font-semibold mb-4">Tarefas por Status</h3>
      <ResponsiveContainer width="100%" height={detailed ? 400 : 300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="#10b981" name="Concluídas" />
          <Area type="monotone" dataKey="in_progress" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Em Progresso" />
          <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Pendentes" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
