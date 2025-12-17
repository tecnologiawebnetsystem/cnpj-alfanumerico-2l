import { NextResponse } from "next/server"
import { getActiveAlerts } from "@/lib/monitoring/alerts"

export async function GET() {
  try {
    const alerts = await getActiveAlerts()
    return NextResponse.json({ alerts })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
