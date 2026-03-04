/**
 * lib/supabase/api-client.ts
 * Compatibilidade: substitui createSupabaseApiClient e createSupabaseServiceClient
 * pelo QueryBuilder SQL Server.
 */
import { db } from "@/lib/db/sqlserver"
import type { NextRequest } from "next/server"
import { getPool } from "@/lib/db"

export function createSupabaseApiClient(_request?: NextRequest) {
  return db
}

export function createSupabaseServiceClient() {
  return db
}

// ── helpers já existentes ────────────────────────────────────────────────────

export function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let key = "wns_"
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

export async function validateApiKey(apiKey: string) {
  if (!apiKey || !apiKey.startsWith("wns_")) {
    return { valid: false, error: "Invalid API key format" }
  }

  const { data: keyData, error: keyError } = await db
    .from("api_keys")
    .select("*")
    .eq("api_key", apiKey)
    .eq("is_active", true)
    .single()

  if (keyError || !keyData) {
    return { valid: false, error: "Invalid or inactive API key" }
  }

  const kd = keyData as Record<string, unknown>

  if (kd.expires_at && new Date(kd.expires_at as string) < new Date()) {
    return { valid: false, error: "API key has expired" }
  }

  const { data: clientData, error: clientError } = await db
    .from("api_clients")
    .select("*")
    .eq("id", kd.client_id as string)
    .eq("status", "active")
    .single()

  if (clientError || !clientData) {
    return { valid: false, error: "Client account is not active" }
  }

  // Rate limit
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await db
    .from("usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("api_key_id", kd.id as string)
    .gte("created_at", oneHourAgo)

  if ((count || 0) >= (kd.rate_limit as number)) {
    return { valid: false, error: "Rate limit exceeded" }
  }

  await db.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", kd.id as string)

  return { valid: true, client: clientData, keyData: kd }
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
