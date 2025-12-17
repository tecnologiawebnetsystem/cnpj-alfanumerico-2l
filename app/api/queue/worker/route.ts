import { NextResponse } from "next/server"
import { startWorker, stopWorker, getWorkerStatus } from "@/lib/queue/worker"

export async function POST() {
  try {
    // Iniciar worker em background
    startWorker().catch((error) => {
      console.error("[v0] Worker crashed:", error)
    })

    return NextResponse.json({ message: "Worker started" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const status = getWorkerStatus()
    return NextResponse.json(status)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    stopWorker()
    return NextResponse.json({ message: "Worker stopped" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
