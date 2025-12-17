import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"
import { markNotificationAsRead } from "@/lib/utils/notifications"

// PUT /api/notifications/[id] - Mark notification as read
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const notificationId = params.id
    await markNotificationAsRead(notificationId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error marking notification as read:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from("notifications").delete().eq("id", params.id).eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting notification:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
