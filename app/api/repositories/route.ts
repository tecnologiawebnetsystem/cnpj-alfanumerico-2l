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
          findings!repository_id (id),
          repository_assignments!repository_id (
            developer_id,
            users!developer_id (name)
          )
        `,
        )
        .eq("client_id", client_id)
    }

    const { data: repositories, error } = await query

    if (error) throw error

    const formattedRepos = repositories?.map((repo: any) => ({
      ...repo,
      findings_count: repo.findings?.length || 0,
      assigned_developer_id: repo.repository_assignments?.[0]?.developer_id,
      assigned_developer_name: repo.repository_assignments?.[0]?.users?.name,
    }))

    return NextResponse.json(formattedRepos || [])
  } catch (error: any) {
    console.error("[API] Get repositories error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
