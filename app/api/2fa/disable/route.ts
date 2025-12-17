import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"

// POST /api/2fa/disable - Disable 2FA
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from("two_factor_auth").update({ is_enabled: false }).eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error disabling 2FA:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
