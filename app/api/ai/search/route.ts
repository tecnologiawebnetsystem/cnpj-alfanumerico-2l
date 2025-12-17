import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { embed } from "ai"

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { query } = await request.json()

  try {
    // Generate embedding for the search query
    const { embedding } = await embed({
      model: "openai/text-embedding-3-small",
      value: query,
    })

    // Search in analyses
    const { data: analyses } = await supabase.from("analyses").select("*").limit(10)

    // Search in tasks
    const { data: tasks } = await supabase.from("tasks").select("*").limit(10)

    // Simple keyword-based search for now (can be enhanced with vector search)
    const keywords = query.toLowerCase().split(" ")

    const results: any[] = []

    // Score analyses
    analyses?.forEach((analysis) => {
      const text = `${analysis.repository_name} ${analysis.status}`.toLowerCase()
      const score = keywords.filter((k) => text.includes(k)).length / keywords.length

      if (score > 0) {
        results.push({
          id: analysis.id,
          type: "analysis",
          title: analysis.repository_name,
          description: `Análise ${analysis.status} com ${analysis.fields_count} campos identificados`,
          relevance: score,
          metadata: {
            status: analysis.status,
            fields: analysis.fields_count,
            date: new Date(analysis.created_at).toLocaleDateString("pt-BR"),
          },
        })
      }
    })

    // Score tasks
    tasks?.forEach((task) => {
      const text = `${task.title} ${task.description} ${task.status}`.toLowerCase()
      const score = keywords.filter((k) => text.includes(k)).length / keywords.length

      if (score > 0) {
        results.push({
          id: task.id,
          type: "task",
          title: task.title,
          description: task.description,
          relevance: score,
          metadata: {
            status: task.status,
            priority: task.priority,
            assigned: task.assigned_to ? "Sim" : "Não",
          },
        })
      }
    })

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance)

    return NextResponse.json({ results: results.slice(0, 20) })
  } catch (error: any) {
    console.error("Error searching:", error)
    return NextResponse.json({ error: "Failed to search" }, { status: 500 })
  }
}
