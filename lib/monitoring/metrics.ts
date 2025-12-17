import { createClient } from "@supabase/supabase-js"

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type MetricType =
  | "analysis_duration"
  | "api_response_time"
  | "queue_size"
  | "error_rate"
  | "file_count"
  | "finding_count"
  | "database_query_time"

export interface MetricOptions {
  client_id?: string
  user_id?: string
  entity_type?: string
  entity_id?: string
  tags?: Record<string, any>
  metadata?: Record<string, any>
}

export async function recordMetric(
  metricType: MetricType,
  metricName: string,
  value: number,
  unit?: string,
  options: MetricOptions = {}
): Promise<void> {
  const supabase = getSupabaseClient()
  
  try {
    await supabase.from("system_metrics").insert({
      metric_type: metricType,
      metric_name: metricName,
      value,
      unit,
      client_id: options.client_id,
      user_id: options.user_id,
      entity_type: options.entity_type,
      entity_id: options.entity_id,
      tags: options.tags,
      metadata: options.metadata,
    })
  } catch (error) {
    console.error("Failed to record metric:", error)
  }
}

export class MetricTimer {
  private startTime: number
  private metricType: MetricType
  private metricName: string
  private options: MetricOptions

  constructor(
    metricType: MetricType,
    metricName: string,
    options: MetricOptions = {}
  ) {
    this.startTime = Date.now()
    this.metricType = metricType
    this.metricName = metricName
    this.options = options
  }

  async stop(): Promise<number> {
    const duration = Date.now() - this.startTime
    await recordMetric(
      this.metricType,
      this.metricName,
      duration,
      "ms",
      this.options
    )
    return duration
  }
}

export async function getRealtimeMetrics(): Promise<any[]> {
  const supabase = getSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from("realtime_metrics_dashboard")
      .select("*")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Failed to get realtime metrics:", error)
    return []
  }
}

export async function getJobQueueStats(): Promise<any[]> {
  const supabase = getSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from("job_queue_stats")
      .select("*")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Failed to get job queue stats:", error)
    return []
  }
}

export async function getProblematicAnalyses(): Promise<any[]> {
  const supabase = getSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from("problematic_analyses")
      .select("*")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Failed to get problematic analyses:", error)
    return []
  }
}
