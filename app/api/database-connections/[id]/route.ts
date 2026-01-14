import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, db_type, host, port, database, username, password } = body

    const supabase = await createClient()

    const updateData: any = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (db_type) updateData.db_type = db_type
    if (host) updateData.host = host
    if (port) updateData.port = port
    if (database) updateData.database = database
    if (username) updateData.username = username
    if (password) updateData.password = password

    const { data: connection, error } = await supabase
      .from("database_connections")
      .update(updateData)
      .eq("id", params.id)
      .eq("client_id", user.client_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ connection })
  } catch (error: any) {
    console.error(" Error updating database connection:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from("database_connections")
      .delete()
      .eq("id", params.id)
      .eq("client_id", user.client_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(" Error deleting database connection:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
