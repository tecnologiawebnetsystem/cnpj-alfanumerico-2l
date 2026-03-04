import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/sqlserver"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {
      name: body.name,
      email: body.email,
      role: body.role,
      client_id: body.client_id || null,
      status: body.status,
      updated_at: new Date().toISOString(),
    }

    // Se senha fornecida, atualiza o hash
    if (body.password) {
      const bcrypt = await import("bcryptjs")
      updateData.password_hash = await bcrypt.hash(body.password, 10)
    }

    const { data, error } = await db.from("users").update(updateData).eq("id", id).single()

    if (error) throw new Error(error.message)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const { error } = await db.from("users").delete().eq("id", id)

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
