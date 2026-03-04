import { db } from "@/lib/db/sqlserver"

export type AlertType =
  | "high_error_rate"
  | "slow_analysis"
  | "queue_overflow"
  | "system_failure"
  | "storage_limit"
  | "rate_limit_exceeded"

export type AlertSeverity = "info" | "warning" | "error" | "critical"

export interface AlertOptions {
  client_id?: string
  entity_type?: string
  entity_id?: string
  metadata?: Record<string, unknown>
  suggested_action?: string
}

export async function createAlert(
  alertType: AlertType,
  severity: AlertSeverity,
  title: string,
  message: string,
  options: AlertOptions = {},
): Promise<string | null> {
  try {
    const { data, error } = await db
      .from("monitoring_alerts")
      .insert({
        alert_type: alertType,
        severity,
        title,
        message,
        client_id: options.client_id,
        entity_type: options.entity_type,
        entity_id: options.entity_id,
        suggested_action: options.suggested_action,
      })
      .single()

    if (error) throw new Error(error.message)
    console.log(`Alert created: ${title} (${severity})`)
    return (data as Record<string, unknown>)?.id as string | null
  } catch (error) {
    console.error("Failed to create alert:", error)
    return null
  }
}

export async function getActiveAlerts(client_id?: string): Promise<unknown[]> {
  try {
    let query = db
      .from("monitoring_alerts")
      .select("*")
      .eq("status", "active")
      .order("severity", { ascending: false })
      .order("created_at", { ascending: false })

    if (client_id) query = query.eq("client_id", client_id)

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return Array.isArray(data) ? data : data ? [data] : []
  } catch (error) {
    console.error("Failed to get active alerts:", error)
    return []
  }
}

export async function acknowledgeAlert(alert_id: string, user_id: string): Promise<boolean> {
  try {
    const { error } = await db
      .from("monitoring_alerts")
      .update({ status: "acknowledged", acknowledged_by: user_id, acknowledged_at: new Date().toISOString() })
      .eq("id", alert_id)
    if (error) throw new Error(error.message)
    return true
  } catch (error) {
    console.error("Failed to acknowledge alert:", error)
    return false
  }
}

export async function resolveAlert(alert_id: string): Promise<boolean> {
  try {
    const { error } = await db
      .from("monitoring_alerts")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", alert_id)
    if (error) throw new Error(error.message)
    return true
  } catch (error) {
    console.error("Failed to resolve alert:", error)
    return false
  }
}

export async function checkAndCreateAlerts(): Promise<void> {
  const errorRate = await checkErrorRate()
  if (errorRate > 0.1) {
    await createAlert("high_error_rate", "error", "Alta taxa de erro detectada", `A taxa de erro está em ${(errorRate * 100).toFixed(2)}%`, {
      metadata: { error_rate: errorRate },
      suggested_action: "Verifique os logs de erro e investigue as análises falhadas",
    })
  }

  const queueSize = await checkQueueSize()
  if (queueSize > 100) {
    await createAlert("queue_overflow", "warning", "Fila de jobs está lotada", `Há ${queueSize} jobs pendentes na fila`, {
      metadata: { queue_size: queueSize },
      suggested_action: "Considere adicionar mais workers ou aumentar a capacidade",
    })
  }

  const { data: slowAnalyses } = await db.from("problematic_analyses").select("*")
  const arr = Array.isArray(slowAnalyses) ? slowAnalyses : slowAnalyses ? [slowAnalyses] : []
  for (const analysis of arr as Record<string, unknown>[]) {
    if (analysis.status === "processing" && (analysis.duration_seconds as number) > 7200) {
      await createAlert("slow_analysis", "warning", "Análise travada detectada", `A análise ${analysis.id} está rodando há mais de 2 horas`, {
        entity_type: "analysis",
        entity_id: analysis.id as string,
        client_id: analysis.client_id as string,
        metadata: { duration_seconds: analysis.duration_seconds },
        suggested_action: "Verifique se a análise está travada e considere reiniciá-la",
      })
    }
  }
}

async function checkErrorRate(): Promise<number> {
  const { data } = await db
    .from("analyses")
    .select("status")
    .gte("created_at", new Date(Date.now() - 3600000).toISOString())
  const arr = Array.isArray(data) ? data : data ? [data] : []
  if (!arr.length) return 0
  const failed = arr.filter((a: Record<string, unknown>) => a.status === "failed").length
  return failed / arr.length
}

async function checkQueueSize(): Promise<number> {
  const { count } = await db.from("job_queue").select("*", { count: "exact", head: true }).eq("status", "pending")
  return count || 0
}
