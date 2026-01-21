"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  User,
  LogOut,
  Settings,
  Kanban,
  ListTodo,
  Code,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  Mail,
  Shield,
  Save,
  History,
  Trophy,
  Timer,
  Focus,
  Keyboard,
  Bot,
  GitBranch,
  Code2,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { WorkTimer } from "./work-timer"
import { DevAIAssistant } from "./dev-ai-assistant"
import { GamificationPanel } from "./gamification-panel"
import { ActivityHistory } from "./activity-history"
import { FocusMode } from "./focus-mode"
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { logout } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DevHeaderProps {
  user: {
    id: string
    name: string
    email: string
  }
  activeView?: "board" | "tasks" | "docs"
}

interface Notification {
  id: string
  type: string
  title?: string
  message: string
  created_at: string
  read: boolean
  task_id?: string
}

export function DevHeader({ user, activeView = "board" }: DevHeaderProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  
  // New feature states
  const [showTimer, setShowTimer] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showGamification, setShowGamification] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showFocusMode, setShowFocusMode] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [currentTask, setCurrentTask] = useState<any>(null)
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    "ctrl+k": () => setShowAIAssistant(true),
    "ctrl+f": () => setShowFocusMode(true),
    "?": () => setShowKeyboardHelp(true),
    "escape": () => {
      setShowAIAssistant(false)
      setShowFocusMode(false)
      setShowKeyboardHelp(false)
      setShowTimer(false)
      setShowGamification(false)
      setShowHistory(false)
    }
  })

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [user.id])

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/dev/notifications?user_id=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data || [])
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoadingNotifications(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/dev/notifications/${notificationId}/read`, { method: "POST" })
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "task_completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-orange-500" />
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Agora"
    if (diffMins < 60) return `${diffMins}m atras`
    if (diffHours < 24) return `${diffHours}h atras`
    return `${diffDays}d atras`
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center h-14">
            {/* Left - Logo */}
            <div className="flex items-center gap-2 min-w-[160px]">
              <Link href="/dev/board" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl p-2 shadow-lg">
                    <Code2 className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex flex-col hidden sm:flex">
                  <span className="text-sm font-bold text-foreground tracking-tight">
                    CNPJ<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Detector</span>
                  </span>
                  <span className="text-[9px] text-muted-foreground font-medium tracking-widest uppercase -mt-0.5">
                    Dev Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* Center - Navigation */}
            <nav className="flex-1 hidden md:flex items-center justify-center">
              {/* Floating Nav Pill */}
              <div className="flex items-center gap-1 bg-muted/50 backdrop-blur-sm rounded-full px-2 py-1.5 border border-border/50 shadow-sm">
                <Link href="/dev/board">
                  <button
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      activeView === "board"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                  >
                    <Kanban className={cn("h-4 w-4", activeView === "board" && "text-blue-500")} />
                    Board
                  </button>
                </Link>
                <Link href="/dev/tasks">
                  <button
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      activeView === "tasks"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                  >
                    <ListTodo className={cn("h-4 w-4", activeView === "tasks" && "text-blue-500")} />
                    Tarefas
                  </button>
                </Link>
                <Link href="/documentacao">
                  <button
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      activeView === "docs"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                  >
                    <Code className={cn("h-4 w-4", activeView === "docs" && "text-blue-500")} />
                    Docs
                  </button>
                </Link>
              </div>
              
              {/* New Features Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-4 flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 group">
                    <Sparkles className="h-4 w-4 text-amber-500 group-hover:text-amber-400" />
                    Ferramentas
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56 p-2">
                  <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Produtividade</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setShowTimer(true)} className="gap-3 cursor-pointer rounded-lg py-2.5">
                    <div className="p-1.5 rounded-md bg-blue-500/10">
                      <Timer className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex flex-col">
                      <span>Cronometro</span>
                      <span className="text-[10px] text-muted-foreground">Registrar tempo</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowAIAssistant(true)} className="gap-3 cursor-pointer rounded-lg py-2.5">
                    <div className="p-1.5 rounded-md bg-purple-500/10">
                      <Bot className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span>Assistente IA</span>
                      <span className="text-[10px] text-muted-foreground">Ajuda com codigo</span>
                    </div>
                    <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded">Ctrl+K</kbd>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowFocusMode(true)} className="gap-3 cursor-pointer rounded-lg py-2.5">
                    <div className="p-1.5 rounded-md bg-green-500/10">
                      <Focus className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span>Modo Foco</span>
                      <span className="text-[10px] text-muted-foreground">Pomodoro</span>
                    </div>
                    <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded">Ctrl+F</kbd>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Estatisticas</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setShowHistory(true)} className="gap-3 cursor-pointer rounded-lg py-2.5">
                    <div className="p-1.5 rounded-md bg-orange-500/10">
                      <History className="h-4 w-4 text-orange-500" />
                    </div>
                    <span>Historico</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowGamification(true)} className="gap-3 cursor-pointer rounded-lg py-2.5">
                    <div className="p-1.5 rounded-md bg-amber-500/10">
                      <Trophy className="h-4 w-4 text-amber-500" />
                    </div>
                    <span>Conquistas</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={() => setShowKeyboardHelp(true)} className="gap-3 cursor-pointer rounded-lg py-2.5">
                    <div className="p-1.5 rounded-md bg-zinc-500/10">
                      <Keyboard className="h-4 w-4 text-zinc-500" />
                    </div>
                    <span className="flex-1">Atalhos</span>
                    <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded">?</kbd>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Right - Notifications and Profile */}
            <div className="flex items-center gap-1 min-w-[160px] justify-end">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">Notificacoes</span>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {unreadCount} novas
                      </Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                        <Bell className="h-5 w-5" />
                      </div>
                      <p className="text-xs">Nenhuma notificacao</p>
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.slice(0, 10).map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={`flex items-start gap-2.5 p-2.5 cursor-pointer ${
                            !notification.read ? "bg-blue-50/50" : ""
                          }`}
                          onClick={() => {
                            markAsRead(notification.id)
                            if (notification.task_id) {
                              router.push("/dev/tasks")
                            }
                          }}
                        >
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            {notification.title && (
                              <p className={`text-xs font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                                {notification.title}
                              </p>
                            )}
                            <p className={`text-xs ${!notification.read ? "" : "text-muted-foreground"} line-clamp-2`}>
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1.5 pl-1.5 pr-2 h-8">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-xs">
                      {user.name?.charAt(0)?.toUpperCase() || "D"}
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-xs font-medium leading-none">{user.name}</span>
                      <span className="text-[10px] text-muted-foreground leading-none mt-0.5">Dev</span>
                    </div>
                    <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="py-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="gap-2 text-xs py-1.5 cursor-pointer"
                    onClick={() => setShowProfileModal(true)}
                  >
                    <User className="h-3.5 w-3.5" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="gap-2 text-xs py-1.5 cursor-pointer"
                    onClick={() => setShowSettingsModal(true)}
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Configuracoes
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 text-xs py-1.5 text-red-600 cursor-pointer" onClick={handleLogout}>
                    <LogOut className="h-3.5 w-3.5" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center justify-center gap-1 pb-2 -mt-1">
            <Link href="/dev/board">
              <Button
                variant={activeView === "board" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1 h-7 text-xs px-2"
              >
                <Kanban className="h-3 w-3" />
                Board
              </Button>
            </Link>
            <Link href="/dev/tasks">
              <Button
                variant={activeView === "tasks" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1 h-7 text-xs px-2"
              >
                <ListTodo className="h-3 w-3" />
                Tarefas
              </Button>
            </Link>
            <Link href="/documentacao">
              <Button 
                variant={activeView === "docs" ? "secondary" : "ghost"} 
                size="sm" 
                className="gap-1 h-7 text-xs px-2"
              >
                <Code className="h-3 w-3" />
                Docs
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Meu Perfil
            </DialogTitle>
            <DialogDescription>
              Visualize e gerencie suas informacoes pessoais
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
                {user.name?.charAt(0)?.toUpperCase() || "D"}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-sm text-muted-foreground">Desenvolvedor</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Funcao</p>
                  <p className="text-sm font-medium">Desenvolvedor</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Timer Modal */}
      <Dialog open={showTimer} onOpenChange={setShowTimer}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Cronometro de Trabalho
            </DialogTitle>
            <DialogDescription>
              Registre o tempo gasto nas suas tarefas
            </DialogDescription>
          </DialogHeader>
          <WorkTimer 
            taskId={currentTask?.id || ""} 
            taskTitle={currentTask?.title || "Selecione uma tarefa"} 
            userId={user.id}
          />
        </DialogContent>
      </Dialog>

      {/* AI Assistant */}
      <DevAIAssistant 
        userId={user.id} 
        isOpen={showAIAssistant} 
        onClose={() => setShowAIAssistant(false)}
        currentTask={currentTask}
      />

      {/* Focus Mode */}
      <FocusMode 
        open={showFocusMode} 
        onOpenChange={setShowFocusMode}
        task={currentTask}
        onComplete={() => setShowFocusMode(false)}
      />

      {/* Activity History Modal */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historico de Atividades
            </DialogTitle>
            <DialogDescription>
              Veja todas as suas atividades recentes
            </DialogDescription>
          </DialogHeader>
          <ActivityHistory userId={user.id} />
        </DialogContent>
      </Dialog>

      {/* Gamification Modal */}
      <Dialog open={showGamification} onOpenChange={setShowGamification}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Conquistas e Ranking
            </DialogTitle>
            <DialogDescription>
              Acompanhe seu progresso e conquistas
            </DialogDescription>
          </DialogHeader>
          <GamificationPanel userId={user.id} />
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp 
        isOpen={showKeyboardHelp} 
        onClose={() => setShowKeyboardHelp(false)} 
      />

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuracoes
            </DialogTitle>
            <DialogDescription>
              Gerencie suas preferencias do sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Notificacoes</CardTitle>
                <CardDescription className="text-xs">Configure como deseja receber notificacoes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Novas tarefas</p>
                    <p className="text-xs text-muted-foreground">Receber ao ser atribuido</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Lembretes</p>
                    <p className="text-xs text-muted-foreground">Tarefas proximas do prazo</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Aparencia</CardTitle>
                <CardDescription className="text-xs">Personalize a interface do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Tema escuro</p>
                    <p className="text-xs text-muted-foreground">Usar tema escuro</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 rounded" />
                </div>
              </CardContent>
            </Card>

            <Button className="w-full gap-2" size="sm">
              <Save className="h-4 w-4" />
              Salvar Configuracoes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
