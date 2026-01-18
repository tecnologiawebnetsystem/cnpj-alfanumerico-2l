import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      finding_id,
      repository_name,
      repository_id,
      client_id,
      assigned_to,
      priority = "medium",
    } = body

    if (!finding_id || !client_id) {
      return NextResponse.json(
        { error: "finding_id e client_id sao obrigatorios" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Buscar o finding com todos os detalhes
    const { data: finding, error: findingError } = await supabase
      .from("findings")
      .select("*")
      .eq("id", finding_id)
      .single()

    if (findingError || !finding) {
      return NextResponse.json(
        { error: "Finding nao encontrado" },
        { status: 404 }
      )
    }

    // Criar a task com todos os detalhes do finding
    const taskData = {
      title: `Corrigir CNPJ: ${finding.file_path?.split("/").pop() || "arquivo"} (linha ${finding.line_number})`,
      description: finding.ai_analysis || finding.suggestion || `Ajustar campo CNPJ em ${finding.file_path}`,
      client_id,
      assigned_to: assigned_to || null,
      status: "pending",
      priority,
      // Detalhes do arquivo
      file_path: finding.file_path,
      line_number: finding.line_number,
      // Codigo
      source_code: finding.code_current,
      suggested_code: finding.code_suggested || finding.ai_suggestion,
      code_before: finding.code_before,
      code_after: finding.code_after,
      // IA
      ai_explanation: finding.ai_analysis,
      ai_confidence: finding.ai_confidence,
      // Referencia
      finding_id: finding.id,
      repository_id: repository_id || finding.repository_id,
      repository_name: repository_name || null,
    }

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert(taskData)
      .select()
      .single()

    if (taskError) {
      console.error("Erro ao criar task:", taskError)
      throw taskError
    }

    // Atualizar o finding para indicar que uma task foi criada
    await supabase
      .from("findings")
      .update({ task_created: true, task_id: task.id })
      .eq("id", finding_id)

    return NextResponse.json({
      success: true,
      task,
      message: "Tarefa criada com sucesso",
    })
  } catch (error: any) {
    console.error("Erro ao criar task do finding:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao criar tarefa" },
      { status: 500 }
    )
  }
}

// Criar tasks em lote a partir de multiplos findings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      finding_ids,
      client_id,
      assigned_to,
      priority = "medium",
    } = body

    if (!finding_ids || !Array.isArray(finding_ids) || finding_ids.length === 0) {
      return NextResponse.json(
        { error: "finding_ids deve ser um array nao vazio" },
        { status: 400 }
      )
    }

    if (!client_id) {
      return NextResponse.json(
        { error: "client_id e obrigatorio" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Buscar todos os findings
    const { data: findings, error: findingsError } = await supabase
      .from("findings")
      .select("*")
      .in("id", finding_ids)

    if (findingsError || !findings || findings.length === 0) {
      return NextResponse.json(
        { error: "Findings nao encontrados" },
        { status: 404 }
      )
    }

    // Criar tasks para cada finding
    const tasksToCreate = findings.map((finding) => ({
      title: `Corrigir CNPJ: ${finding.file_path?.split("/").pop() || "arquivo"} (linha ${finding.line_number})`,
      description: finding.ai_analysis || finding.suggestion || `Ajustar campo CNPJ em ${finding.file_path}`,
      client_id,
      assigned_to: assigned_to || null,
      status: "pending",
      priority,
      file_path: finding.file_path,
      line_number: finding.line_number,
      source_code: finding.code_current,
      suggested_code: finding.code_suggested || finding.ai_suggestion,
      code_before: finding.code_before,
      code_after: finding.code_after,
      ai_explanation: finding.ai_analysis,
      ai_confidence: finding.ai_confidence,
      finding_id: finding.id,
    }))

    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .insert(tasksToCreate)
      .select()

    if (tasksError) {
      console.error("Erro ao criar tasks em lote:", tasksError)
      throw tasksError
    }

    // Atualizar findings para indicar que tasks foram criadas
    await supabase
      .from("findings")
      .update({ task_created: true })
      .in("id", finding_ids)

    return NextResponse.json({
      success: true,
      tasks_created: tasks?.length || 0,
      message: `${tasks?.length || 0} tarefa(s) criada(s) com sucesso`,
    })
  } catch (error: any) {
    console.error("Erro ao criar tasks em lote:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao criar tarefas" },
      { status: 500 }
    )
  }
}
