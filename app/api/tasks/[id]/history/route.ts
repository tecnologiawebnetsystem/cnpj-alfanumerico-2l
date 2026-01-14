import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"

// GET /api/tasks/[id]/history - Buscar histórico de uma tarefa
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: history, error } = await supabase
      .from("task_history")
      .select(`
        *,
        user:users(name, email)
      `)
      .eq("task_id", params.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ history })
  } catch (error: any) {
    console.error(" Error fetching task history:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
