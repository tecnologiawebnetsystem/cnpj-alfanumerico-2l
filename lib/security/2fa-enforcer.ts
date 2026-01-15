import { createClient } from "@/lib/supabase"

export async function enforce2FA(userId: string): Promise<{
  required: boolean
  enabled: boolean
  role: string
}> {
  const supabase = createClient()

  const { data: user, error } = await supabase
    .from("users")
    .select("role, two_factor_enabled")
    .eq("id", userId)
    .single()

  if (error || !user) {
    return { required: false, enabled: false, role: "unknown" }
  }

  const requiresFA = ["admin", "super_admin"].includes(user.role)

  return {
    required: requiresFA,
    enabled: user.two_factor_enabled || false,
    role: user.role,
  }
}

export async function block2FARequired(userId: string): Promise<boolean> {
  const status = await enforce2FA(userId)
  return status.required && !status.enabled
}
