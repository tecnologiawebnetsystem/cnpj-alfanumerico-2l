import { createClient } from "@supabase/supabase-js"
import type { NextRequest } from "next/server"

function getSupabaseClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("client_id")
    const type = searchParams.get("type")
    const status = searchParams.get("status") || "all"
    const dev = searchParams.get("dev") || "all"

    if (!clientId || !type) {
      return Response.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    let reportData: any = {}

    // Generate report based on type
    switch (type) {
      case "analyses":
        const { data: analyses } = await supabase
          .from("analyses")
          .select(`
            *,
            repositories(name, language),
            users(name)
          `)
          .eq("client_id", clientId)
          .eq("status", status === "all" ? status : "completed")
          .order("created_at", { ascending: false })

        reportData = { type: "Análises Concluídas", data: analyses }
        break

      case "tasks-by-repo":
        const { data: tasksByRepo } = await supabase
          .from("tasks")
          .select(`
            *,
            analyses(repositories(name)),
            users(name)
          `)
          .eq("client_id", clientId)
          .order("created_at", { ascending: false })

        reportData = { type: "Tarefas por Repositório", data: tasksByRepo }
        break

      case "tasks-by-status":
        const statusFilter = status !== "all" ? { status } : {}
        const { data: tasksByStatus } = await supabase
          .from("tasks")
          .select(`
            *,
            analyses(repositories(name)),
            users(name)
          `)
          .eq("client_id", clientId)
          .match(statusFilter)
          .order("status", { ascending: true })

        reportData = { type: "Tarefas por Status", data: tasksByStatus, filter: status }
        break

      case "tasks-by-dev":
        const devFilter = dev !== "all" ? { assigned_to: dev } : {}
        const { data: tasksByDev } = await supabase
          .from("tasks")
          .select(`
            *,
            analyses(repositories(name)),
            users(name)
          `)
          .eq("client_id", clientId)
          .match(devFilter)
          .order("assigned_to", { ascending: true })

        reportData = { type: "Tarefas por Desenvolvedor", data: tasksByDev }
        break

      case "general":
        const { data: allAnalyses } = await supabase.from("analyses").select("*").eq("client_id", clientId)

        const { data: allTasks } = await supabase
          .from("tasks")
          .select(`
            *,
            users(name)
          `)
          .eq("client_id", clientId)

        const { data: allRepos } = await supabase.from("repositories").select("*").eq("client_id", clientId)

        reportData = {
          type: "Relatório Geral",
          analyses: allAnalyses,
          tasks: allTasks,
          repositories: allRepos,
          summary: {
            totalAnalyses: allAnalyses?.length || 0,
            completedAnalyses: allAnalyses?.filter((a) => a.status === "completed").length || 0,
            totalTasks: allTasks?.length || 0,
            completedTasks: allTasks?.filter((t) => t.status === "completed").length || 0,
            totalRepositories: allRepos?.length || 0,
          },
        }
        break

      default:
        return Response.json({ error: "Invalid report type" }, { status: 400 })
    }

    // Generate PDF (simplified - in production use a proper PDF library)
    const pdfContent = `
      Relatório: ${reportData.type}
      Gerado em: ${new Date().toLocaleString("pt-BR")}
      
      ${JSON.stringify(reportData, null, 2)}
    `

    return new Response(pdfContent, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="relatorio-${type}.pdf"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error generating report:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
