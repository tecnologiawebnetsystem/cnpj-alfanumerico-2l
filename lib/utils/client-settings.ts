import { createClient } from "@/lib/supabase/server"

export async function getClientSetting(key: string, clientId?: string): Promise<string | null> {
  try {
    const supabase = await createClient()

    let targetClientId = clientId

    // If no clientId provided, get from current user
    if (!targetClientId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null

      const { data: userData } = await supabase.from("users").select("client_id").eq("id", user.id).single()

      targetClientId = userData?.client_id
    }

    if (!targetClientId) return null

    const { data } = await supabase
      .from("client_settings")
      .select("value, is_enabled")
      .eq("client_id", targetClientId)
      .eq("key", key)
      .single()

    return data?.is_enabled ? data.value : null
  } catch (error) {
    console.error(`Error getting client setting ${key}:`, error)
    return null
  }
}

export async function getClientSettings(category?: string, clientId?: string): Promise<Record<string, string>> {
  try {
    const supabase = await createClient()

    let targetClientId = clientId

    if (!targetClientId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return {}

      const { data: userData } = await supabase.from("users").select("client_id").eq("id", user.id).single()

      targetClientId = userData?.client_id
    }

    if (!targetClientId) return {}

    let query = supabase.from("client_settings").select("key, value, is_enabled").eq("client_id", targetClientId)

    if (category) {
      query = query.eq("category", category)
    }

    const { data } = await query

    if (!data) return {}

    return data
      .filter((s) => s.is_enabled)
      .reduce(
        (acc, setting) => {
          if (setting.value) {
            acc[setting.key] = setting.value
          }
          return acc
        },
        {} as Record<string, string>,
      )
  } catch (error) {
    console.error("Error getting client settings:", error)
    return {}
  }
}
