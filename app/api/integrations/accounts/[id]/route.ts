import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"

// GET - Get specific integration account
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.client_id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const supabase = await createServerClient()

    const { data: integration, error } = await supabase
      .from("integrations")
      .select(`
        *,
        integration_providers (
          display_name,
          name,
          icon_name
        )
      `)
      .eq("id", params.id)
      .eq("client_id", user.client_id)
      .single()

    if (error) {
      console.error(" Error fetching integration:", error)
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ integration })
  } catch (error) {
    console.error(" Error in GET /api/integrations/accounts/[id]:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// PUT - Update integration account
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.client_id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, organization, project, access_token, base_url, status } = body

    const supabase = await createServerClient()

    // Build update object (only include fields that were provided)
    const updateData: any = { updated_at: new Date().toISOString() }
    if (name !== undefined) updateData.name = name
    if (organization !== undefined) updateData.organization = organization
    if (project !== undefined) updateData.project = project
    if (access_token !== undefined) updateData.access_token = access_token
    if (base_url !== undefined) updateData.base_url = base_url
    if (status !== undefined) updateData.status = status

    const { data: integration, error } = await supabase
      .from("integrations")
      .update(updateData)
      .eq("id", params.id)
      .eq("client_id", user.client_id)
      .select()
      .single()

    if (error) {
      console.error(" Error updating integration:", error)
      return NextResponse.json({ error: "Erro ao atualizar conta" }, { status: 500 })
    }

    return NextResponse.json({ integration })
  } catch (error) {
    console.error(" Error in PUT /api/integrations/accounts/[id]:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// DELETE - Delete integration account
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.client_id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const supabase = await createServerClient()

    // Check if integration is being used by any repositories
    const { data: repos, error: reposError } = await supabase
      .from("repositories")
      .select("id")
      .eq("integration_id", params.id)
      .limit(1)

    if (reposError) {
      console.error(" Error checking repositories:", reposError)
    }

    if (repos && repos.length > 0) {
      return NextResponse.json({ error: "Não é possível excluir conta em uso por repositórios" }, { status: 400 })
    }

    const { error } = await supabase.from("integrations").delete().eq("id", params.id).eq("client_id", user.client_id)

    if (error) {
      console.error(" Error deleting integration:", error)
      return NextResponse.json({ error: "Erro ao excluir conta" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(" Error in DELETE /api/integrations/accounts/[id]:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
