import { NextResponse } from "next/server"
import { db } from "@/lib/db/sqlserver"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const password = "Admin@2026"
    const passwordHash = await bcrypt.hash(password, 10)

    const { data, error } = await db
      .from("users")
      .update({ password_hash: passwordHash })
      .eq("email", "admin@webnetsystems.com.br")
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Senha do admin resetada com sucesso",
      email: "admin@webnetsystems.com.br",
      password: "Admin@2026",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ success: false, error: "Erro ao resetar senha" }, { status: 500 })
  }
}
