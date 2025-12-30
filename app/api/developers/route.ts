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

    const { data: developers, error } = await supabase
      .from("users")
      .select(
        `
        id,
        name,
        email,
        kanban_tasks!developer_id (
          id
        )
      `,
      )
      .eq("client_id", client_id)
      .eq("role", "dev")

    if (error) throw error

    const formattedDevelopers = developers?.map((dev: any) => ({
      id: dev.id,
      name: dev.name,
      email: dev.email,
      tasks_count: dev.kanban_tasks?.length || 0,
    }))

    return NextResponse.json(formattedDevelopers || [])
  } catch (error: any) {
    console.error("[API] Get developers error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
