import { db as supabase } from "@/lib/db/sqlserver"
import { gzip, gunzip } from "zlib"
import { promisify } from "util"

const gzipAsync = promisify(gzip)
const gunzipAsync = promisify(gunzip)

export async function compressAndSaveFindings(
  analysisId: string,
  findings: any[]
): Promise<boolean> {
  // supabase already bound above
  
  try {
    const findingsWithMetadata = findings.map(f => ({
      ...f,
      repository: f.repository || null,
      project: f.project || null,
    }))
    
    const jsonData = JSON.stringify(findingsWithMetadata)
    const originalSize = Buffer.byteLength(jsonData)

    // Comprimir com gzip
    const compressed = await gzipAsync(jsonData)
    const compressedSize = compressed.length

    // Salvar no banco
    const { error } = await supabase.from("findings_compressed").insert({
      analysis_id: analysisId,
      compressed_data: compressed,
      compression_type: "gzip",
      original_size: originalSize,
      compressed_size: compressedSize,
      finding_count: findings.length,
    })

    if (error) throw error

    const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(
      1
    )
    console.log(
      ` Compressed ${findings.length} findings: ${originalSize}B → ${compressedSize}B (${compressionRatio}% reduction)`
    )

    return true
  } catch (error: any) {
    console.error(" Error compressing findings:", error)
    return false
  }
}

export async function decompressFindings(
  analysisId: string
): Promise<any[] | null> {
  // supabase already bound above
  
  try {
    const { data, error } = await supabase
      .from("findings_compressed")
      .select("compressed_data, compression_type")
      .eq("analysis_id", analysisId)
      .single()

    if (error) throw error
    if (!data) return null

    // Descomprimir
    const decompressed = await gunzipAsync(Buffer.from(data.compressed_data))
    const findings = JSON.parse(decompressed.toString())

    console.log(` Decompressed ${findings.length} findings`)
    return findings
  } catch (error: any) {
    console.error(" Error decompressing findings:", error)
    return null
  }
}

export async function archiveOldFindings(daysOld: number = 7): Promise<number> {
  // supabase already bound above
  
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    // Buscar análises antigas com findings não comprimidos
    const { data: analyses, error: selectError } = await supabase
      .from("analyses")
      .select("id")
      .lt("completed_at", cutoffDate.toISOString())
      .eq("status", "completed")
      .limit(100)

    if (selectError) throw selectError
    if (!analyses || analyses.length === 0) return 0

    let archived = 0

    for (const analysis of analyses) {
      // Verificar se já tem comprimido
      const { data: existing } = await supabase
        .from("findings_compressed")
        .select("id")
        .eq("analysis_id", analysis.id)
        .single()

      if (existing) continue // Já comprimido

      // Buscar findings
      const { data: findings, error: findingsError } = await supabase
        .from("findings")
        .select("*")
        .eq("analysis_id", analysis.id)

      if (findingsError) continue
      if (!findings || findings.length === 0) continue

      // Comprimir e salvar
      const success = await compressAndSaveFindings(analysis.id, findings)

      if (success) {
        // Opcional: deletar findings não comprimidos para economizar espaço
        // await supabase.from("findings").delete().eq("analysis_id", analysis.id)
        archived++
      }
    }

    console.log(` Archived ${archived} old analyses`)
    return archived
  } catch (error: any) {
    console.error(" Error archiving old findings:", error)
    return 0
  }
}
