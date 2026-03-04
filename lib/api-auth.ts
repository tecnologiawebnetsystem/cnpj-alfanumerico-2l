import { db } from "@/lib/db/sqlserver"
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

export async function validateApiKey(
  apiKey: string,
): Promise<{ valid: boolean; client?: ApiClient; keyData?: ApiKey; error?: string }> {
  if (!apiKey || !apiKey.startsWith("wns_")) {
    return { valid: false, error: "Invalid API key format" }
  }

  const { data: keyData, error: keyError } = await db
    .from<ApiKey>("api_keys")
    .select("*")
    .eq("api_key", apiKey)
    .eq("is_active", true)
    .single()

  if (keyError || !keyData) {
    return { valid: false, error: "Invalid or inactive API key" }
  }

  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return { valid: false, error: "API key has expired" }
  }

  const { data: clientData, error: clientError } = await db
    .from<ApiClient>("api_clients")
    .select("*")
    .eq("id", keyData.client_id)
    .eq("status", "active")
    .single()

  if (clientError || !clientData) {
    return { valid: false, error: "Client account is not active" }
  }

  // Rate limit: contar requisições da última hora
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await db
    .from("usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("api_key_id", keyData.id)
    .gte("created_at", oneHourAgo)

  if ((count || 0) >= keyData.rate_limit) {
    return { valid: false, error: "Rate limit exceeded" }
  }

  await db.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyData.id)

  return { valid: true, client: clientData, keyData }
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
  await db.from("usage_logs").insert({
    client_id: clientId,
    api_key_id: apiKeyId,
    endpoint,
    method,
    status_code: statusCode,
    response_time: responseTime,
    ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
    user_agent: request.headers.get("user-agent") || "unknown",
  })
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
 * Obtém o usuário atual para uso em API Route Handlers.
 */
export async function getCurrentUserForAPI() {
  try {
    const cookieStore = await cookies()
    const userEmail = cookieStore.get("user_email")?.value

    if (!userEmail) return null

    const { data: user, error } = await db.from("users").select("*").eq("email", userEmail).single()

    if (error || !user) return null

    return user
  } catch (error) {
    console.error("Error getting current user for API:", error)
    return null
  }
}
