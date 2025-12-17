import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    if (!user_id) {
      return NextResponse.json({ error: "user_id required" }, { status: 401 })
    }

    const supabase = await createServerClient()

    // Verificar se o usuário é super admin
    const { data: user } = await supabase.from("users").select("role").eq("id", user_id).single()

    if (!user || (user.role !== "super_admin" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("repositories")
      .select(`
        *,
        clients (
          name
        )
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    const repositories =
      data?.map((r) => ({
        ...r,
        client_name: r.clients?.name || null,
      })) || []

    return NextResponse.json(repositories)
  } catch (error: any) {
    console.error("[v0] Error loading repositories:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
