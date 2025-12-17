import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-actions"
import { createServerClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { license_start, license_end, license_active, license_type } = body

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("clients")
      .update({
        license_start,
        license_end,
        license_active,
        license_type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Error updating license:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
