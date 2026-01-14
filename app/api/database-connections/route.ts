import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"

export async function GET(request: NextRequest) {
  try {
    console.log(" GET /api/database-connections called")

    const user = await getCurrentUser()
    console.log(" User:", user ? `${user.email} (client_id: ${user.client_id})` : "null")

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const supabase = await createClient()
    console.log(" Supabase client created, querying database_connections...")

    const { data: connections, error } = await supabase
      .from("database_connections")
      .select("*")
      .eq("client_id", user.client_id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(" Supabase error:", error)
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        console.log(" Table database_connections does not exist yet, returning empty array")
        return NextResponse.json({ connections: [] })
      }
      throw error
    }

    console.log(" Found", connections?.length || 0, "connections")
    return NextResponse.json({ connections: connections || [] })
  } catch (error: any) {
    console.error(" Error fetching database connections:", error)
    return NextResponse.json({ error: error.message || "Erro ao buscar conexões" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log(" POST /api/database-connections called")

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, database_type, host, port, database_name, username, password, ssl_enabled } = body

    // Validações básicas
    if (!name || !database_type || !host || !port || !database_name || !username || !password) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    const supabase = await createClient()

    // Criptografar senha (em produção, usar crypto adequado)
    // Por enquanto, vamos apenas codificar em base64 (NÃO É SEGURO PARA PRODUÇÃO)
    const passwordEncrypted = Buffer.from(password).toString("base64")

    const { data: connection, error } = await supabase
      .from("database_connections")
      .insert({
        client_id: user.client_id,
        name,
        description,
        database_type,
        host,
        port,
        database_name,
        username,
        password_encrypted: passwordEncrypted,
        ssl_enabled: ssl_enabled || false,
        status: "active",
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error(" Error creating connection:", error)
      throw error
    }

    console.log(" Connection created successfully:", connection.id)
    return NextResponse.json({ connection }, { status: 201 })
  } catch (error: any) {
    console.error(" Error creating database connection:", error)
    return NextResponse.json({ error: error.message || "Erro ao criar conexão" }, { status: 500 })
  }
}
