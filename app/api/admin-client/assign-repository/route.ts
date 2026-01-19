import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repository_id, developer_id, client_id } = body

    if (!repository_id || !developer_id) {
      return NextResponse.json({ success: false, error: "Dados inválidos" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("repository_assignments")
      .upsert(
        {
          repository_id,
          developer_id,
          client_id,
          assigned_at: new Date().toISOString(),
        },
        {
          onConflict: "repository_id,client_id",
        },
      )
      .select()

    if (error) throw error

    // Buscar findings através das analyses do repositório
    const { data: analyses } = await supabase
      .from("analyses")
      .select("id")
      .eq("repository_id", repository_id)

    const analysisIds = analyses?.map((a: any) => a.id) || []
    let findingsCount = 0
    let findings: any[] = []

    if (analysisIds.length > 0) {
      const { data: findingsData } = await supabase
        .from("findings")
        .select("id, file_path, suggestion, action_required")
        .in("analysis_id", analysisIds)

      if (findingsData && findingsData.length > 0) {
        findings = findingsData
        findingsCount = findings.length
        
        // Criar tarefas para cada finding
        const tasks = findings.map((finding: any) => ({
          title: `Corrigir: ${finding.file_path || "Arquivo"}`,
          description: finding.suggestion || finding.action_required || "Verificar CNPJ",
          assigned_to: developer_id,
          client_id: client_id,
          status: "pending",
          priority: "medium",
        }))

        await supabase.from("tasks").insert(tasks)

        // Create notification for the developer
        try {
          // Get repository name
          const { data: repo } = await supabase
            .from("repositories")
            .select("name")
            .eq("id", repository_id)
            .single()

          await supabase.from("notifications").insert({
            user_id: developer_id,
            type: "task_assigned",
            title: "Repositorio atribuido",
            message: `Voce foi atribuido ao repositorio "${repo?.name || "Repositorio"}" com ${findingsCount} tarefa(s) pendente(s).`,
            data: { repository_id, tasks_count: findingsCount },
            read: false,
          })
        } catch (notifError) {
          console.error("Error creating notification:", notifError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Desenvolvedor atribuído com sucesso",
      tasks_created: findingsCount,
    })
  } catch (error: any) {
    console.error("[API] Assign repository error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
