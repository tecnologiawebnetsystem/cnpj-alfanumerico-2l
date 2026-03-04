export const runtime = "nodejs"
export const maxDuration = 300

import { type NextRequest, NextResponse } from "next/server"
import { db as supabase } from "@/lib/db/sqlserver"
import { analyzeWithGemini } from "@/lib/ai/gemini-analyzer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { batch_id } = body

    if (!batch_id) {
      return NextResponse.json({ error: "batch_id required" }, { status: 400 })
    }

    const { data: findings, error: findingsError } = await supabase
      .from("findings")
      .select("*")
      .eq("analysis_id", batch_id)
      .is("suggestion", null)
      .limit(100)

    if (findingsError) {
      return NextResponse.json({ error: findingsError.message }, { status: 500 })
    }

    if (!findings || findings.length === 0) {
      return NextResponse.json({ success: true, processed: 0 })
    }

    let processed = 0
    let failed = 0

    for (let i = 0; i < findings.length; i += 5) {
      const batch = findings.slice(i, i + 5)

      const promises = batch.map(async (finding: any) => {
        try {
          if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            await supabase
              .from("findings")
              .update({ suggestion: "Alterar campo para formato alfanumérico para suportar CPF e CNPJ", updated_at: new Date().toISOString() })
              .eq("id", finding.id)
            processed++
            return
          }

          const analysis = await analyzeWithGemini(
            { filePath: finding.file_path, lineNumber: finding.line_number, fieldName: finding.field_name, code: finding.code_current },
            finding.repository || "Unknown",
            finding.project || "Unknown",
          )

          await supabase
            .from("findings")
            .update({ suggestion: analysis.technical_solution, updated_at: new Date().toISOString() })
            .eq("id", finding.id)

          processed++
        } catch (error) {
          failed++
          console.error(`Failed to enrich finding ${finding.id}:`, error)
        }
      })

      await Promise.all(promises)
      if (i + 5 < findings.length) await new Promise((r) => setTimeout(r, 1000))
    }

    return NextResponse.json({ success: true, processed, failed })
  } catch (error) {
    console.error("Error in AI enrichment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
