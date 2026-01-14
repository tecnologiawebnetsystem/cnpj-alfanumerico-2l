export const runtime = "nodejs"
export const maxDuration = 300 // 5 minutes

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { analyzeWithGemini } from "@/lib/ai/gemini-analyzer"

export async function POST(request: NextRequest) {
  console.log(" Starting background AI enrichment")

  try {
    const body = await request.json()
    const { batch_id } = body

    if (!batch_id) {
      return NextResponse.json({ error: "batch_id required" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: findings, error: findingsError } = await supabase
      .from("findings")
      .select("*")
      .eq("analysis_id", batch_id) // ✅ CORRETO! Usar analysis_id ao invés de batch_id
      .is("suggestion", null) // ✅ Buscar findings que ainda não têm sugestão
      .limit(100)

    if (findingsError) {
      console.error(" Error fetching findings:", findingsError)
      return NextResponse.json({ error: findingsError.message }, { status: 500 })
    }

    if (!findings || findings.length === 0) {
      console.log(" No findings to enrich")
      return NextResponse.json({ success: true, processed: 0 })
    }

    console.log(` Enriching ${findings.length} findings with Gemini`)

    let processed = 0
    let failed = 0

    for (let i = 0; i < findings.length; i += 5) {
      const batch = findings.slice(i, i + 5)

      const promises = batch.map(async (finding) => {
        try {
          if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            console.warn(" Gemini API key not configured, using fallback suggestion")
            await supabase
              .from("findings")
              .update({
                suggestion: "Alterar campo para formato alfanumérico para suportar CPF e CNPJ",
                updated_at: new Date().toISOString(),
              })
              .eq("id", finding.id)

            processed++
            return
          }

          const analysis = await analyzeWithGemini(
            {
              filePath: finding.file_path,
              lineNumber: finding.line_number,
              fieldName: finding.field_name,
              code: finding.code_current,
            },
            finding.repository || "Unknown",
            finding.project || "Unknown",
          )

          await supabase
            .from("findings")
            .update({
              suggestion: analysis.technical_solution,
              updated_at: new Date().toISOString(),
            })
            .eq("id", finding.id)

          processed++
          console.log(` Enriched finding ${finding.id}`)
        } catch (error) {
          failed++
          console.error(` Failed to enrich finding ${finding.id}:`, error)
        }
      })

      await Promise.all(promises)

      if (i + 5 < findings.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    console.log(` AI enrichment complete: ${processed} success, ${failed} failed`)

    return NextResponse.json({
      success: true,
      processed,
      failed,
    })
  } catch (error) {
    console.error(" Error in AI enrichment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
