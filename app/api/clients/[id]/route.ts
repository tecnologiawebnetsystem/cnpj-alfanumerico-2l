import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-actions"
import { createServerClient } from "@/lib/supabase/server"

// PUT /api/clients/[id] - Atualizar cliente
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, phone, address } = body

    const supabase = await createServerClient()

    const { data: client, error } = await supabase
      .from("clients")
      .update({ name, email, phone, address })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error(" Error updating client:", error)
      return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 })
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error(" Error in PUT /api/clients/[id]:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// DELETE /api/clients/[id] - Deletar cliente
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const supabase = await createServerClient()

    // Verificar se há usuários vinculados
    const { data: users } = await supabase.from("users").select("id").eq("client_id", params.id).limit(1)

    if (users && users.length > 0) {
      return NextResponse.json({ error: "Não é possível deletar cliente com usuários vinculados" }, { status: 400 })
    }

    const { error } = await supabase.from("clients").delete().eq("id", params.id)

    if (error) {
      console.error(" Error deleting client:", error)
      return NextResponse.json({ error: "Erro ao deletar cliente" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(" Error in DELETE /api/clients/[id]:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
