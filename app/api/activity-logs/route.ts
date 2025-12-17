import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-actions"
import { getActivityLogs } from "@/lib/utils/activity-logger"

// GET /api/activity-logs - Get activity logs
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get("entity_type") || undefined
    const entityId = searchParams.get("entity_id") || undefined
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const logs = await getActivityLogs({
      clientId: user.client_id,
      entityType,
      entityId,
      limit,
      offset,
    })

    return NextResponse.json({ logs })
  } catch (error: any) {
    console.error("[v0] Error fetching activity logs:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
