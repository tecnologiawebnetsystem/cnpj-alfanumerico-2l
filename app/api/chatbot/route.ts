import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "edge"
export const dynamic = "force-dynamic"

// Intent types for chatbot
type Intent = 
  | "list_pending_tasks"
  | "list_my_tasks"
  | "list_by_repository"
  | "list_by_priority"
  | "task_details"
  | "task_count"
  | "greeting"
  | "help"
  | "unknown"

// Detect user intent from message
function detectIntent(message: string): Intent {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.match(/ol[aá]|oi|bom dia|boa tarde|boa noite|hey|hello/)) {
    return "greeting"
  }
  
  if (lowerMessage.match(/ajuda|help|como|o que voc[eê] pode fazer|comandos/)) {
    return "help"
  }
  
  if (lowerMessage.match(/quantas? tarefas?|n[uú]mero|total|contagem|count/)) {
    return "task_count"
  }
  
  if (lowerMessage.match(/pendentes?|pending|aguardando|a fazer/)) {
    return "list_pending_tasks"
  }
  
  if (lowerMessage.match(/minhas? tarefas?|meu trabalho|my tasks/)) {
    return "list_my_tasks"
  }
  
  if (lowerMessage.match(/reposit[oó]rio|repo|projeto|project/)) {
    return "list_by_repository"
  }
  
  if (lowerMessage.match(/prioridade|urgente|alta|m[eé]dia|baixa|priority/)) {
    return "list_by_priority"
  }
  
  if (lowerMessage.match(/detalhes?|ver tarefa|mostrar|info|task #\d+/)) {
    return "task_details"
  }
  
  return "unknown"
}

// Extract repository name from message
function extractRepositoryName(message: string): string | null {
  const match = message.match(/reposit[oó]rio\s+([a-z0-9-_]+)|repo\s+([a-z0-9-_]+)/i)
  return match ? (match[1] || match[2]) : null
}

// Extract task ID from message
function extractTaskId(message: string): string | null {
  const match = message.match(/task #?([a-f0-9-]{36})|tarefa #?([a-f0-9-]{36})/i)
  return match ? (match[1] || match[2]) : null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user details with client_id
    const { data: userData } = await supabase
      .from("users")
      .select("id, name, email, role, client_id")
      .eq("id", user.id)
      .single()
    
    if (!userData || !userData.client_id) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    const { message, sessionId } = await request.json()
    
    console.log("[v0] Chatbot - User message:", message)
    console.log("[v0] Chatbot - User:", userData.name, "Client ID:", userData.client_id)
    
    // Detect user intent
    const intent = detectIntent(message)
    console.log("[v0] Chatbot - Detected intent:", intent)
    
    // Save user message to history
    await supabase.from("ai_chat_history").insert({
      user_id: userData.id,
      client_id: userData.client_id,
      session_id: sessionId,
      role: "user",
      content: message,
      metadata: { intent }
    })
    
    let response: string
    let tasks: any[] = []
    let metadata: any = {}
    
    // Handle different intents
    switch (intent) {
      case "greeting":
        response = `Olá ${userData.name}! 👋 Sou seu assistente de tarefas. Posso te ajudar a:\n\n• Ver suas tarefas pendentes\n• Filtrar por repositório\n• Verificar prioridades\n• Obter detalhes de tarefas específicas\n\nO que você precisa hoje?`
        break
        
      case "help":
        response = `Aqui está o que posso fazer por você:\n\n📋 **Listar tarefas:**\n• "Minhas tarefas pendentes"\n• "Tarefas do repositório card-brazil-v2"\n• "Tarefas de alta prioridade"\n\n📊 **Estatísticas:**\n• "Quantas tarefas tenho?"\n• "Resumo das minhas tarefas"\n\n🔍 **Detalhes:**\n• "Ver tarefa #abc123"\n• "Detalhes da tarefa X"\n\nComo posso ajudar?`
        break
        
      case "task_count":
        // Get task counts
        const { data: counts } = await supabase
          .from("tasks")
          .select("status, priority")
          .eq("client_id", userData.client_id)
          .eq("assigned_to", userData.id)
        
        if (!counts || counts.length === 0) {
          response = "Você não tem tarefas atribuídas no momento. 🎉"
        } else {
          const pending = counts.filter(t => t.status === "pendente").length
          const inProgress = counts.filter(t => t.status === "em_progresso").length
          const highPriority = counts.filter(t => t.priority === "alta").length
          
          response = `📊 **Suas tarefas:**\n\n• Total: ${counts.length}\n• Pendentes: ${pending}\n• Em Progresso: ${inProgress}\n• Alta Prioridade: ${highPriority}\n\nQuer ver os detalhes?`
        }
        break
        
      case "list_pending_tasks":
      case "list_my_tasks":
        // Get user's tasks
        const { data: userTasks } = await supabase
          .from("tasks")
          .select("id, title, repository_name, priority, status, due_date, line_number, file_path")
          .eq("client_id", userData.client_id)
          .eq("assigned_to", userData.id)
          .in("status", ["pendente", "em_progresso"])
          .order("priority", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(10)
        
        if (!userTasks || userTasks.length === 0) {
          response = "Você não tem tarefas pendentes! 🎉 Tudo em dia!"
        } else {
          tasks = userTasks
          response = `📋 **Suas tarefas (${userTasks.length}):**\n\n${userTasks.map((t, i) => 
            `${i+1}. **${t.title}**\n   📁 ${t.repository_name}\n   🔹 ${t.priority} | ${t.status}\n   📍 ${t.file_path}:${t.line_number}`
          ).join("\n\n")}\n\nQuer ver detalhes de alguma tarefa?`
          metadata = { taskCount: userTasks.length }
        }
        break
        
      case "list_by_repository":
        const repoName = extractRepositoryName(message)
        
        if (!repoName) {
          // List repositories with task counts
          const { data: repos } = await supabase
            .from("tasks")
            .select("repository_name")
            .eq("client_id", userData.client_id)
            .eq("assigned_to", userData.id)
          
          if (!repos || repos.length === 0) {
            response = "Você não tem tarefas em nenhum repositório."
          } else {
            const repoCount = repos.reduce((acc: any, t: any) => {
              acc[t.repository_name] = (acc[t.repository_name] || 0) + 1
              return acc
            }, {})
            
            response = `📦 **Seus repositórios:**\n\n${Object.entries(repoCount).map(([repo, count]) => 
              `• ${repo}: ${count} tarefa(s)`
            ).join("\n")}\n\nDigite "tarefas do repositório [nome]" para ver detalhes.`
          }
        } else {
          // Get tasks for specific repository
          const { data: repoTasks } = await supabase
            .from("tasks")
            .select("id, title, priority, status, line_number, file_path")
            .eq("client_id", userData.client_id)
            .eq("assigned_to", userData.id)
            .ilike("repository_name", `%${repoName}%`)
            .order("priority", { ascending: false })
            .limit(10)
          
          if (!repoTasks || repoTasks.length === 0) {
            response = `Não encontrei tarefas no repositório "${repoName}".`
          } else {
            tasks = repoTasks
            response = `📦 **Tarefas do ${repoName} (${repoTasks.length}):**\n\n${repoTasks.map((t, i) => 
              `${i+1}. **${t.title}**\n   🔹 ${t.priority} | ${t.status}\n   📍 ${t.file_path}:${t.line_number}`
            ).join("\n\n")}`
            metadata = { repository: repoName, taskCount: repoTasks.length }
          }
        }
        break
        
      case "list_by_priority":
        const priority = message.match(/alta|high/i) ? "alta" : 
                        message.match(/m[eé]dia|medium/i) ? "média" : "baixa"
        
        const { data: priorityTasks } = await supabase
          .from("tasks")
          .select("id, title, repository_name, status, file_path, line_number")
          .eq("client_id", userData.client_id)
          .eq("assigned_to", userData.id)
          .eq("priority", priority)
          .limit(10)
        
        if (!priorityTasks || priorityTasks.length === 0) {
          response = `Você não tem tarefas de prioridade ${priority}.`
        } else {
          tasks = priorityTasks
          response = `🔥 **Tarefas de prioridade ${priority} (${priorityTasks.length}):**\n\n${priorityTasks.map((t, i) => 
            `${i+1}. **${t.title}**\n   📁 ${t.repository_name}\n   📍 ${t.file_path}:${t.line_number}`
          ).join("\n\n")}`
          metadata = { priority, taskCount: priorityTasks.length }
        }
        break
        
      case "task_details":
        const taskId = extractTaskId(message)
        
        if (!taskId) {
          response = "Por favor, forneça o ID da tarefa. Exemplo: 'ver tarefa #abc123'"
        } else {
          const { data: taskDetail } = await supabase
            .from("tasks")
            .select("*")
            .eq("id", taskId)
            .eq("client_id", userData.client_id)
            .single()
          
          if (!taskDetail) {
            response = "Tarefa não encontrada."
          } else {
            response = `📋 **Detalhes da Tarefa:**\n\n**Título:** ${taskDetail.title}\n**Repositório:** ${taskDetail.repository_name}\n**Arquivo:** ${taskDetail.file_path}\n**Linha:** ${taskDetail.line_number}\n**Status:** ${taskDetail.status}\n**Prioridade:** ${taskDetail.priority}\n\n**Descrição:**\n${taskDetail.description || "Sem descrição"}\n\n**Código Atual:**\n\`\`\`\n${taskDetail.code_current}\n\`\`\`\n\n**Código Sugerido:**\n\`\`\`\n${taskDetail.code_suggested}\n\`\`\``
            metadata = { taskId: taskDetail.id }
          }
        }
        break
        
      default:
        response = "Desculpe, não entendi sua solicitação. Digite 'ajuda' para ver o que posso fazer."
    }
    
    console.log("[v0] Chatbot - Response:", response.substring(0, 100) + "...")
    
    // Save bot response to history
    await supabase.from("ai_chat_history").insert({
      user_id: userData.id,
      client_id: userData.client_id,
      session_id: sessionId,
      role: "assistant",
      content: response,
      metadata: { intent, ...metadata }
    })
    
    return NextResponse.json({
      message: response,
      intent,
      tasks,
      metadata
    })
    
  } catch (error: any) {
    console.error("[v0] Chatbot error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")
    
    // Get chat history
    const { data: history } = await supabase
      .from("ai_chat_history")
      .select("*")
      .eq("user_id", user.id)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(50)
    
    return NextResponse.json({ history: history || [] })
    
  } catch (error: any) {
    console.error("[v0] Chatbot history error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
