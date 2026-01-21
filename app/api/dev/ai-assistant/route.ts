import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      message,
      task_id,
      task_title,
      task_code,
      suggested_code,
      file_path,
      history = [],
    } = body

    // Build context
    let context = `Voce e um assistente de codigo especializado em ajudar desenvolvedores a entender e corrigir problemas em codigo.
Voce deve responder em portugues brasileiro de forma clara e objetiva.
Quando gerar codigo, sempre use blocos de codigo markdown com a linguagem especificada.

`

    if (task_title) {
      context += `TAREFA ATUAL: ${task_title}\n`
    }

    if (file_path) {
      context += `ARQUIVO: ${file_path}\n`
    }

    if (task_code) {
      context += `\nCODIGO ATUAL (COM PROBLEMA):\n\`\`\`\n${task_code}\n\`\`\`\n`
    }

    if (suggested_code) {
      context += `\nCODIGO SUGERIDO (CORRECAO):\n\`\`\`\n${suggested_code}\n\`\`\`\n`
    }

    // Build messages
    const messages: { role: "user" | "assistant"; content: string }[] = [
      { role: "user", content: context },
    ]

    // Add history
    for (const msg of history) {
      messages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })
    }

    // Add current message
    messages.push({
      role: "user",
      content: message,
    })

    const { text } = await generateText({
      model: "google/gemini-2.0-flash-001",
      messages,
      temperature: 0.7,
      maxTokens: 2000,
    })

    return NextResponse.json({ response: text })
  } catch (error: any) {
    console.error("Error in dev AI assistant:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao processar mensagem" },
      { status: 500 }
    )
  }
}
