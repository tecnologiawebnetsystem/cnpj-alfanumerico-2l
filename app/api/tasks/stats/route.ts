import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-actions"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const supabase = await createClient()

    let query = supabase.from("tasks").select("status").eq("client_id", user.client_id)

    // Se for DEV, contar apenas suas tarefas
    if (user.role === "dev") {
      query = query.eq("assigned_to", user.id)
    }

    const { data: tasks, error } = await query

    if (error) throw error

    // Calcular estatísticas
    const stats = {
      total: tasks?.length || 0,
      pending: tasks?.filter((t) => t.status === "pending").length || 0,
      in_progress: tasks?.filter((t) => t.status === "in_progress").length || 0,
      awaiting_qa: tasks?.filter((t) => t.status === "awaiting_qa").length || 0,
      completed: tasks?.filter((t) => t.status === "completed").length || 0,
      blocked: tasks?.filter((t) => t.status === "blocked").length || 0,
    }

    return NextResponse.json({ stats })
  } catch (error: any) {
    console.error("[v0] Error fetching task stats:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
