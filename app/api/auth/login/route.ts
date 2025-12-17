import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data: users, error: queryError } = await supabase
      .from("users")
      .select("id, email, name, role, client_id, status, password_hash")
      .eq("email", email)
      .limit(1)

    if (queryError) {
      return NextResponse.json({ success: false, error: "Erro ao verificar credenciais" }, { status: 500 })
    }

    if (!users || users.length === 0) {
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
      return NextResponse.json({ success: false, error: "Credenciais inválidas" }, { status: 401 })
    }

    if (userData.status !== "active") {
      return NextResponse.json({ success: false, error: "Usuário inativo" }, { status: 401 })
    }

    await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", userData.id)

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

    const sessionToken = Buffer.from(
      JSON.stringify({
        email: user.email,
        userId: user.id,
        clientId: user.client_id,
        timestamp: Date.now(),
      }),
    ).toString("base64")

    const response = NextResponse.json({
      success: true,
      user,
      sessionToken,
    })

    response.cookies.set("user_email", user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    response.cookies.set("user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: `Erro interno: ${error?.message || "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
