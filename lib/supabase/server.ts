import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout: ${errorMsg}`)), timeoutMs)),
  ])
}

/**
 * Creates a Supabase server client with cookie handling
 * Important: Don't put this client in a global variable.
 * Always create a new client within each function when using it.
 */
export async function createServerClient() {
  const startTime = Date.now()
  console.log("[v0] === createServerClient START ===", new Date().toISOString())

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("[v0] CRITICAL: Missing Supabase environment variables")
      throw new Error("Missing Supabase environment variables")
    }

    console.log("[v0] Awaiting cookies() with timeout...")
    const cookieStore = await withTimeout(cookies(), 3000, "cookies() took too long")
    console.log("[v0] cookies() resolved in", Date.now() - startTime, "ms")

    const allCookies = cookieStore.getAll()
    console.log("[v0] Total cookies:", allCookies.length)

    const client = createSupabaseServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return allCookies
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (err) {
            // Expected to fail in API routes - silently ignore
            console.log("[v0] Cookie set failed (expected in API routes)")
          }
        },
      },
    })

    const elapsed = Date.now() - startTime
    console.log("[v0] Client created in", elapsed, "ms")
    console.log("[v0] === createServerClient SUCCESS ===")

    return client
  } catch (error) {
    console.error("[v0] === createServerClient ERROR ===")
    console.error("[v0] Error:", error)

    console.log("[v0] Creating fallback client WITHOUT cookies...")
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Cannot create fallback client: missing env vars")
    }

    // Create client without cookie handling
    const fallbackClient = createSupabaseServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    })

    console.log("[v0] Fallback client created")
    return fallbackClient
  }
}

export const createClient = createServerClient

export async function getCurrentUser() {
  try {
    console.log("[v0] === getCurrentUser START ===")
    const cookieStore = await cookies()

    console.log("[v0] Getting user_email cookie...")
    const userEmailCookie = cookieStore.get("user_email")
    console.log("[v0] user_email cookie object:", JSON.stringify(userEmailCookie))
    const userEmail = userEmailCookie?.value

    console.log("[v0] User email from cookie:", userEmail || "undefined")

    if (!userEmail) {
      console.log("[v0] No user email in cookie - checking all cookies...")
      const allCookies = cookieStore.getAll()
      console.log("[v0] All available cookies:", allCookies.map((c) => c.name).join(", "))
      return null
    }

    console.log("[v0] Creating Supabase client to fetch user...")
    const supabase = await createServerClient()

    console.log("[v0] Querying users table for email:", userEmail)
    const { data: userData, error } = await supabase
      .from("users")
      .select("id, email, name, role, client_id, status")
      .eq("email", userEmail)
      .eq("status", "active")
      .single()

    if (error || !userData) {
      console.log("[v0] getCurrentUser - Error or no user found:", error?.message)
      return null
    }

    // Get client name if client_id exists
    let clientName = null
    if (userData.client_id) {
      console.log("[v0] Fetching client name for client_id:", userData.client_id)
      const { data: clientData } = await supabase.from("clients").select("name").eq("id", userData.client_id).single()
      clientName = clientData?.name
      console.log("[v0] Client name:", clientName)
    }

    console.log("[v0] getCurrentUser - User found:", userData.email, "Role:", userData.role)
    console.log("[v0] === getCurrentUser END ===")

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      client_id: userData.client_id,
      client_name: clientName,
    }
  } catch (error) {
    console.error("[v0] getCurrentUser - Critical error:", error)
    return null
  }
}

export async function getUserFromToken(authHeader: string | null) {
  try {
    console.log("[v0] getUserFromToken - Start")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[v0] No valid Authorization header")
      return null
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix
    console.log("[v0] Token received, length:", token.length)

    // Decode base64 token
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"))
    console.log("[v0] Token decoded, email:", decoded.email)

    // Verify token is not too old (7 days max)
    const tokenAge = Date.now() - decoded.timestamp
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days

    if (tokenAge > maxAge) {
      console.log("[v0] Token expired")
      return null
    }

    const supabase = await createServerClient()

    const { data: userData, error } = await supabase
      .from("users")
      .select("id, email, name, role, client_id, status")
      .eq("id", decoded.userId)
      .eq("email", decoded.email)
      .eq("status", "active")
      .single()

    if (error || !userData) {
      console.log("[v0] getUserFromToken - Error or no user found:", error?.message)
      return null
    }

    // Get client name if client_id exists
    let clientName = null
    if (userData.client_id) {
      const { data: clientData } = await supabase.from("clients").select("name").eq("id", userData.client_id).single()
      clientName = clientData?.name
    }

    console.log("[v0] getUserFromToken - User found:", userData.email)

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      client_id: userData.client_id,
      client_name: clientName,
    }
  } catch (error) {
    console.error("[v0] getUserFromToken - Error:", error)
    return null
  }
}
