import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    if (!user_id) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      // Se a tabela nao existe, retorna array vazio
      if (error.code === "42P01") {
        return NextResponse.json([])
      }
      throw error
    }

    return NextResponse.json(notifications || [])
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json([])
  }
}

// Mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { notification_id, user_id, mark_all } = body

    if (!user_id) {
      return NextResponse.json({ error: "user_id obrigatorio" }, { status: 400 })
    }

    const supabase = await createClient()

    if (mark_all) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user_id)
        .eq("read", false)
    } else if (notification_id) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notification_id)
        .eq("user_id", user_id)
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, type, title, message, task_id, data: notifData } = body

    if (!user_id || !type || !message) {
      return NextResponse.json(
        { error: "user_id, type, and message are required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id,
        type,
        title: title || null,
        message,
        data: notifData || null,
        read: false,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
