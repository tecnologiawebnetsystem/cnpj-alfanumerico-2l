import { getNextJob, completeJob, failJob, logJob, updateJobProgress } from "./job-queue"
import { analyzeRepository } from "../analyzer/repository-analyzer"
import { db } from "@/lib/db/sqlserver"

const WORKER_ID = `worker-${process.env.VERCEL_REGION || "local"}-${Date.now()}`

let isRunning = false
let currentJob: Record<string, unknown> | null = null

async function processAnalysisJob(job: Record<string, unknown>): Promise<void> {
  const jobData = job.job_data as Record<string, unknown>
  const { analysis_id, repository_id, account_id } = jobData

  await logJob(job.id as string, "info", `Started analysis for repository ${repository_id}`)

  try {
    const { data: repo } = await db.from("repositories").select("*").eq("id", repository_id as string).single()
    if (!repo) throw new Error("Repository not found")

    const { data: account } = await db.from("github_tokens").select("*").eq("id", account_id as string).single()
    if (!account) throw new Error("Account not found")

    const r = repo as Record<string, unknown>
    const a = account as Record<string, unknown>

    await analyzeRepository(
      analysis_id as string,
      null,
      (r.url || r.clone_url) as string,
      null,
      "github",
      undefined,
      r.name as string,
    )

    await logJob(job.id as string, "info", "Analysis completed successfully")
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    await logJob(job.id as string, "error", `Analysis failed: ${msg}`)
    throw error
  }
}

async function processJob(job: Record<string, unknown>): Promise<void> {
  currentJob = job
  try {
    switch (job.job_type) {
      case "analysis":
        await processAnalysisJob(job)
        break
      case "report_generation":
        await logJob(job.id as string, "info", "Report generation not yet implemented")
        break
      case "database_scan":
        await logJob(job.id as string, "info", "Database scan not yet implemented")
        break
      default:
        throw new Error(`Unknown job type: ${job.job_type}`)
    }
    await completeJob(job.id as string)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    await failJob(job.id as string, msg)
  } finally {
    currentJob = null
  }
}

export async function startWorker(): Promise<void> {
  if (isRunning) { console.log("Worker already running"); return }
  isRunning = true
  console.log(`Worker ${WORKER_ID} started`)

  while (isRunning) {
    try {
      const job = await getNextJob(WORKER_ID)
      if (job) {
        await processJob(job as unknown as Record<string, unknown>)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
    } catch (error) {
      console.error("Worker error:", error)
      await new Promise((resolve) => setTimeout(resolve, 10000))
    }
  }

  console.log(`Worker ${WORKER_ID} stopped`)
}

export function stopWorker(): void { isRunning = false }

export function getWorkerStatus() {
  return { isRunning, currentJob, workerId: WORKER_ID }
}
