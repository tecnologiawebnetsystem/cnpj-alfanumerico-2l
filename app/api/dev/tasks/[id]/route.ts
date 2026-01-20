import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleUpdate(request, params)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleUpdate(request, params)
}

async function handleUpdate(request: NextRequest, params: Promise<{ id: string }>) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = await createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {},
          remove() {},
        },
      },
    )

    const body = await request.json()

    const { data: currentTask } = await supabase.from("tasks").select("*").eq("id", id).single()

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (body.status) {
      updateData.status = body.status
    }

    // Hours tracking fields
    if (body.estimated_hours !== undefined) {
      updateData.estimated_hours = body.estimated_hours
    }
    if (body.remaining_hours !== undefined) {
      updateData.remaining_hours = body.remaining_hours
    }
    if (body.completed_hours !== undefined) {
      updateData.completed_hours = body.completed_hours
    }

    if (body.status === "completed") {
      updateData.completed_at = body.completed_at || new Date().toISOString()

      if (body.commit_hash) {
        updateData.commit_hash = body.commit_hash
      }

      if (body.pr_number) {
        updateData.pr_number = body.pr_number
      }

      // Get user ID from cookie
      const userCookie = cookieStore.get("user")
      if (userCookie) {
        const user = JSON.parse(userCookie.value)
        updateData.completed_by = user.id
      }
    }

    const { data, error } = await supabase.from("tasks").update(updateData).eq("id", id).select().single()

    if (error) throw error

    if (currentTask && currentTask.status !== body.status) {
      const userCookie = cookieStore.get("user")
      let userId = null
      if (userCookie) {
        const user = JSON.parse(userCookie.value)
        userId = user.id
      }

      await supabase.from("task_history").insert({
        task_id: id,
        user_id: userId,
        action: "status_change",
        old_value: currentTask.status,
        new_value: body.status,
        comment: `Status alterado de ${currentTask.status} para ${body.status} via drag-and-drop`,
      })

      console.log(" Task history logged for status change:", currentTask.status, "->", body.status)
    }

    console.log(" Task updated successfully:", id, "New status:", body.status)
    return NextResponse.json(data)
  } catch (error) {
    console.error(" Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}
