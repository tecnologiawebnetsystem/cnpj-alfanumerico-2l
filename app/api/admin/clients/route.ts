import { type NextRequest, NextResponse } from "next/server"
import { queryOne } from "@/lib/db/index"
import { db } from "@/lib/db/sqlserver"

async function getAdminUser(request: NextRequest) {
  const userId = new URL(request.url).searchParams.get("user_id")
  if (!userId) return null
  return queryOne<{ id: string; email: string; name: string; role: string; client_id: string | null; status: string }>(
    "SELECT id, email, name, role, client_id, status FROM users WHERE id = @id",
    { id: userId },
  )
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAdminUser(request)
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { data, error } = await db.from("clients").select("*").order("created_at", { ascending: false })
    if (error) throw new Error(error.message)

    return NextResponse.json(data || [])
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("Error loading clients:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAdminUser(request)
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { data, error } = await db
      .from("clients")
      .insert({ name: body.name, cnpj: body.cnpj, email: body.email, status: body.status || "active" })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("Error creating client:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAdminUser(request)
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body
    if (!id) return NextResponse.json({ error: "ID do cliente é obrigatório" }, { status: 400 })

    const { data, error } = await db.from("clients").update(updateData).eq("id", id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("Error updating client:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAdminUser(request)
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const id = new URL(request.url).searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID do cliente é obrigatório" }, { status: 400 })

    const { error } = await db.from("clients").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("Error deleting client:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
