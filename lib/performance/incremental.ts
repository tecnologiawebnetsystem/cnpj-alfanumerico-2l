import { db as supabase } from "@/lib/db/sqlserver"
import crypto from "crypto"

export function calculateFileHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex")
}

export async function getAnalyzedFile(
  repositoryId: string,
  filePath: string,
  fileHash: string
): Promise<any | null> {
  // supabase already bound above
  
  try {
    const { data, error } = await supabase
      .from("analyzed_files")
      .select("*")
      .eq("repository_id", repositoryId)
      .eq("file_path", filePath)
      .eq("file_hash", fileHash)
      .single()

    if (error && error.code !== "PGRST116") throw error // PGRST116 = not found

    return data
  } catch (error: any) {
    console.error(" Error getting analyzed file:", error)
    return null
  }
}

export async function saveAnalyzedFile(params: {
  repositoryId: string
  filePath: string
  fileHash: string
  hasCnpj: boolean
  findings: any[]
}): Promise<boolean> {
  // supabase already bound above
  
  try {
    const { error } = await supabase.from("analyzed_files").upsert({
      repository_id: params.repositoryId,
      file_path: params.filePath,
      file_hash: params.fileHash,
      has_cnpj: params.hasCnpj,
      findings: params.findings,
      analyzed_at: new Date().toISOString(),
    })

    if (error) throw error
    return true
  } catch (error: any) {
    console.error(" Error saving analyzed file:", error)
    return false
  }
}

export async function getModifiedFiles(
  repositoryId: string,
  files: Array<{ path: string; content: string }>
): Promise<{
  toAnalyze: Array<{ path: string; content: string }>
  fromCache: Array<{ path: string; findings: any[] }>
}> {
  const toAnalyze: Array<{ path: string; content: string }> = []
  const fromCache: Array<{ path: string; findings: any[] }> = []

  for (const file of files) {
    const fileHash = calculateFileHash(file.content)
    const analyzed = await getAnalyzedFile(repositoryId, file.path, fileHash)

    if (analyzed) {
      // Arquivo já analisado com este conteúdo exato
      fromCache.push({
        path: file.path,
        findings: analyzed.findings || [],
      })
      console.log(` Using cached result for: ${file.path}`)
    } else {
      // Arquivo novo ou modificado
      toAnalyze.push(file)
    }
  }

  console.log(
    ` Incremental analysis: ${toAnalyze.length} to analyze, ${fromCache.length} from cache`
  )

  return { toAnalyze, fromCache }
}

export async function cleanupOldAnalyzedFiles(
  daysToKeep: number = 30
): Promise<number> {
  // supabase already bound above
  
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const { error } = await supabase
      .from("analyzed_files")
      .delete()
      .lt("analyzed_at", cutoffDate.toISOString())

    if (error) throw error

    console.log(` Cleaned up old analyzed files`)
    return 0
  } catch (error: any) {
    console.error(" Error cleaning analyzed files:", error)
    return 0
  }
}
