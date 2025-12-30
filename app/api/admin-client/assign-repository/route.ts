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

    const { data: findings } = await supabase
      .from("findings")
      .select("*")
      .eq("repository_id", repository_id)
      .eq("status", "open")

    if (findings && findings.length > 0) {
      const tasks = findings.map((finding) => ({
        title: `Fix: ${finding.issue_type}`,
        description: finding.description,
        repository_id: repository_id,
        developer_id: developer_id,
        client_id: client_id,
        finding_id: finding.id,
        status: "todo",
        priority: finding.severity === "critical" ? "high" : finding.severity === "high" ? "medium" : "low",
      }))

      await supabase.from("kanban_tasks").insert(tasks)
    }

    return NextResponse.json({
      success: true,
      message: "Desenvolvedor atribuído com sucesso",
      tasks_created: findings?.length || 0,
    })
  } catch (error: any) {
    console.error("[API] Assign repository error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
