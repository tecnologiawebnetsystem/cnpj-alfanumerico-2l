"use client"

import { useState, useEffect } from "react"
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Notification } from "@/lib/types"

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchNotifications() {
    try {
      const response = await fetch("/api/notifications?limit=20")
      if (!response.ok) {
        setNotifications([])
        setUnreadCount(0)
        return
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        setNotifications([])
        setUnreadCount(0)
        return
      }

      const data = await response.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unread_count || 0)
    } catch (error) {
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n)),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {}
  }

  async function markAllAsRead() {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, read_at: new Date().toISOString() })))
      setUnreadCount(0)
    } catch (error) {}
  }

  async function deleteNotification(notificationId: string) {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      })
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      if (!notifications.find((n) => n.id === notificationId)?.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {}
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "urgent":
        return "text-red-500"
      case "high":
        return "text-orange-500"
      case "normal":
        return "text-blue-500"
      case "low":
        return "text-gray-500"
      default:
        return "text-gray-500"
    }
  }

  function getTimeAgo(date: string) {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000)

    if (diffInSeconds < 60) return "agora"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`
    return `${Math.floor(diffInSeconds / 86400)}d atrás`
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs">
              <CheckCheck className="h-4 w-4 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-colors cursor-pointer group",
                    !notification.read && "bg-blue-50/50 dark:bg-blue-950/20",
                  )}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id)
                    }
                    if (notification.link) {
                      window.location.href = notification.link
                      setOpen(false)
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-1", getPriorityColor(notification.priority))}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{getTimeAgo(notification.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                window.location.href = "/dashboard/notifications"
                setOpen(false)
              }}
            >
              Ver todas as notificações
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
