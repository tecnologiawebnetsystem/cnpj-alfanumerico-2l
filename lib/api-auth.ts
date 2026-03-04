import { db } from "@/lib/db/sqlserver"
import { queryOne, query } from "@/lib/db/index"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

export interface ApiClient {
  id: string
  company_name: string
  email: string
  plan: string
  status: string
}

export interface ApiKey {
  id: string
  client_id: string
  key_name: string
  api_key: string
  is_active: boolean
  rate_limit: number
  last_used_at: string | null
  expires_at: string | null
}

/**
 * Valida API key e cliente em 2 queries paralelas (key + client),
 * depois faz o rate-limit check e o update de last_used_at de forma
 * não-bloqueante (fire-and-forget).
 */
export async function validateApiKey(
  apiKey: string,
): Promise<{ valid: boolean; client?: ApiClient; keyData?: ApiKey; error?: string }> {
  if (!apiKey || !apiKey.startsWith("wns_")) {
    return { valid: false, error: "Invalid API key format" }
  }

  // 1. Buscar key — query única com JOIN para trazer client junto
  const row = await queryOne<ApiKey & ApiClient & { client_status: string }>(
    `SELECT k.id, k.client_id, k.key_name, k.api_key, k.is_active,
            k.rate_limit, k.last_used_at, k.expires_at,
            c.company_name, c.email, c.plan, c.status AS client_status
     FROM   api_keys k
     JOIN   api_clients c ON c.id = k.client_id
     WHERE  k.api_key = @apiKey
       AND  k.is_active = 1
       AND  c.status = 'active'`,
    { apiKey },
  )

  if (!row) {
    return { valid: false, error: "Invalid or inactive API key" }
  }

  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return { valid: false, error: "API key has expired" }
  }

  // 2. Rate limit: COUNT na última hora
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const countRow = await queryOne<{ cnt: number }>(
    `SELECT COUNT(*) AS cnt FROM usage_logs
     WHERE  api_key_id = @id AND created_at >= @since`,
    { id: row.id, since: oneHourAgo },
  )

  if ((countRow?.cnt ?? 0) >= row.rate_limit) {
    return { valid: false, error: "Rate limit exceeded" }
  }

  // 3. Atualiza last_used_at de forma não-bloqueante (fire-and-forget)
  db.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", row.id)
    .then(() => {}).catch(() => {})

  const keyData: ApiKey = {
    id: row.id,
    client_id: row.client_id,
    key_name: row.key_name,
    api_key: row.api_key,
    is_active: row.is_active,
    rate_limit: row.rate_limit,
    last_used_at: row.last_used_at,
    expires_at: row.expires_at,
  }

  const client: ApiClient = {
    id: row.client_id,
    company_name: row.company_name,
    email: row.email,
    plan: row.plan,
    status: row.client_status,
  }

  return { valid: true, client, keyData }
}

export async function logApiUsage(
  clientId: string,
  apiKeyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number,
  request: NextRequest,
) {
  // fire-and-forget — não bloqueia a resposta
  db.from("usage_logs").insert({
    client_id: clientId,
    api_key_id: apiKeyId,
    endpoint,
    method,
    status_code: statusCode,
    response_time: responseTime,
    ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
    user_agent: request.headers.get("user-agent") || "unknown",
  }).then(() => {}).catch(() => {})
}

export function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let key = "wns_"
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

/**
 * Obtém o usuário atual — JOIN único em vez de 2 queries separadas.
 */
export async function getCurrentUserForAPI() {
  try {
    const cookieStore = await cookies()
    const userEmail = cookieStore.get("user_email")?.value
    if (!userEmail) return null

    return await queryOne(
      `SELECT u.*, c.name AS client_name
       FROM   users u
       LEFT JOIN clients c ON c.id = u.client_id
       WHERE  u.email = @email`,
      { email: userEmail },
    )
  } catch {
    return null
  }
}
