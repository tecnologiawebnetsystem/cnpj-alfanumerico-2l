import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, priority, assigned_to, status } = body

    const supabase = await createClient()

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (priority !== undefined) updateData.priority = priority
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to
    if (status !== undefined) updateData.status = status

    const { data: task, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", params.id)
      .eq("client_id", user.client_id)
      .select()
      .single()

    if (error) throw error

    await supabase.from("task_history").insert({
      task_id: params.id,
      user_id: user.id,
      action: "updated",
      new_value: JSON.stringify(updateData),
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error(" Error updating task:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    const supabase = await createClient()

    // Atualizar tarefa
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    // Se mudou para "in_progress", registrar started_at
    if (status === "in_progress") {
      updateData.started_at = new Date().toISOString()
    }

    // Se mudou para "completed", registrar completed_at
    if (status === "completed") {
      updateData.completed_at = new Date().toISOString()
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", params.id)
      .eq("client_id", user.client_id)
      .select()
      .single()

    if (error) throw error

    // Registrar no histórico
    await supabase.from("task_history").insert({
      task_id: params.id,
      user_id: user.id,
      action: "status_changed",
      new_value: status,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error(" Error updating task:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Apenas Admin e Super Admin podem deletar tarefas
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from("tasks").delete().eq("id", params.id).eq("client_id", user.client_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(" Error deleting task:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
