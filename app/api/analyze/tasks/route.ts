import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * Gera tarefas automaticamente a partir dos findings de uma análise
 */
export async function POST(request: Request) {
  console.log(" === TASK GENERATION API START ===")

  try {
    const body = await request.json()
    const { batch_id, user_id } = body

    if (!batch_id) {
      return NextResponse.json({ error: "batch_id is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get batch analysis
    const { data: batch, error: batchError } = await supabase
      .from("batch_analyses")
      .select("*")
      .eq("id", batch_id)
      .single()

    if (batchError || !batch) {
      return NextResponse.json({ error: "Batch analysis not found" }, { status: 404 })
    }

    // Get all findings for this batch
    const { data: findings, error: findingsError } = await supabase
      .from("findings")
      .select("*")
      .eq("analysis_id", batch_id)

    if (findingsError) {
      console.error(" Error fetching findings:", findingsError)
      return NextResponse.json({ error: "Failed to fetch findings" }, { status: 500 })
    }

    console.log(` Found ${findings?.length || 0} findings to convert to tasks`)

    if (!findings || findings.length === 0) {
      return NextResponse.json({ success: true, tasks_created: 0, message: "No findings to convert" })
    }

    // Group findings by repository
    const findingsByRepo = findings.reduce(
      (acc, finding) => {
        const repo = finding.repository || "Unknown"
        if (!acc[repo]) acc[repo] = []
        acc[repo].push(finding)
        return acc
      },
      {} as Record<string, any[]>,
    )

    let tasksCreated = 0

    // Create tasks for each repository
    for (const [repoName, repoFindings] of Object.entries(findingsByRepo)) {
      try {
        // Create one task per finding (to be more granular)
        const tasksToInsert = repoFindings.map((finding) => {
          const priority = determinePriority(finding)
          const storyPoints = estimateStoryPoints(finding)

          return {
            client_id: batch.client_id,
            analysis_id: batch_id,
            title: `Alterar CNPJ em ${finding.field_name || "campo"}`,
            description: `Arquivo: ${finding.file_path}\nLinha: ${finding.line_number}\n\nCódigo atual:\n${finding.code_current || ""}\n\nSugestão: ${finding.suggestion || "Alterar para formato alfanumérico"}`,
            status: "pending",
            priority,
            story_points: storyPoints,
            repository_name: repoName,
            file_path: finding.file_path,
            line_number: finding.line_number,
            code_before: finding.code_before,
            code_current: finding.code_current,
            code_suggested: finding.code_suggested || generateSuggestedCode(finding),
            code_after: finding.code_after,
            assigned_to: null, // Will be assigned later
            created_at: new Date().toISOString(),
          }
        })

        const { error: insertError } = await supabase.from("tasks").insert(tasksToInsert)

        if (insertError) {
          console.error(` Error creating tasks for ${repoName}:`, insertError)
        } else {
          tasksCreated += tasksToInsert.length
          console.log(` Created ${tasksToInsert.length} tasks for ${repoName}`)
        }
      } catch (error) {
        console.error(` Exception creating tasks for ${repoName}:`, error)
      }
    }

    console.log(` === TASK GENERATION COMPLETE: ${tasksCreated} tasks created ===`)

    return NextResponse.json({
      success: true,
      tasks_created: tasksCreated,
      repositories_processed: Object.keys(findingsByRepo).length,
    })
  } catch (error: any) {
    console.error(" Task generation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function determinePriority(finding: any): string {
  // High priority if it's in a critical file or has validation
  if (finding.is_validation || finding.file_path?.includes("controller") || finding.file_path?.includes("service")) {
    return "high"
  }

  // Medium priority for business logic
  if (finding.file_path?.includes("model") || finding.file_path?.includes("entity")) {
    return "medium"
  }

  // Low priority for others
  return "low"
}

function estimateStoryPoints(finding: any): number {
  // Simple field change: 1 point
  // Field with validation: 3 points
  // Field in multiple files: 5 points

  if (finding.is_validation) return 3
  return 1
}

function generateSuggestedCode(finding: any): string {
  const fieldName = finding.field_name || "cnpj"
  const currentCode = finding.code_current || ""

  // Simple suggestion: change VARCHAR(14) to VARCHAR(18)
  if (currentCode.includes("VARCHAR(14)")) {
    return currentCode.replace("VARCHAR(14)", "VARCHAR(18)")
  }

  if (currentCode.includes("CHAR(14)")) {
    return currentCode.replace("CHAR(14)", "VARCHAR(18)")
  }

  return `// TODO: Alterar ${fieldName} para formato alfanumérico (VARCHAR(18))`
}
