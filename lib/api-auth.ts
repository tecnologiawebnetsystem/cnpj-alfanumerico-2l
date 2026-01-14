import { createServerClient } from "@/lib/supabase/server"
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
  const supabase = await createServerClient()

  // Validate API key format
  if (!apiKey || !apiKey.startsWith("wns_")) {
    return { valid: false, error: "Invalid API key format" }
  }

  // Check if API key exists and is active
  const { data: keyData, error: keyError } = await supabase
    .from("api_keys")
    .select("*")
    .eq("api_key", apiKey)
    .eq("is_active", true)
    .single()

  if (keyError || !keyData) {
    return { valid: false, error: "Invalid or inactive API key" }
  }

  // Check if key is expired
  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return { valid: false, error: "API key has expired" }
  }

  // Get client data
  const { data: clientData, error: clientError } = await supabase
    .from("api_clients")
    .select("*")
    .eq("id", keyData.client_id)
    .eq("status", "active")
    .single()

  if (clientError || !clientData) {
    return { valid: false, error: "Client account is not active" }
  }

  // Check rate limit
  const rateLimitOk = await checkRateLimit(supabase, keyData.id, keyData.rate_limit)
  if (!rateLimitOk) {
    return { valid: false, error: "Rate limit exceeded" }
  }

  // Update last_used_at
  await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyData.id)

  return { valid: true, client: clientData, keyData }
}

async function checkRateLimit(supabase: any, keyId: string, limit: number): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { count } = await supabase
    .from("usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("api_key_id", keyId)
    .gte("created_at", oneHourAgo)

  return (count || 0) < limit
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
  const supabase = await createServerClient()

  await supabase.from("usage_logs").insert({
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
  let key = "wns_" // WebNetSystems prefix
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

/**
 * Get current user for API Route Handlers
 * Use this function in Route Handlers to get the authenticated user
 */
export async function getCurrentUserForAPI() {
  try {
    const cookieStore = await cookies()
    const userEmail = cookieStore.get("user_email")?.value

    if (!userEmail) {
      return null
    }

    const supabase = await createServerClient()

    const { data: user, error } = await supabase.from("users").select("*").eq("email", userEmail).single()

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error(" Error getting current user for API:", error)
    return null
  }
}
