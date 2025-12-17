import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { analysisId: string } }) {
  try {
    const { analysisId } = params
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: analysis } = await supabase
      .from("analyses")
      .select("*, repositories(*), connections:connection_id(account_name)")
      .eq("id", analysisId)
      .single()

    const { data: findings } = await supabase.from("findings").select("*").eq("analysis_id", analysisId)

    const headers = [
      "Conta/Organização",
      "Repositório",
      "Arquivo",
      "Linha",
      "Campo",
      "Código Atual",
      "Solução",
      "Horas Estimadas",
      "Linguagem",
      "Data",
    ]

    const accountName = analysis?.connections?.account_name || "N/A"
    const repositoryName = analysis?.repositories?.name || analysis?.repository_name || "N/A"

    const csvContent = [
      headers.join(","),
      ...(findings?.map((f) =>
        [
          `"${accountName}"`,
          `"${repositoryName}"`,
          `"${f.file_path}"`,
          f.line_number,
          `"${f.field_name}"`,
          `"${f.code_current?.replace(/"/g, '""') || ""}"`,
          `"${f.suggestion?.replace(/"/g, '""') || ""}"`,
          f.estimated_hours || 4, // Added estimated hours column
          f.language || "unknown",
          new Date(f.created_at).toLocaleDateString("pt-BR"),
        ].join(","),
      ) || []),
    ].join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="relatorio-${repositoryName}-${analysisId}.csv"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error generating CSV:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
