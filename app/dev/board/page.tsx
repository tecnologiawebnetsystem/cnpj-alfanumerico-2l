"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DevKanbanBoard } from "@/components/dev/dev-kanban-board"
import { DevHeader } from "@/components/dev/dev-header"
import { Loader2 } from "lucide-react"

export default function DevBoardPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/login")
      return
    }

    if (currentUser.role !== "dev") {
      router.push("/dashboard")
      return
    }

    setUser(currentUser)
    fetchTasks(currentUser.id)
  }, [router])

  const fetchTasks = async (userId: string) => {
    try {
      const res = await fetch(`/api/dev/tasks?user_id=${userId}&include_details=true`)
      const data = await res.json()
      setTasks(data || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const handleTaskUpdate = async (taskId: string, updates: any) => {
    try {
      const res = await fetch(`/api/dev/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        throw new Error("Failed to update task")
      }

      // Refresh tasks
      if (user) {
        await fetchTasks(user.id)
      }
    } catch (error) {
      console.error("Error updating task:", error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando suas tarefas...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DevHeader user={user} activeView="board" />

      {/* Page Content */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Board Kanban</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Arraste e solte para organizar suas tarefas
          </p>
        </div>

        {/* Kanban Board */}
        <DevKanbanBoard tasks={tasks} onTaskUpdate={handleTaskUpdate} />
      </main>
    </div>
  )
}
