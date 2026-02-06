import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: analysisId } = await params
    const searchParams = request.nextUrl.searchParams
    const user_id = searchParams.get("user_id")

    console.log(" Admin findings API - user_id:", user_id, "analysisId:", analysisId)

    if (!user_id) {
      return NextResponse.json({ error: "user_id é obrigatório" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Verificar se o usuário é super admin
    const { data: user, error: userError } = await supabase.from("users").select("role").eq("id", user_id).single()

    if (userError || !user) {
      console.error(" User not found:", userError)
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (user.role?.toUpperCase() !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Buscar findings da análise
    const { data: findings, error } = await supabase
      .from("findings")
      .select("*")
      .eq("analysis_id", analysisId)
      .order("file_path", { ascending: true })
      .order("line_number", { ascending: true })

    if (error) {
      console.error(" Error fetching findings:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(" Findings loaded:", findings?.length || 0)
    return NextResponse.json(findings || [])
  } catch (error: any) {
    console.error(" Error in admin findings API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
