import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repository_ids, client_id, report_type, analysis_type } = body

    if (!repository_ids || !Array.isArray(repository_ids) || repository_ids.length === 0) {
      return NextResponse.json({ error: "Selecione pelo menos um repositorio" }, { status: 400 })
    }

    if (!client_id) {
      return NextResponse.json({ error: "client_id obrigatorio" }, { status: 400 })
    }

    const supabase = await createClient()

    // Criar registro de batch analysis
    const { data: batch, error: batchError } = await supabase
      .from("batch_analyses")
      .insert({
        client_id: client_id,
        name: `Analise - ${new Date().toLocaleString("pt-BR")}`,
        description: `${report_type === "analitico" ? "Relatorio Analitico" : "Relatorio Sintetico"} - ${analysis_type === "codigo" ? "Codigo" : "Database"}`,
        status: "processing",
        total_repositories: repository_ids.length,
        completed_repositories: 0,
        failed_repositories: 0,
        analysis_method: "sequential",
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (batchError) {
      console.error("Erro ao criar batch:", batchError)
      throw batchError
    }

    // Criar registros de selecao de repositorios
    const selections = repository_ids.map((repoId: string) => ({
      batch_id: batch.id,
      repository_id: repoId,
      selected_at: new Date().toISOString(),
    }))

    await supabase.from("repository_selections").insert(selections)

    return NextResponse.json({
      success: true,
      batch_id: batch.id,
      total_repositories: repository_ids.length,
    })
  } catch (error: any) {
    console.error("Erro ao criar batch:", error)
    return NextResponse.json({ error: error.message || "Erro ao criar batch" }, { status: 500 })
  }
}
