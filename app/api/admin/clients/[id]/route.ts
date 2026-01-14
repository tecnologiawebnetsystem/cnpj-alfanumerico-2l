import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log(" === PUT /api/admin/clients/[id] START ===")
    const { id } = await params
    console.log(" Client ID:", id)

    const supabase = await createServerClient()
    const body = await request.json()

    console.log(" Updating client...")

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
      console.error(" Error updating client:", error)
      throw error
    }

    console.log(" Client updated successfully")
    console.log(" === PUT /api/admin/clients/[id] END ===")

    return NextResponse.json(data)
  } catch (error) {
    console.error(" CRITICAL Error updating client:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log(" === DELETE /api/admin/clients/[id] START ===")
    const { id } = await params
    console.log(" Client ID to delete:", id)

    const supabase = await createServerClient()

    console.log(" Deleting client...")
    const { error } = await supabase.from("clients").delete().eq("id", id)

    if (error) {
      console.error(" Error deleting client:", error)
      throw error
    }

    console.log(" Client deleted successfully")
    console.log(" === DELETE /api/admin/clients/[id] END ===")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(" CRITICAL Error deleting client:", error)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
