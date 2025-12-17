import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"
import { createNotification } from "@/lib/utils/notifications"
import { updateUserStats } from "@/lib/utils/gamification"

// GET /api/comments - Get comments for entity
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get("entity_type")
    const entityId = searchParams.get("entity_id")

    if (!entityType || !entityId) {
      return NextResponse.json({ error: "entity_type e entity_id são obrigatórios" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: comments, error } = await supabase
      .from("comments")
      .select(`
        *,
        user:users!comments_user_id_fkey (
          id,
          name,
          email,
          role
        )
      `)
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true })

    if (error) throw error

    return NextResponse.json({ comments })
  } catch (error: any) {
    console.error("[v0] Error fetching comments:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/comments - Create comment
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { entity_type, entity_id, content, parent_comment_id, mentions } = body

    if (!entity_type || !entity_id || !content) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        user_id: user.id,
        client_id: user.client_id,
        entity_type,
        entity_id,
        parent_comment_id,
        content,
        mentions,
      })
      .select(`
        *,
        user:users!comments_user_id_fkey (
          id,
          name,
          email,
          role
        )
      `)
      .single()

    if (error) throw error

    // Update user stats
    await updateUserStats(user.id, { comments_made: 1 })

    // Send notifications to mentioned users
    if (mentions && mentions.length > 0) {
      for (const mentionedUserId of mentions) {
        await createNotification({
          userId: mentionedUserId,
          clientId: user.client_id,
          type: "comment_mention",
          title: "Você foi mencionado",
          message: `${user.name} mencionou você em um comentário`,
          link: `/dashboard?entity=${entity_type}&id=${entity_id}`,
          priority: "normal",
          category: "comment",
        })
      }
    }

    return NextResponse.json({ comment })
  } catch (error: any) {
    console.error("[v0] Error creating comment:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
