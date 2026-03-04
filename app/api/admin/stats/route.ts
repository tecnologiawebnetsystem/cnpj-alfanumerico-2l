import { type NextRequest, NextResponse } from "next/server"
import { queryOne } from "@/lib/db/index"
import { db } from "@/lib/db/sqlserver"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    if (!user_id) {
      return NextResponse.json({ error: "user_id required" }, { status: 401 })
    }

    // Verificar se o usuário é super admin
    const user = await queryOne<{ role: string }>(
      "SELECT role FROM users WHERE id = @id",
      { id: user_id },
    )

    if (!user || (user.role !== "super_admin" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Uma única query agrega todos os contadores — elimina 6 round-trips extras
    const stats = await queryOne<{
      totalClients: number
      activeClients: number
      activeSubscriptions: number
      totalUsers: number
      totalRepositories: number
      totalAnalyses: number
      pendingTasks: number
    }>(
      `SELECT
        (SELECT COUNT(*) FROM clients)                                       AS totalClients,
        (SELECT COUNT(*) FROM clients  WHERE status = 'active')             AS activeClients,
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'active')        AS activeSubscriptions,
        (SELECT COUNT(*) FROM users)                                         AS totalUsers,
        (SELECT COUNT(*) FROM repositories)                                  AS totalRepositories,
        (SELECT COUNT(*) FROM analyses)                                      AS totalAnalyses,
        (SELECT COUNT(*) FROM tasks WHERE status = 'pending')               AS pendingTasks`,
    )

    return NextResponse.json({
      totalClients:        stats?.totalClients        ?? 0,
      activeClients:       stats?.activeClients       ?? 0,
      activeSubscriptions: stats?.activeSubscriptions ?? 0,
      totalUsers:          stats?.totalUsers          ?? 0,
      totalRepositories:   stats?.totalRepositories   ?? 0,
      totalAnalyses:       stats?.totalAnalyses       ?? 0,
      pendingTasks:        stats?.pendingTasks        ?? 0,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("Error loading admin stats:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
