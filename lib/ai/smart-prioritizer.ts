import { generateText } from "ai"

export interface PriorityScore {
  finding_id: string
  priority_score: number
  priority_level: "urgent" | "high" | "medium" | "low"
  reason: string
  order: number
  estimated_hours: number
  dependencies: string[]
  recommended_sprint: number
}

export async function prioritizeFindings(findings: any[]): Promise<PriorityScore[]> {
  try {
    const findingsSummary = findings.slice(0, 20).map((f, idx) => ({
      id: idx,
      file: f.file_path,
      field: f.field_name,
      type: f.field_type,
      line: f.line_number,
    }))

    const prompt = `Você é um tech lead experiente. Priorize estes ${findings.length} achados de CNPJ para correção:

${JSON.stringify(findingsSummary, null, 2)}

Analise:
1. Criticidade do sistema (ex: pagamentos > relatórios)
2. Facilidade de correção
3. Impacto em produção
4. Dependências entre arquivos

Para cada achado, retorne JSON array com:
- finding_id: número do achado
- priority_score: 0-100
- priority_level: urgent/high/medium/low
- reason: por que esta prioridade
- order: ordem de correção (1, 2, 3...)
- estimated_hours: horas estimadas
- dependencies: array de arquivos dependentes
- recommended_sprint: qual sprint corrigir (1, 2, 3)

Responda APENAS com JSON array válido.`

    const { text } = await generateText({
      model: "google/gemini-2.5-pro",
      prompt,
      temperature: 0.4,
      maxTokens: 1500,
    })

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error("Invalid JSON response")

    const priorities = JSON.parse(jsonMatch[0]) as PriorityScore[]
    return priorities
  } catch (error) {
    console.error(" Error prioritizing findings:", error)
    return findings.map((f, idx) => ({
      finding_id: String(idx),
      priority_score: 50,
      priority_level: "medium" as const,
      reason: "Priorização padrão aplicada",
      order: idx + 1,
      estimated_hours: 2,
      dependencies: [],
      recommended_sprint: 1,
    }))
  }
}
