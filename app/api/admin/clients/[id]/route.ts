import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log("[v0] === PUT /api/admin/clients/[id] START ===")
    const { id } = await params
    console.log("[v0] Client ID:", id)

    const supabase = await createServerClient()
    const body = await request.json()

    console.log("[v0] Updating client...")

    const { data, error } = await supabase
      .from("clients")
      .update({
        name: body.name,
        cnpj: body.cnpj,
        email: body.email,
        phone: body.phone,
        status: body.status,
        plan: body.plan,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating client:", error)
      throw error
    }

    console.log("[v0] Client updated successfully")
    console.log("[v0] === PUT /api/admin/clients/[id] END ===")

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] CRITICAL Error updating client:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log("[v0] === DELETE /api/admin/clients/[id] START ===")
    const { id } = await params
    console.log("[v0] Client ID to delete:", id)

    const supabase = await createServerClient()

    console.log("[v0] Deleting client...")
    const { error } = await supabase.from("clients").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting client:", error)
      throw error
    }

    console.log("[v0] Client deleted successfully")
    console.log("[v0] === DELETE /api/admin/clients/[id] END ===")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] CRITICAL Error deleting client:", error)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
