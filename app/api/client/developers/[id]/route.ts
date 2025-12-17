import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] DELETE /api/client/developers/[id] - Start")
    console.log("[v0] Developer ID:", params.id)
    
    const body = await request.json()
    const { user_id } = body

    console.log("[v0] User ID from body:", user_id)

    if (!user_id) {
      console.log("[v0] Missing user_id in request body")
      return NextResponse.json({ error: "user_id é obrigatório" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Verificar se o usuário que está fazendo a requisição existe e é admin
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id, email, role, client_id")
      .eq("id", user_id)
      .single()

    if (userError || !currentUser) {
      console.log("[v0] Current user not found or error:", userError)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    console.log("[v0] Current user:", currentUser.email, "Role:", currentUser.role)

    // Verificar se é admin ou super_admin
    if (currentUser.role !== "admin" && currentUser.role !== "super_admin") {
      console.log("[v0] User does not have permission")
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    // Não pode deletar a si mesmo
    if (currentUser.id === params.id) {
      console.log("[v0] User trying to delete themselves")
      return NextResponse.json({ error: "Não é possível deletar seu próprio usuário" }, { status: 400 })
    }

    // Verificar se o desenvolvedor existe e pertence ao mesmo cliente
    const { data: developer, error: devError } = await supabase
      .from("users")
      .select("*")
      .eq("id", params.id)
      .single()

    if (devError || !developer) {
      console.log("[v0] Developer not found:", devError)
      return NextResponse.json({ error: "Desenvolvedor não encontrado" }, { status: 404 })
    }

    console.log("[v0] Developer found:", developer.email, "Client ID:", developer.client_id)

    // Se for admin (não super_admin), verificar se pertence ao mesmo cliente
    if (currentUser.role === "admin" && developer.client_id !== currentUser.client_id) {
      console.log("[v0] Developer belongs to different client")
      return NextResponse.json({ error: "Sem permissão para deletar este desenvolvedor" }, { status: 403 })
    }

    console.log("[v0] Deleting developer from database...")

    // Deletar desenvolvedor
    const { error: deleteError } = await supabase.from("users").delete().eq("id", params.id)

    if (deleteError) {
      console.error("[v0] Error deleting developer:", deleteError)
      return NextResponse.json({ error: "Erro ao deletar desenvolvedor" }, { status: 500 })
    }

    console.log("[v0] Developer deleted successfully")

    return NextResponse.json({ success: true, message: "Desenvolvedor excluído com sucesso" })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/client/developers/[id]:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
