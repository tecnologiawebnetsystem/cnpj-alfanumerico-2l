import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Apenas Admin e Super Admin podem atribuir tarefas em massa
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await request.json()
    const { task_ids, assigned_to } = body

    if (!task_ids || !Array.isArray(task_ids) || task_ids.length === 0) {
      return NextResponse.json({ error: "task_ids deve ser um array não vazio" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Update all tasks at once
    const { data, error } = await supabase
      .from("tasks")
      .update({
        assigned_to: assigned_to,
        updated_at: new Date().toISOString(),
      })
      .in("id", task_ids)
      .eq("client_id", user.client_id)
      .select()

    if (error) {
      console.error(" Error bulk assigning tasks:", error)
      return NextResponse.json({ error: "Erro ao atribuir tarefas" }, { status: 500 })
    }

    console.log(" Bulk assigned", data?.length, "tasks to", assigned_to || "none")

    return NextResponse.json({ 
      success: true, 
      updated_count: data?.length || 0,
      message: `${data?.length || 0} tarefa(s) atribuída(s) com sucesso`
    })
  } catch (error: any) {
    console.error(" Error in POST /api/tasks/bulk-assign:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
