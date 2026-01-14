import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface CacheResult {
  cache_id: string
  findings: any[]
  tasks: any[]
  statistics: any
  age_minutes: number
}

export async function checkCache(
  repositoryUrl: string,
  branch: string,
  commitSha: string
): Promise<CacheResult | null> {
  const supabase = getSupabaseClient()
  
  try {
    const { data, error } = await supabase.rpc("check_analysis_cache", {
      repository_url_param: repositoryUrl,
      branch_param: branch,
      commit_sha_param: commitSha,
    })

    if (error) throw error

    if (data && data.length > 0) {
      console.log(
        ` Cache HIT: ${repositoryUrl} (age: ${data[0].age_minutes}min)`
      )
      return data[0]
    }

    console.log(` Cache MISS: ${repositoryUrl}`)
    return null
  } catch (error: any) {
    console.error(" Error checking cache:", error)
    return null
  }
}

export async function saveToCache(params: {
  repositoryUrl: string
  repositoryId: string
  branch: string
  commitSha: string
  findings: any[]
  tasks: any[]
  statistics: any
  fileCount: number
  totalSizeKb: number
  analysisDurationMs: number
  clientId: string
  ttlHours?: number
}): Promise<string | null> {
  const supabase = getSupabaseClient()
  
  try {
    const { data, error } = await supabase.rpc("save_to_cache", {
      repository_url_param: params.repositoryUrl,
      repository_id_param: params.repositoryId,
      branch_param: params.branch,
      commit_sha_param: params.commitSha,
      findings_param: params.findings,
      tasks_param: params.tasks,
      statistics_param: params.statistics,
      file_count_param: params.fileCount,
      total_size_kb_param: params.totalSizeKb,
      analysis_duration_ms_param: params.analysisDurationMs,
      client_id_param: params.clientId,
      ttl_hours: params.ttlHours || 24,
    })

    if (error) throw error

    console.log(` Saved to cache: ${params.repositoryUrl}`)
    return data
  } catch (error: any) {
    console.error(" Error saving to cache:", error)
    return null
  }
}

export async function cleanupExpiredCache(): Promise<number> {
  const supabase = getSupabaseClient()
  
  try {
    const { data, error } = await supabase.rpc("cleanup_expired_cache")

    if (error) throw error

    console.log(` Cleaned up ${data} expired cache entries`)
    return data
  } catch (error: any) {
    console.error(" Error cleaning cache:", error)
    return 0
  }
}

export async function getCacheStatistics(): Promise<any> {
  const supabase = getSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from("cache_statistics")
      .select("*")
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error(" Error getting cache statistics:", error)
    return null
  }
}

export async function invalidateRepositoryCache(
  repositoryId: string
): Promise<boolean> {
  const supabase = getSupabaseClient()
  
  try {
    const { error } = await supabase
      .from("analysis_cache")
      .delete()
      .eq("repository_id", repositoryId)

    if (error) throw error

    console.log(` Invalidated cache for repository: ${repositoryId}`)
    return true
  } catch (error: any) {
    console.error(" Error invalidating cache:", error)
    return false
  }
}
