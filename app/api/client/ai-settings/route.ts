import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const client_id = searchParams.get("client_id")

    if (!client_id) {
      return NextResponse.json({ error: "client_id obrigatorio" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: rows, error } = await supabase
      .from("ai_provider_settings")
      .select("*")
      .eq("client_id", client_id)
      .eq("provider", "gemini")
      .limit(1)

    if (error) {
      throw error
    }

    const data = rows && rows.length > 0 ? rows[0] : null

    // Retornar configuracao padrao se nao existir
    const settings = data || {
      provider: "gemini",
      model_name: "gemini-1.5-flash",
      temperature: 0.3,
      max_tokens: 4096,
      is_active: false,
      api_key: "",
    }

    // Mascarar API key
    if (settings.api_key) {
      settings.api_key_masked = settings.api_key.substring(0, 8) + "..." + settings.api_key.slice(-4)
      settings.has_api_key = true
    } else {
      settings.api_key_masked = ""
      settings.has_api_key = false
    }
    delete settings.api_key

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error("Error fetching AI settings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client_id, api_key, model_name, temperature, max_tokens, is_active } = body

    if (!client_id) {
      return NextResponse.json({ error: "client_id obrigatorio" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verificar se ja existe configuracao
    const { data: existingRows } = await supabase
      .from("ai_provider_settings")
      .select("id")
      .eq("client_id", client_id)
      .eq("provider", "gemini")
      .limit(1)

    const existing = existingRows && existingRows.length > 0 ? existingRows[0] : null

    const settingsData: any = {
      client_id,
      provider: "gemini",
      model_name: model_name || "gemini-1.5-flash",
      temperature: temperature ?? 0.3,
      max_tokens: max_tokens || 4096,
      is_active: is_active ?? true,
    }

    // So atualizar api_key se foi enviada
    if (api_key && api_key.length > 10) {
      settingsData.api_key = api_key
    }

    let result
    if (existing) {
      // Atualizar
      const { data, error } = await supabase
        .from("ai_provider_settings")
        .update(settingsData)
        .eq("id", existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Inserir
      const { data, error } = await supabase
        .from("ai_provider_settings")
        .insert(settingsData)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({
      success: true,
      message: "Configuracoes salvas com sucesso",
      settings: {
        ...result,
        api_key: undefined,
        api_key_masked: result.api_key ? result.api_key.substring(0, 8) + "..." : "",
        has_api_key: !!result.api_key,
      },
    })
  } catch (error: any) {
    console.error("Error saving AI settings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const client_id = searchParams.get("client_id")

    if (!client_id) {
      return NextResponse.json({ error: "client_id obrigatorio" }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from("ai_provider_settings")
      .delete()
      .eq("client_id", client_id)
      .eq("provider", "gemini")

    if (error) throw error

    return NextResponse.json({ success: true, message: "Configuracoes removidas" })
  } catch (error: any) {
    console.error("Error deleting AI settings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
