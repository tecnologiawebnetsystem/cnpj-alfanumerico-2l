import { query, queryOne, execute } from "@/lib/db/index"

interface CacheResult {
  cache_id: string
  findings: unknown[]
  tasks: unknown[]
  statistics: unknown
  age_minutes: number
}

/**
 * Verifica se existe cache válido para o repositório/branch/commit.
 */
export async function checkCache(
  repositoryUrl: string,
  branch: string,
  commitSha: string,
): Promise<CacheResult | null> {
  try {
    const row = await queryOne<CacheResult>(
      `SELECT TOP 1
              id             AS cache_id,
              findings_json  AS findings,
              tasks_json     AS tasks,
              statistics     AS statistics,
              DATEDIFF(MINUTE, created_at, GETUTCDATE()) AS age_minutes
       FROM   analysis_cache
       WHERE  repository_url = @url
         AND  branch         = @branch
         AND  commit_sha     = @sha
         AND  expires_at     > GETUTCDATE()`,
      { url: repositoryUrl, branch, sha: commitSha },
    )

    if (row) {
      return row
    }
    return null
  } catch {
    return null
  }
}

/**
 * Persiste o resultado de uma análise no cache.
 */
export async function saveToCache(params: {
  repositoryUrl: string
  repositoryId: string
  branch: string
  commitSha: string
  findings: unknown[]
  tasks: unknown[]
  statistics: unknown
  fileCount: number
  totalSizeKb: number
  analysisDurationMs: number
  clientId: string
  ttlHours?: number
}): Promise<string | null> {
  try {
    const ttl = params.ttlHours ?? 24
    const expires = new Date(Date.now() + ttl * 60 * 60 * 1000).toISOString()
    const id = crypto.randomUUID()

    await execute(
      `INSERT INTO analysis_cache
         (id, repository_id, repository_url, branch, commit_sha,
          findings_json, tasks_json, statistics,
          file_count, total_size_kb, analysis_duration_ms,
          client_id, expires_at, created_at)
       VALUES
         (@id, @repoId, @url, @branch, @sha,
          @findings, @tasks, @stats,
          @fileCount, @sizeKb, @durationMs,
          @clientId, @expires, GETUTCDATE())`,
      {
        id,
        repoId:     params.repositoryId,
        url:        params.repositoryUrl,
        branch:     params.branch,
        sha:        params.commitSha,
        findings:   JSON.stringify(params.findings),
        tasks:      JSON.stringify(params.tasks),
        stats:      JSON.stringify(params.statistics),
        fileCount:  params.fileCount,
        sizeKb:     params.totalSizeKb,
        durationMs: params.analysisDurationMs,
        clientId:   params.clientId,
        expires,
      },
    )

    return id
  } catch {
    return null
  }
}

/**
 * Remove entradas de cache expiradas. Retorna a quantidade deletada.
 */
export async function cleanupExpiredCache(): Promise<number> {
  try {
    return await execute(
      "DELETE FROM analysis_cache WHERE expires_at <= GETUTCDATE()",
    )
  } catch {
    return 0
  }
}

/**
 * Estatísticas do cache.
 */
export async function getCacheStatistics(): Promise<unknown> {
  try {
    return await queryOne(
      `SELECT
        COUNT(*)                                                             AS total_entries,
        SUM(CASE WHEN expires_at > GETUTCDATE() THEN 1 ELSE 0 END)         AS active_entries,
        SUM(CASE WHEN expires_at <= GETUTCDATE() THEN 1 ELSE 0 END)        AS expired_entries,
        AVG(analysis_duration_ms)                                           AS avg_duration_ms,
        SUM(total_size_kb)                                                  AS total_size_kb
       FROM analysis_cache`,
    )
  } catch {
    return null
  }
}

/**
 * Invalida todo o cache de um repositório específico.
 */
export async function invalidateRepositoryCache(repositoryId: string): Promise<boolean> {
  try {
    await execute(
      "DELETE FROM analysis_cache WHERE repository_id = @repoId",
      { repoId: repositoryId },
    )
    return true
  } catch {
    return false
  }
}
