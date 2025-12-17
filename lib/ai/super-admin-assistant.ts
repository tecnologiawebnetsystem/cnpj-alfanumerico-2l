import { generateText } from "ai"

export async function generateDashboardInsights(stats: any) {
  try {
    const { text } = await generateText({
      model: "google/gemini-2.5-pro",
      prompt: `Você é um assistente IA para Super Admins. Analise essas estatísticas e forneça insights estratégicos:

Stats:
- Total de Clientes: ${stats.totalClients}
- Clientes Ativos: ${stats.activeClients}
- Licenças Expiradas: ${stats.expiredLicenses}
- Total de Usuários: ${stats.totalUsers}
- Total de Análises: ${stats.totalAnalyses}
- Repositórios: ${stats.totalRepositories}

Forneça:
1. Principais alertas (se houver)
2. Recomendações de ação
3. Tendências observadas
4. Oportunidades de crescimento

Seja objetivo e direto ao ponto.`,
    })

    return text
  } catch (error) {
    console.error("Error generating insights:", error)
    return null
  }
}

export async function predictCNPJCount(repositoryInfo: any) {
  try {
    const { text } = await generateText({
      model: "google/gemini-2.5-pro",
      prompt: `Com base nessas informações do repositório, preveja quantos CNPJs provavelmente serão encontrados:

Repositório: ${repositoryInfo.name}
Linguagem Principal: ${repositoryInfo.language}
Tamanho: ${repositoryInfo.size} KB
Arquivos: ${repositoryInfo.fileCount}

Responda APENAS com um número e uma breve justificativa (máximo 2 frases).`,
    })

    return text
  } catch (error) {
    console.error("Error predicting CNPJ count:", error)
    return null
  }
}

export async function calculateROI(analysisData: any) {
  try {
    const { text } = await generateText({
      model: "google/gemini-2.5-pro",
      prompt: `Calcule o ROI desta correção de CNPJ:

- CNPJs encontrados: ${analysisData.totalFindings}
- Horas estimadas: ${analysisData.estimatedHours}
- Custo hora do dev: R$ 100/hora

Calcule:
1. Custo total da correção
2. Economia estimada (considere conformidade legal, bugs evitados)
3. ROI percentual
4. Payback em meses

Formate em JSON com esses campos: cost, savings, roi, payback`,
    })

    return JSON.parse(text)
  } catch (error) {
    console.error("Error calculating ROI:", error)
    return null
  }
}
