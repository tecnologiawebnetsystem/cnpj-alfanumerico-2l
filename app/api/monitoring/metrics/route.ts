import { NextResponse } from "next/server"
import { getRealtimeMetrics } from "@/lib/monitoring/metrics"

export async function GET() {
  try {
    const metrics = await getRealtimeMetrics()
    return NextResponse.json({ metrics })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
