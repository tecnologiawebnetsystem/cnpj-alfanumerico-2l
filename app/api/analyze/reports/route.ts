import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const maxDuration = 120

/**
 * Gera relatório completo de uma análise
 */
export async function POST(request: Request) {
  console.log("[v0] === REPORT GENERATION API START ===")

  try {
    const body = await request.json()
    const { batch_id, format = "json" } = body

    if (!batch_id) {
      return NextResponse.json({ error: "batch_id is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get batch analysis with all data
    const { data: batch, error: batchError } = await supabase
      .from("batch_analyses")
      .select("*")
      .eq("id", batch_id)
      .single()

    if (batchError || !batch) {
      return NextResponse.json({ error: "Batch analysis not found" }, { status: 404 })
    }

    // Get findings
    const { data: findings, error: findingsError } = await supabase
      .from("findings")
      .select("*")
      .eq("analysis_id", batch_id)

    if (findingsError) {
      return NextResponse.json({ error: "Failed to fetch findings" }, { status: 500 })
    }

    // Get tasks (if generated)
    const { data: tasks } = await supabase.from("tasks").select("*").eq("analysis_id", batch_id)

    // Generate report data
    const report = {
      batch_id,
      created_at: new Date().toISOString(),
      analysis_summary: {
        status: batch.status,
        total_repositories: batch.total_repositories,
        completed_repositories: batch.completed_repositories,
        total_files: batch.total_files,
        total_findings: batch.total_findings,
        progress: batch.progress,
        method: batch.analysis_method,
        started_at: batch.started_at,
        completed_at: batch.completed_at,
        duration_minutes: batch.completed_at
          ? Math.round((new Date(batch.completed_at).getTime() - new Date(batch.started_at).getTime()) / 60000)
          : null,
      },
      findings_by_repository: groupFindingsByRepository(findings || []),
      findings_by_file_type: groupFindingsByFileType(findings || []),
      findings_by_priority: groupFindingsByPriority(findings || []),
      top_affected_files: getTopAffectedFiles(findings || [], 10),
      tasks_summary: {
        total_tasks: tasks?.length || 0,
        by_status: groupTasksByStatus(tasks || []),
        by_priority: groupTasksByPriority(tasks || []),
      },
      recommendations: generateRecommendations(batch, findings || [], tasks || []),
      detailed_findings: findings,
    }

    // Save report to database
    const { data: savedReport, error: saveError } = await supabase
      .from("reports")
      .insert({
        analysis_id: batch_id,
        client_id: batch.client_id,
        format,
        generated_at: new Date().toISOString(),
        file_url: null, // Could upload to blob storage later
        file_size: JSON.stringify(report).length,
      })
      .select()
      .single()

    if (saveError) {
      console.error("[v0] Error saving report:", saveError)
    }

    console.log(`[v0] === REPORT GENERATION COMPLETE ===`)

    return NextResponse.json({
      success: true,
      report_id: savedReport?.id,
      report,
    })
  } catch (error: any) {
    console.error("[v0] Report generation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function groupFindingsByRepository(findings: any[]): Record<string, number> {
  return findings.reduce(
    (acc, f) => {
      const repo = f.repository || "Unknown"
      acc[repo] = (acc[repo] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
}

function groupFindingsByFileType(findings: any[]): Record<string, number> {
  return findings.reduce(
    (acc, f) => {
      const type = f.file_type || "unknown"
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
}

function groupFindingsByPriority(findings: any[]): Record<string, number> {
  return findings.reduce(
    (acc, f) => {
      const priority = f.is_validation ? "high" : f.is_input || f.is_output ? "medium" : "low"
      acc[priority] = (acc[priority] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
}

function getTopAffectedFiles(findings: any[], limit: number): any[] {
  const fileCount = findings.reduce(
    (acc, f) => {
      const file = f.file_path || "Unknown"
      acc[file] = (acc[file] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return Object.entries(fileCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([file, count]) => ({ file, count }))
}

function groupTasksByStatus(tasks: any[]): Record<string, number> {
  return tasks.reduce(
    (acc, t) => {
      const status = t.status || "pending"
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
}

function groupTasksByPriority(tasks: any[]): Record<string, number> {
  return tasks.reduce(
    (acc, t) => {
      const priority = t.priority || "low"
      acc[priority] = (acc[priority] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
}

function generateRecommendations(batch: any, findings: any[], tasks: any[]): string[] {
  const recommendations: string[] = []

  if (findings.length > 100) {
    recommendations.push("Grande volume de findings detectado. Recomendamos priorizar por repositório crítico.")
  }

  const validationFindings = findings.filter((f) => f.is_validation)
  if (validationFindings.length > 0) {
    recommendations.push(
      `${validationFindings.length} campos com validação detectados. Estes requerem atenção especial nos testes.`,
    )
  }

  if (batch.total_repositories > 50) {
    recommendations.push("Considere dividir a implementação em sprints por repositório para melhor controle.")
  }

  const highPriorityTasks = tasks.filter((t) => t.priority === "high")
  if (highPriorityTasks.length > 0) {
    recommendations.push(`${highPriorityTasks.length} tarefas de alta prioridade identificadas. Iniciar por estas.`)
  }

  if (recommendations.length === 0) {
    recommendations.push("Análise concluída com sucesso. Todas as tarefas foram criadas e podem ser iniciadas.")
  }

  return recommendations
}
