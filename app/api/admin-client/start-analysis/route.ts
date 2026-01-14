import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await request.json()
    const { repository_ids, report_type, analysis_type, client_id } = body

    if (!repository_ids || !Array.isArray(repository_ids) || repository_ids.length === 0) {
      return NextResponse.json({ error: "Selecione pelo menos um repositório" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Create analysis batch
    const { data: batch, error: batchError } = await supabase
      .from("analysis_batches")
      .insert({
        client_id: client_id,
        created_by: user.id,
        status: "pending",
        total_repositories: repository_ids.length,
        completed_repositories: 0,
        report_type: report_type,
        analysis_type: analysis_type,
      })
      .select()
      .single()

    if (batchError) throw batchError

    // Create individual analyses for each repository
    const analyses = repository_ids.map((repo_id: string) => ({
      batch_id: batch.id,
      repository_id: repo_id,
      client_id: client_id,
      status: "pending",
      progress: 0,
      findings_count: 0,
      analysis_type: analysis_type,
    }))

    const { error: analysesError } = await supabase.from("analyses").insert(analyses)

    if (analysesError) throw analysesError

    // Start background job to process analyses
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/process-analyses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batch_id: batch.id }),
    }).catch((err) => console.error("Error starting background job:", err))

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
