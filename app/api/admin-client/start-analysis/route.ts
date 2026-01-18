import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repository_ids, report_type, analysis_type, client_id } = body

    if (!repository_ids || !Array.isArray(repository_ids) || repository_ids.length === 0) {
      return NextResponse.json({ error: "Selecione pelo menos um repositório" }, { status: 400 })
    }

    if (!client_id) {
      return NextResponse.json({ error: "client_id é obrigatório" }, { status: 400 })
    }

    const supabase = await createClient()

    // Create batch analysis record
    const { data: batch, error: batchError } = await supabase
      .from("batch_analyses")
      .insert({
        client_id: client_id,
        name: `Análise em lote - ${new Date().toLocaleString("pt-BR")}`,
        status: "pending",
        total_repositories: repository_ids.length,
        completed_repositories: 0,
        failed_repositories: 0,
        analysis_method: analysis_type || "codigo",
      })
      .select()
      .single()

    if (batchError) {
      console.error(" Error creating batch:", batchError)
      throw batchError
    }

    // Create individual analyses for each repository
    const analyses = repository_ids.map((repo_id: string) => ({
      batch_id: batch.id,
      repository_id: repo_id,
      client_id: client_id,
      status: "pending",
      progress: 0,
    }))

    const { error: analysesError } = await supabase.from("analyses").insert(analyses)

    if (analysesError) {
      console.error(" Error creating analyses:", analysesError)
      throw analysesError
    }

    console.log(" Analysis batch created:", batch.id, "with", repository_ids.length, "repositories")

    return NextResponse.json({
      success: true,
      batch_id: batch.id,
      message: `Análise iniciada para ${repository_ids.length} repositório(s)`,
    })
  } catch (error: any) {
    console.error(" Error starting analysis:", error)
    return NextResponse.json({ error: error.message || "Erro ao iniciar análise" }, { status: 500 })
  }
}
