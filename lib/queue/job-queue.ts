import { db } from "@/lib/db/sqlserver"

export type JobType = "analysis" | "report_generation" | "database_scan"
export type JobStatus = "pending" | "processing" | "completed" | "failed" | "paused" | "cancelled"

export interface Job {
  id: string
  client_id: string
  user_id: string
  job_type: JobType
  job_data: Record<string, unknown>
  status: JobStatus
  priority: number
  attempts: number
  max_attempts: number
  last_error?: string
  created_at: string
  started_at?: string
  completed_at?: string
  failed_at?: string
  worker_id?: string
  progress: number
  result?: unknown
}

export interface JobLog {
  id: string
  job_id: string
  level: "info" | "warning" | "error" | "debug"
  message: string
  metadata?: Record<string, unknown>
  created_at: string
}

export async function enqueueJob(params: {
  client_id: string
  user_id: string
  job_type: JobType
  job_data: Record<string, unknown>
  priority?: number
  max_attempts?: number
}): Promise<{ job_id: string; error?: string }> {
  try {
    const { data, error } = await db
      .from("job_queue")
      .insert({
        client_id: params.client_id,
        user_id: params.user_id,
        job_type: params.job_type,
        job_data: JSON.stringify(params.job_data),
        priority: params.priority || 0,
        max_attempts: params.max_attempts || 3,
        status: "pending",
      })
      .single()

    if (error) throw new Error(error.message)
    console.log(`Job enqueued: ${(data as Record<string, unknown>)?.id} (type: ${params.job_type})`)
    return { job_id: (data as Record<string, unknown>)?.id as string }
  } catch (err: unknown) {
    console.error("Error enqueueing job:", err)
    return { job_id: "", error: err instanceof Error ? err.message : String(err) }
  }
}

export async function getNextJob(worker_id: string): Promise<Job | null> {
  try {
    // SQL Server: busca o próximo job pendente e marca como processing
    const { data, error } = await db
      .from("job_queue")
      .select("*")
      .eq("status", "pending")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1)
      .single()

    if (error || !data) return null

    const job = data as Record<string, unknown>

    await db
      .from("job_queue")
      .update({ status: "processing", worker_id, started_at: new Date().toISOString() })
      .eq("id", job.id as string)
      .eq("status", "pending")

    console.log(`Worker ${worker_id} picked up job: ${job.id}`)
    return data as unknown as Job
  } catch (err) {
    console.error("Error getting next job:", err)
    return null
  }
}

export async function updateJobProgress(job_id: string, progress: number, progress_details?: Record<string, unknown>): Promise<boolean> {
  try {
    const { error } = await db.from("job_queue").update({ progress, progress_details: JSON.stringify(progress_details) }).eq("id", job_id)
    if (error) throw new Error(error.message)
    return true
  } catch (err) {
    console.error("Error updating job progress:", err)
    return false
  }
}

export async function completeJob(job_id: string, result?: unknown): Promise<boolean> {
  try {
    const { error } = await db.from("job_queue").update({ status: "completed", completed_at: new Date().toISOString(), result: JSON.stringify(result) }).eq("id", job_id)
    if (error) throw new Error(error.message)
    console.log(`Job completed: ${job_id}`)
    return true
  } catch (err) {
    console.error("Error completing job:", err)
    return false
  }
}

export async function failJob(job_id: string, error_message: string, error_details?: unknown): Promise<boolean> {
  try {
    // Incrementa tentativas e decide se vai para failed ou volta para pending
    const { data: job } = await db.from("job_queue").select("attempts, max_attempts").eq("id", job_id).single()
    const j = job as Record<string, unknown>
    const attempts = ((j?.attempts as number) || 0) + 1
    const maxAttempts = (j?.max_attempts as number) || 3
    const newStatus = attempts >= maxAttempts ? "failed" : "pending"

    const { error } = await db.from("job_queue").update({
      status: newStatus,
      attempts,
      last_error: error_message,
      failed_at: newStatus === "failed" ? new Date().toISOString() : null,
      next_retry_at: newStatus === "pending" ? new Date(Date.now() + attempts * 60000).toISOString() : null,
    }).eq("id", job_id)

    if (error) throw new Error(error.message)
    console.log(`Job failed: ${job_id} - ${error_message}`)
    return true
  } catch (err) {
    console.error("Error failing job:", err)
    return false
  }
}

export async function pauseJob(job_id: string): Promise<boolean> {
  try {
    const { error } = await db.from("job_queue").update({ status: "paused" }).eq("id", job_id)
    if (error) throw new Error(error.message)
    return true
  } catch (err) {
    console.error("Error pausing job:", err)
    return false
  }
}

export async function resumeJob(job_id: string): Promise<boolean> {
  try {
    const { error } = await db.from("job_queue").update({ status: "pending" }).eq("id", job_id)
    if (error) throw new Error(error.message)
    return true
  } catch (err) {
    console.error("Error resuming job:", err)
    return false
  }
}

export async function cancelJob(job_id: string): Promise<boolean> {
  try {
    const { error } = await db.from("job_queue").update({ status: "cancelled" }).eq("id", job_id)
    if (error) throw new Error(error.message)
    return true
  } catch (err) {
    console.error("Error cancelling job:", err)
    return false
  }
}

export async function logJob(job_id: string, level: "info" | "warning" | "error" | "debug", message: string, metadata?: Record<string, unknown>): Promise<boolean> {
  try {
    const { error } = await db.from("job_logs").insert({ job_id, level, message, metadata: JSON.stringify(metadata) })
    if (error) throw new Error(error.message)
    return true
  } catch (err) {
    console.error("Error logging job:", err)
    return false
  }
}

export async function getJobLogs(job_id: string): Promise<JobLog[]> {
  try {
    const { data, error } = await db.from("job_logs").select("*").eq("job_id", job_id).order("created_at", { ascending: false }).limit(100)
    if (error) throw new Error(error.message)
    return (Array.isArray(data) ? data : data ? [data] : []) as JobLog[]
  } catch (err) {
    console.error("Error getting job logs:", err)
    return []
  }
}

export async function getJobStatus(job_id: string): Promise<Job | null> {
  try {
    const { data, error } = await db.from("job_queue").select("*").eq("id", job_id).single()
    if (error) return null
    return data as unknown as Job
  } catch (err) {
    console.error("Error getting job status:", err)
    return null
  }
}

export async function listClientJobs(client_id: string, filters?: { status?: JobStatus; job_type?: JobType; limit?: number }): Promise<Job[]> {
  try {
    let query = db.from("job_queue").select("*").eq("client_id", client_id).order("created_at", { ascending: false })
    if (filters?.status) query = query.eq("status", filters.status)
    if (filters?.job_type) query = query.eq("job_type", filters.job_type)
    query = query.limit(filters?.limit || 50)
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return (Array.isArray(data) ? data : data ? [data] : []) as Job[]
  } catch (err) {
    console.error("Error listing client jobs:", err)
    return []
  }
}
