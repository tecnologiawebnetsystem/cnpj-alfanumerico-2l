import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const user_id = searchParams.get("user_id")

    console.log(" Admin analyses API - user_id:", user_id)

    if (!user_id) {
      return NextResponse.json({ error: "user_id é obrigatório" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Verificar se o usuário é super admin
    const { data: user, error: userError } = await supabase.from("users").select("role").eq("id", user_id).single()

    if (userError || !user) {
      console.error(" User not found:", userError)
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (user.role?.toUpperCase() !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { data: analyses, error } = await supabase
      .from("analyses")
      .select(
        `
        id,
        client_id,
        repository_id,
        status,
        started_at,
        completed_at,
        error_message,
        repositories (
          name,
          client_id
        )
      `,
      )
      .order("started_at", { ascending: false })

    if (error) {
      console.error(" Error fetching analyses:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Buscar informações dos clientes separadamente
    const clientIds = [...new Set((analyses || []).map((a) => a.client_id).filter(Boolean))]
    const { data: clients } = await supabase.from("clients").select("id, name").in("id", clientIds)

    const clientMap = new Map(clients?.map((c) => [c.id, c.name]) || [])

    // Contar findings para cada análise
    const analysesWithCounts = await Promise.all(
      (analyses || []).map(async (analysis) => {
        const { count } = await supabase
          .from("findings")
          .select("*", { count: "exact", head: true })
          .eq("analysis_id", analysis.id)

        return {
          id: analysis.id,
          client_id: analysis.client_id,
          client_name: clientMap.get(analysis.client_id) || "Cliente Desconhecido",
          repository_id: analysis.repository_id,
          repository_name: analysis.repositories?.name || "Repositório Desconhecido",
          status: analysis.status,
          started_at: analysis.started_at,
          completed_at: analysis.completed_at,
          error_message: analysis.error_message,
          total_findings: count || 0,
        }
      }),
    )

    console.log(" Analyses loaded:", analysesWithCounts.length)
    return NextResponse.json(analysesWithCounts)
  } catch (error: any) {
    console.error(" Error in admin analyses API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
