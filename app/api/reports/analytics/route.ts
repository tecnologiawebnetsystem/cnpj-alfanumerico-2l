import { type NextRequest, NextResponse } from "next/server"
import { db as supabase } from "@/lib/db/sqlserver"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("client_id")
    const period = Number.parseInt(searchParams.get("period") || "30")

    if (!clientId) {
      return NextResponse.json({ error: "client_id is required" }, { status: 400 })
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)

    const { data: analyses } = await supabase
      .from("analyses")
      .select("*")
      .eq("client_id", clientId)
      .eq("status", "completed")
      .gte("created_at", startDate.toISOString())

    const { data: batchAnalyses } = await supabase
      .from("batch_analyses")
      .select("*")
      .eq("client_id", clientId)
      .eq("status", "completed")
      .gte("created_at", startDate.toISOString())

    const allAnalyses = [...(analyses || []), ...(batchAnalyses || [])]
    const analysisIds = allAnalyses.map((a: any) => a.id)

    const { data: findings } = await supabase.from("findings").select("*").in("analysis_id", analysisIds)
    const { data: tasks } = await supabase.from("tasks").select("*").in("analysis_id", analysisIds)

    const totalAnalyses = allAnalyses.length
    const totalFindings = findings?.length || 0
    const totalTasks = tasks?.length || 0
    const tasksCompleted = tasks?.filter((t: any) => t.status === "completed").length || 0

    const codeFindings = findings?.filter((f: any) => f.field_type === "code").length || 0
    const dbFindings = findings?.filter((f: any) => f.field_type === "database").length || 0
    const totalHours = Math.round((codeFindings * 0.5 + dbFindings * 1) / 8)
    const estimatedDays = Math.ceil(totalHours / 8)

    const evolution = []
    for (let i = period; i >= 0; i -= Math.ceil(period / 7)) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const findingsCount = findings?.filter((f: any) => new Date(f.created_at) <= date).length || 0
      const resolvedCount = tasks?.filter((t: any) => t.status === "completed" && new Date(t.completed_at || t.created_at) <= date).length || 0
      evolution.push({ date: dateStr, findings: findingsCount, resolved: resolvedCount })
    }

    const projectsMap = new Map()
    findings?.forEach((f: any) => {
      const proj = f.project || "Sem Projeto"
      projectsMap.set(proj, (projectsMap.get(proj) || 0) + 1)
    })
    const projectsDistribution = Array.from(projectsMap.entries()).map(([name, value]) => ({ name, value }))

    const reposMap = new Map()
    findings?.forEach((f: any) => {
      const repo = f.repository || f.file_path?.split("/")[0] || "Desconhecido"
      reposMap.set(repo, (reposMap.get(repo) || 0) + 1)
    })
    const topRepositories = Array.from(reposMap.entries())
      .map(([name, findings]) => ({ name, findings }))
      .sort((a: any, b: any) => b.findings - a.findings)
      .slice(0, 10)

    return NextResponse.json({
      totalAnalyses,
      totalFindings,
      totalTasks,
      tasksCompleted,
      totalHours,
      estimatedDays,
      analysesGrowth: 15,
      findingsReduction: 8,
      evolution,
      projectsDistribution,
      topRepositories,
      projects: Array.from(projectsMap.keys()),
    })
  } catch (error) {
    console.error("Error generating analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
