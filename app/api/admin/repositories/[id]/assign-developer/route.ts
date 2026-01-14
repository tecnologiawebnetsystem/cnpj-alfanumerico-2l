import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: repositoryId } = params
    const body = await request.json()
    const { developer_id, notes, user_id } = body

    if (!developer_id) {
      return NextResponse.json({ error: "developer_id is required" }, { status: 400 })
    }

    if (!user_id) {
      return NextResponse.json({ error: "user_id is required" }, { status: 401 })
    }

    const supabase = await createServerClient()

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, role, client_id")
      .eq("id", user_id)
      .single()

    if (userError || !user || (user.role !== "admin" && user.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { data: repository, error: repoError } = await supabase
      .from("repositories")
      .select("id, name, client_id")
      .eq("id", repositoryId)
      .single()

    if (repoError || !repository) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    const { data: developer, error: devError } = await supabase
      .from("users")
      .select("id, name, email, role, client_id")
      .eq("id", developer_id)
      .eq("role", "dev")
      .single()

    if (devError || !developer) {
      return NextResponse.json({ error: "Developer not found" }, { status: 404 })
    }

    if (developer.client_id !== user.client_id) {
      return NextResponse.json({ error: "Developer does not belong to your client" }, { status: 403 })
    }

    const { data: existingAssignment } = await supabase
      .from("repository_developer_assignments")
      .select("id")
      .eq("repository_id", repositoryId)
      .eq("developer_id", developer_id)
      .single()

    let assignmentId: string

    if (existingAssignment) {
      // Atualizar existente
      const { data, error } = await supabase
        .from("repository_developer_assignments")
        .update({
          status: "active",
          assigned_by: user_id,
          assigned_at: new Date().toISOString(),
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingAssignment.id)
        .select()
        .single()

      if (error) throw error
      assignmentId = data.id
    } else {
      // Criar novo
      const { data, error } = await supabase
        .from("repository_developer_assignments")
        .insert({
          repository_id: repositoryId,
          developer_id,
          client_id: user.client_id,
          assigned_by: user_id,
          notes,
          status: "active",
        })
        .select()
        .single()

      if (error) throw error
      assignmentId = data.id
    }

    return NextResponse.json({
      success: true,
      assignment_id: assignmentId,
      developer_name: developer.name,
      repository_name: repository.name,
      message: `${developer.name} atribuído ao repositório ${repository.name}`,
    })
  } catch (error: any) {
    console.error(" Error assigning developer to repository:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: repositoryId } = params
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    if (!user_id) {
      return NextResponse.json({ error: "user_id is required" }, { status: 401 })
    }

    const supabase = await createServerClient()

    const { data: assignments, error } = await supabase
      .from("repository_developer_assignments")
      .select(
        `
        *,
        developer:users!developer_id (id, name, email),
        repository:repositories (id, name, full_name)
      `,
      )
      .eq("repository_id", repositoryId)
      .eq("status", "active")
      .order("assigned_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(assignments || [])
  } catch (error: any) {
    console.error(" Error fetching repository assignments:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: repositoryId } = params
    const { searchParams } = new URL(request.url)
    const developer_id = searchParams.get("developer_id")
    const user_id = searchParams.get("user_id")

    if (!developer_id || !user_id) {
      return NextResponse.json({ error: "developer_id and user_id are required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { error } = await supabase
      .from("repository_developer_assignments")
      .update({
        status: "archived",
        updated_at: new Date().toISOString(),
      })
      .eq("repository_id", repositoryId)
      .eq("developer_id", developer_id)

    if (error) throw error

    return NextResponse.json({ success: true, message: "Assignment archived successfully" })
  } catch (error: any) {
    console.error(" Error archiving repository assignment:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
