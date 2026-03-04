import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey, logApiUsage } from "@/lib/api-auth"
import { db as supabase } from "@/lib/db/sqlserver"
import { generatePDFReport, generateJSONReport, generateExcelReport } from "@/lib/report-generator"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now()
  const { id } = await params

  try {
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) return NextResponse.json({ error: "API key is required" }, { status: 401 })

    const { valid, client, keyData, error } = await validateApiKey(apiKey)
    if (!valid || !client || !keyData) return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "json"

    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .eq("client_id", (client as any).id)
      .single()

    if (analysisError || !analysis) {
      await logApiUsage((client as any).id, (keyData as any).id, `/api/v1/reports/${id}`, "GET", 404, Date.now() - startTime, request)
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    if (analysis.status !== "completed") {
      await logApiUsage((client as any).id, (keyData as any).id, `/api/v1/reports/${id}`, "GET", 400, Date.now() - startTime, request)
      return NextResponse.json({ error: "Analysis not completed yet" }, { status: 400 })
    }

    const { data: findings } = await supabase.from("findings").select("*").eq("analysis_id", id)
    const { data: databaseFindings } = await supabase.from("database_findings").select("*").eq("analysis_id", id)

    const reportData = { analysis, findings: findings || [], databaseFindings: databaseFindings || [] }

    let reportContent: any
    let contentType: string
    let filename: string

    switch (format) {
      case "pdf":
        reportContent = await generatePDFReport(reportData)
        contentType = "application/pdf"
        filename = `cnpj-analysis-${id}.pdf`
        break
      case "excel":
        reportContent = await generateExcelReport(reportData)
        contentType = "text/csv; charset=utf-8"
        filename = `cnpj-analysis-${id}.csv`
        break
      default:
        reportContent = generateJSONReport(reportData)
        contentType = "application/json"
        filename = `cnpj-analysis-${id}.json`
    }

    await supabase.from("reports").insert({
      analysis_id: id,
      report_type: format,
      file_size: reportContent.length || JSON.stringify(reportContent).length,
    })

    await logApiUsage((client as any).id, (keyData as any).id, `/api/v1/reports/${id}`, "GET", 200, Date.now() - startTime, request)

    if (format === "json") return NextResponse.json(reportContent)

    return new NextResponse(reportContent, {
      headers: { "Content-Type": contentType, "Content-Disposition": `attachment; filename="${filename}"` },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
