import { generateText } from "ai"

export interface GeminiAnalysisResult {
  summary: string
  severity: "critical" | "high" | "medium" | "low"
  recommendation: string
  estimated_hours: number // renamed from estimated_effort to estimated_hours for clarity
  business_impact: string
  technical_solution: string
  account_name: string // added account name
  repository_name: string // added repository name
}

export async function analyzeWithGemini(
  cnpjFinding: any,
  accountName: string,
  repositoryName: string,
): Promise<GeminiAnalysisResult> {
  try {
    const prompt = `Você é um especialista em análise de sistemas e migração de dados.
    
Analise o seguinte achado de CNPJ alfanumérico:
- Conta/Organização: ${accountName}
- Repositório: ${repositoryName}
- Arquivo: ${cnpjFinding.filePath}
- Linha: ${cnpjFinding.lineNumber}
- Campo: ${cnpjFinding.fieldName}
- Código encontrado: ${cnpjFinding.code}

Forneça uma análise em JSON com:
1. summary: resumo executivo (1-2 linhas)
2. severity: nível de severidade (critical/high/medium/low)
3. recommendation: recomendação específica de ação
4. estimated_hours: QUANTIDADE DE HORAS estimadas para corrigir (número decimal, ex: 2.5)
5. business_impact: impacto no negócio
6. technical_solution: solução técnica recomendada em português
7. account_name: "${accountName}"
8. repository_name: "${repositoryName}"

Responda APENAS com JSON válido, sem marcadores de código.`

    const { text } = await generateText({
      model: "google/gemini-2.5-flash-image", // Modelo grátis mais recente via AI Gateway
      prompt,
      temperature: 0.3,
      maxTokens: 600,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Invalid JSON response from Gemini")
    }

    const analysis = JSON.parse(jsonMatch[0]) as GeminiAnalysisResult
    return analysis
  } catch (error) {
    console.error(" Error analyzing with Gemini:", error)
    return {
      summary: "Campo CNPJ requer atualização para formato alfanumérico",
      severity: "high",
      recommendation: "Atualizar validação e tamanho do campo",
      estimated_hours: 4,
      business_impact: "Alto - impacto em processamento de novos CNPJs",
      technical_solution: "Alterar VARCHAR(14) para VARCHAR(18) e atualizar regexes",
      account_name: accountName,
      repository_name: repositoryName,
    }
  }
}

export async function generateSmartReport(findings: any[]): Promise<string> {
  try {
    const prompt = `Você é um consultor técnico especializado em compliance de dados.

Tenho ${findings.length} achados de CNPJ alfanumérico em diferentes repositórios:

${findings
  .slice(0, 5)
  .map((f) => `- ${f.file}: campo ${f.fieldName} na linha ${f.line}`)
  .join("\n")}

${findings.length > 5 ? `... e mais ${findings.length - 5} achados` : ""}

Gere um relatório executivo em PORTUGUÊS com:
1. Resumo executivo (3-4 parágrafos)
2. Prioridades de ação
3. Riscos se não corrigido
4. Timeline recomendada
5. ROI da implementação

Seja conciso e objetivo.`

    const { text } = await generateText({
      model: "google/gemini-2.5-pro",
      prompt,
      temperature: 0.5,
      maxTokens: 1200,
    })

    return text
  } catch (error) {
    console.error(" Error generating smart report:", error)
    return "Relatório não disponível no momento"
  }
}
