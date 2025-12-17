import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hashPassword } from "@/lib/auth-actions"
import { createServerClient } from "@/lib/supabase/server"

// PUT /api/users/[id] - Atualizar usuário
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (currentUser.role !== "admin" && currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await request.json()
    const { name, role, password } = body

    const supabase = await createServerClient()

    // Verificar se usuário existe e pertence ao cliente (se Admin)
    const { data: existingUser } = await supabase.from("users").select("*").eq("id", params.id).single()

    if (!existingUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (currentUser.role === "admin" && existingUser.client_id !== currentUser.client_id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    // Preparar dados para atualização
    const updateData: any = {}
    if (name) updateData.name = name
    if (role) updateData.role = role
    if (password) {
      updateData.password_hash = await hashPassword(password)
      // Atualizar senha no Supabase Auth também
      await supabase.auth.admin.updateUserById(params.id, { password })
    }

    // Atualizar usuário
    const { data: user, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", params.id)
      .select(`
        id,
        email,
        name,
        role,
        client_id,
        created_at,
        clients(name)
      `)
      .single()

    if (error) {
      console.error("[v0] Error updating user:", error)
      return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Error in PUT /api/users/[id]:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Deletar usuário
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (currentUser.role !== "admin" && currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    // Não pode deletar a si mesmo
    if (currentUser.id === params.id) {
      return NextResponse.json({ error: "Não é possível deletar seu próprio usuário" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Verificar se usuário existe e pertence ao cliente (se Admin)
    const { data: existingUser } = await supabase.from("users").select("*").eq("id", params.id).single()

    if (!existingUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (currentUser.role === "admin" && existingUser.client_id !== currentUser.client_id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    // Deletar usuário do Auth
    await supabase.auth.admin.deleteUser(params.id)

    // Deletar usuário da tabela
    const { error } = await supabase.from("users").delete().eq("id", params.id)

    if (error) {
      console.error("[v0] Error deleting user:", error)
      return NextResponse.json({ error: "Erro ao deletar usuário" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/users/[id]:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
