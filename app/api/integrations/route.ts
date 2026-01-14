import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET /api/integrations - Listar integrações do cliente
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar usuário e client_id
    const { data: userData } = await supabase.from("users").select("client_id").eq("id", user.id).single()

    if (!userData?.client_id) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    // Buscar integrações com informações do provedor
    const { data: integrations, error } = await supabase
      .from("integrations")
      .select(`
        *,
        provider:integration_providers(*)
      `)
      .eq("client_id", userData.client_id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(" Error fetching integrations:", error)
      return NextResponse.json({ error: "Erro ao buscar integrações" }, { status: 500 })
    }

    // Remover credenciais sensíveis da resposta
    const sanitizedIntegrations = integrations?.map((integration) => ({
      ...integration,
      oauth_client_secret: integration.oauth_client_secret ? "***" : null,
      access_token: integration.access_token ? "***" : null,
      refresh_token: integration.refresh_token ? "***" : null,
    }))

    return NextResponse.json({ integrations: sanitizedIntegrations })
  } catch (error) {
    console.error(" Error in GET /api/integrations:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// POST /api/integrations - Criar nova integração
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar usuário e client_id
    const { data: userData } = await supabase.from("users").select("client_id").eq("id", user.id).single()

    if (!userData?.client_id) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    const body = await request.json()
    const {
      provider_id,
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
    } = body

    // Validações
    if (!provider_id || !name) {
      return NextResponse.json({ error: "Campos obrigatórios: provider_id, name" }, { status: 400 })
    }

    // Criar integração
    const { data: integration, error } = await supabase
      .from("integrations")
      .insert({
        client_id: userData.client_id,
        user_id: user.id,
        provider_id,
        name,
        description,
        client_id_value: oauth_client_id,
        client_secret: oauth_client_secret,
        access_token,
        refresh_token,
        base_url,
        organization,
        status: "active",
      })
      .select(`
        *,
        provider:integration_providers(*)
      `)
      .single()

    if (error) {
      console.error(" Error creating integration:", error)
      return NextResponse.json({ error: "Erro ao criar integração" }, { status: 500 })
    }

    // Remover credenciais sensíveis da resposta
    const sanitizedIntegration = {
      ...integration,
      client_secret: integration.client_secret ? "***" : null,
      access_token: integration.access_token ? "***" : null,
      refresh_token: integration.refresh_token ? "***" : null,
    }

    return NextResponse.json({ integration: sanitizedIntegration }, { status: 201 })
  } catch (error) {
    console.error(" Error in POST /api/integrations:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
