import { type NextRequest, NextResponse } from "next/server"
import { db as supabase } from "@/lib/db/sqlserver"

export async function PUT(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 })
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, role, client_id")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { data: task, error: updateError } = await supabase
      .from("tasks")
      .update({
        title: body.title,
        description: body.description,
        priority: body.priority,
        assigned_to: body.assigned_to === "none" ? null : body.assigned_to,
        status: body.status,
      })
      .eq("id", params.taskId)
      .eq("client_id", (user as any).client_id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
    }

    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
