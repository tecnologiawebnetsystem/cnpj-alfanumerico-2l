"use client"

import { useState, useEffect } from "react"
import { Bell, Check, CheckCheck, Trash2, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Notification } from "@/lib/types"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  async function fetchNotifications() {
    try {
      setLoading(true)
      const url = filter === "unread" ? "/api/notifications?unread=true&limit=100" : "/api/notifications?limit=100"
      const response = await fetch(url)
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error(" Error fetching notifications:", error)
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
    } catch (error) {
      console.error(" Error marking notification as read:", error)
    }
  }

  async function markAllAsRead() {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, read_at: new Date().toISOString() })))
    } catch (error) {
      console.error(" Error marking all as read:", error)
    }
  }

  async function deleteNotification(notificationId: string) {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      })
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (error) {
      console.error(" Error deleting notification:", error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}` : "Todas lidas"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="unread">Não lidas</SelectItem>
            </SelectContent>
          </Select>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando notificações...</p>
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
          <p className="text-muted-foreground">
            {filter === "unread" ? "Você não tem notificações não lidas" : "Você não tem notificações"}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "p-4 hover:shadow-md transition-all cursor-pointer group",
                !notification.read && "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20",
              )}
              onClick={() => {
                if (!notification.read) {
                  markAsRead(notification.id)
                }
                if (notification.link) {
                  window.location.href = notification.link
                }
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "mt-1",
                    notification.priority === "urgent" && "text-red-500",
                    notification.priority === "high" && "text-orange-500",
                    notification.priority === "normal" && "text-blue-500",
                    notification.priority === "low" && "text-gray-500",
                  )}
                >
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{notification.title}</h3>
                      {notification.category && (
                        <Badge variant="secondary" className="mt-1">
                          {notification.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-2">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notification.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
