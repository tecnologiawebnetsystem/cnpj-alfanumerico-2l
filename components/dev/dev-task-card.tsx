"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  created_at: string
}

interface DevTaskCardProps {
  task: Task
  isSelected: boolean
  onClick: () => void
}

export function DevTaskCard({ task, isSelected, onClick }: DevTaskCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "in_progress":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "border-blue-500 border-2 shadow-md" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {getStatusIcon(task.status)}
            <h3 className="font-semibold text-slate-900 line-clamp-1">{task.title}</h3>
          </div>
          <Badge className={getPriorityColor(task.priority)}>
            {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
        <div className="mt-3 text-xs text-muted-foreground">
          Criada em {new Date(task.created_at).toLocaleDateString("pt-BR")}
        </div>
      </CardContent>
    </Card>
  )
}
