import { generateText } from "ai"

export async function generateFixedCode(finding: any, fileContent: string) {
  try {
    const { text } = await generateText({
      model: "google/gemini-2.5-pro",
      prompt: `Gere o código corrigido para este achado de CNPJ:

Arquivo: ${finding.file_path}
Linha: ${finding.line_number}
CNPJ Encontrado: ${finding.cnpj_value}
Contexto: ${finding.context}

Código Original:
${fileContent}

IMPORTANTE:
- Substitua o CNPJ hardcoded por uma variável de ambiente ou config
- Mantenha a compatibilidade com formato antigo E novo (alfanumérico)
- Adicione comentários explicativos
- Sugira nome de variável apropriado

Responda APENAS com o código corrigido, sem explicações adicionais.`,
    })

    return text
  } catch (error) {
    console.error("Error generating fixed code:", error)
    return null
  }
}

export async function explainImpact(finding: any, dependencies: string[]) {
  try {
    const { text } = await generateText({
      model: "google/gemini-2.5-pro",
      prompt: `Explique o impacto de mudar este CNPJ:

Arquivo: ${finding.file_path}
Linha: ${finding.line_number}
Dependências: ${dependencies.join(", ")}

Analise:
1. Quais outros arquivos serão afetados?
2. Há risco de quebrar funcionalidades?
3. Precisa de testes específicos?
4. Recomendações de segurança

Seja conciso e técnico.`,
    })

    return text
  } catch (error) {
    console.error("Error explaining impact:", error)
    return null
  }
}

export async function suggestTests(finding: any, language: string) {
  try {
    const { text } = await generateText({
      model: "google/gemini-2.5-pro",
      prompt: `Sugira testes unitários para essa correção de CNPJ:

Linguagem: ${language}
Arquivo: ${finding.file_path}
Função/Classe: ${finding.context}

Gere código de teste que:
- Valide formato antigo (numérico)
- Valide formato novo (alfanumérico)
- Teste edge cases
- Use framework padrão da linguagem

Responda APENAS com o código do teste.`,
    })

    return text
  } catch (error) {
    console.error("Error suggesting tests:", error)
    return null
  }
}
