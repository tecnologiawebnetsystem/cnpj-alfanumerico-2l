import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { message, analysisId } = await req.json()

    if (!message || !analysisId) {
      return NextResponse.json({ error: "Message and analysisId required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: analysis } = await supabase.from("analyses").select("*, findings(*)").eq("id", analysisId).single()

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    const findingsCount = analysis.findings?.length || 0
    const filesCount = new Set(analysis.findings?.map((f: any) => f.file_path)).size

    const systemPrompt = `Você é um assistente IA especializado em análise de CNPJ alfanumérico.

CONTEXTO DA ANÁLISE:
- Total de arquivos: ${filesCount}
- Total de achados: ${findingsCount}
- Status: ${analysis.status}
- Repositório: ${analysis.repository_name || "N/A"}

Responda perguntas sobre:
- Prioridades de correção
- Estimativas de tempo
- Planos de ação
- Riscos e impactos
- Código específico

Seja conciso, técnico e em PORTUGUÊS.`

    const { text } = await generateText({
      model: "google/gemini-2.5-pro",
      prompt: `${systemPrompt}\n\nPERGUNTA DO USUÁRIO: ${message}`,
      temperature: 0.6,
      maxTokens: 600,
    })

    return NextResponse.json({
      response: text,
      context: {
        findingsCount,
        filesCount,
        status: analysis.status,
      },
    })
  } catch (error: any) {
    console.error(" Chat error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
