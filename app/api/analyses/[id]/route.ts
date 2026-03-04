import { db as supabase } from "@/lib/db/sqlserver"

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

    // First, check if it's a batch analysis
    const { data: batchAnalyses, error: batchError } = await supabase.from("analyses").select("id").eq("batch_id", id)

    if (batchError) {
      console.error("Error checking batch:", batchError)
    }

    // Get all analysis IDs (either from batch or single)
    const analysisIds = batchAnalyses && batchAnalyses.length > 0 ? batchAnalyses.map((a: any) => a.id) : [id]

    const chunks = chunkArray(analysisIds, 100)

    for (const chunk of chunks) {
      const { error: findingsError } = await supabase.from("findings").delete().in("analysis_id", chunk)
      if (findingsError) console.error("Error deleting findings:", findingsError)

      const { error: dbFindingsError } = await supabase.from("database_findings").delete().in("analysis_id", chunk)
      if (dbFindingsError) console.error("Error deleting database_findings:", dbFindingsError)

      const { error: tasksError } = await supabase.from("tasks").delete().in("analysis_id", chunk)
      if (tasksError) console.error("Error deleting tasks:", tasksError)

      const { error: selectionsError } = await supabase.from("repository_selections").delete().in("analysis_id", chunk)
      if (selectionsError) console.error("Error deleting repository_selections:", selectionsError)

      const { error: analysesError } = await supabase.from("analyses").delete().in("id", chunk)
      if (analysesError) {
        console.error("Error deleting analyses:", analysesError)
        return Response.json({ error: "Erro ao excluir análise" }, { status: 500 })
      }
    }

    return Response.json({ success: true, deleted: analysisIds.length })
  } catch (error) {
    console.error("Error in DELETE /api/analyses/[id]:", error)
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
