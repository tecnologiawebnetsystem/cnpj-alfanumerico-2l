import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey, logApiUsage } from "@/lib/api-auth"
import { db as supabase } from "@/lib/db/sqlserver"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now()
  const { id } = await params

  try {
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) return NextResponse.json({ error: "API key is required" }, { status: 401 })

    const { valid, client, keyData, error } = await validateApiKey(apiKey)
    if (!valid || !client || !keyData) return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })

    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .eq("client_id", (client as any).id)
      .single()

    if (analysisError || !analysis) {
      await logApiUsage((client as any).id, (keyData as any).id, `/api/v1/analyze/${id}`, "GET", 404, Date.now() - startTime, request)
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    let findings: any[] = []
    let databaseFindings: any[] = []

    if (analysis.status === "completed") {
      const { data: findingsData } = await supabase.from("findings").select("*").eq("analysis_id", id)
      const { data: dbFindingsData } = await supabase.from("database_findings").select("*").eq("analysis_id", id)
      findings = findingsData || []
      databaseFindings = dbFindingsData || []
    }

    await logApiUsage((client as any).id, (keyData as any).id, `/api/v1/analyze/${id}`, "GET", 200, Date.now() - startTime, request)

    return NextResponse.json({
      analysis,
      findings,
      database_findings: databaseFindings,
      summary: {
        total_files: analysis.total_files,
        files_analyzed: analysis.files_analyzed,
        cnpj_occurrences: findings.length,
        database_fields: databaseFindings.length,
        estimated_hours: analysis.estimated_hours,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
