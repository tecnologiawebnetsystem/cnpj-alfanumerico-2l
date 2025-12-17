import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { analysisId: string } }) {
  try {
    const { analysisId } = params
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", analysisId)
      .single()

    if (analysisError || !analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    const { data: findings } = await supabase.from("findings").select("*").eq("analysis_id", analysisId)

    const reportContent = `
RELATÓRIO DE ANÁLISE CNPJ - ${analysis.repository_name || "Repositório"}
Data: ${new Date(analysis.created_at).toLocaleDateString("pt-BR")}
Status: ${analysis.status}

RESUMO
======
Total de Arquivos: ${analysis.results?.summary?.total_files || 0}
Total de Ocorrências: ${findings?.length || 0}
Tempo de Análise: ${Math.round((new Date(analysis.completed_at || new Date()).getTime() - new Date(analysis.created_at).getTime()) / 1000)}s

OCORRÊNCIAS ENCONTRADAS
=======================
${
  findings
    ?.map(
      (f, idx) => `
${idx + 1}. Arquivo: ${f.file_path}
   Linha: ${f.line_number}
   Campo: ${f.field_name}
   Sugestão: ${f.suggestion}
`,
    )
    .join("\n") || "Nenhuma ocorrência encontrada"
}

Fim do relatório.
    `

    return new NextResponse(reportContent, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="relatorio-${analysisId}.txt"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
