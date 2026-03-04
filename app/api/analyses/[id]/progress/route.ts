import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/sqlserver"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Verifica se é batch
    const { data: batchData } = await db.from("batch_analyses").select("*").eq("id", id).maybeSingle()

    if (batchData) {
      const { data: analyses } = await db
        .from("analyses")
        .select("id, status, progress, error_message")
        .eq("batch_id", id)

      const arr = Array.isArray(analyses) ? analyses : analyses ? [analyses] : []

      if (arr.length > 0) {
        const total = arr.length
        const completed = arr.filter((a: Record<string, unknown>) => a.status === "completed").length
        const processing = arr.filter((a: Record<string, unknown>) => a.status === "processing").length
        const failed = arr.filter((a: Record<string, unknown>) => a.status === "failed").length
        const actualProgress = Math.round((completed / total) * 100)

        return NextResponse.json({
          id: (batchData as Record<string, unknown>).id,
          status: completed === total ? "completed" : failed === total ? "failed" : "processing",
          progress: actualProgress,
          current_step: `Analisando ${completed}/${total} repositórios`,
          total_steps: 100,
          batch_details: {
            total,
            completed,
            processing,
            failed,
            errors: arr
              .filter((a: Record<string, unknown>) => a.error_message)
              .map((a: Record<string, unknown>) => a.error_message),
          },
        })
      }
    }

    const { data: analysis } = await db
      .from("analyses")
      .select("id, status, progress, current_step, total_steps, batch_id, error_message")
      .eq("id", id)
      .maybeSingle()

    if (analysis) {
      const a = analysis as Record<string, unknown>
      return NextResponse.json({
        id: a.id,
        status: a.status,
        progress: a.progress || 0,
        current_step: a.current_step || "Iniciando análise...",
        total_steps: a.total_steps || 100,
        error_message: a.error_message,
      })
    }

    return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
  } catch (error) {
    console.error("Error fetching analysis progress:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { progress, current_step, status } = body

    const updateData: Record<string, unknown> = {}
    if (progress !== undefined) updateData.progress = progress
    if (current_step) updateData.current_step = current_step
    if (status) updateData.status = status

    const { error } = await db.from("analyses").update(updateData).eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating analysis progress:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
