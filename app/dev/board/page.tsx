"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DevKanbanBoard } from "@/components/dev/dev-kanban-board"
import { Button } from "@/components/ui/button"
import { Loader2, ListTodo } from "lucide-react"
import Image from "next/image"

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
      setTasks(data)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskUpdate = async () => {
    if (user) {
      await fetchTasks(user.id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-slate-50">
      <div className="bg-gradient-to-r from-primary to-primary/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Image
                src="/images/act-logo-square.jfif"
                alt="ACT Digital"
                width={48}
                height={48}
                className="rounded-xl shadow-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">Board Kanban</h1>
                <p className="text-primary-foreground/80">Arraste e solte para organizar suas tarefas</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/dev/tasks")}
              variant="outline"
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ListTodo className="h-4 w-4" />
              Ver Lista de Tarefas
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DevKanbanBoard tasks={tasks} onTaskUpdate={handleTaskUpdate} />
      </div>
    </div>
  )
}
