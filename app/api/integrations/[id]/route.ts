import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET /api/integrations/:id - Buscar integração específica
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("client_id").eq("id", user.id).single()

    if (!userData?.client_id) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    const { data: integration, error } = await supabase
      .from("integrations")
      .select(`
        *,
        provider:integration_providers(*)
      `)
      .eq("id", id)
      .eq("client_id", userData.client_id)
      .single()

    if (error || !integration) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    // Remover credenciais sensíveis
    const sanitizedIntegration = {
      ...integration,
      oauth_client_secret: integration.oauth_client_secret ? "***" : null,
      access_token: integration.access_token ? "***" : null,
      refresh_token: integration.refresh_token ? "***" : null,
    }

    return NextResponse.json({ integration: sanitizedIntegration })
  } catch (error) {
    console.error(" Error in GET /api/integrations/:id:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// PUT /api/integrations/:id - Atualizar integração
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("client_id").eq("id", user.id).single()

    if (!userData?.client_id) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      description,
      oauth_client_id,
      oauth_client_secret,
      access_token,
      refresh_token,
      base_url,
      organization,
      username,
      is_default,
      status,
    } = body

    // Preparar dados para atualização
    const updateData: any = {
      name,
      description,
      client_id_value: oauth_client_id,
      client_secret: oauth_client_secret,
      access_token,
      refresh_token,
      base_url,
      organization,
      status,
    }

    // Remover campos undefined
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    const { data: integration, error } = await supabase
      .from("integrations")
      .update(updateData)
      .eq("id", id)
      .eq("client_id", userData.client_id)
      .select(`
        *,
        provider:integration_providers(*)
      `)
      .single()

    if (error) {
      console.error(" Error updating integration:", error)
      return NextResponse.json({ error: "Erro ao atualizar integração" }, { status: 500 })
    }

    // Remover credenciais sensíveis
    const sanitizedIntegration = {
      ...integration,
      client_secret: integration.client_secret ? "***" : null,
      access_token: integration.access_token ? "***" : null,
      refresh_token: integration.refresh_token ? "***" : null,
    }

    return NextResponse.json({ integration: sanitizedIntegration })
  } catch (error) {
    console.error(" Error in PUT /api/integrations/:id:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// DELETE /api/integrations/:id - Deletar integração
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("client_id").eq("id", user.id).single()

    if (!userData?.client_id) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    const { error } = await supabase.from("integrations").delete().eq("id", id).eq("client_id", userData.client_id)

    if (error) {
      console.error(" Error deleting integration:", error)
      return NextResponse.json({ error: "Erro ao deletar integração" }, { status: 500 })
    }

    return NextResponse.json({ message: "Integração deletada com sucesso" })
  } catch (error) {
    console.error(" Error in DELETE /api/integrations/:id:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
