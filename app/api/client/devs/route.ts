import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase/api-client"

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return `$sha256$${hashHex}`
}

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] === GET /api/client/devs START ===")
    const { searchParams } = new URL(request.url)
    const client_id = searchParams.get("client_id")

    console.log("[v0] client_id:", client_id)

    if (!client_id) {
      return NextResponse.json({ error: "client_id is required" }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()

    console.log("[v0] Querying users table for devs...")
    const { data: devs, error } = await supabase
      .from("users")
      .select("id, name, email, status, created_at")
      .eq("client_id", client_id)
      .eq("role", "dev")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching devs:", error)
      throw error
    }

    console.log("[v0] Found", devs?.length || 0, "developers")

    const devsWithCounts = await Promise.all(
      (devs || []).map(async (dev) => {
        const { count: totalTasks } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("assigned_to", dev.id)

        const { count: completedTasks } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("assigned_to", dev.id)
          .eq("status", "completed")

        return {
          ...dev,
          tasks_count: totalTasks || 0,
          completed_tasks: completedTasks || 0,
        }
      }),
    )

    console.log("[v0] Developers with task counts:", devsWithCounts.length)
    console.log("[v0] === GET /api/client/devs END ===")

    return NextResponse.json(devsWithCounts)
  } catch (error) {
    console.error("[v0] CRITICAL Error fetching devs:", error)
    return NextResponse.json({ error: "Failed to fetch devs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] === POST /api/client/devs START ===")

    const supabase = createSupabaseServiceClient()
    const body = await request.json()

    console.log("[v0] Creating new dev:", body.email)

    const passwordHash = await hashPassword(body.password)

    const { data, error } = await supabase
      .from("users")
      .insert({
        email: body.email,
        password_hash: passwordHash,
        name: body.name,
        role: "dev",
        client_id: body.client_id,
        status: body.status,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating dev:", error)
      throw error
    }

    console.log("[v0] Dev created successfully:", data.id)
    console.log("[v0] === POST /api/client/devs END ===")

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] CRITICAL Error creating dev:", error)
    return NextResponse.json({ error: "Failed to create dev" }, { status: 500 })
  }
}
