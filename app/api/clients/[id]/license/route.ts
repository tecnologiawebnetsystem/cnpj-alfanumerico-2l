import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()

    const { data: client, error } = await supabase
      .from("clients")
      .select("name, license_active, license_start, license_end, license_type")
      .eq("id", params.id)
      .single()

    if (error) throw error

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    const now = new Date()
    const licenseEnd = client.license_end ? new Date(client.license_end) : null
    const isExpired = licenseEnd ? licenseEnd < now : false
    const daysRemaining = licenseEnd ? Math.ceil((licenseEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null

    return NextResponse.json({
      isActive: client.license_active && !isExpired,
      isExpired,
      daysRemaining,
      licenseEnd: client.license_end,
      clientName: client.name,
      licenseType: client.license_type,
    })
  } catch (error: any) {
    console.error("[v0] Error checking license:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
