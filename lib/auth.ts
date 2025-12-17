import { getSupabaseClient } from "@/lib/supabase"
import { AbortSignal } from "abort-controller"

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
    console.log("[v0] Timestamp:", new Date().toISOString())
    console.log("[v0] Email:", email)
    console.log("[v0] Password length:", password?.length || 0)
    console.log("[v0] Window location:", typeof window !== "undefined" ? window.location.href : "N/A")

    console.log("[v0] Calling fetch to /api/auth/login...")
    const startTime = Date.now()

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    const fetchDuration = Date.now() - startTime
    console.log("[v0] Fetch completed in", fetchDuration, "ms")
    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

    console.log("[v0] Response received, status:", response.status)

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
        console.log("[v0] Session token saved to localStorage")
      }

      console.log("[v0] === LOGIN END - SUCCESS ===")
      return { success: true, user: result.user, sessionToken: result.sessionToken }
    }

    return { success: false, error: result.error || "Credenciais inválidas" }
  } catch (error) {
    console.error("[v0] === LOGIN EXCEPTION ===")
    console.error("[v0] Error name:", error instanceof Error ? error.name : "Unknown")
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "N/A")

    let errorMessage = "Erro ao fazer login"
    if (error instanceof TypeError && error.message.includes("fetch")) {
      errorMessage = "Erro de conexão com o servidor. Verifique sua internet."
    } else if (error instanceof Error && error.name === "AbortError") {
      errorMessage = "Timeout na requisição. Tente novamente."
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

// Logout
export function logout() {
  localStorage.removeItem("user")
  localStorage.removeItem("sessionToken")
  window.location.href = "/login"
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
