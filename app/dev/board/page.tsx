"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DevKanbanBoard } from "@/components/dev/dev-kanban-board"
import { DevHeader } from "@/components/dev/dev-header"
import { WorkTimer } from "@/components/dev/work-timer"
import { DevAIAssistant } from "@/components/dev/dev-ai-assistant"
import { FocusMode } from "@/components/dev/focus-mode"
import { KeyboardShortcutsHelp } from "@/components/dev/keyboard-shortcuts-help"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { Loader2, Bot, Timer, Focus, Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function DevBoardPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // New features state
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [showTimer, setShowTimer] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showFocusMode, setShowFocusMode] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Keyboard shortcuts
  useKeyboardShortcuts({
    "ctrl+k": () => setShowAIAssistant(true),
    "ctrl+f": () => { if (selectedTask) setShowFocusMode(true) },
    "ctrl+t": () => { if (selectedTask) setShowTimer(true) },
    "?": () => setShowShortcuts(true),
    "escape": () => {
      setShowAIAssistant(false)
      setShowFocusMode(false)
      setShowTimer(false)
      setShowShortcuts(false)
    },
  })

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

  const handleTaskSelect = (task: any) => {
    setSelectedTask(task)
  }

  const handleStartFocus = (task: any) => {
    setSelectedTask(task)
    setShowFocusMode(true)
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
    <TooltipProvider>
      <div className="min-h-screen bg-muted/30">
        <DevHeader user={user} activeView="board" />

        {/* Page Content */}
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Page Title and Toolbar */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Board Kanban</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Arraste e solte para organizar suas tarefas
              </p>
            </div>
            
            {/* Toolbar with new features */}
            <div className="flex items-center gap-2">
              {selectedTask && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowTimer(true)}
                        className="gap-2"
                      >
                        <Timer className="h-4 w-4" />
                        <span className="hidden sm:inline">Timer</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Iniciar cronometro (Ctrl+T)</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowFocusMode(true)}
                        className="gap-2"
                      >
                        <Focus className="h-4 w-4" />
                        <span className="hidden sm:inline">Foco</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Modo Foco/Pomodoro (Ctrl+F)</TooltipContent>
                  </Tooltip>
                </>
              )}
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAIAssistant(true)}
                    className="gap-2"
                  >
                    <Bot className="h-4 w-4" />
                    <span className="hidden sm:inline">Assistente IA</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Assistente IA (Ctrl+K)</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowShortcuts(true)}
                  >
                    <Keyboard className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Atalhos de teclado (?)</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Selected Task Info */}
          {selectedTask && (
            <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Tarefa selecionada: {selectedTask.title}</p>
                <p className="text-xs text-muted-foreground">Use os botoes acima ou atalhos de teclado</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTask(null)}>
                Limpar selecao
              </Button>
            </div>
          )}

          {/* Kanban Board */}
          <DevKanbanBoard 
            tasks={tasks} 
            onTaskUpdate={handleTaskUpdate}
            onTaskSelect={handleTaskSelect}
            onStartFocus={handleStartFocus}
          />
        </main>

        {/* Timer Modal */}
        {showTimer && selectedTask && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold">Cronometro de Trabalho</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowTimer(false)}>
                  Fechar
                </Button>
              </div>
              <div className="p-4">
                <WorkTimer
                  taskId={selectedTask.id}
                  taskTitle={selectedTask.title}
                  userId={user.id}
                  onTimeLogged={(minutes) => {
                    console.log(`Logged ${minutes} minutes`)
                    fetchTasks(user.id)
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* AI Assistant */}
        <DevAIAssistant
          userId={user.id}
          currentTask={selectedTask}
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
        />

        {/* Focus Mode */}
        <FocusMode
          open={showFocusMode}
          onOpenChange={setShowFocusMode}
          task={selectedTask}
          onComplete={() => {
            if (selectedTask) {
              handleTaskUpdate(selectedTask.id, { status: "done" })
            }
            setShowFocusMode(false)
          }}
        />

        {/* Keyboard Shortcuts Help */}
        <KeyboardShortcutsHelp
          isOpen={showShortcuts}
          onClose={() => setShowShortcuts(false)}
        />
      </div>
    </TooltipProvider>
  )
}
