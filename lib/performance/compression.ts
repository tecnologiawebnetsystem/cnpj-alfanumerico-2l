import { createClient } from "@supabase/supabase-js"
import { gzip, gunzip } from "zlib"
import { promisify } from "util"

const gzipAsync = promisify(gzip)
const gunzipAsync = promisify(gunzip)

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function compressAndSaveFindings(
  analysisId: string,
  findings: any[]
): Promise<boolean> {
  const supabase = getSupabaseClient()
  
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
      `[v0] Compressed ${findings.length} findings: ${originalSize}B → ${compressedSize}B (${compressionRatio}% reduction)`
    )

    return true
  } catch (error: any) {
    console.error("[v0] Error compressing findings:", error)
    return false
  }
}

export async function decompressFindings(
  analysisId: string
): Promise<any[] | null> {
  const supabase = getSupabaseClient()
  
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

    console.log(`[v0] Decompressed ${findings.length} findings`)
    return findings
  } catch (error: any) {
    console.error("[v0] Error decompressing findings:", error)
    return null
  }
}

export async function archiveOldFindings(daysOld: number = 7): Promise<number> {
  const supabase = getSupabaseClient()
  
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

    console.log(`[v0] Archived ${archived} old analyses`)
    return archived
  } catch (error: any) {
    console.error("[v0] Error archiving old findings:", error)
    return 0
  }
}
