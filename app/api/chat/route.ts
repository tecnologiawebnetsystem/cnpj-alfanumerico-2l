import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-actions"
import { streamText } from "ai"

// POST /api/chat - Chatbot de CNPJ Alfanumérico
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { messages } = await request.json()

    const systemPrompt = `Você é um assistente especializado em CNPJ Alfanumérico brasileiro.

CONTEXTO:
O CNPJ alfanumérico é uma nova formatação do CNPJ que permite o uso de letras e números, expandindo significativamente a capacidade de cadastros.

FORMATO:
- Antigo (numérico): 14 dígitos (XX.XXX.XXX/XXXX-XX)
- Novo (alfanumérico): 14 caracteres alfanuméricos (XX.XXX.XXX/XXXX-XX)
- Caracteres permitidos: 0-9, A-Z (exceto I, O, S, Z para evitar confusão)
- Algoritmo de validação: Módulo 97 (similar ao IBAN)

SUAS CAPACIDADES:
1. Explicar o que é CNPJ alfanumérico
2. Explicar as diferenças entre CNPJ numérico e alfanumérico
3. Validar CNPJs (tanto numéricos quanto alfanuméricos)
4. Explicar o algoritmo de validação
5. Ajudar com migração de sistemas
6. Responder dúvidas técnicas sobre implementação

VALIDAÇÃO DE CNPJ:
Quando o usuário pedir para validar um CNPJ, você deve:
1. Verificar o formato (14 caracteres)
2. Remover pontuação
3. Aplicar o algoritmo Módulo 97
4. Retornar se é válido ou inválido

IMPORTANTE:
- Seja preciso e técnico
- Use exemplos quando apropriado
- Se não souber algo, admita
- Foque apenas em CNPJ alfanumérico

Responda de forma clara, objetiva e profissional.`

    const result = await streamText({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
      maxTokens: 1000,
    })

    return result.toUIMessageStreamResponse()
  } catch (error: any) {
    console.error(" Error in chat:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
