import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: jobs, error } = await supabase
      .from("worker_jobs")
      .select("id, status, worker_id, created_at, started_at, completed_at, result")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) throw error

    const logs = jobs.flatMap((job) => {
      const entries = []

      entries.push({
        timestamp: new Date(job.created_at).toLocaleTimeString(),
        level: "info",
        message: `Job ${job.id} criado`,
        workerId: job.worker_id,
      })

      if (job.started_at) {
        entries.push({
          timestamp: new Date(job.started_at).toLocaleTimeString(),
          level: "info",
          message: `Job ${job.id} iniciado`,
          workerId: job.worker_id,
        })
      }

      if (job.completed_at) {
        entries.push({
          timestamp: new Date(job.completed_at).toLocaleTimeString(),
          level: job.status === "completed" ? "success" : "error",
          message: `Job ${job.id} ${job.status === "completed" ? "concluído" : "falhou"}`,
          workerId: job.worker_id,
        })
      }

      return entries
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Erro ao buscar logs:", error)
    return NextResponse.json({ error: "Erro ao buscar logs", logs: [] }, { status: 500 })
  }
}
