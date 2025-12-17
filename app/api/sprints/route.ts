import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Criar sprint
    const { data: sprint, error } = await supabase
      .from("sprints")
      .insert({
        ...body,
        created_by: user.id,
        status: "planning",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(sprint)
  } catch (error) {
    console.error("Error creating sprint:", error)
    return NextResponse.json({ error: "Failed to create sprint" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("client_id")

    if (!clientId) {
      return NextResponse.json({ error: "Client ID required" }, { status: 400 })
    }

    const { data: sprints, error } = await supabase
      .from("sprints")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(sprints)
  } catch (error) {
    console.error("Error fetching sprints:", error)
    return NextResponse.json({ error: "Failed to fetch sprints" }, { status: 500 })
  }
}
