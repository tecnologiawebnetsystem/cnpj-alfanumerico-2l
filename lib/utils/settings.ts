import { createClient } from "@/lib/supabase/server"

// Cache de configurações (em memória)
const settingsCache = new Map<string, { value: string; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export async function getSetting(key: string, defaultValue = ""): Promise<string> {
  // Verificar cache
  const cached = settingsCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("system_settings").select("value").eq("key", key).single()

    if (error || !data) {
      return defaultValue
    }

    // Atualizar cache
    settingsCache.set(key, { value: data.value || defaultValue, timestamp: Date.now() })

    return data.value || defaultValue
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error)
    return defaultValue
  }
}

export async function getSettings(category?: string): Promise<Record<string, string>> {
  try {
    const supabase = await createClient()
    let query = supabase.from("system_settings").select("key, value")

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error || !data) {
      return {}
    }

    const settings: Record<string, string> = {}
    data.forEach((setting) => {
      settings[setting.key] = setting.value || ""
    })

    return settings
  } catch (error) {
    console.error("Error getting settings:", error)
    return {}
  }
}

export function clearSettingsCache() {
  settingsCache.clear()
}

// Helpers para configurações específicas
export async function isFeatureEnabled(feature: "ai" | "whatsapp" | "slack" | "jira"): Promise<boolean> {
  const value = await getSetting(`${feature}_enabled`, "false")
  return value === "true"
}

export async function getEmailConfig() {
  return {
    provider: await getSetting("email_provider", "resend"),
    apiKey: await getSetting("resend_api_key", ""),
    fromAddress: await getSetting("email_from_address", "noreply@cnpj-analyzer.com"),
    fromName: await getSetting("email_from_name", "CNPJ Analyzer"),
  }
}

export async function getWhatsAppConfig() {
  return {
    enabled: await isFeatureEnabled("whatsapp"),
    apiUrl: await getSetting("whatsapp_api_url", ""),
    apiKey: await getSetting("whatsapp_api_key", ""),
    instance: await getSetting("whatsapp_instance", ""),
  }
}

export async function getAIConfig() {
  return {
    enabled: await isFeatureEnabled("ai"),
    provider: await getSetting("ai_provider", "openai"),
    apiKey: await getSetting("openai_api_key", ""),
    model: await getSetting("ai_model", "gpt-4"),
  }
}
