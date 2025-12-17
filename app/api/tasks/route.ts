import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "all"

    const supabase = await createServerClient()

    let query = supabase
      .from("tasks")
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_fkey(name)
      `)
      .eq("client_id", user.client_id)

    // Se for DEV, mostrar apenas tarefas atribuídas a ele
    if (user.role === "dev") {
      query = query.eq("assigned_to", user.id)
    }

    // Aplicar filtro de status
    if (filter !== "all") {
      query = query.eq("status", filter)
    }

    query = query.order("created_at", { ascending: false })

    const { data: tasks, error } = await query

    if (error) throw error

    // Formatar dados
    const formattedTasks = tasks?.map((task: any) => ({
      ...task,
      assigned_to_name: task.assigned_to_user?.name || null,
    }))

    return NextResponse.json({ tasks: formattedTasks })
  } catch (error: any) {
    console.error("[v0] Error fetching tasks:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Apenas Admin e Super Admin podem criar tarefas
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      file_path,
      line_number,
      field_name,
      table_name,
      change_type,
      priority,
      estimated_hours,
      deadline,
      assigned_to,
      repository_id,
      analysis_id,
    } = body

    if (!title || !description) {
      return NextResponse.json({ error: "Campos obrigatórios: title, description" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        client_id: user.client_id,
        title,
        description,
        file_path,
        line_number,
        field_name,
        table_name,
        change_type,
        priority: priority || "medium",
        status: "pending",
        estimated_hours,
        deadline,
        assigned_to,
        repository_id,
        analysis_id,
        created_by: user.id,
      })
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_fkey(name)
      `)
      .single()

    if (error) {
      console.error("[v0] Error creating task:", error)
      return NextResponse.json({ error: "Erro ao criar tarefa" }, { status: 500 })
    }

    return NextResponse.json({ task }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error in POST /api/tasks:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
