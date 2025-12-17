import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se é Super Admin
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userData?.role !== "super_admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Buscar todas as configurações
    const { data: settings, error } = await supabase
      .from("system_settings")
      .select("*")
      .order("category", { ascending: true })
      .order("label", { ascending: true })

    if (error) throw error

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Erro ao buscar configurações" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se é Super Admin
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userData?.role !== "super_admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { settings } = await request.json()

    // Atualizar cada configuração
    for (const [key, value] of Object.entries(settings)) {
      await supabase
        .from("system_settings")
        .update({ value: value as string, updated_at: new Date().toISOString() })
        .eq("key", key)
    }

    // Log da atividade
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "update",
      entity_type: "system_settings",
      description: `Atualizou ${Object.keys(settings).length} configuração(ões) do sistema`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Erro ao atualizar configurações" }, { status: 500 })
  }
}
