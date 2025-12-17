import { NextResponse } from "next/server"
import { getJobQueueStats } from "@/lib/monitoring/metrics"

export async function GET() {
  try {
    const stats = await getJobQueueStats()
    return NextResponse.json({ stats })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
