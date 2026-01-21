import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysis_id, client_id } = body

    if (!analysis_id || !client_id) {
      return NextResponse.json({ error: "analysis_id e client_id obrigatorios" }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar findings da analise que ainda nao tem tasks
    const { data: findings, error: findingsError } = await supabase
      .from("findings")
      .select("*")
      .eq("analysis_id", analysis_id)
      .eq("task_created", false)
      .is("task_id", null)

    if (findingsError) throw findingsError

    if (!findings || findings.length === 0) {
      return NextResponse.json({
        success: true,
        tasks_created: 0,
        message: "Nenhum finding sem task encontrado",
      })
    }

    // Buscar informacoes da analise
    const { data: analysis } = await supabase
      .from("analyses")
      .select("*, repositories(name, full_name)")
      .eq("id", analysis_id)
      .single()

    const repositoryName = analysis?.repositories?.name || analysis?.repositories?.full_name || "Desconhecido"

    // Criar tasks para cada finding
    const tasksToCreate = findings.map((finding: any) => ({
      client_id: client_id,
      analysis_id: analysis_id,
      finding_id: finding.id,
      title: `Atualizar campo CNPJ: ${finding.field_name || "campo"} em ${finding.file_path?.split("/").pop() || "arquivo"}`,
      description: generateTaskDescription(finding, repositoryName),
      repository_name: repositoryName,
      file_path: finding.file_path,
      line_number: finding.line_number,
      code_current: finding.context || finding.code_context,
      code_before: finding.code_before_lines ? [finding.code_before_lines] : [],
      code_after: finding.code_after_lines ? [finding.code_after_lines] : [],
      code_suggested: finding.ai_suggestion || finding.suggestion,
      ai_suggestion: finding.ai_suggestion,
      ai_explanation: finding.ai_analysis,
      ai_confidence: finding.ai_confidence,
      status: "pending",
      priority: determinePriority(finding),
      estimated_hours: estimateHours(finding),
      created_at: new Date().toISOString(),
    }))

    // Inserir tasks
    const { data: createdTasks, error: tasksError } = await supabase
      .from("tasks")
      .insert(tasksToCreate)
      .select("id")

    if (tasksError) throw tasksError

    // Atualizar findings com task_id
    if (createdTasks && createdTasks.length > 0) {
      for (let i = 0; i < findings.length; i++) {
        if (createdTasks[i]) {
          await supabase
            .from("findings")
            .update({ 
              task_id: createdTasks[i].id,
              task_created: true 
            })
            .eq("id", findings[i].id)
        }
      }
    }

    return NextResponse.json({
      success: true,
      tasks_created: createdTasks?.length || 0,
      repository: repositoryName,
    })
  } catch (error: any) {
    console.error("Erro ao gerar tasks:", error)
    return NextResponse.json({ error: error.message || "Erro ao gerar tasks" }, { status: 500 })
  }
}

function generateTaskDescription(finding: any, repositoryName: string): string {
  const parts = [
    `**Repositorio:** ${repositoryName}`,
    `**Arquivo:** ${finding.file_path || "N/A"}`,
    `**Linha:** ${finding.line_number || "N/A"}`,
    `**Campo Encontrado:** ${finding.field_name || "N/A"}`,
    "",
    "### Contexto do Codigo",
    "```",
    finding.code_before_lines || "",
    finding.context || finding.code_context || "",
    finding.code_after_lines || "",
    "```",
    "",
    "### Acao Necessaria",
    finding.action_required || "Atualizar para suportar novo formato CNPJ alfanumerico (12 caracteres)",
  ]

  if (finding.ai_analysis) {
    parts.push("", "### Analise da IA", finding.ai_analysis)
  }

  if (finding.ai_suggestion) {
    parts.push("", "### Sugestao da IA", "```", finding.ai_suggestion, "```")
  }

  return parts.join("\n")
}

function determinePriority(finding: any): string {
  // Prioridade alta se for input/validation
  if (finding.is_input || finding.is_validation) return "high"
  
  // Prioridade media se for database
  if (finding.is_database) return "medium"
  
  // Prioridade baseada na confianca da IA
  if (finding.ai_confidence && finding.ai_confidence > 0.8) return "high"
  if (finding.ai_confidence && finding.ai_confidence > 0.5) return "medium"
  
  return "medium"
}

function estimateHours(finding: any): number {
  // Estimativa baseada no tipo de alteracao
  if (finding.is_database) return 8 // Database changes are more complex
  if (finding.is_validation) return 4 // Validation logic
  if (finding.is_input) return 2 // Input fields
  if (finding.is_output) return 1 // Output/display only
  
  // Default based on AI confidence
  if (finding.ai_confidence && finding.ai_confidence > 0.8) return 2
  if (finding.ai_confidence && finding.ai_confidence > 0.5) return 4
  
  return 4 // Default 4 hours
}
