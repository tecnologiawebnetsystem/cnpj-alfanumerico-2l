import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"
import { createNotification, markAllNotificationsAsRead } from "@/lib/utils/notifications"

// GET /api/notifications - Get all notifications for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unread") === "true"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (unreadOnly) {
      query = query.eq("read", false)
    }

    const { data: notifications, error } = await query

    if (error) throw error

    // Get unread count
    const { count: unreadCount } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false)

    return NextResponse.json({
      notifications,
      unread_count: unreadCount || 0,
    })
  } catch (error: any) {
    console.error("[v0] Error fetching notifications:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/notifications - Create notification (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { user_id, type, title, message, link, priority, category, metadata, expires_at } = body

    const notification = await createNotification({
      userId: user_id,
      clientId: user.client_id,
      type,
      title,
      message,
      link,
      priority,
      category,
      metadata,
      expiresAt: expires_at ? new Date(expires_at) : undefined,
    })

    return NextResponse.json({ notification })
  } catch (error: any) {
    console.error("[v0] Error creating notification:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/notifications - Mark all as read
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await markAllNotificationsAsRead(user.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error marking notifications as read:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
