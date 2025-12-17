import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

const WIKI_CONTEXT = `
Você é um assistente IA especializado no sistema CNPJ Alfanumérico da ACT Digital.
Responda APENAS perguntas sobre este sistema. Se a pergunta não for relacionada, diga educadamente que só pode responder sobre o sistema CNPJ Alfanumérico.

INFORMAÇÕES DO SISTEMA:
- Sistema completo para migração de CNPJ numérico para alfanumérico
- Análise automática de código e banco de dados
- Validação de CNPJ em formato novo (alfanumérico A-Z, 0-9)
- Geração de relatórios em PDF, CSV e JSON
- Integração com GitHub e Azure DevOps
- 3 perfis: Super Admin, Admin Cliente e Desenvolvedor
- Chatbot inteligente com Gemini IA
- Geração automática de código corrigido
- Priorização inteligente de findings
- Dashboard com métricas e analytics

FUNCIONALIDADES PRINCIPAIS:
- Validador online de CNPJ (numérico e alfanumérico)
- Exemplos de código em 11+ linguagens
- Análise de repositórios Git
- Clonagem local para análise rápida
- API REST completa com OpenAPI 3.0
- Sistema de tasks Kanban
- Relatórios detalhados
`

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: "google/gemini-2.5-pro",
      prompt: `${WIKI_CONTEXT}\n\nPergunta do usuário: ${message}\n\nResponda de forma clara, objetiva e em português.`,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("[v0] Error in wiki chat:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
