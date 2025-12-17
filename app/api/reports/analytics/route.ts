import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("client_id")
    const period = Number.parseInt(searchParams.get("period") || "30")
    const project = searchParams.get("project") || "all"

    if (!clientId) {
      return NextResponse.json({ error: "client_id is required" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)

    // Get analyses for the period
    const analysesQuery = supabase
      .from("analyses")
      .select("*")
      .eq("client_id", clientId)
      .eq("status", "completed")
      .gte("created_at", startDate.toISOString())

    const { data: analyses } = await analysesQuery

    // Get batch analyses
    const { data: batchAnalyses } = await supabase
      .from("batch_analyses")
      .select("*")
      .eq("client_id", clientId)
      .eq("status", "completed")
      .gte("created_at", startDate.toISOString())

    const allAnalyses = [...(analyses || []), ...(batchAnalyses || [])]

    // Get findings
    const analysisIds = allAnalyses.map((a) => a.id)
    const { data: findings } = await supabase.from("findings").select("*").in("analysis_id", analysisIds)

    // Get tasks
    const { data: tasks } = await supabase.from("tasks").select("*").in("analysis_id", analysisIds)

    // Calculate metrics
    const totalAnalyses = allAnalyses.length
    const totalFindings = findings?.length || 0
    const totalTasks = tasks?.length || 0
    const tasksCompleted = tasks?.filter((t) => t.status === "completed").length || 0

    // Estimate hours
    const codeFindings = findings?.filter((f) => f.field_type === "code").length || 0
    const dbFindings = findings?.filter((f) => f.field_type === "database").length || 0
    const totalHours = Math.round((codeFindings * 0.5 + dbFindings * 1) / 8)
    const estimatedDays = Math.ceil(totalHours / 8)

    // Evolution data
    const evolution = []
    for (let i = period; i >= 0; i -= Math.ceil(period / 7)) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const findingsCount = findings?.filter((f) => new Date(f.created_at) <= date).length || 0

      const resolvedCount =
        tasks?.filter((t) => t.status === "completed" && new Date(t.completed_at || t.created_at) <= date).length || 0

      evolution.push({
        date: dateStr,
        findings: findingsCount,
        resolved: resolvedCount,
      })
    }

    // Projects distribution
    const projectsMap = new Map()
    findings?.forEach((f) => {
      const proj = f.project || "Sem Projeto"
      projectsMap.set(proj, (projectsMap.get(proj) || 0) + 1)
    })
    const projectsDistribution = Array.from(projectsMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))

    // Top repositories
    const reposMap = new Map()
    findings?.forEach((f) => {
      const repo = f.repository || f.file_path?.split("/")[0] || "Desconhecido"
      reposMap.set(repo, (reposMap.get(repo) || 0) + 1)
    })
    const topRepositories = Array.from(reposMap.entries())
      .map(([name, findings]) => ({ name, findings }))
      .sort((a, b) => b.findings - a.findings)
      .slice(0, 10)

    // Get unique projects for filter
    const projects = Array.from(projectsMap.keys())

    return NextResponse.json({
      totalAnalyses,
      totalFindings,
      totalTasks,
      tasksCompleted,
      totalHours,
      estimatedDays,
      analysesGrowth: 15, // Could calculate from previous period
      findingsReduction: 8, // Could calculate from resolved tasks
      evolution,
      projectsDistribution,
      topRepositories,
      projects,
    })
  } catch (error) {
    console.error("[v0] Error generating analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
