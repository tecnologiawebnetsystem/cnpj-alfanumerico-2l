import { createClient } from "@/lib/supabase"

interface SecurityEvent {
  userId?: string
  eventType: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  severity?: "low" | "medium" | "high" | "critical"
}

export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    const supabase = createClient()
    if (!supabase) {
      console.error("[v0] Supabase client not available for security logging")
      return
    }

    await supabase.from("security_logs").insert({
      user_id: event.userId,
      event_type: event.eventType,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      details: event.details,
      severity: event.severity || "medium",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Failed to log security event:", error)
  }
}
