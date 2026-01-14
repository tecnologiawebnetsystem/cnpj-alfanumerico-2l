import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const batchId = params.id
    const supabase = await createServerClient()

    // Get all findings for this batch
    const { data: analyses } = await supabase.from("analyses").select("id, repository_id").eq("batch_id", batchId)

    const analysisIds = analyses?.map((a) => a.id) || []

    // Get findings with details
    const { data: findings } = await supabase
      .from("findings")
      .select(
        `
        *,
        analyses!inner(repository_id),
        repositories!inner(name, full_name)
      `,
      )
      .in("analysis_id", analysisIds)

    // Get repository names
    const repositoryIds = [...new Set(analyses?.map((a) => a.repository_id))]
    const { data: repositories } = await supabase
      .from("repositories")
      .select("id, name, full_name")
      .in("id", repositoryIds)

    const repoMap = new Map(repositories?.map((r) => [r.id, r.name || r.full_name]))

    // Format findings for analytical report
    const formattedFindings = findings?.map((f: any) => ({
      id: f.id,
      repository_name: repoMap.get(f.analyses.repository_id) || "Unknown",
      file_path: f.file_path,
      line_number: f.line_number,
      severity: f.severity,
      issue_type: f.type,
      description: f.description,
      current_code: f.code_snippet || "",
      suggested_code: f.suggestion || "",
      ai_explanation: f.ai_suggestion || "Nenhuma sugestão disponível",
    }))

    // Calculate stats for synthetic report
    const stats = {
      total_findings: findings?.length || 0,
      critical: findings?.filter((f: any) => f.severity === "critical").length || 0,
      high: findings?.filter((f: any) => f.severity === "high").length || 0,
      medium: findings?.filter((f: any) => f.severity === "medium").length || 0,
      low: findings?.filter((f: any) => f.severity === "low").length || 0,
      repositories_analyzed: repositoryIds.length,
      files_analyzed: new Set(findings?.map((f: any) => f.file_path)).size,
      lines_analyzed: findings?.reduce((acc: number, f: any) => acc + (f.line_number || 0), 0) || 0,
    }

    // Top issues
    const issueTypeCounts = new Map<string, { count: number; severity: string }>()
    findings?.forEach((f: any) => {
      const existing = issueTypeCounts.get(f.type) || { count: 0, severity: f.severity }
      issueTypeCounts.set(f.type, { count: existing.count + 1, severity: f.severity })
    })

    const topIssues = Array.from(issueTypeCounts.entries())
      .map(([type, data]) => ({
        issue_type: type,
        count: data.count,
        severity: data.severity,
      }))
      .sort((a, b) => b.count - a.count)

    // Repository stats
    const repoFindingsCount = new Map<string, { count: number; critical: number }>()
    findings?.forEach((f: any) => {
      const repoName = repoMap.get(f.analyses.repository_id) || "Unknown"
      const existing = repoFindingsCount.get(repoName) || { count: 0, critical: 0 }
      repoFindingsCount.set(repoName, {
        count: existing.count + 1,
        critical: existing.critical + (f.severity === "critical" ? 1 : 0),
      })
    })

    const repositoryStats = Array.from(repoFindingsCount.entries())
      .map(([name, data]) => ({
        repository_name: name,
        findings_count: data.count,
        critical_count: data.critical,
      }))
      .sort((a, b) => b.findings_count - a.findings_count)

    return NextResponse.json({
      findings: formattedFindings,
      stats,
      topIssues,
      repositoryStats,
    })
  } catch (error: any) {
    console.error(" Error fetching report:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
