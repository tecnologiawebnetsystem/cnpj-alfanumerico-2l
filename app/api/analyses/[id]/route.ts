import { createClient } from "@supabase/supabase-js"

function getSupabaseClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = params && typeof params === "object" && "then" in params ? await params : params
    const { id } = resolvedParams

    console.log("[v0] DELETE request for analysis ID:", id)

    const supabase = getSupabaseClient()

    // First, check if it's a batch analysis
    const { data: batchAnalyses, error: batchError } = await supabase.from("analyses").select("id").eq("batch_id", id)

    if (batchError) {
      console.error("[v0] Error checking batch:", batchError)
    }

    // Get all analysis IDs (either from batch or single)
    const analysisIds = batchAnalyses && batchAnalyses.length > 0 ? batchAnalyses.map((a) => a.id) : [id]

    console.log("[v0] Deleting", analysisIds.length, "analysis(es)")

    const chunks = chunkArray(analysisIds, 100)

    for (const chunk of chunks) {
      // Delete findings for this chunk
      const { error: findingsError } = await supabase.from("findings").delete().in("analysis_id", chunk)

      if (findingsError) {
        console.error("[v0] Error deleting findings:", findingsError)
      }

      // Delete database findings
      const { error: dbFindingsError } = await supabase.from("database_findings").delete().in("analysis_id", chunk)

      if (dbFindingsError) {
        console.error("[v0] Error deleting database_findings:", dbFindingsError)
      }

      // Delete tasks related to these analyses
      const { error: tasksError } = await supabase.from("tasks").delete().in("analysis_id", chunk)

      if (tasksError) {
        console.error("[v0] Error deleting tasks:", tasksError)
      }

      // Delete repository selections
      const { error: selectionsError } = await supabase.from("repository_selections").delete().in("analysis_id", chunk)

      if (selectionsError) {
        console.error("[v0] Error deleting repository_selections:", selectionsError)
      }

      // Delete the analyses themselves
      const { error: analysesError } = await supabase.from("analyses").delete().in("id", chunk)

      if (analysesError) {
        console.error("[v0] Error deleting analyses:", analysesError)
        return Response.json({ error: "Erro ao excluir análise" }, { status: 500 })
      }
    }

    console.log("[v0] Successfully deleted", analysisIds.length, "analysis(es)")
    return Response.json({ success: true, deleted: analysisIds.length })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/analyses/[id]:", error)
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
