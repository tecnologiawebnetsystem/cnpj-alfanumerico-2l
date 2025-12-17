import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET /api/integrations/providers - Listar provedores disponíveis
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const { data: providers, error } = await supabase
      .from("integration_providers")
      .select("*")
      .eq("is_enabled", true)
      .order("name")

    if (error) {
      console.error("[v0] Error fetching providers:", error)
      return NextResponse.json({ error: "Erro ao buscar provedores" }, { status: 500 })
    }

    return NextResponse.json({ providers })
  } catch (error) {
    console.error("[v0] Error in GET /api/integrations/providers:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
