import { type NextRequest, NextResponse } from "next/server"
import { db as supabase } from "@/lib/db/sqlserver"
import { generatePDFReport, generateJSONReport, generateExcelReport } from "@/lib/report-generator"
import { decompressFindings } from "@/lib/performance/compression"
import JSZip from "jszip"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "json"

    console.log(" ============ REPORT REQUEST START ============")
    console.log(" Analysis ID:", id)
    console.log(" Format:", format)

    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      console.error(" No authorization token provided")
      return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 })
    }

    let userInfo
    try {
      userInfo = JSON.parse(atob(token))
      console.log(" User authenticated:", userInfo.email, "Client ID:", userInfo.client_id)
    } catch (e) {
      console.error(" Invalid token format")
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 })
    }

    // supabase = db (bound from @/lib/db/sqlserver)

    console.log(" Step 1: Checking batch_analyses table...")
    const { data: batchAnalysis } = await supabase
      .from("batch_analyses")
      .select("*")
      .eq("id", id)
      .eq("client_id", userInfo.client_id)
      .maybeSingle()

    if (batchAnalysis) {
      console.log(" Found batch analysis:", batchAnalysis.name)

      const { data: analyses } = await supabase.from("analyses").select("*").eq("batch_id", id)

      console.log(" Associated analyses:", analyses?.length || 0)

      if (!analyses || analyses.length === 0) {
        console.error(" No analyses found in batch")
        return NextResponse.json({ error: "No analyses found in batch" }, { status: 404 })
      }

      const analysisIds = analyses.map((a) => a.id)

      console.log(" Fetching findings for", analysisIds.length, "analyses")
      let { data: findings } = await supabase.from("findings").select("*").in("analysis_id", analysisIds)

      console.log(" Regular findings found:", findings?.length || 0)

      if (!findings || findings.length === 0) {
        console.log(" No regular findings, checking compressed...")
        const allCompressed = []
        for (const analysisId of analysisIds) {
          const compressed = await decompressFindings(analysisId)
          if (compressed && compressed.length > 0) {
            allCompressed.push(...compressed)
          }
        }
        if (allCompressed.length > 0) {
          console.log(" Found compressed findings:", allCompressed.length)
          findings = allCompressed
        }
      }

      const { data: databaseFindings } = await supabase
        .from("database_findings")
        .select("*")
        .in("analysis_id", analysisIds)

      console.log(" Code findings:", findings?.length || 0)
      console.log(" Database findings:", databaseFindings?.length || 0)

      if (findings && findings.length > 0) {
        console.log(" Sample finding:", {
          file_path: findings[0].file_path,
          repository: findings[0].repository,
          project: findings[0].project,
          line_number: findings[0].line_number,
        })
      } else {
        console.error(" ❌ NO FINDINGS FOUND - This is the problem!")
        console.log(" Analysis IDs searched:", analysisIds)
      }

      const reportData = {
        analysis: {
          ...batchAnalysis,
          type: "batch",
          repository_name: batchAnalysis.name || "Análise em Lote",
          status: batchAnalysis.status,
          completed_at: batchAnalysis.completed_at,
          analyses: analyses,
        },
        findings: findings || [],
        databaseFindings: databaseFindings || [],
      }

      if (format === "zip") {
        console.log(" Generating ZIP with all formats for batch")
        const zip = new JSZip()

        const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "")
        const zipFilename = `relatorio-cnpj-${id}-${timestamp}.zip`

        const [pdfContent, csvContent, jsonContent] = await Promise.all([
          generatePDFReport(reportData),
          generateExcelReport(reportData),
          Promise.resolve(JSON.stringify(generateJSONReport(reportData), null, 2)),
        ])

        zip.file(`relatorio-cnpj-${id}-${timestamp}.pdf`, pdfContent)
        zip.file(`relatorio-cnpj-${id}-${timestamp}.csv`, csvContent)
        zip.file(`relatorio-cnpj-${id}-${timestamp}.json`, jsonContent)

        const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

        console.log(" ZIP generated successfully")
        console.log(" ============ REPORT REQUEST END (SUCCESS) ============")

        return new NextResponse(zipBuffer, {
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${zipFilename}"`,
          },
        })
      }

      let reportContent: any
      let contentType: string
      let filename: string

      switch (format) {
        case "pdf":
          reportContent = await generatePDFReport(reportData)
          contentType = "application/pdf"
          filename = `cnpj-batch-analysis-${id}.pdf`
          break
        case "excel":
          reportContent = await generateExcelReport(reportData)
          contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          filename = `cnpj-batch-analysis-${id}.xlsx`
          break
        case "json":
        default:
          reportContent = generateJSONReport(reportData)
          contentType = "application/json"
          filename = `cnpj-batch-analysis-${id}.json`
          break
      }

      console.log(" ============ REPORT REQUEST END (SUCCESS) ============")

      if (format === "json") {
        return NextResponse.json(reportContent)
      }

      return new NextResponse(reportContent, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      })
    }

    console.log(" Step 2: Checking analyses table...")
    const { data: analysis } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .eq("client_id", userInfo.client_id)
      .maybeSingle()

    console.log(" Individual analysis found:", analysis ? "YES" : "NO")
    if (analysis) {
      console.log(" Repository:", analysis.repository_name)
      console.log(" Status:", analysis.status)
    }

    if (!analysis) {
      console.error(" ❌ Analysis not found in both tables")
      return NextResponse.json(
        {
          error: "Analysis not found",
          message: "A análise não foi encontrada ou você não tem permissão para acessá-la.",
        },
        { status: 404 },
      )
    }

    if (analysis.status !== "completed") {
      console.error(" Analysis not completed, status:", analysis.status)
      return NextResponse.json({ error: "Analysis not completed yet" }, { status: 400 })
    }

    console.log(" Fetching findings for individual analysis...")

    let { data: findings } = await supabase.from("findings").select("*").eq("analysis_id", id)

    console.log(" Regular findings found:", findings?.length || 0)

    if (!findings || findings.length === 0) {
      console.log(" No regular findings, checking compressed...")
      const compressed = await decompressFindings(id)
      if (compressed && compressed.length > 0) {
        console.log(" Found compressed findings:", compressed.length)
        findings = compressed
      }
    }

    const { data: databaseFindings } = await supabase.from("database_findings").select("*").eq("analysis_id", id)

    console.log(" Code findings:", findings?.length || 0)
    console.log(" Database findings:", databaseFindings?.length || 0)

    if (findings && findings.length > 0) {
      console.log(" Sample finding:", {
        file_path: findings[0].file_path,
        repository: findings[0].repository,
        project: findings[0].project,
        line_number: findings[0].line_number,
      })
    } else {
      console.error(" ❌ NO FINDINGS FOUND - This is the problem!")
      console.log(" Analysis ID searched:", id)
      console.log(" Analysis status:", analysis.status)
      console.log(" Analysis repository:", analysis.repository_name)
    }

    const reportData = {
      analysis,
      findings: findings || [],
      databaseFindings: databaseFindings || [],
    }

    if (format === "zip") {
      console.log(" Generating ZIP with all formats")
      const zip = new JSZip()

      const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "")
      const zipFilename = `relatorio-cnpj-${id}-${timestamp}.zip`

      const [pdfContent, csvContent, jsonContent] = await Promise.all([
        generatePDFReport(reportData),
        generateExcelReport(reportData),
        Promise.resolve(JSON.stringify(generateJSONReport(reportData), null, 2)),
      ])

      zip.file(`relatorio-cnpj-${id}-${timestamp}.pdf`, pdfContent)
      zip.file(`relatorio-cnpj-${id}-${timestamp}.csv`, csvContent)
      zip.file(`relatorio-cnpj-${id}-${timestamp}.json`, jsonContent)

      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

      console.log(" ZIP generated successfully")
      console.log(" ============ REPORT REQUEST END (SUCCESS) ============")

      return new NextResponse(zipBuffer, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${zipFilename}"`,
        },
      })
    }

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
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = `cnpj-analysis-${id}.xlsx`
        break
      case "json":
      default:
        reportContent = generateJSONReport(reportData)
        contentType = "application/json"
        filename = `cnpj-analysis-${id}.json`
        break
    }

    console.log(" ============ REPORT REQUEST END (SUCCESS) ============")

    if (format === "json") {
      return NextResponse.json(reportContent)
    }

    return new NextResponse(reportContent, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error(" ❌ Error generating report:", error)
    console.error(" Error stack:", error instanceof Error ? error.stack : "no stack")
    console.error(" ============ REPORT REQUEST END (ERROR) ============")
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Erro ao gerar relatório. Por favor, tente novamente.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
