import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"

// GET /api/integrations/config - Get integration configs
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: configs, error } = await supabase
      .from("integration_configs")
      .select("*")
      .eq("client_id", user.client_id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ configs })
  } catch (error: any) {
    console.error(" Error fetching integration configs:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/integrations/config - Create integration config
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { integration_type, name, config } = body

    const supabase = await createClient()

    const { data: integrationConfig, error } = await supabase
      .from("integration_configs")
      .insert({
        client_id: user.client_id,
        integration_type,
        name,
        config,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ config: integrationConfig })
  } catch (error: any) {
    console.error(" Error creating integration config:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
