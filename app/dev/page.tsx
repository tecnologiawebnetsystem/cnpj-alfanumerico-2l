"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DevHeader } from "@/components/dev/dev-header"
import { DevKanbanBoard } from "@/components/dev/dev-kanban-board"
import { WorkTimer } from "@/components/dev/work-timer"
import { DevAIAssistant } from "@/components/dev/dev-ai-assistant"
import { ActivityHistory } from "@/components/dev/activity-history"
import { DevNotifications } from "@/components/dev/dev-notifications"
import { GamificationPanel } from "@/components/dev/gamification-panel"
import { FocusMode } from "@/components/dev/focus-mode"
import { KeyboardShortcutsHelp } from "@/components/dev/keyboard-shortcuts-help"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { 
  Loader2, 
  LayoutDashboard, 
  History, 
  Trophy, 
  Bell,
  Target,
  Keyboard
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DevPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("board")
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [showFocusMode, setShowFocusMode] = useState(false)
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  // Keyboard shortcuts
  const shortcuts = {
    "ctrl+k": () => setShowAIAssistant(true),
    "ctrl+f": () => setShowFocusMode(true),
    "ctrl+1": () => setActiveTab("board"),
    "ctrl+2": () => setActiveTab("history"),
    "ctrl+3": () => setActiveTab("achievements"),
    "ctrl+4": () => setActiveTab("notifications"),
    "?": () => setShowShortcutsHelp(true),
    "escape": () => {
      setShowFocusMode(false)
      setShowShortcutsHelp(false)
      setShowAIAssistant(false)
    }
  }
  useKeyboardShortcuts(shortcuts)

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

      // Award points for completing task
      if (updates.status === "done" && user) {
        await fetch("/api/dev/gamification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            user_id: user.id, 
            action: "complete_task",
            task_id: taskId
          }),
        })
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

  const handleTaskSelect = useCallback((task: any) => {
    setSelectedTask(task)
  }, [])

  const handleStartFocus = useCallback((task: any) => {
    setSelectedTask(task)
    setShowFocusMode(true)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Get current in-progress task for timer
  const currentTask = tasks.find(t => t.status === "in_progress") || selectedTask

  return (
    <div className="min-h-screen bg-muted/30">
      <DevHeader user={user} activeView="dashboard" />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Top Bar with Timer and Quick Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Meu Painel</h1>
            <p className="text-sm text-muted-foreground">
              {tasks.filter(t => t.status === "in_progress").length} tarefas em andamento
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Work Timer - Always visible */}
            {currentTask && (
              <WorkTimer 
                taskId={currentTask.id} 
                taskTitle={currentTask.title}
                userId={user.id}
              />
            )}
            
            {/* Quick Actions */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFocusMode(true)}
              title="Modo Foco (Ctrl+F)"
            >
              <Target className="h-4 w-4 mr-2" />
              Foco
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowShortcutsHelp(true)}
              title="Atalhos (?)"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="board" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Board
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Historico
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Trophy className="h-4 w-4" />
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notificacoes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-0">
            <DevKanbanBoard 
              tasks={tasks} 
              onTaskUpdate={handleTaskUpdate}
              onTaskSelect={handleTaskSelect}
              onStartFocus={handleStartFocus}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <ActivityHistory userId={user.id} />
          </TabsContent>

          <TabsContent value="achievements" className="mt-0">
            <GamificationPanel userId={user.id} />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <DevNotifications userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>

      {/* AI Assistant - Floating */}
      <DevAIAssistant 
        userId={user.id}
        currentTask={selectedTask}
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />

      {/* Focus Mode Overlay */}
      <FocusMode 
        open={showFocusMode && !!selectedTask}
        onOpenChange={(open) => {
          setShowFocusMode(open)
          if (!open) setSelectedTask(null)
        }}
        task={selectedTask || undefined}
        onComplete={() => {
          if (selectedTask) {
            handleTaskUpdate(selectedTask.id, { status: "done" })
          }
          setShowFocusMode(false)
        }}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp 
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />
    </div>
  )
}
