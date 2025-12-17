import { getNextJob, completeJob, failJob, logJob, updateJobProgress } from "./job-queue"
import { analyzeRepository } from "../analyzer/repository-analyzer"
import { createClient } from "@supabase/supabase-js"

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const WORKER_ID = `worker-${process.env.VERCEL_REGION || "local"}-${Date.now()}`

let isRunning = false
let currentJob: any = null

async function processAnalysisJob(job: any): Promise<void> {
  const supabase = getSupabaseClient()
  
  const { analysis_id, repository_id, account_id } = job.job_data

  console.log(
    `[v0] Processing analysis job: ${job.id} for repository: ${repository_id}`
  )

  await logJob(job.id, "info", `Started analysis for repository ${repository_id}`)

  try {
    // Buscar detalhes do repositório e token
    const { data: repo } = await supabase
      .from("repositories")
      .select("*")
      .eq("id", repository_id)
      .single()

    if (!repo) throw new Error("Repository not found")

    const { data: account } = await supabase
      .from("github_tokens")
      .select("*")
      .eq("id", account_id)
      .single()

    if (!account) throw new Error("Account not found")

    // Executar análise com callback de progresso
    await analyzeRepository({
      analysisId: analysis_id,
      repository: repo,
      token: account.access_token,
      provider: account.provider || "github",
      onProgress: async (progress: number, message: string) => {
        await updateJobProgress(job.id, progress, { message })
        await logJob(job.id, "info", message)
      },
    })

    await logJob(job.id, "info", "Analysis completed successfully")
  } catch (error: any) {
    console.error(`[v0] Error processing analysis job ${job.id}:`, error)
    await logJob(job.id, "error", `Analysis failed: ${error.message}`, {
      error: error.stack,
    })
    throw error
  }
}

async function processJob(job: any): Promise<void> {
  currentJob = job

  try {
    switch (job.job_type) {
      case "analysis":
        await processAnalysisJob(job)
        break

      case "report_generation":
        // TODO: Implementar geração de relatório
        await logJob(job.id, "info", "Report generation not yet implemented")
        break

      case "database_scan":
        // TODO: Implementar scan de banco
        await logJob(job.id, "info", "Database scan not yet implemented")
        break

      default:
        throw new Error(`Unknown job type: ${job.job_type}`)
    }

    // Job completou com sucesso
    await completeJob(job.id)
  } catch (error: any) {
    // Job falhou - será reprocessado automaticamente
    await failJob(job.id, error.message, { stack: error.stack })
  } finally {
    currentJob = null
  }
}

export async function startWorker(): Promise<void> {
  if (isRunning) {
    console.log("[v0] Worker already running")
    return
  }

  isRunning = true
  console.log(`[v0] Worker ${WORKER_ID} started`)

  while (isRunning) {
    try {
      // Buscar próximo job
      const job = await getNextJob(WORKER_ID)

      if (job) {
        await processJob(job)
      } else {
        // Nenhum job disponível, aguardar antes de tentar novamente
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
    } catch (error: any) {
      console.error("[v0] Worker error:", error)
      // Aguardar antes de tentar novamente
      await new Promise((resolve) => setTimeout(resolve, 10000))
    }
  }

  console.log(`[v0] Worker ${WORKER_ID} stopped`)
}

export function stopWorker(): void {
  isRunning = false
}

export function getWorkerStatus(): {
  isRunning: boolean
  currentJob: any | null
  workerId: string
} {
  return {
    isRunning,
    currentJob,
    workerId: WORKER_ID,
  }
}
