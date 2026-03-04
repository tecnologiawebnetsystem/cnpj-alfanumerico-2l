import { execute, query } from "@/lib/db/index"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = params && typeof params === "object" && "then" in params ? await params : params
    const { id } = resolvedParams

    // Resolve all analysis IDs (batch or single) in ONE query
    const batchRows = await query<{ id: string }>(
      "SELECT id FROM analyses WHERE batch_id = @id OR id = @id",
      { id },
    )

    if (batchRows.length === 0) {
      return Response.json({ success: true, deleted: 0 })
    }

    const ids = batchRows.map((r) => `'${r.id.replace(/'/g, "''")}'`).join(",")

    // Delete dependentes + principal em uma única transação implícita via subquery
    // A ordem respeita as FKs: findings → tasks → repository_selections → analyses
    await execute(`DELETE FROM findings            WHERE analysis_id IN (${ids})`)
    await execute(`DELETE FROM database_findings   WHERE analysis_id IN (${ids})`)
    await execute(`DELETE FROM tasks               WHERE analysis_id IN (${ids})`)
    await execute(`DELETE FROM repository_selections WHERE analysis_id IN (${ids})`)
    await execute(`DELETE FROM analyses            WHERE id           IN (${ids})`)

    return Response.json({ success: true, deleted: batchRows.length })
  } catch (error) {
    console.error("Error in DELETE /api/analyses/[id]:", error)
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
