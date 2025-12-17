import { NextResponse } from "next/server"
import { getJobStatus, pauseJob, resumeJob, cancelJob, getJobLogs } from "@/lib/queue/job-queue"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = await getJobStatus(params.id)

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const logs = await getJobLogs(params.id)

    return NextResponse.json({ job, logs })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await request.json()

    let success = false

    if (action === "pause") {
      success = await pauseJob(params.id)
    } else if (action === "resume") {
      success = await resumeJob(params.id)
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (!success) {
      return NextResponse.json({ error: "Failed to update job" }, { status: 500 })
    }

    return NextResponse.json({ message: `Job ${action}d successfully` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = await cancelJob(params.id)

    if (!success) {
      return NextResponse.json({ error: "Failed to cancel job" }, { status: 500 })
    }

    return NextResponse.json({ message: "Job cancelled successfully" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
