"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import { logout } from "@/lib/auth"

interface DevHeaderProps {
  user: {
    id: string
    name: string
    email: string
  }
  activeView?: "board" | "tasks"
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

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
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
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-14">
          {/* Left - Logo and Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/dev/board" className="flex items-center gap-2">
              <Image
                src="/images/act-logo-square.jfif"
                alt="ACT Digital"
                width={32}
                height={32}
                className="rounded-md"
              />
              <span className="font-semibold text-sm text-foreground hidden sm:block">
                CNPJ Detector
              </span>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/dev/board">
                <Button
                  variant={activeView === "board" ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                >
                  <Kanban className="h-3.5 w-3.5" />
                  Board Kanban
                </Button>
              </Link>
              <Link href="/dev/tasks">
                <Button
                  variant={activeView === "tasks" ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                >
                  <ListTodo className="h-3.5 w-3.5" />
                  Lista de Tarefas
                </Button>
              </Link>
              <Link href="/documentacao">
                <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
                  <Code className="h-3.5 w-3.5" />
                  Documentacao
                </Button>
              </Link>
            </nav>
          </div>

          {/* Right - Notifications and Profile */}
          <div className="flex items-center gap-1">
            {/* Notifications Dropdown */}
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
                      <Bell className="h-5 w-5 text-muted-foreground" />
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
                        {!notification.read && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1.5 pl-1.5 pr-2 h-8">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-medium text-xs">
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
                <DropdownMenuItem className="gap-2 text-xs py-1.5">
                  <User className="h-3.5 w-3.5" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs py-1.5">
                  <Settings className="h-3.5 w-3.5" />
                  Configuracoes
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-xs py-1.5 text-red-600" onClick={handleLogout}>
                  <LogOut className="h-3.5 w-3.5" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1 pb-2 -mt-1 overflow-x-auto">
          <Link href="/dev/board">
            <Button
              variant={activeView === "board" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5 whitespace-nowrap h-7 text-xs"
            >
              <Kanban className="h-3.5 w-3.5" />
              Board
            </Button>
          </Link>
          <Link href="/dev/tasks">
            <Button
              variant={activeView === "tasks" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5 whitespace-nowrap h-7 text-xs"
            >
              <ListTodo className="h-3.5 w-3.5" />
              Tarefas
            </Button>
          </Link>
          <Link href="/documentacao">
            <Button variant="ghost" size="sm" className="gap-1.5 whitespace-nowrap h-7 text-xs">
              <Code className="h-3.5 w-3.5" />
              Docs
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
