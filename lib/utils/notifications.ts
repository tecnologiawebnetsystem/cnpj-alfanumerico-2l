import { createClient } from "@/lib/supabase/server"
import type { Notification, NotificationType, NotificationPriority } from "@/lib/types"

export async function createNotification({
  userId,
  clientId,
  type,
  title,
  message,
  link,
  priority = "normal",
  category,
  metadata,
  expiresAt,
}: {
  userId: string
  clientId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  priority?: NotificationPriority
  category?: string
  metadata?: Record<string, any>
  expiresAt?: Date
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      client_id: clientId,
      type,
      title,
      message,
      link,
      priority,
      category,
      metadata,
      expires_at: expiresAt?.toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error(" Error creating notification:", error)
    throw error
  }

  return data as Notification
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("notifications")
    .update({
      read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", notificationId)

  if (error) {
    console.error(" Error marking notification as read:", error)
    throw error
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("notifications")
    .update({
      read: true,
      read_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("read", false)

  if (error) {
    console.error(" Error marking all notifications as read:", error)
    throw error
  }
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false)

  if (error) {
    console.error(" Error getting unread notifications count:", error)
    return 0
  }

  return count || 0
}
