import { createClient } from "@supabase/supabase-js"

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type JobType = "analysis" | "report_generation" | "database_scan"
export type JobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "paused"
  | "cancelled"

export interface Job {
  id: string
  client_id: string
  user_id: string
  job_type: JobType
  job_data: any
  status: JobStatus
  priority: number
  attempts: number
  max_attempts: number
  last_error?: string
  error_details?: any
  created_at: string
  started_at?: string
  completed_at?: string
  failed_at?: string
  next_retry_at?: string
  worker_id?: string
  locked_at?: string
  locked_until?: string
  progress: number
  progress_details?: any
  result?: any
}

export interface JobLog {
  id: string
  job_id: string
  level: "info" | "warning" | "error" | "debug"
  message: string
  metadata?: any
  created_at: string
}

export async function enqueueJob(params: {
  client_id: string
  user_id: string
  job_type: JobType
  job_data: any
  priority?: number
  max_attempts?: number
}): Promise<{ job_id: string; error?: string }> {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from("job_queue")
      .insert({
        client_id: params.client_id,
        user_id: params.user_id,
        job_type: params.job_type,
        job_data: params.job_data,
        priority: params.priority || 0,
        max_attempts: params.max_attempts || 3,
        status: "pending",
      })
      .select("id")
      .single()

    if (error) throw error

    console.log(`[v0] Job enqueued: ${data.id} (type: ${params.job_type})`)
    return { job_id: data.id }
  } catch (error: any) {
    console.error("[v0] Error enqueueing job:", error)
    return { job_id: "", error: error.message }
  }
}

export async function getNextJob(
  worker_id: string
): Promise<Job | null> {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase.rpc("get_next_job", {
      worker_id_param: worker_id,
      lock_duration_minutes: 30,
    })

    if (error) throw error
    if (!data || data.length === 0) return null

    const job = data[0]
    console.log(
      `[v0] Worker ${worker_id} picked up job: ${job.job_id} (attempt ${job.attempts})`
    )

    return {
      id: job.job_id,
      job_type: job.job_type,
      job_data: job.job_data,
      attempts: job.attempts,
    } as Job
  } catch (error: any) {
    console.error("[v0] Error getting next job:", error)
    return null
  }
}

export async function updateJobProgress(
  job_id: string,
  progress: number,
  progress_details?: any
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    
    const { error } = await supabase
      .from("job_queue")
      .update({
        progress,
        progress_details,
      })
      .eq("id", job_id)

    if (error) throw error
    return true
  } catch (error: any) {
    console.error("[v0] Error updating job progress:", error)
    return false
  }
}

export async function completeJob(
  job_id: string,
  result?: any
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    
    const { error } = await supabase.rpc("complete_job", {
      job_id_param: job_id,
      result_param: result,
    })

    if (error) throw error
    console.log(`[v0] Job completed: ${job_id}`)
    return true
  } catch (error: any) {
    console.error("[v0] Error completing job:", error)
    return false
  }
}

export async function failJob(
  job_id: string,
  error_message: string,
  error_details?: any
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    
    const { error } = await supabase.rpc("fail_job", {
      job_id_param: job_id,
      error_message_param: error_message,
      error_details_param: error_details,
    })

    if (error) throw error
    console.log(`[v0] Job failed: ${job_id} - ${error_message}`)
    return true
  } catch (error: any) {
    console.error("[v0] Error failing job:", error)
    return false
  }
}

export async function pauseJob(job_id: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    
    const { error } = await supabase.rpc("pause_job", {
      job_id_param: job_id,
    })

    if (error) throw error
    console.log(`[v0] Job paused: ${job_id}`)
    return true
  } catch (error: any) {
    console.error("[v0] Error pausing job:", error)
    return false
  }
}

export async function resumeJob(job_id: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    
    const { error } = await supabase.rpc("resume_job", {
      job_id_param: job_id,
    })

    if (error) throw error
    console.log(`[v0] Job resumed: ${job_id}`)
    return true
  } catch (error: any) {
    console.error("[v0] Error resuming job:", error)
    return false
  }
}

export async function cancelJob(job_id: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    
    const { error } = await supabase.rpc("cancel_job", {
      job_id_param: job_id,
    })

    if (error) throw error
    console.log(`[v0] Job cancelled: ${job_id}`)
    return true
  } catch (error: any) {
    console.error("[v0] Error cancelling job:", error)
    return false
  }
}

export async function logJob(
  job_id: string,
  level: "info" | "warning" | "error" | "debug",
  message: string,
  metadata?: any
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    
    const { error } = await supabase.from("job_logs").insert({
      job_id,
      level,
      message,
      metadata,
    })

    if (error) throw error
    return true
  } catch (error: any) {
    console.error("[v0] Error logging job:", error)
    return false
  }
}

export async function getJobLogs(
  job_id: string
): Promise<JobLog[]> {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from("job_logs")
      .select("*")
      .eq("job_id", job_id)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error("[v0] Error getting job logs:", error)
    return []
  }
}

export async function getJobStatus(job_id: string): Promise<Job | null> {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from("job_queue")
      .select("*")
      .eq("id", job_id)
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error("[v0] Error getting job status:", error)
    return null
  }
}

export async function listClientJobs(
  client_id: string,
  filters?: {
    status?: JobStatus
    job_type?: JobType
    limit?: number
  }
): Promise<Job[]> {
  try {
    const supabase = getSupabaseClient()
    
    let query = supabase
      .from("job_queue")
      .select("*")
      .eq("client_id", client_id)
      .order("created_at", { ascending: false })

    if (filters?.status) {
      query = query.eq("status", filters.status)
    }

    if (filters?.job_type) {
      query = query.eq("job_type", filters.job_type)
    }

    query = query.limit(filters?.limit || 50)

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error("[v0] Error listing client jobs:", error)
    return []
  }
}
