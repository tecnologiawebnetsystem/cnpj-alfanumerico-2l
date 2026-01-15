import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { loginSchema } from "@/lib/security/validation"
import { loginRateLimiter } from "@/lib/security/redis-rate-limiter"
import { enforce2FA } from "@/lib/security/2fa-enforcer"
import { SessionManager } from "@/lib/security/session-manager"
import { isIPWhitelisted } from "@/lib/security/ip-whitelist"
import { safeErrorResponse } from "@/lib/security/error-handler"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

function getClientIP(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown"
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get("user-agent") || "unknown"

  const rateLimitResult = await loginRateLimiter.check(clientIP)

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: "Muitas tentativas de login. Tente novamente em 15 minutos." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          "Retry-After": String(rateLimitResult.reset - Math.floor(Date.now() / 1000)),
        },
      },
    )
  }

  try {
    const body = await request.json()

    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: validationResult.error.errors[0].message }, { status: 400 })
    }

    const { email, password } = validationResult.data

    const supabase = await createServerClient()

    const { data: users, error: queryError } = await supabase
      .from("users")
      .select("id, email, name, role, client_id, status, password_hash, two_factor_enabled")
      .eq("email", email)
      .limit(1)

    if (queryError) {
      return safeErrorResponse(queryError)
    }

    if (!users || users.length === 0) {
      await supabase.from("security_logs").insert({
        event_type: "failed_login",
        user_email: email,
        ip_address: clientIP,
        user_agent: userAgent,
        details: { reason: "user_not_found" },
      })
      return NextResponse.json({ success: false, error: "Credenciais inválidas" }, { status: 401 })
    }

    const userData = users[0]

    const storedHash = userData.password_hash?.trim() || ""
    let isValid = false

    if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
      const { data: verifyResult, error: verifyError } = await supabase.rpc("verify_password", {
        input_password: password,
        stored_hash: storedHash,
      })

      if (verifyError) {
        const encoder = new TextEncoder()
        const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(password))
        const inputHash = Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
        isValid = inputHash === storedHash.substring(0, 64).toLowerCase()
      } else {
        isValid = verifyResult
      }
    } else {
      const encoder = new TextEncoder()
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(password))
      const inputHash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
      isValid = inputHash === storedHash.substring(0, 64).toLowerCase()
    }

    if (!isValid) {
      await supabase.from("security_logs").insert({
        event_type: "failed_login",
        user_id: userData.id,
        user_email: email,
        ip_address: clientIP,
        user_agent: userAgent,
        details: { reason: "invalid_password" },
      })

      return NextResponse.json({ success: false, error: "Credenciais inválidas" }, { status: 401 })
    }

    if (userData.status !== "active") {
      return NextResponse.json({ success: false, error: "Usuário inativo" }, { status: 401 })
    }

    const twoFAStatus = await enforce2FA(userData.id)
    if (twoFAStatus.required && !twoFAStatus.enabled) {
      return NextResponse.json(
        {
          success: false,
          error: "Autenticação de dois fatores é obrigatória para sua função. Configure o 2FA antes de continuar.",
          require2FA: true,
        },
        { status: 403 },
      )
    }

    if (["admin", "super_admin"].includes(userData.role) && userData.client_id) {
      const ipAllowed = await isIPWhitelisted(clientIP, userData.client_id)
      if (!ipAllowed) {
        await supabase.from("security_logs").insert({
          event_type: "blocked_login",
          user_id: userData.id,
          user_email: email,
          ip_address: clientIP,
          user_agent: userAgent,
          details: { reason: "ip_not_whitelisted" },
        })

        return NextResponse.json(
          { success: false, error: "Acesso negado. Seu IP não está autorizado para login administrativo." },
          { status: 403 },
        )
      }
    }

    await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", userData.id)

    let clientName = null
    if (userData.client_id) {
      const { data: clientData } = await supabase.from("clients").select("name").eq("id", userData.client_id).single()
      clientName = clientData?.name
    }

    const sessionId = await SessionManager.createSession(
      userData.id,
      userData.email,
      userData.role,
      userData.client_id || "",
      clientIP,
      userAgent,
    )

    const user = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      client_id: userData.client_id,
      client_name: clientName,
    }

    await supabase.from("security_logs").insert({
      event_type: "successful_login",
      user_id: userData.id,
      user_email: email,
      ip_address: clientIP,
      user_agent: userAgent,
      details: { session_id: sessionId },
    })

    const response = NextResponse.json({
      success: true,
      user,
    })

    // Session is already set by SessionManager
    return response
  } catch (error: any) {
    return safeErrorResponse(error)
  }
}
