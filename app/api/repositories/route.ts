import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const client_id = searchParams.get("client_id")
    const include_stats = searchParams.get("include_stats") === "true"

    if (!client_id) {
      return NextResponse.json({ success: false, error: "client_id é obrigatório" }, { status: 400 })
    }

    const supabase = await createClient()

    let query = supabase.from("repositories").select("*").eq("client_id", client_id)

    if (include_stats) {
      query = supabase
        .from("repositories")
        .select(
          `
          *,
          analyses (id, findings:findings(id)),
          repository_assignments (
            developer_id,
            status,
            users:users!developer_id (name)
          )
        `,
        )
        .eq("client_id", client_id)
    }

    const { data: repositories, error } = await query

    if (error) throw error

    const formattedRepos = repositories?.map((repo: any) => {
      // Count findings from all analyses
      const findingsCount = repo.analyses?.reduce((acc: number, analysis: any) => {
        return acc + (analysis.findings?.length || 0)
      }, 0) || 0

      return {
        ...repo,
        findings_count: findingsCount,
        assigned_developer_id: repo.repository_assignments?.[0]?.developer_id,
        assigned_developer_name: repo.repository_assignments?.[0]?.users?.name,
        status: repo.repository_assignments?.[0]?.status || "pendente",
        analyses: undefined, // Remove analyses from response
        repository_assignments: undefined, // Remove assignments from response
      }
    })

    return NextResponse.json(formattedRepos || [])
  } catch (error: any) {
    console.error("[API] Get repositories error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
