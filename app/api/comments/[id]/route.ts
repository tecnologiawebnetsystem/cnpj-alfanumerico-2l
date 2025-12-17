import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"

// PUT /api/comments/[id] - Update comment
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    const supabase = await createClient()

    const { data: comment, error } = await supabase
      .from("comments")
      .update({
        content,
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ comment })
  } catch (error: any) {
    console.error("[v0] Error updating comment:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/comments/[id] - Delete comment
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from("comments")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting comment:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
