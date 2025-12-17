import { generateText } from "ai"

export async function prioritizeTasks(tasks: any[]) {
  try {
    const tasksStr = tasks
      .map((t) => `ID: ${t.id}, Title: ${t.title}, Priority: ${t.priority}, File: ${t.file_path}`)
      .join("\n")

    const { text } = await generateText({
      model: "google/gemini-2.5-pro",
      prompt: `Você é um assistente IA para Admins de Cliente. Analise essas tarefas e sugira a ordem de priorização ideal:

${tasksStr}

Considere:
- Criticidade do sistema
- Dependências entre arquivos
- Facilidade de correção
- Impacto no negócio

Responda com a lista de IDs ordenados por prioridade, separados por vírgula, seguido de uma breve explicação (máximo 3 frases).`,
    })

    return text
  } catch (error) {
    console.error("Error prioritizing tasks:", error)
    return null
  }
}

export async function generateJiraTasks(findings: any[], sprint: string) {
  try {
    const findingsStr = findings
      .map((f) => `File: ${f.file_path}, Line: ${f.line_number}, CNPJ: ${f.cnpj_value}`)
      .join("\n")

    const { text } = await generateText({
      model: "google/gemini-2.5-pro",
      prompt: `Gere tasks Jira/Azure DevOps para esses achados de CNPJ:

Sprint: ${sprint}
Findings:
${findingsStr}

Para cada finding, crie uma task com:
- Título conciso
- Descrição técnica
- Estimativa de pontos (1-13 Fibonacci)
- Labels sugeridas

Formato: JSON array com campos: title, description, points, labels`,
    })

    return JSON.parse(text)
  } catch (error) {
    console.error("Error generating Jira tasks:", error)
    return null
  }
}

export async function analyzeBusinessImpact(findings: any[]) {
  try {
    const { text } = await generateText({
      model: "google/gemini-2.5-pro",
      prompt: `Analise o impacto de negócio desses ${findings.length} CNPJs encontrados:

Locais: ${findings.map((f) => f.file_path).join(", ")}

Identifique:
1. Riscos de compliance/legal (LGPD, Receita Federal)
2. Impacto em integrações críticas
3. Módulos mais afetados
4. Urgência de correção (alta/média/baixa)

Seja direto e objetivo.`,
    })

    return text
  } catch (error) {
    console.error("Error analyzing business impact:", error)
    return null
  }
}
