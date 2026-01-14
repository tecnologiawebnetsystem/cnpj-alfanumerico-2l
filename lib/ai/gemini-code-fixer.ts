import { generateText } from "ai"

export interface CodeFixResult {
  original_code: string
  fixed_code: string
  explanation: string
  file_path: string
  line_number: number
  confidence: number
  backup_needed: boolean
}

export async function generateCodeFix(finding: any): Promise<CodeFixResult> {
  try {
    const prompt = `Você é um desenvolvedor especialista. Analise este código e gere a versão CORRIGIDA para suportar CNPJ alfanumérico (14 caracteres com letras A-Z e números 0-9).

ARQUIVO: ${finding.file_path}
LINHA: ${finding.line_number}
CAMPO: ${finding.field_name}
CÓDIGO ATUAL:
${finding.context}

INSTRUÇÕES:
1. Gere o código COMPLETO já corrigido
2. Mantenha a indentação e estilo original
3. Altere validações de regex para aceitar [A-Z0-9]{14}
4. Altere VARCHAR(14) para VARCHAR(18) se for SQL
5. Explique as mudanças em português

Responda em JSON com: original_code, fixed_code, explanation, confidence (0-100), backup_needed (true/false)`

    const { text } = await generateText({
      model: "google/gemini-2.5-pro",
      prompt,
      temperature: 0.2,
      maxTokens: 800,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("Invalid JSON response")

    const result = JSON.parse(jsonMatch[0])
    return {
      ...result,
      file_path: finding.file_path,
      line_number: finding.line_number,
    }
  } catch (error) {
    console.error(" Error generating code fix:", error)
    return {
      original_code: finding.context,
      fixed_code: finding.context.replace(/VARCHAR$$14$$/gi, "VARCHAR(18)"),
      explanation: "Correção automática aplicada",
      file_path: finding.file_path,
      line_number: finding.line_number,
      confidence: 50,
      backup_needed: true,
    }
  }
}
