import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"
import { authenticator } from "otplib"
import QRCode from "qrcode"

// POST /api/2fa/setup - Setup 2FA for user
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Generate secret
    const secret = authenticator.generateSecret()

    // Generate QR code
    const otpauth = authenticator.keyuri(user.email, "CNPJ Alfanumérico", secret)
    const qrCode = await QRCode.toDataURL(otpauth)

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 10).toUpperCase())

    const supabase = await createClient()

    // Save to database (not enabled yet)
    const { error } = await supabase.from("two_factor_auth").upsert({
      user_id: user.id,
      secret,
      backup_codes: backupCodes,
      is_enabled: false,
    })

    if (error) throw error

    return NextResponse.json({
      secret,
      qr_code: qrCode,
      backup_codes: backupCodes,
    })
  } catch (error: any) {
    console.error("[v0] Error setting up 2FA:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
