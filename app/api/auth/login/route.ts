import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/sqlserver"
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
  try {
    const body = await request.json()

    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: validationResult.error.errors[0].message }, { status: 400 })
    }

    const { email, password } = validationResult.data

    // Busca usuário no SQL Server
    const { data: users, error: queryError } = await db
      .from("users")
      .select("id, email, name, role, client_id, status, password_hash")
      .eq("email", email)
      .limit(1)

    if (queryError) {
      console.error("Database query error:", queryError)
      return NextResponse.json({ success: false, error: "Erro ao consultar banco de dados" }, { status: 500 })
    }

    const usersArr = Array.isArray(users) ? users : users ? [users] : []

    if (usersArr.length === 0) {
      return NextResponse.json({ success: false, error: "Credenciais inválidas" }, { status: 401 })
    }

    const userData = usersArr[0] as Record<string, unknown>
    const storedHash = (userData.password_hash as string)?.trim() || ""

    let isValid = false

    if (storedHash.length === 60 && storedHash.startsWith("$2")) {
      isValid = await bcrypt.compare(password, storedHash)
    } else if (storedHash.length >= 64) {
      const inputHash = crypto.createHash("sha256").update(password).digest("hex")
      const storedHashClean = storedHash.replace(/[\r\n\s]/g, "").substring(0, 64)
      isValid = inputHash.toLowerCase() === storedHashClean.toLowerCase()
    } else {
      isValid = password === storedHash
    }

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Credenciais inválidas" }, { status: 401 })
    }

    if (userData.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Usuário inativo. Entre em contato com o administrador." },
        { status: 401 },
      )
    }

    // Atualiza last_login
    await db.from("users").update({ last_login: new Date().toISOString() }).eq("id", userData.id as string)

    // Busca nome do cliente
    let clientName: string | null = null
    if (userData.client_id) {
      const { data: clientData } = await db
        .from("clients")
        .select("name")
        .eq("id", userData.client_id as string)
        .single()
      if (clientData) {
        clientName = (clientData as Record<string, unknown>).name as string
      }
    }

    const user = {
      id: userData.id as string,
      email: userData.email as string,
      name: userData.name as string,
      role: userData.role as string,
      client_id: userData.client_id as string | null,
      client_name: clientName,
    }

    const sessionToken = crypto.randomUUID()
    const cookieStore = await cookies()

    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      timestamp: Date.now(),
    }
    const encodedSession = Buffer.from(JSON.stringify(sessionData)).toString("base64")

    cookieStore.set("session_token", encodedSession, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    cookieStore.set("user_email", user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
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

    return NextResponse.json({ success: true, user, sessionToken })
  } catch (error: unknown) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
