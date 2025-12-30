import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: client } = await supabase.from("clients").select("id").eq("user_id", user.id).single()

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const body = await request.json()
    const { repository_ids, report_type, assigned_developer_id } = body
    // report_type: 'analytical' | 'synthetic'
    // repository_ids: array of repository URLs or 'all'

    // Get repositories to analyze
    let repositories = []
    if (repository_ids === "all") {
      const { data: accounts } = await supabase
        .from("accounts")
        .select("*")
        .eq("client_id", client.id)
        .in("provider", ["github", "gitlab", "azure"])

      repositories = accounts?.flatMap((acc) => acc.repositories || []) || []
    } else {
      repositories = repository_ids
    }

    // Create analysis batch
    const { data: analysis, error } = await supabase
      .from("analyses")
      .insert({
        client_id: client.id,
        status: "pending",
        report_type,
        total_repositories: repositories.length,
        repositories_analyzed: 0,
        total_findings: 0,
      })
      .select()
      .single()

    if (error) throw error

    // Create repository assignments if developer is assigned
    if (assigned_developer_id) {
      const assignments = repositories.map((repo: any) => ({
        client_id: client.id,
        repository_url: repo.url || repo,
        repository_name: repo.name || repo,
        repository_type: repo.provider || "github",
        assigned_developer_id,
        assigned_at: new Date().toISOString(),
        assigned_by: user.id,
        status: "assigned",
      }))

      await supabase.from("repository_assignments").insert(assignments)
    }

    // Trigger async analysis (you would use a queue system in production)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analysis_id: analysis.id,
        repositories,
        report_type,
        client_id: client.id,
      }),
    }).catch(console.error)

    return NextResponse.json({ analysis_id: analysis.id })
  } catch (error: any) {
    console.error("Error starting analysis:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
