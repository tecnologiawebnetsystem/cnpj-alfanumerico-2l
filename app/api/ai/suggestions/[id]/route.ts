import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"

// PUT /api/ai/suggestions/[id] - Update suggestion status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { status, feedback } = body

    const supabase = await createClient()

    const updateData: any = {
      status,
      feedback,
    }

    if (status === "accepted") {
      updateData.applied_by = user.id
      updateData.applied_at = new Date().toISOString()
    }

    const { data: suggestion, error } = await supabase
      .from("ai_suggestions")
      .update(updateData)
      .eq("id", params.id)
      .eq("client_id", user.client_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ suggestion })
  } catch (error: any) {
    console.error("[v0] Error updating AI suggestion:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
