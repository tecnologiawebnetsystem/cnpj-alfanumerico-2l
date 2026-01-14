import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"

// GET - List all integration accounts for client
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.client_id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const supabase = await createServerClient()

    const { data: integrations, error } = await supabase
      .from("integrations")
      .select(`
        *,
        integration_providers (
          display_name,
          name,
          icon_name
        )
      `)
      .eq("client_id", user.client_id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(" Error fetching integrations:", error)
      return NextResponse.json({ error: "Erro ao buscar contas" }, { status: 500 })
    }

    return NextResponse.json({ integrations })
  } catch (error) {
    console.error(" Error in GET /api/integrations/accounts:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// POST - Create new integration account
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.client_id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, provider_name, organization, project, access_token, base_url } = body

    if (!name || !provider_name || !access_token) {
      return NextResponse.json({ error: "Nome, provedor e token são obrigatórios" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Get provider_id from provider name
    const { data: provider, error: providerError } = await supabase
      .from("integration_providers")
      .select("id")
      .eq("name", provider_name)
      .single()

    if (providerError || !provider) {
      return NextResponse.json({ error: "Provedor não encontrado" }, { status: 404 })
    }

    // Create integration
    const { data: integration, error } = await supabase
      .from("integrations")
      .insert({
        client_id: user.client_id,
        user_id: user.id,
        provider_id: provider.id,
        name,
        organization,
        project,
        access_token,
        base_url,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error(" Error creating integration:", error)
      return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 })
    }

    return NextResponse.json({ integration }, { status: 201 })
  } catch (error) {
    console.error(" Error in POST /api/integrations/accounts:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
