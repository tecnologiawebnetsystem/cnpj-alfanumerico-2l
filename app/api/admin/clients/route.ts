import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase/api-client"

async function getCurrentUser(request?: NextRequest) {
  try {
    console.log("[v0] getCurrentUser - Start")

    if (request) {
      const { searchParams } = new URL(request.url)
      const userId = searchParams.get("user_id")

      if (userId) {
        console.log("[v0] User ID from query:", userId)
        const supabase = createSupabaseServiceClient()
        const { data: user, error } = await supabase
          .from("users")
          .select("id, email, name, role, client_id, status")
          .eq("id", userId)
          .maybeSingle()

        if (user) {
          console.log("[v0] User found by ID:", user.email, "role:", user.role)
          return user
        }
      }
    }

    console.log("[v0] No user ID provided")
    return null
  } catch (error) {
    console.error("[v0] Exception in getCurrentUser:", error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] GET /api/admin/clients - Start")
    const user = await getCurrentUser(request)

    if (!user || user.role !== "super_admin") {
      console.log("[v0] Unauthorized access attempt. User role:", user?.role)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    console.log("[v0] User authorized, fetching clients...")
    const supabase = createSupabaseServiceClient()

    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false })

    if (error) throw error

    console.log("[v0] Clients fetched successfully:", data?.length || 0, "clients")
    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error("[v0] Error loading clients:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] POST /api/admin/clients - Start")

    const user = await getCurrentUser(request)

    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    console.log("[v0] Request body:", body)

    const supabase = createSupabaseServiceClient()

    const insertData = {
      name: body.name,
      cnpj: body.cnpj,
      email: body.email,
      status: body.status || "active",
    }

    console.log("[v0] Inserting data:", insertData)

    const { data, error } = await supabase.from("clients").insert([insertData]).select().single()

    if (error) {
      console.error("[v0] Supabase insert error:", error)
      return NextResponse.json({ error: error.message || "Erro ao inserir no banco" }, { status: 500 })
    }

    console.log("[v0] Client created successfully:", data)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] POST /api/admin/clients - Error:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("[v0] PUT /api/admin/clients - Start")

    const user = await getCurrentUser(request)

    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body
    console.log("[v0] Updating client:", id, updateData)

    if (!id) {
      return NextResponse.json({ error: "ID do cliente é obrigatório" }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()

    const { data, error } = await supabase.from("clients").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("[v0] Supabase update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Client updated successfully:", data)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] PUT /api/admin/clients - Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("[v0] DELETE /api/admin/clients - Start")

    const user = await getCurrentUser(request)

    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID do cliente é obrigatório" }, { status: 400 })
    }

    console.log("[v0] Deleting client:", id)

    const supabase = createSupabaseServiceClient()

    const { error } = await supabase.from("clients").delete().eq("id", id)

    if (error) {
      console.error("[v0] Supabase delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Client deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] DELETE /api/admin/clients - Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
