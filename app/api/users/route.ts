import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-actions"
import { createServerClient } from "@/lib/supabase/server"
import { hashPassword } from "@/lib/auth-actions"

// GET /api/users - Listar usuários (Admin/Super Admin)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Apenas Admin e Super Admin podem listar usuários
    if (currentUser.role !== "admin" && currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const supabase = await createServerClient()

    // Super Admin vê todos os usuários, Admin vê apenas do seu cliente
    let query = supabase
      .from("users")
      .select(`
        id,
        email,
        name,
        role,
        client_id,
        created_at,
        clients(name)
      `)
      .order("created_at", { ascending: false })

    if (currentUser.role === "admin") {
      query = query.eq("client_id", currentUser.client_id)
    }

    const { data: users, error } = await query

    if (error) {
      console.error("[v0] Error fetching users:", error)
      return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error("[v0] Error in GET /api/users:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// POST /api/users - Criar usuário (Admin/Super Admin)
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (currentUser.role !== "admin" && currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, password, role, client_id } = body

    if (!email || !name || !password || !role) {
      return NextResponse.json({ error: "Campos obrigatórios: email, name, password, role" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Verificar se email já existe
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password)

    // Determinar client_id
    let finalClientId = client_id
    if (currentUser.role === "admin") {
      finalClientId = currentUser.client_id // Admin só pode criar usuários do seu cliente
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("[v0] Error creating auth user:", authError)
      return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
    }

    // Criar usuário na tabela users
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email,
        name,
        password_hash: hashedPassword,
        role,
        client_id: finalClientId,
      })
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

    if (userError) {
      console.error("[v0] Error creating user:", userError)
      // Tentar deletar o usuário do Auth se falhar
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in POST /api/users:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
