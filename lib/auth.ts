import { getSupabaseClient } from "@/lib/supabase"

// Criar cliente Supabase
function getSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  return getSupabaseClient(supabaseUrl, supabaseAnonKey)
}

export interface User {
  id: string
  email: string
  name: string
  role: "super_admin" | "admin" | "dev" // updated roles to match 3-tier system
  client_id?: string
  client_name?: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
  sessionToken?: string
}

// Login com email e senha
export async function login(email: string, password: string): Promise<AuthResponse & { sessionToken?: string }> {
  try {
    console.log("[v0] === LOGIN START ===")
    console.log("[v0] Email:", email)

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Include cookies in request
    })

    console.log("[v0] Response status:", response.status)

    if (!response.ok) {
      const result = await response.json()
      return { success: false, error: result.error || "Credenciais inválidas" }
    }

    const result = await response.json()
    console.log("[v0] Response body parsed:", result)

    if (result.success && result.user) {
      localStorage.setItem("user", JSON.stringify(result.user))

      if (result.sessionToken) {
        localStorage.setItem("sessionToken", result.sessionToken)

        const cookieValue = btoa(
          JSON.stringify({
            userId: result.user.id,
            email: result.user.email,
            role: result.user.role,
            timestamp: Date.now(),
          }),
        )
        document.cookie = `session_token=${cookieValue}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
        console.log("[v0] Session token saved to cookie")
      }

      console.log("[v0] === LOGIN END - SUCCESS ===")
      return { success: true, user: result.user, sessionToken: result.sessionToken }
    }

    return { success: false, error: result.error || "Credenciais inválidas" }
  } catch (error) {
    console.error("[v0] === LOGIN EXCEPTION ===", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao fazer login",
    }
  }
}

// Logout
export function logout() {
  localStorage.removeItem("user")
  localStorage.removeItem("sessionToken")
  document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  window.location.href = "/"
}

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("sessionToken")
}

// Obter usuário atual
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem("user")
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

// Verificar se está autenticado
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

// Verificar se é super admin
export function isSuperAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === "super_admin"
}

// Verificar se é admin (super_admin ou admin)
export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === "super_admin" || user?.role === "admin"
}

// Verificar se é dev
export function isDev(): boolean {
  const user = getCurrentUser()
  return user?.role === "dev"
}

// Verificar se user pode gerenciar outros (super_admin ou admin)
export function canManageUsers(): boolean {
  const user = getCurrentUser()
  return user?.role === "super_admin" || user?.role === "admin"
}

// Verificar se user pode criar tasks (super_admin ou admin)
export function canCreateTasks(): boolean {
  const user = getCurrentUser()
  return user?.role === "super_admin" || user?.role === "admin"
}

// Verificar se user é client-scoped (admin ou dev)
export function isClientScoped(): boolean {
  const user = getCurrentUser()
  return user?.role === "admin" || user?.role === "dev"
}
