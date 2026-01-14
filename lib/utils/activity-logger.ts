import { createClient } from "@/lib/supabase/server"
import type { ActivityLog } from "@/lib/types"

export async function logActivity({
  userId,
  clientId,
  action,
  entityType,
  entityId,
  entityName,
  oldValue,
  newValue,
  ipAddress,
  userAgent,
  metadata,
}: {
  userId?: string
  clientId: string
  action: string
  entityType: string
  entityId?: string
  entityName?: string
  oldValue?: Record<string, any>
  newValue?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("activity_logs")
    .insert({
      user_id: userId,
      client_id: clientId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      old_value: oldValue,
      new_value: newValue,
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata,
    })
    .select()
    .single()

  if (error) {
    console.error(" Error logging activity:", error)
    throw error
  }

  return data as ActivityLog
}

export async function getActivityLogs({
  clientId,
  entityType,
  entityId,
  userId,
  limit = 50,
  offset = 0,
}: {
  clientId?: string
  entityType?: string
  entityId?: string
  userId?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from("activity_logs")
    .select(`
      *,
      users:user_id (
        name,
        email,
        role
      )
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (clientId) query = query.eq("client_id", clientId)
  if (entityType) query = query.eq("entity_type", entityType)
  if (entityId) query = query.eq("entity_id", entityId)
  if (userId) query = query.eq("user_id", userId)

  const { data, error } = await query

  if (error) {
    console.error(" Error getting activity logs:", error)
    throw error
  }

  return data as ActivityLog[]
}
