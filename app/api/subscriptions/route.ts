import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"

// GET /api/subscriptions - Get client subscription
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select(`
        *,
        plan:plans (*)
      `)
      .eq("client_id", user.client_id)
      .eq("status", "active")
      .single()

    if (error && error.code !== "PGRST116") throw error

    return NextResponse.json({ subscription: subscription || null })
  } catch (error: any) {
    console.error("[v0] Error fetching subscription:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
