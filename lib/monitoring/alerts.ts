import { createClient } from "@supabase/supabase-js"

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

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
  metadata?: Record<string, any>
  suggested_action?: string
}

export async function createAlert(
  alertType: AlertType,
  severity: AlertSeverity,
  title: string,
  message: string,
  options: AlertOptions = {}
): Promise<string | null> {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from("monitoring_alerts")
      .insert({
        alert_type: alertType,
        severity,
        title,
        message,
        client_id: options.client_id,
        entity_type: options.entity_type,
        entity_id: options.entity_id,
        metadata: options.metadata,
        suggested_action: options.suggested_action,
      })
      .select("id")
      .single()

    if (error) throw error

    console.log(` Alert created: ${title} (${severity})`)
    return data.id
  } catch (error) {
    console.error("Failed to create alert:", error)
    return null
  }
}

export async function getActiveAlerts(
  client_id?: string
): Promise<any[]> {
  try {
    const supabase = getSupabaseClient()
    
    let query = supabase
      .from("monitoring_alerts")
      .select("*")
      .eq("status", "active")
      .order("severity", { ascending: false })
      .order("created_at", { ascending: false })

    if (client_id) {
      query = query.eq("client_id", client_id)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Failed to get active alerts:", error)
    return []
  }
}

export async function acknowledgeAlert(
  alert_id: string,
  user_id: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    
    const { error } = await supabase
      .from("monitoring_alerts")
      .update({
        status: "acknowledged",
        acknowledged_by: user_id,
        acknowledged_at: new Date().toISOString(),
      })
      .eq("id", alert_id)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Failed to acknowledge alert:", error)
    return false
  }
}

export async function resolveAlert(alert_id: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    
    const { error } = await supabase
      .from("monitoring_alerts")
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
      })
      .eq("id", alert_id)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Failed to resolve alert:", error)
    return false
  }
}

export async function checkAndCreateAlerts(): Promise<void> {
  // Verificar taxa de erro alta
  const errorRate = await checkErrorRate()
  if (errorRate > 0.1) {
    // Mais de 10% de erros
    await createAlert(
      "high_error_rate",
      "error",
      "Alta taxa de erro detectada",
      `A taxa de erro está em ${(errorRate * 100).toFixed(
        2
      )}%, acima do limite de 10%`,
      {
        metadata: { error_rate: errorRate },
        suggested_action:
          "Verifique os logs de erro e investigue as análises falhadas",
      }
    )
  }

  // Verificar fila de jobs lotada
  const queueSize = await checkQueueSize()
  if (queueSize > 100) {
    await createAlert(
      "queue_overflow",
      "warning",
      "Fila de jobs está lotada",
      `Há ${queueSize} jobs pendentes na fila`,
      {
        metadata: { queue_size: queueSize },
        suggested_action:
          "Considere adicionar mais workers ou aumentar a capacidade",
      }
    )
  }

  // Verificar análises lentas
  const slowAnalyses = await getProblematicAnalyses()
  for (const analysis of slowAnalyses) {
    if (
      analysis.status === "processing" &&
      analysis.duration_seconds > 7200
    ) {
      // Mais de 2 horas
      await createAlert(
        "slow_analysis",
        "warning",
        "Análise travada detectada",
        `A análise ${analysis.id} está rodando há mais de 2 horas`,
        {
          entity_type: "analysis",
          entity_id: analysis.id,
          client_id: analysis.client_id,
          metadata: { duration_seconds: analysis.duration_seconds },
          suggested_action: "Verifique se a análise está travada e considere reiniciá-la",
        }
      )
    }
  }
}

async function checkErrorRate(): Promise<number> {
  const supabase = getSupabaseClient()
  
  const { data } = await supabase
    .from("analyses")
    .select("status")
    .gte("created_at", new Date(Date.now() - 3600000).toISOString()) // Última hora

  if (!data || data.length === 0) return 0

  const failed = data.filter((a) => a.status === "failed").length
  return failed / data.length
}

async function checkQueueSize(): Promise<number> {
  const supabase = getSupabaseClient()
  
  const { data } = await supabase
    .from("job_queue")
    .select("id")
    .eq("status", "pending")

  return data?.length || 0
}

async function getProblematicAnalyses(): Promise<any[]> {
  const supabase = getSupabaseClient()
  
  const { data } = await supabase.from("problematic_analyses").select("*")
  return data || []
}
