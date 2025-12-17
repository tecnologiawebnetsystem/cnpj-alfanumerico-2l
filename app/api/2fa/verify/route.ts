import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"
import { authenticator } from "otplib"

// POST /api/2fa/verify - Verify 2FA code and enable
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { code } = body

    const supabase = await createClient()

    // Get 2FA config
    const { data: twoFactor, error: fetchError } = await supabase
      .from("two_factor_auth")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (fetchError) throw fetchError

    // Verify code
    const isValid = authenticator.verify({
      token: code,
      secret: twoFactor.secret,
    })

    if (!isValid) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 })
    }

    // Enable 2FA
    const { error: updateError } = await supabase
      .from("two_factor_auth")
      .update({
        is_enabled: true,
        last_used_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error verifying 2FA:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
