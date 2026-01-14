import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST() {
  try {
    // Criar cliente Supabase com service role
    const supabase = await createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get() {},
          set() {},
          remove() {},
        },
      },
    )

    // Gerar novo hash para a senha Admin@2026 usando função PostgreSQL
    const password = "Admin@2026"

    const { data: hashData, error: hashError } = await supabase.rpc("hash_password", {
      p_password: password,
    })

    if (hashError || !hashData) {
      console.error(" Error hashing password:", hashError)
      return NextResponse.json({ success: false, error: "Erro ao processar senha" }, { status: 500 })
    }

    const passwordHash = hashData

    console.log(" Generated new password hash:", passwordHash)

    // Atualizar senha do admin
    const { data, error } = await supabase
      .from("users")
      .update({ password_hash: passwordHash })
      .eq("email", "admin@webnetsystems.com.br")
      .select()

    if (error) {
      console.error(" Error updating password:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log(" Password reset successful for admin")

    return NextResponse.json({
      success: true,
      message: "Senha do admin resetada com sucesso",
      email: "admin@webnetsystems.com.br",
      password: "Admin@2026",
      hash: passwordHash,
    })
  } catch (error) {
    console.error(" Reset password error:", error)
    return NextResponse.json({ success: false, error: "Erro ao resetar senha" }, { status: 500 })
  }
}
