import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"
import crypto from "crypto"

// POST /api/shared-links - Create shared link
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { entity_type, entity_id, password, expires_at, max_views } = body

    const supabase = await createClient()

    // Generate unique token
    const token = crypto.randomBytes(32).toString("hex")

    // Hash password if provided
    let passwordHash = null
    if (password) {
      passwordHash = crypto.createHash("sha256").update(password).digest("hex")
    }

    const { data: sharedLink, error } = await supabase
      .from("shared_links")
      .insert({
        client_id: user.client_id,
        entity_type,
        entity_id,
        token,
        password_hash: passwordHash,
        expires_at,
        max_views,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    const baseUrl = request.headers.get("origin") || request.headers.get("host") || "http://localhost:3000"

    return NextResponse.json({
      shared_link: sharedLink,
      url: `${baseUrl}/shared/${token}`,
    })
  } catch (error: any) {
    console.error(" Error creating shared link:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
