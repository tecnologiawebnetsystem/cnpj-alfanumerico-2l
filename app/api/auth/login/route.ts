import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { loginSchema } from "@/lib/security/validation"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

function getClientIP(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown"
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get("user-agent") || "unknown"

  try {
    const body = await request.json()
    console.log("[v0] Login attempt for email:", body.email)

    // Validate input
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      console.log("[v0] Validation failed:", validationResult.error.errors)
      return NextResponse.json({ success: false, error: validationResult.error.errors[0].message }, { status: 400 })
    }

    const { email, password } = validationResult.data

    const supabase = await createServerClient()

    // Query user from database
    const { data: users, error: queryError } = await supabase
      .from("users")
      .select("id, email, name, role, client_id, status, password_hash")
      .eq("email", email)
      .limit(1)

    console.log("[v0] User query result:", { found: users?.length || 0, error: queryError?.message })

    if (queryError) {
      console.error("[v0] Database query error:", queryError)
      return NextResponse.json({ success: false, error: "Erro ao consultar banco de dados" }, { status: 500 })
    }

    if (!users || users.length === 0) {
      console.log("[v0] User not found:", email)
      return NextResponse.json({ success: false, error: "Credenciais inválidas" }, { status: 401 })
    }

    const userData = users[0]
    const storedHash = userData.password_hash?.trim() || ""

    let isValid = false

    if (storedHash.length === 60 && storedHash.startsWith("$2")) {
      // Bcrypt hash - use bcrypt.compare
      console.log("[v0] Using bcrypt verification")
      isValid = await bcrypt.compare(password, storedHash)
    } else if (storedHash.length >= 64) {
      // SHA-256 hash - use Node.js crypto
      const inputHash = crypto.createHash("sha256").update(password).digest("hex")
      const storedHashClean = storedHash.replace(/[\r\n\s]/g, "").substring(0, 64)
      isValid = inputHash.toLowerCase() === storedHashClean.toLowerCase()
    } else {
      // Direct comparison for plain text (development only - NOT recommended)
      console.log("[v0] WARNING: Plain text password detected")
      isValid = password === storedHash
    }

    console.log("[v0] Password verification:", {
      isValid,
      hashLength: storedHash.length,
      hashType: storedHash.startsWith("$2") ? "bcrypt" : "sha256",
    })

    if (!isValid) {
      console.log("[v0] Invalid password for user:", email)
      return NextResponse.json({ success: false, error: "Credenciais inválidas" }, { status: 401 })
    }

    if (userData.status !== "active") {
      console.log("[v0] User is inactive:", email)
      return NextResponse.json(
        { success: false, error: "Usuário inativo. Entre em contato com o administrador." },
        { status: 401 },
      )
    }

    // Update last login
    await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", userData.id)

    // Get client name if exists
    let clientName = null
    if (userData.client_id) {
      const { data: clientData } = await supabase.from("clients").select("name").eq("id", userData.client_id).single()
      clientName = clientData?.name
    }

    const user = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      client_id: userData.client_id,
      client_name: clientName,
    }

    console.log("[v0] Login successful for:", email, "Role:", userData.role)

    const sessionToken = crypto.randomUUID()

    // Set cookies for session
    const cookieStore = await cookies()

    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      timestamp: Date.now(),
    }
    const encodedSession = Buffer.from(JSON.stringify(sessionData)).toString("base64")

    cookieStore.set("session_token", encodedSession, {
      httpOnly: false, // Allow JS access for client-side checks
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    cookieStore.set("user_email", user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    cookieStore.set("user_role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    cookieStore.set("user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    if (user.client_id) {
      cookieStore.set("client_id", user.client_id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
    }

    return NextResponse.json({
      success: true,
      user,
      sessionToken,
    })
  } catch (error: any) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
