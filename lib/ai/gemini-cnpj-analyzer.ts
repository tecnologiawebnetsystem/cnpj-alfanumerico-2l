/**
 * Gemini CNPJ Analyzer
 * Analisa individualmente cada finding de CNPJ e gera sugestoes detalhadas
 */

import { generateText } from "ai"

interface Finding {
  file_path: string
  line_number: number
  field_name: string
  context: string
  code_context: string
  code_before_lines: string
  code_after_lines: string
}

interface AIAnalysisResult {
  analysis: string
  suggestion: string
  suggestedCode: string
  confidence: number
  explanation: string
  actionItems: string[]
}

export class GeminiCNPJAnalyzer {
  private apiKey: string
  private model: string
  private temperature: number
  private maxTokens: number

  constructor(options: {
    apiKey: string
    model?: string
    temperature?: number
    maxTokens?: number
  }) {
    this.apiKey = options.apiKey
    this.model = options.model || "gemini-1.5-flash"
    this.temperature = options.temperature ?? 0.3
    this.maxTokens = options.maxTokens || 4096
  }

  /**
   * Analisa um finding individual e gera sugestao detalhada
   */
  async analyzeFinding(finding: Finding): Promise<AIAnalysisResult> {
    const prompt = this.buildPrompt(finding)

    try {
      const { text } = await generateText({
        model: `google/${this.model}`,
        prompt,
        temperature: this.temperature,
        maxTokens: this.maxTokens,
      })

      return this.parseResponse(text)
    } catch (error: any) {
      console.error("Erro ao analisar com Gemini:", error)
      return {
        analysis: "Erro na analise com IA",
        suggestion: finding.context,
        suggestedCode: "",
        confidence: 0,
        explanation: error.message,
        actionItems: ["Verificar manualmente"],
      }
    }
  }

  /**
   * Analisa multiplos findings em lote
   */
  async analyzeFindings(findings: Finding[]): Promise<Map<number, AIAnalysisResult>> {
    const results = new Map<number, AIAnalysisResult>()

    for (let i = 0; i < findings.length; i++) {
      const finding = findings[i]
      
      try {
        const result = await this.analyzeFinding(finding)
        results.set(i, result)
        
        // Pequeno delay para evitar rate limiting
        if (i < findings.length - 1) {
          await this.delay(500)
        }
      } catch (error) {
        console.error(`Erro ao analisar finding ${i}:`, error)
        results.set(i, {
          analysis: "Erro na analise",
          suggestion: "",
          suggestedCode: "",
          confidence: 0,
          explanation: "Falha ao processar com IA",
          actionItems: [],
        })
      }
    }

    return results
  }

  /**
   * Constroi o prompt para analise do finding
   */
  private buildPrompt(finding: Finding): string {
    return `Voce e um especialista em migracao de sistemas para o novo formato de CNPJ alfanumerico do Brasil.

CONTEXTO DO NOVO CNPJ ALFANUMERICO:
- A partir de Julho/2026, o Brasil adotara CNPJs alfanumericos
- Formato antigo: 14 digitos numericos (XX.XXX.XXX/XXXX-XX)
- Formato novo: 12 caracteres alfanumericos (letras maiusculas A-Z e numeros 0-9)
- Exemplo novo: AB1C2D3E4F5G
- O novo formato NAO tera pontos, barras ou tracos
- Validacao sera por algoritmo diferente do atual

CODIGO ENCONTRADO:
Arquivo: ${finding.file_path}
Linha: ${finding.line_number}
Campo/Variavel: ${finding.field_name}

Codigo antes:
\`\`\`
${finding.code_before_lines}
\`\`\`

Linha com o problema:
\`\`\`
${finding.code_context}
\`\`\`

Codigo depois:
\`\`\`
${finding.code_after_lines}
\`\`\`

TAREFA:
Analise este codigo e forneca:

1. ANALISE: Explique qual e o problema e por que este codigo nao funcionara com o novo CNPJ alfanumerico.

2. IMPACTO: Descreva o impacto se nao for corrigido.

3. SOLUCAO: Forneca o codigo corrigido completo que suporte TANTO o formato antigo (durante transicao) QUANTO o novo formato alfanumerico.

4. CONFIANCA: De uma nota de 0 a 1 indicando sua confianca na solucao.

5. ACOES: Liste os passos necessarios para implementar a correcao.

Responda EXATAMENTE neste formato JSON:
{
  "analysis": "explicacao do problema",
  "impact": "descricao do impacto",
  "suggestedCode": "codigo corrigido completo",
  "confidence": 0.95,
  "explanation": "explicacao detalhada da solucao",
  "actionItems": ["acao 1", "acao 2", "acao 3"]
}`
  }

  /**
   * Faz parse da resposta do Gemini
   */
  private parseResponse(response: string): AIAnalysisResult {
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          analysis: parsed.analysis || "",
          suggestion: parsed.impact || "",
          suggestedCode: parsed.suggestedCode || "",
          confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
          explanation: parsed.explanation || "",
          actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
        }
      }

      // Se nao conseguir fazer parse, retornar resposta bruta
      return {
        analysis: response.substring(0, 500),
        suggestion: "",
        suggestedCode: "",
        confidence: 0.5,
        explanation: response,
        actionItems: [],
      }
    } catch (error) {
      return {
        analysis: "Erro ao processar resposta da IA",
        suggestion: "",
        suggestedCode: "",
        confidence: 0,
        explanation: response.substring(0, 1000),
        actionItems: [],
      }
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

/**
 * Cria uma instancia do analyzer com configuracoes do banco
 */
export async function createGeminiAnalyzer(clientId: string): Promise<GeminiCNPJAnalyzer | null> {
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data: settings } = await supabase
      .from("ai_provider_settings")
      .select("*")
      .eq("client_id", clientId)
      .eq("provider", "gemini")
      .eq("is_active", true)
      .single()

    if (!settings || !settings.api_key) {
      console.log("Configuracoes de IA nao encontradas ou inativas para cliente:", clientId)
      return null
    }

    return new GeminiCNPJAnalyzer({
      apiKey: settings.api_key,
      model: settings.model_name,
      temperature: settings.temperature,
      maxTokens: settings.max_tokens,
    })
  } catch (error) {
    console.error("Erro ao criar Gemini analyzer:", error)
    return null
  }
}
