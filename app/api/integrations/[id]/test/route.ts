import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { Octokit } from "@octokit/rest"

// POST /api/integrations/:id/test - Testar conexão da integração
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now()

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

    // Buscar integração com credenciais
    const { data: integration, error: integrationError } = await supabase
      .from("integrations")
      .select(`
        *,
        provider:integration_providers(*)
      `)
      .eq("id", id)
      .eq("client_id", userData.client_id)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    // Testar conexão baseado no provedor
    let testResult: { success: boolean; message: string; error?: string }

    if (integration.provider.name === "github") {
      testResult = await testGitHubConnection(integration)
    } else if (integration.provider.name === "gitlab") {
      testResult = { success: false, message: "GitLab em desenvolvimento" }
    } else if (integration.provider.name === "azure_devops") {
      testResult = { success: false, message: "Azure DevOps em desenvolvimento" }
    } else {
      testResult = { success: false, message: "Provedor não suportado" }
    }

    const responseTime = Date.now() - startTime

    // Registrar log de teste
    await supabase.from("integration_test_logs").insert({
      integration_id: id,
      tested_by: user.id,
      status: testResult.success ? "success" : "error",
      response_time: responseTime,
      error_message: testResult.error || null,
    })

    // Atualizar status da integração
    await supabase
      .from("integrations")
      .update({
        last_tested_at: new Date().toISOString(),
        last_error: testResult.error || null,
        error_count: testResult.success ? 0 : integration.error_count + 1,
        status: testResult.success ? "active" : "error",
      })
      .eq("id", id)

    return NextResponse.json({
      success: testResult.success,
      message: testResult.message,
      response_time: responseTime,
    })
  } catch (error) {
    console.error(" Error in POST /api/integrations/:id/test:", error)

    const responseTime = Date.now() - startTime

    return NextResponse.json(
      {
        success: false,
        message: "Erro ao testar conexão",
        error: error instanceof Error ? error.message : "Erro desconhecido",
        response_time: responseTime,
      },
      { status: 500 },
    )
  }
}

// Função auxiliar para testar conexão GitHub
async function testGitHubConnection(integration: any): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Note: For now, we'll try to use the token directly since it's encrypted in DB
    // In production, you should call the PostgreSQL function get_integration_with_decrypted_credentials

    if (!integration.access_token) {
      return {
        success: false,
        message: "Token de acesso não configurado",
        error: "Missing access token",
      }
    }

    // Criar cliente Octokit
    const octokit = new Octokit({
      auth: integration.access_token,
    })

    // Testar autenticação
    const { data: user } = await octokit.rest.users.getAuthenticated()

    return {
      success: true,
      message: `Conexão bem-sucedida! Autenticado como ${user.login}`,
    }
  } catch (error: any) {
    console.error(" GitHub connection test failed:", error)
    return {
      success: false,
      message: "Falha ao conectar com GitHub",
      error: error.message || "Unknown error",
    }
  }
}
