import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-actions"
import { createServerClient } from "@/lib/supabase/server"

// GET /api/clients - Listar clientes (Super Admin)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Apenas Super Admin pode listar clientes
    if (currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const supabase = await createServerClient()

    const { data: clients, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching clients:", error)
      return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 })
    }

    return NextResponse.json({ clients })
  } catch (error) {
    console.error("[v0] Error in GET /api/clients:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// POST /api/clients - Criar cliente (Super Admin)
export async function POST(request: NextRequest) {
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

    if (!name) {
      return NextResponse.json({ error: "Campo obrigatório: name" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        name,
        email,
        phone,
        address,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating client:", error)
      return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 })
    }

    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in POST /api/clients:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
