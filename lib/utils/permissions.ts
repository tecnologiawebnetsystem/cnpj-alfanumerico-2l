import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/lib/types"

const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 4,
  admin: 3,
  dev: 2,
  user: 1,
}

export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  const supabase = await createClient()

  // Get user role
  const { data: user } = await supabase.from("users").select("role").eq("id", userId).single()

  if (!user) return false

  // Super admin has all permissions
  if (user.role === "super_admin") return true

  // Check if role has permission
  const { data: rolePermission } = await supabase
    .from("role_permissions")
    .select(`
      permissions (
        name
      )
    `)
    .eq("role", user.role)

  if (!rolePermission) return false

  return rolePermission.some((rp: any) => rp.permissions?.name === permission)
}

export async function hasRole(userId: string, requiredRole: UserRole): Promise<boolean> {
  const supabase = await createClient()

  const { data: user } = await supabase.from("users").select("role").eq("id", userId).single()

  if (!user) return false

  const userLevel = ROLE_HIERARCHY[user.role as UserRole] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0

  return userLevel >= requiredLevel
}

export async function requirePermission(userId: string, permission: string): Promise<void> {
  const allowed = await hasPermission(userId, permission)
  if (!allowed) {
    throw new Error(`Permission denied: ${permission}`)
  }
}

export async function requireRole(userId: string, requiredRole: UserRole): Promise<void> {
  const allowed = await hasRole(userId, requiredRole)
  if (!allowed) {
    throw new Error(`Role required: ${requiredRole}`)
  }
}
