import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    console.log(" Progress endpoint - ID:", id)

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: batchData } = await supabase.from("batch_analyses").select("*").eq("id", id).maybeSingle()

    if (batchData) {
      console.log(" Found batch analysis:", batchData.id, "progress:", batchData.progress)

      const { data: analyses } = await supabase
        .from("analyses")
        .select("id, status, progress, error_message")
        .eq("batch_id", id)

      if (analyses && analyses.length > 0) {
        const total = analyses.length
        const completed = analyses.filter((a) => a.status === "completed").length
        const processing = analyses.filter((a) => a.status === "processing").length
        const failed = analyses.filter((a) => a.status === "failed").length

        const actualProgress = Math.round((completed / total) * 100)

        console.log(" Batch progress:", { total, completed, processing, failed, actualProgress })

        return NextResponse.json({
          id: batchData.id,
          status: completed === total ? "completed" : failed === total ? "failed" : "processing",
          progress: actualProgress,
          current_step: batchData.current_step || `Analisando ${completed}/${total} repositórios`,
          total_steps: 100,
          batch_details: {
            total,
            completed,
            processing,
            failed,
            errors: analyses.filter((a) => a.error_message).map((a) => a.error_message),
          },
        })
      }
    }

    const { data: analysis } = await supabase
      .from("analyses")
      .select("id, status, progress, current_step, total_steps, batch_id, error_message")
      .eq("id", id)
      .maybeSingle()

    if (analysis) {
      console.log(" Found single analysis:", analysis.id, "progress:", analysis.progress)

      return NextResponse.json({
        id: analysis.id,
        status: analysis.status,
        progress: analysis.progress || 0,
        current_step: analysis.current_step || "Iniciando análise...",
        total_steps: analysis.total_steps || 100,
        error_message: analysis.error_message,
      })
    }

    console.log(" Analysis not found:", id)
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
  } catch (error) {
    console.error(" Error fetching analysis progress:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    console.log(" Progress update - ID:", id)

    const body = await request.json()
    const { progress, current_step, status } = body

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const updateData: any = {}
    if (progress !== undefined) updateData.progress = progress
    if (current_step) updateData.current_step = current_step
    if (status) updateData.status = status

    const { error } = await supabase.from("analyses").update(updateData).eq("id", id)

    if (error) {
      console.error(" Error updating progress:", error)
      return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(" Error updating analysis progress:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
