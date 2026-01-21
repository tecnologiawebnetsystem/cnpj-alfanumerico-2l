"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Clock, CheckCircle2, AlertCircle, TrendingUp, 
  Keyboard, History, Trophy, Target, Bell,
  Sparkles
} from "lucide-react"

// Import all new components
import { WorkTimer } from "./work-timer"
import { DevAIAssistant } from "./dev-ai-assistant"
import { TaskChecklist } from "./task-checklist"
import { ActivityHistory } from "./activity-history"
import { DevNotifications } from "./dev-notifications"
import { DiffViewer } from "./diff-viewer"
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help"
import { FocusMode } from "./focus-mode"
import { GamificationPanel } from "./gamification-panel"
import { GitIntegration } from "./git-integration"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"

interface DevDashboardFullProps {
  userId: string
  stats: {
    total: number
    completed: number
    inProgress: number
    delayed: number
    performanceScore: number
  }
  tasks: any[]
  onTaskSelect?: (task: any) => void
  onStatusChange?: (taskId: string, status: string) => void
}

export function DevDashboardFull({ 
  userId, 
  stats, 
  tasks, 
  onTaskSelect,
  onStatusChange 
}: DevDashboardFullProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [focusModeTask, setFocusModeTask] = useState<any>(null)
  
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  // Keyboard shortcuts
  const shortcuts = [
    { key: "1", action: () => setActiveTab("overview"), description: "Visao Geral" },
    { key: "2", action: () => setActiveTab("tasks"), description: "Tarefas" },
    { key: "3", action: () => setActiveTab("history"), description: "Historico" },
    { key: "4", action: () => setActiveTab("achievements"), description: "Conquistas" },
    { key: "?", action: () => setShowShortcuts(true), description: "Ajuda" },
    { key: "f", action: () => {
      if (selectedTask) setFocusModeTask(selectedTask)
    }, description: "Modo Foco" },
    { key: "Escape", action: () => {
      setFocusModeTask(null)
      setShowShortcuts(false)
    }, description: "Fechar" },
  ]

  useKeyboardShortcuts(shortcuts)

  const handleTaskClick = (task: any) => {
    setSelectedTask(task)
    onTaskSelect?.(task)
  }

  const handleEnterFocusMode = (task: any) => {
    setFocusModeTask(task)
  }

  const handleExitFocusMode = () => {
    setFocusModeTask(null)
  }

  const handleFocusModeComplete = async () => {
    if (focusModeTask && onStatusChange) {
      await onStatusChange(focusModeTask.id, "done")
      setFocusModeTask(null)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  // Focus Mode - Full screen overlay
  if (focusModeTask) {
    return (
      <FocusMode
        task={focusModeTask}
        userId={userId}
        onExit={handleExitFocusMode}
        onComplete={handleFocusModeComplete}
      />
    )
  }

  return (
    <div className="space-y-6 p-6 relative">
      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />

      {/* Top Bar with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meu Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo de volta! Aqui esta seu resumo.</p>
        </div>
        <div className="flex items-center gap-2">
          <DevNotifications userId={userId} />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowShortcuts(true)}
          >
            <Keyboard className="h-4 w-4 mr-2" />
            Atalhos
          </Button>
        </div>
      </div>

      {/* Performance Score + Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="md:col-span-2 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Performance Score</p>
                <div className={`text-5xl font-bold ${getScoreColor(stats.performanceScore)}`}>
                  {stats.performanceScore}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Ultimos 7 dias</p>
              </div>
              <TrendingUp className="h-12 w-12 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Concluidas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.delayed}</p>
              <p className="text-xs text-muted-foreground">Atrasadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Visao Geral</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">Tarefas</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Historico</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Conquistas</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Progress */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Progresso Geral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taxa de Conclusao</span>
                    <span className="font-semibold">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-3" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                    <p className="text-xs text-muted-foreground">Em Andamento</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    <p className="text-xs text-muted-foreground">Concluidas</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{stats.delayed}</p>
                    <p className="text-xs text-muted-foreground">Atrasadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timer Widget */}
            <WorkTimer 
              userId={userId} 
              taskId={selectedTask?.id}
              taskTitle={selectedTask?.title}
              compact
            />
          </div>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tarefas Recentes</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("tasks")}>
                  Ver Todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                      selectedTask?.id === task.id ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.repository_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          task.status === "todo" ? "outline" : 
                          task.status === "in_progress" ? "default" : 
                          "secondary"
                        }
                      >
                        {task.status === "todo" ? "Pendente" : 
                         task.status === "in_progress" ? "Em Andamento" : 
                         "Concluida"}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEnterFocusMode(task)
                        }}
                      >
                        <Target className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma tarefa atribuida
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Task List with more details */}
              <Card>
                <CardHeader>
                  <CardTitle>Minhas Tarefas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleTaskClick(task)}
                        className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                          selectedTask?.id === task.id ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.repository_name} - {task.file_path}
                            </p>
                            {task.estimated_hours && (
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Est: {task.estimated_hours}h
                                </span>
                                {task.completed_hours > 0 && (
                                  <span>Gasto: {task.completed_hours}h</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              variant={
                                task.priority === "critical" ? "destructive" :
                                task.priority === "high" ? "default" :
                                "outline"
                              }
                            >
                              {task.priority}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEnterFocusMode(task)
                              }}
                            >
                              <Target className="h-4 w-4 mr-1" />
                              Focar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Task Details Sidebar */}
            <div className="space-y-4">
              {selectedTask ? (
                <>
                  <WorkTimer 
                    userId={userId} 
                    taskId={selectedTask.id}
                    taskTitle={selectedTask.title}
                  />
                  
                  <TaskChecklist 
                    taskId={selectedTask.id}
                    onAllComplete={() => {
                      // Show completion dialog
                    }}
                  />

                  {selectedTask.current_code && selectedTask.suggested_code && (
                    <DiffViewer
                      originalCode={selectedTask.current_code}
                      modifiedCode={selectedTask.suggested_code}
                      language={selectedTask.file_path?.split(".").pop() || "typescript"}
                      fileName={selectedTask.file_path}
                    />
                  )}

                  <GitIntegration 
                    taskId={selectedTask.id}
                    repositoryUrl={selectedTask.repository_url}
                    branchName={selectedTask.branch_name}
                  />
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Selecione uma tarefa para ver detalhes</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <ActivityHistory userId={userId} />
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <GamificationPanel userId={userId} />
        </TabsContent>
      </Tabs>

      {/* AI Assistant - Floating Button */}
      <DevAIAssistant 
        userId={userId}
        taskId={selectedTask?.id}
        taskContext={selectedTask ? {
          title: selectedTask.title,
          description: selectedTask.description,
          currentCode: selectedTask.current_code,
          suggestedCode: selectedTask.suggested_code,
          filePath: selectedTask.file_path
        } : undefined}
      />
    </div>
  )
}
