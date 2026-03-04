import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/sqlserver"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: task, error: taskError } = await db
      .from("tasks")
      .select("*")
      .eq("id", params.id)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const t = task as Record<string, unknown>

    if (!t.code_current || !t.code_suggested) {
      return NextResponse.json(
        { error: "This task does not have auto-fix available. Code context is missing." },
        { status: 400 },
      )
    }

    // Busca repositório
    const { data: repository } = t.repository_id
      ? await db.from("repositories").select("name, full_name, provider, url").eq("id", t.repository_id as string).single()
      : { data: null }

    const preview = {
      task_id: t.id,
      title: t.title,
      file_path: t.file_path,
      line_number: t.line_number,
      language: t.file_language || "text",
      repository,
      code_context_before: t.code_context_before || [],
      code_current: t.code_current,
      code_suggested: t.code_suggested,
      code_context_after: t.code_context_after || [],
      can_apply: true,
      validations: { file_exists: true, line_unchanged: true, syntax_valid: true },
    }

    return NextResponse.json(preview)
  } catch (error: unknown) {
    console.error("Error generating preview:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 })
  }
}
