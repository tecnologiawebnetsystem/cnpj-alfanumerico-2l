import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth-actions"
import type { UserRole } from "@/lib/types"

export function withAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
  options: { requiredRole?: UserRole } = {},
) {
  return async (request: NextRequest) => {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (options.requiredRole) {
      const roleHierarchy: Record<UserRole, number> = {
        super_admin: 4,
        admin: 3,
        dev: 2,
        user: 1,
      }

      const userLevel = roleHierarchy[user.role as UserRole] || 0
      const requiredLevel = roleHierarchy[options.requiredRole] || 0

      if (userLevel < requiredLevel) {
        return NextResponse.json({ error: "Permissão negada" }, { status: 403 })
      }
    }

    return handler(request, user)
  }
}
