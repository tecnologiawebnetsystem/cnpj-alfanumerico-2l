import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get client
    const { data: client } = await supabase.from("clients").select("id").eq("user_id", user.id).single()

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Get all repository assignments with developer info
    const { data: assignments, error } = await supabase
      .from("repository_assignments")
      .select(`
        *,
        assigned_developer:users!repository_assignments_assigned_developer_id_fkey(id, name, email),
        assigned_by_user:users!repository_assignments_assigned_by_fkey(name)
      `)
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ assignments })
  } catch (error: any) {
    console.error("Error fetching repository assignments:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: client } = await supabase.from("clients").select("id").eq("user_id", user.id).single()

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const body = await request.json()
    const { repository_url, repository_name, repository_type, assigned_developer_id, notes } = body

    const { data: assignment, error } = await supabase
      .from("repository_assignments")
      .insert({
        client_id: client.id,
        repository_url,
        repository_name,
        repository_type,
        assigned_developer_id,
        assigned_at: assigned_developer_id ? new Date().toISOString() : null,
        assigned_by: user.id,
        status: assigned_developer_id ? "assigned" : "pending",
        notes,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ assignment })
  } catch (error: any) {
    console.error("Error creating repository assignment:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
