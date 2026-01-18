import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const client_id = searchParams.get("client_id")

    if (!client_id) {
      return NextResponse.json({ success: false, error: "client_id é obrigatório" }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar desenvolvedores
    const { data: developers, error } = await supabase
      .from("users")
      .select("id, name, email, status")
      .eq("client_id", client_id)
      .ilike("role", "%dev%")

    if (error) throw error

    // Buscar contagem de tarefas separadamente
    const devIds = developers?.map((d: any) => d.id) || []
    let tasksCounts = new Map<string, number>()

    if (devIds.length > 0) {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("assigned_to")
        .in("assigned_to", devIds)

      if (tasks) {
        tasks.forEach((task: any) => {
          const count = tasksCounts.get(task.assigned_to) || 0
          tasksCounts.set(task.assigned_to, count + 1)
        })
      }
    }

    const formattedDevelopers = developers?.map((dev: any) => ({
      id: dev.id,
      name: dev.name,
      email: dev.email,
      status: dev.status,
      tasks_count: tasksCounts.get(dev.id) || 0,
    }))

    return NextResponse.json(formattedDevelopers || [])
  } catch (error: any) {
    console.error("[API] Get developers error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
