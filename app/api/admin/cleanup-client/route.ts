import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Get user role
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userError || userData?.role !== "super_admin") {
      return NextResponse.json({ error: "Acesso negado. Apenas Super Admin pode executar esta ação." }, { status: 403 })
    }

    const { client_id } = await request.json()

    if (!client_id) {
      return NextResponse.json({ error: "client_id é obrigatório" }, { status: 400 })
    }

    // Get client name for logging
    const { data: client } = await supabase.from("clients").select("name").eq("id", client_id).single()

    console.log(`[v0] Starting cleanup for client: ${client?.name} (${client_id})`)

    const { data: cleanupResult, error: cleanupError } = await supabase.rpc("cleanup_client_data", {
      p_client_id: client_id,
    })

    if (cleanupError) {
      console.error("[v0] Cleanup error:", cleanupError)
      return NextResponse.json({ error: "Erro ao limpar dados do cliente", details: cleanupError }, { status: 500 })
    }

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "cleanup_client",
      entity_type: "client",
      entity_id: client_id,
      entity_name: client?.name || "Unknown",
      metadata: {
        ...cleanupResult,
        performed_by: user.email,
      },
    })

    console.log(`[v0] Cleanup completed successfully:`, cleanupResult)

    return NextResponse.json({
      success: true,
      message: `Todos os dados do cliente ${client?.name} foram removidos com sucesso`,
      details: cleanupResult,
    })
  } catch (error) {
    console.error("[v0] Unexpected error during cleanup:", error)
    return NextResponse.json({ error: "Erro inesperado ao limpar dados" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userData?.role !== "super_admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const client_id = searchParams.get("client_id")

    if (!client_id) {
      return NextResponse.json({ error: "client_id é obrigatório" }, { status: 400 })
    }

    // Get counts of what will be deleted
    const [analyses, tasks, findings, repositories, users, reports] = await Promise.all([
      supabase.from("analyses").select("id", { count: "exact", head: true }).eq("client_id", client_id),
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("client_id", client_id),
      supabase.from("findings").select("id", { count: "exact", head: true }).eq("client_id", client_id),
      supabase.from("repositories").select("id", { count: "exact", head: true }).eq("client_id", client_id),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("client_id", client_id),
      supabase.from("reports").select("id", { count: "exact", head: true }).eq("client_id", client_id),
    ])

    return NextResponse.json({
      preview: {
        analyses_count: analyses.count || 0,
        tasks_count: tasks.count || 0,
        findings_count: findings.count || 0,
        repositories_count: repositories.count || 0,
        users_count: users.count || 0,
        reports_count: reports.count || 0,
      },
    })
  } catch (error) {
    console.error("[v0] Error getting cleanup preview:", error)
    return NextResponse.json({ error: "Erro ao buscar preview" }, { status: 500 })
  }
}
